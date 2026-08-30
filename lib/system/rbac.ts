import type { PermissionAction, SystemPermissionDto, UserRole } from '@/types/dto';
import { monitoring } from '@/lib/monitoring';

/**
 * Centralized Role-Based Access Control (RBAC) Engine
 * Manages permission matrices, granular action authorization, role hierarchy, and route guards.
 */

// Master Permission Matrix Definition
export const PERMISSION_DEFINITIONS: SystemPermissionDto[] = [
  // 1. Shipments & Orders
  {
    id: 'perm-ship-read',
    name: 'View Shipments & Orders',
    description: 'Read shipment status, tracking timeline, cargo details and proof of delivery',
    category: 'Shipments & Logistics',
    action: 'shipment:read',
    superadmin: true,
    admin: true,
    driver: true,
    customer: true,
  },
  {
    id: 'perm-ship-create',
    name: 'Book & Create Shipments',
    description: 'Create new express or freight shipments, schedule pickups, generate waybills',
    category: 'Shipments & Logistics',
    action: 'shipment:create',
    superadmin: true,
    admin: true,
    driver: false,
    customer: true,
  },
  {
    id: 'perm-ship-update',
    name: 'Modify Shipment Details',
    description: 'Update shipment status, reschedule delivery window, reroute packages',
    category: 'Shipments & Logistics',
    action: 'shipment:update',
    superadmin: true,
    admin: true,
    driver: true,
    customer: false,
  },
  {
    id: 'perm-ship-assign',
    name: 'Dispatch & Driver Assignment',
    description: 'Assign shipments to drivers, allocate fleet vehicles, optimize route manifests',
    category: 'Shipments & Logistics',
    action: 'shipment:assign',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-ship-pod',
    name: 'Proof of Delivery Capture',
    description: 'Submit recipient signature, photo proof, OTP validation, and GPS coordinates',
    category: 'Shipments & Logistics',
    action: 'shipment:pod',
    superadmin: true,
    admin: true,
    driver: true,
    customer: false,
  },
  {
    id: 'perm-ship-delete',
    name: 'Cancel & Delete Shipments',
    description: 'Void orders, process shipment cancellations, issue billing write-offs',
    category: 'Shipments & Logistics',
    action: 'shipment:delete',
    superadmin: true,
    admin: false,
    driver: false,
    customer: false,
  },

  // 2. Driver & Fleet Telematics
  {
    id: 'perm-driver-read',
    name: 'View Fleet & Drivers',
    description: 'Inspect live driver status, map telemetry, vehicle fuel levels, and ratings',
    category: 'Fleet & Dispatch',
    action: 'driver:read',
    superadmin: true,
    admin: true,
    driver: true,
    customer: false,
  },
  {
    id: 'perm-driver-telemetry',
    name: 'Broadcast Telematics & GPS',
    description: 'Update driver real-time latitude, longitude, and active status',
    category: 'Fleet & Dispatch',
    action: 'driver:telemetry',
    superadmin: true,
    admin: true,
    driver: true,
    customer: false,
  },
  {
    id: 'perm-driver-manage',
    name: 'Manage Drivers & Personnel',
    description: 'Add new drivers, edit qualifications, change shift assignments and vehicles',
    category: 'Fleet & Dispatch',
    action: 'driver:manage',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-fleet-manage',
    name: 'Manage Fleet Vehicles',
    description: 'Register EV sprinters, heavy freight trucks, manage maintenance schedules',
    category: 'Fleet & Dispatch',
    action: 'fleet:manage',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },

  // 3. AI Governance & Copilot Kill-Switch
  {
    id: 'perm-gov-read',
    name: 'View AI Governance Config',
    description: 'Inspect AI access policy, pending autonomous proposals, and audit logs',
    category: 'AI Governance',
    action: 'governance:read',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-gov-policy',
    name: 'Modify AI Data Policy',
    description: 'Configure autonomous data access modes (Zero Access, Anonymized, Read-Only, Full)',
    category: 'AI Governance',
    action: 'governance:policy_write',
    superadmin: true,
    admin: false,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-gov-killswitch',
    name: 'AI Master Kill-Switch',
    description: 'Instantly disable or enable AI autonomy across all dispatch & logistics agents',
    category: 'AI Governance',
    action: 'governance:killswitch',
    superadmin: true,
    admin: false,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-gov-approve',
    name: 'Approve/Reject AI Actions',
    description: 'Human-in-the-loop review for autonomous route adjustments and tariff alterations',
    category: 'AI Governance',
    action: 'governance:approve_action',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },

  // 4. Finance & Billing
  {
    id: 'perm-fin-read',
    name: 'View Invoices & Billing',
    description: 'Access billing records, payment reconciliation, and revenue analytics',
    category: 'Finance & Tariffs',
    action: 'finance:read',
    superadmin: true,
    admin: true,
    driver: false,
    customer: true,
  },
  {
    id: 'perm-fin-tariff',
    name: 'Edit Pricing & Tariffs',
    description: 'Update zone base rates, weight tariffs, and fuel surcharge multipliers',
    category: 'Finance & Tariffs',
    action: 'finance:tariff_edit',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },

  // 5. System, Cron, & Monitoring
  {
    id: 'perm-cron-manage',
    name: 'Manage System Cron Jobs',
    description: 'Start, stop, inspect, and manually trigger background synchronization crons',
    category: 'System & Platform',
    action: 'cron:manage',
    superadmin: true,
    admin: false,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-sys-reseed',
    name: 'Database Reseed & Restore',
    description: 'Reinitialize demo shipments, drivers, hubs, and governance records',
    category: 'System & Platform',
    action: 'system:db_reseed',
    superadmin: true,
    admin: false,
    driver: false,
    customer: false,
  },
  {
    id: 'perm-notif-broadcast',
    name: 'Broadcast System Alerts',
    description: 'Dispatch internal, SMS, and transactional email notifications',
    category: 'System & Platform',
    action: 'notification:broadcast',
    superadmin: true,
    admin: true,
    driver: false,
    customer: false,
  },
];

