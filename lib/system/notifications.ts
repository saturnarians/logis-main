import type {
  NotificationChannel,
  NotificationItemDto,
  SendNotificationDto,
  UserRole,
} from "@/types/dto";
import { monitoring } from "@/lib/monitoring";
import { Resend } from "resend";
import twilio from "twilio";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
  process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const DEFAULT_TWILIO_FROM = process.env.TWILIO_FROM_NUMBER || "";

async function sendEmailWithResend(
  email: string,
  subject: string,
  html: string,
) {
  if (!resend) {
    monitoring.warn(
      "NotificationEngine:Email",
      "RESEND_API_KEY is not configured; skipping real email send.",
      { email, subject },
    );
    return false;
  }

  try {
    const response = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [email],
      subject,
      html,
      text: html.replace(/<[^>]*>/g, "").trim() || subject,
    });

    if (response.error) {
      throw new Error(response.error.message || "Resend email send failed");
    }

    monitoring.info(
      "NotificationEngine:Email",
      `Real email sent via Resend to ${email}`,
      { subject, id: response.data?.id },
    );
    return true;
  } catch (error) {
    monitoring.error(
      "NotificationEngine:Email",
      "Resend email delivery failed",
      error,
      { email, subject },
    );
    return false;
  }
}

async function sendSmsWithTwilio(phone: string, title: string, body: string) {
  if (!twilioClient || !DEFAULT_TWILIO_FROM) {
    monitoring.warn(
      "NotificationEngine:SMS",
      "Twilio credentials are not configured; skipping real SMS send.",
      { phone, title },
    );
    return false;
  }

  try {
    const message = await twilioClient.messages.create({
      from: DEFAULT_TWILIO_FROM,
      to: phone,
      body: `${title} - ${body}`.slice(0, 1600),
    });

    monitoring.info(
      "NotificationEngine:SMS",
      `Real SMS sent via Twilio to ${phone}`,
      { sid: message.sid, status: message.status },
    );
    return true;
  } catch (error) {
    monitoring.error(
      "NotificationEngine:SMS",
      "Twilio SMS delivery failed",
      error,
      { phone, title },
    );
    return false;
  }
}

/**
 * Centralized Multi-Channel Notification Dispatcher
 * Dispatches and records notifications across 3 channels:
 *  1. Internal (in-app alerts, badge counters, drawer lists)
 *  2. SMS (urgent delivery SMS, driver route notifications, OTP codes)
 *  3. Email (transactional receipts, SLA breach escalations, proof of delivery)
 */

const MAX_NOTIFICATIONS = 200;
const notificationStore: NotificationItemDto[] =
  (globalThis as any).__DHL_NOTIFICATIONS_STORE__ || [];
(globalThis as any).__DHL_NOTIFICATIONS_STORE__ = notificationStore;

// Initialize with some seed notifications if empty
if (notificationStore.length === 0) {
  notificationStore.push(
    {
      id: "notif-seed-01",
      title: "Autonomous Route Optimization Triggered",
      message:
        "AI Copilot adjusted waypoint sequence for European Road Corridor FRA-LON to bypass heavy snowfall.",
      channel: "internal",
      category: "ai_governance",
      priority: "high",
      recipientRole: "admin",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
        .toISOString()
        .replace("T", " ")
        .substring(0, 16),
      deliveredChannels: ["internal"],
    },
    {
      id: "notif-seed-02",
      title: "Express Delivery OTP SMS Sent",
      message:
        "SMS verification code sent to customer for shipment DHL-EU-884921 (Siemens Medical).",
      channel: "sms",
      category: "shipment_update",
      priority: "medium",
      recipientPhone: "+44 7700 900123",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
        .toISOString()
        .replace("T", " ")
        .substring(0, 16),
      deliveredChannels: ["internal", "sms"],
    },
    {
      id: "notif-seed-03",
      title: "Billing Invoice #INV-2026-089 Issued",
      message:
        "Corporate billing invoice sent via transactional email to accounts@bmw-logistics.de.",
      channel: "email",
      category: "billing_invoice",
      priority: "low",
      recipientEmail: "accounts@bmw-logistics.de",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 120)
        .toISOString()
        .replace("T", " ")
        .substring(0, 16),
      deliveredChannels: ["internal", "email"],
    },
  );
}

