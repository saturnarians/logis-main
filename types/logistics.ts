export type Role = 'superadmin' | 'admin' | 'driver' | 'customer';

export type ShipmentStatus = 
  | 'Pending' 
  | 'In Transit' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Delayed' 
  | 'Canceled';

export type PriorityLevel = 'Standard' | 'Express' | 'Overnight';

export type DriverStatus = 'Available' | 'On Duty' | 'Off Duty' | 'Maintenance';

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  timestamp?: string;
  completed: boolean;
}

export interface TimelineEntry {
  id: string;
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface ProofOfDelivery {
  signatureUrl?: string;
  photoUrl?: string;
  otpCode?: string;
  verified: boolean;
  verifiedAt?: string;
  signedByCustomerName?: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  senderName: string;
  senderAddress: string;
  recipientAddress: string;
  originCity: string;
  destinationCity: string;
  destCity?: string;
  status: ShipmentStatus;
  priority: PriorityLevel;
  weightKg: number;
  parcelType: string;
  pieces?: number;
  serviceType?: string;
  carrier?: string;
  temperatureCelsius?: number;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  
  driverId?: string;
  driverName?: string;
  vehicleNo?: string;
  assignedDriverId?: string;
  
  routePoints: RoutePoint[];
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  
  costUsd: number;
  revenueUsd: number;
  fuelCostUsd: number;
  
  timeline: TimelineEntry[];
  proofOfDelivery?: ProofOfDelivery;
  flaggedForDelay?: boolean;
  delayReason?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: DriverStatus;
  vehicleType: string;
  vehicleNo: string;
  currentLat: number;
  currentLng: number;
  assignedShipmentIds: string[];
  rating: number;
  completedToday: number;
  fuelLevelPct: number;
  activeRouteName?: string;
}

export interface LogisticsAlert {
  id: string;
  shipmentId: string;
  trackingId: string;
  type: 'delay' | 'capacity' | 'weather' | 'sla_breach' | 'route_stop' | 'pod_required';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'fuel' | 'toll' | 'maintenance' | 'driver_payout';
  amountUsd: number;
  vehicleNo: string;
  driverName: string;
  note: string;
}

export interface DailyTrend {
  date: string;
  delivered: number;
  delayed: number;
  pending: number;
  totalVolume: number;
}

export interface HourlyHeatmap {
  hour: string; // e.g. '08:00'
  dispatched: number;
  delivered: number;
}

export interface FuelTrend {
  date: string;
  fuelSpend: number;
  tollsSpend: number;
  maintenanceSpend: number;
  avgCostPerDelivery: number;
}

export type VehicleStatus = 'Available' | 'En Route' | 'In-Maintenance';

export interface Vehicle {
  id: string;
  plateNo: string;
  model: string;
  type: string;
  status: VehicleStatus;
  driverId?: string;
  driverName?: string;
  fuelLevelPct: number;
  mileageKm: number;
  nextServiceDate: string;
  maxPayloadKg: number;
  lastInspectionPassed: boolean;
  gpsDeviceId: string;
}

export interface RoutePlan {
  id: string;
  name: string;
  zone: string;
  totalStops: number;
  completedStops: number;
  distanceKm: number;
  estDurationHours: number;
  assignedDriverName: string;
  status: 'In Progress' | 'Scheduled' | 'Completed' | 'Optimized';
  originHub: string;
  destinationHub: string;
  efficiencyScorePct: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Packaging' | 'Cold-Chain' | 'Security & Seals' | 'Labels & Hardware' | 'Customer Freight';
  warehouseHub: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  unitCostUsd: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface WarehouseHub {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  totalCapacityTons: number;
  currentUsageTons: number;
  managerName: string;
  contactPhone: string;
  activeDocks: number;
  totalDocks: number;
  inboundToday: number;
  outboundToday: number;
  status: 'Normal Operations' | 'High Congestion' | 'Maintenance';
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amountUsd: number;
  paymentType: 'Prepaid' | 'COD' | 'Contract 30D' | 'Credit Card';
  status: 'Paid' | 'Pending' | 'Overdue' | 'COD Collected';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  itemsSummary: string;
}

export interface RateTariff {
  id: string;
  name: string;
  zoneFrom: string;
  zoneTo: string;
  basePriceUsd: number;
  pricePerKgUsd: number;
  expressMultiplier: number;
  overnightMultiplier: number;
  fuelSurchargePct: number;
  handlingFeeUsd: number;
}

export interface SystemPermission {
  id: string;
  name: string;
  description: string;
  superadmin: boolean;
  admin: boolean;
  driver: boolean;
  customer: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  staffId: string;
  hub?: string;
  vehicleId?: string;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  lastLogin?: string;
}

export type AIDataAccessMode = 'read_only' | 'human_in_the_loop' | 'read_write';

export type AIActionType = 
  | 'update_shipment_status' 
  | 'assign_driver' 
  | 'create_route_alert' 
  | 'update_tariff';

export interface PendingAIAction {
  id: string;
  actionType: AIActionType;
  title: string;
  description: string;
  payload: {
    shipmentId?: string;
    trackingId?: string;
    newStatus?: ShipmentStatus;
    location?: string;
    note?: string;
    driverId?: string;
    driverName?: string;
    alertMessage?: string;
    alertSeverity?: 'low' | 'medium' | 'high';
    alertType?: 'delay' | 'capacity' | 'weather' | 'sla_breach';
    tariffId?: string;
    basePriceUsd?: number;
    pricePerKgUsd?: number;
    fuelSurchargePct?: number;
    [key: string]: any;
  };
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  proposerPrompt?: string;
}

export interface AIAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  status: 'Executed' | 'Approved' | 'Rejected' | 'Blocked (Read-Only)' | 'AI Off';
}

export interface AIGovernanceConfig {
  aiEnabled: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
  dataAccessMode: AIDataAccessMode;
  readPermissions: {
    shipments: boolean;
    fleetAndDrivers: boolean;
    telemetryAndGPS: boolean;
    financialsAndTariffs: boolean;
    alertsAndExceptions: boolean;
  };
  writePermissions: {
    updateShipmentStatus: boolean;
    assignDrivers: boolean;
    createAlerts: boolean;
    modifyTariffs: boolean;
  };
  pendingActions: PendingAIAction[];
  auditLogs: AIAuditLog[];
}