class RBACEngine {
  private permissions: SystemPermissionDto[] = PERMISSION_DEFINITIONS;

  /**
   * Check if a given role is allowed to perform a specific action
   */
  public hasPermission(role: UserRole, action: PermissionAction): boolean {
    if (role === 'superadmin') return true; // SuperAdmin has universal clearance

    const perm = this.permissions.find((p) => p.action === action);
    if (!perm) {
      monitoring.warn('RBAC', `Permission action [${action}] is not defined in matrix`);
      return false;
    }

    return Boolean(perm[role]);
  }

  /**
   * Check resource-level access (e.g., driver can only access their assigned shipment)
   */
  public canAccessShipment(user: { role: UserRole; id?: string; staffId?: string }, shipment: { driverId?: string; assignedDriverId?: string; customerPhone?: string }): boolean {
    if (user.role === 'superadmin' || user.role === 'admin') return true;

    if (user.role === 'driver') {
      return (
        shipment.driverId === user.id ||
        shipment.assignedDriverId === user.id ||
        shipment.driverId === user.staffId ||
        !shipment.driverId // Unassigned shipments readable by fleet
      );
    }

    return true; // Customers can view if tracking ID matches
  }

  /**
   * Throw or reject if user does not satisfy permission
   */
  public enforce(role: UserRole, action: PermissionAction): void {
    if (!this.hasPermission(role, action)) {
      monitoring.warn('RBAC', `Access Denied: Role [${role}] attempted action [${action}]`);
      const error: any = new Error(`Forbidden: Role [${role}] lacks required permission [${action}]`);
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Get all permissions granted to a given role
   */
  public getPermissionsForRole(role: UserRole): SystemPermissionDto[] {
    return this.permissions.filter((p) => role === 'superadmin' || Boolean(p[role]));
  }

  /**
   * Return full permissions list
   */
  public getAllPermissions(): SystemPermissionDto[] {
    return [...this.permissions];
  }
}

export const rbac = new RBACEngine();