class NotificationEngine {
  /**
   * Dispatch notification across requested channels
   */
  public async send(
    payload: SendNotificationDto,
  ): Promise<NotificationItemDto> {
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 16);
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const deliveredChannels: NotificationChannel[] = [];

    // 1. Process Internal Channel
    if (payload.channel === "internal" || payload.channel === "all") {
      deliveredChannels.push("internal");
    }

    // 2. Process SMS Channel
    if (payload.channel === "sms" || payload.channel === "all") {
      const phone = payload.recipientPhone?.trim();
      if (phone) {
        const sent = await sendSmsWithTwilio(
          phone,
          payload.title,
          payload.message,
        );
        if (sent) deliveredChannels.push("sms");
      } else {
        monitoring.warn(
          "NotificationEngine",
          "SMS channel selected without a recipient phone number.",
          { payload },
        );
      }
    }

    // 3. Process Email Channel
    if (payload.channel === "email" || payload.channel === "all") {
      const email = payload.recipientEmail?.trim();
      if (email) {
        const sent = await sendEmailWithResend(
          email,
          payload.title,
          `<p>${payload.message}</p>`,
        );
        if (sent) deliveredChannels.push("email");
      } else {
        monitoring.warn(
          "NotificationEngine",
          "Email channel selected without a recipient email address.",
          { payload },
        );
      }
    }

    const item: NotificationItemDto = {
      id,
      title: payload.title,
      message: payload.message,
      channel: payload.channel,
      category: payload.category,
      priority: payload.priority,
      recipientRole: payload.recipientRole || null,
      recipientId: payload.recipientId || null,
      recipientPhone: payload.recipientPhone || null,
      recipientEmail: payload.recipientEmail || null,
      read: false,
      timestamp,
      metadata: payload.metadata || null,
      deliveredChannels,
    };

    notificationStore.unshift(item);
    if (notificationStore.length > MAX_NOTIFICATIONS) {
      notificationStore.pop();
    }

    monitoring.info(
      "NotificationEngine",
      `Dispatched notification [${item.title}] via [${deliveredChannels.join(", ")}]`,
      {
        id: item.id,
        channels: deliveredChannels,
        recipientRole: item.recipientRole,
      },
    );

    monitoring.recordMetric("notification.dispatched", 1, {
      category: payload.category,
      priority: payload.priority,
    });

    return item;
  }

  /**
   * Simulate or execute SMS Dispatch
   */
  public async dispatchSmsSimulation(
    phone: string,
    title: string,
    body: string,
  ) {
    const sent = await sendSmsWithTwilio(phone, title, body);
    monitoring.recordMetric("notification.sms.sent", sent ? 1 : 0);
    return sent;
  }

  /**
   * Simulate or execute Transactional Email Dispatch
   */
  public async dispatchEmailSimulation(
    email: string,
    subject: string,
    htmlOrText: string,
  ) {
    const sent = await sendEmailWithResend(email, subject, htmlOrText);
    monitoring.recordMetric("notification.email.sent", sent ? 1 : 0);
    return sent;
  }

  /**
   * Fetch all stored internal notifications filtered by role or user
   */
  public getList(filter?: {
    role?: UserRole;
    userId?: string;
    unreadOnly?: boolean;
  }): NotificationItemDto[] {
    return notificationStore.filter((n) => {
      if (filter?.unreadOnly && n.read) return false;
      if (
        filter?.role &&
        n.recipientRole &&
        n.recipientRole !== filter.role &&
        filter.role !== "superadmin"
      ) {
        return false;
      }
      if (filter?.userId && n.recipientId && n.recipientId !== filter.userId) {
        return false;
      }
      return true;
    });
  }

  /**
   * Mark a single notification as read
   */
  public markAsRead(notificationId: string): boolean {
    const item = notificationStore.find((n) => n.id === notificationId);
    if (item) {
      item.read = true;
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read for a given role or user
   */
  public markAllAsRead(role?: UserRole, userId?: string) {
    for (const item of notificationStore) {
      if (!role || item.recipientRole === role || role === "superadmin") {
        if (!userId || item.recipientId === userId) {
          item.read = true;
        }
      }
    }
  }

  /**
   * Return unread count
   */
  public getUnreadCount(role?: UserRole, userId?: string): number {
    return this.getList({ role, userId, unreadOnly: true }).length;
  }
}

export const notifications = new NotificationEngine();
