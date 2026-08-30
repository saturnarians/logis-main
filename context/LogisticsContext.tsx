'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Role, 
  Shipment, 
  Driver, 
  LogisticsAlert, 
  ExpenseRecord, 
  ShipmentStatus, 
  ProofOfDelivery,
  DriverStatus,
  Vehicle,
  RoutePlan,
  InventoryItem,
  WarehouseHub,
  InvoiceRecord,
  RateTariff,
  SystemPermission,
  VehicleStatus,
  AuthUser,
  AIGovernanceConfig,
  AIDataAccessMode,
  PendingAIAction,
  AIAuditLog
} from '@/types/logistics';
import { 
  INITIAL_DRIVERS, 
  INITIAL_SHIPMENTS, 
  INITIAL_ALERTS, 
  INITIAL_EXPENSES,
  INITIAL_VEHICLES,
  INITIAL_ROUTES,
  INITIAL_INVENTORY,
  INITIAL_WAREHOUSES,
  INITIAL_INVOICES,
  INITIAL_TARIFFS,
  INITIAL_PERMISSIONS,
  INITIAL_AI_GOVERNANCE
} from '@/lib/mockData';

const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr-superadmin',
    name: 'Alex Rodriguez',
    email: 'superadmin@dhl.com',
    role: 'superadmin',
    staffId: 'DHL-DIR-001',
    hub: 'Global Operations Headquarters',
    department: 'Executive Logistics Command',
    phone: '+44 20 7946 0991',
    lastLogin: '2026-08-14 09:12'
  },
  {
    id: 'usr-admin',
    name: 'Sarah Jenkins',
    email: 'admin@dhl.com',
    role: 'admin',
    staffId: 'DHL-MGR-442',
    hub: 'London Central Gateway',
    department: 'Dispatch & Fleet Logistics',
    phone: '+44 20 7946 0834',
    lastLogin: '2026-08-14 08:45'
  },
  {
    id: 'usr-driver',
    name: 'Marcus Vance',
    email: 'driver@dhl.com',
    role: 'driver',
    staffId: 'DHL-DRV-101',
    hub: 'London Central Gateway',
    vehicleId: 'DHL-EV-402',
    department: 'Express Last-Mile Courier',
    phone: '+44 7700 900123',
    lastLogin: '2026-08-14 07:30'
  }
];

export type NavSection = 
  | 'overview_dashboard'
  | 'overview_reports'
  | 'orders_shipments'
  | 'orders_dispatch'
  | 'orders_tracking'
  | 'fleet_vehicles'
  | 'fleet_drivers'
  | 'fleet_routes'
  | 'inventory_stock'
  | 'inventory_warehouses'
  | 'finance_invoices'
  | 'finance_tariffs'
  | 'utility_alerts'
  | 'utility_settings'
  | 'utility_help';

interface LogisticsContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;
  shipments: Shipment[];
  drivers: Driver[];
  alerts: LogisticsAlert[];
  expenses: ExpenseRecord[];
  vehicles: Vehicle[];
  routes: RoutePlan[];
  inventory: InventoryItem[];
  warehouses: WarehouseHub[];
  invoices: InvoiceRecord[];
  tariffs: RateTariff[];
  permissions: SystemPermission[];
  
  // Navigation & UI state
  activeNavSection: NavSection;
  setActiveNavSection: (section: NavSection) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Filters
  statusFilter: string; // 'All' or specific ShipmentStatus
  setStatusFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: 'Today' | 'This Week' | 'This Month' | 'Custom';
  setDateRange: (range: 'Today' | 'This Week' | 'This Month' | 'Custom') => void;
  
  // Simulation
  isSimulating: boolean;
  toggleSimulation: () => void;
  
  // Public tracking state
  trackedShipmentId: string | null;
  setTrackedShipmentId: (id: string | null) => void;
  
  // Actions
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus, note?: string, location?: string) => void;
  createShipment: (shipment: Omit<Shipment, 'id' | 'createdAt' | 'timeline' | 'routePoints' | 'currentLocation'>) => void;
  assignDriverToShipment: (shipmentId: string, driverId: string) => void;
  submitProofOfDelivery: (shipmentId: string, pod: ProofOfDelivery) => void;
  updateDriverStatus: (driverId: string, status: DriverStatus) => void;
  resolveAlert: (alertId: string) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateInventoryStock: (itemId: string, newQuantity: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  createInvoice: (invoice: Omit<InvoiceRecord, 'id'>) => void;
  updateInvoiceStatus: (invoiceId: string, status: InvoiceRecord['status']) => void;
  updateTariff: (tariffId: string, updated: Partial<RateTariff>) => void;
  togglePermission: (permId: string, targetRole: Role) => void;
  
  // Auth state & methods
  currentUser: AuthUser | null;
  usersList: AuthUser[];
  loginUser: (role: Role, credentials?: { staffId?: string; email?: string; name?: string; hub?: string; vehicleId?: string }) => boolean;
  registerUser: (account: Omit<AuthUser, 'id'>) => boolean;
  logoutUser: () => void;

  // AI Copilot & Voice state
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
  initialCopilotPrompt: string;
  openCopilotWithPrompt: (prompt: string) => void;

  // AI Governance, Data Access & Human-in-the-Loop
  aiGovernance: AIGovernanceConfig;
  toggleAIMasterSwitch: (enabled: boolean) => void;
  updateAIGovernance: (updated: Partial<AIGovernanceConfig>) => void;
  setAIDataAccessMode: (mode: AIDataAccessMode) => void;
  toggleAIReadPermission: (key: keyof AIGovernanceConfig['readPermissions']) => void;
  toggleAIWritePermission: (key: keyof AIGovernanceConfig['writePermissions']) => void;
  approveAIAction: (actionId: string) => { success: boolean; message: string };
  rejectAIAction: (actionId: string, reason?: string) => { success: boolean; message: string };
  executeOrQueueAIAction: (action: Omit<PendingAIAction, 'id' | 'status' | 'timestamp'>) => { status: 'executed' | 'queued' | 'blocked'; message: string; action?: PendingAIAction };

  // Prisma + SQLite Database state & controls
  dbConnected: boolean;
  refreshDatabase: () => Promise<void>;
  reseedDatabase: () => Promise<{ success: boolean; message: string }>;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<Role>('customer');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [usersList, setUsersList] = useState<AuthUser[]>(DEFAULT_USERS);
  const [activeDriverId, setActiveDriverId] = useState<string>('drv-101');
  
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [alerts, setAlerts] = useState<LogisticsAlert[]>(INITIAL_ALERTS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [routes, setRoutes] = useState<RoutePlan[]>(INITIAL_ROUTES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [warehouses, setWarehouses] = useState<WarehouseHub[]>(INITIAL_WAREHOUSES);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [tariffs, setTariffs] = useState<RateTariff[]>(INITIAL_TARIFFS);
  const [permissions, setPermissions] = useState<SystemPermission[]>(INITIAL_PERMISSIONS);
  const [aiGovernance, setAiGovernance] = useState<AIGovernanceConfig>(INITIAL_AI_GOVERNANCE);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setRole('customer');
      setCurrentUser(null);
      return;
    }
    if (status !== 'authenticated' || !session.user) return;

    const user = session.user as AuthUser;
    setRole(user.role);
    setCurrentUser(user);
  }, [session, status]);

  const loginUser = (
    targetRole: Role,
    credentials?: { staffId?: string; email?: string; name?: string; hub?: string; vehicleId?: string }
  ) => {
    setRole(targetRole);
    if (targetRole === 'customer') {
      setCurrentUser(null);
      return true;
    }
    const matchedUser = usersList.find(
      (u) =>
        u.role === targetRole &&
        ((credentials?.email && u.email.toLowerCase() === credentials.email.toLowerCase()) ||
         (credentials?.staffId && u.staffId.toLowerCase() === credentials.staffId.toLowerCase()))
    ) || usersList.find((u) => u.role === targetRole) || {
      id: `usr-${Date.now()}`,
      name: credentials?.name || (targetRole === 'superadmin' ? 'Operations Director' : targetRole === 'admin' ? 'Station Controller' : 'Field Courier'),
      email: credentials?.email || `${targetRole}@dhl.com`,
      role: targetRole,
      staffId: credentials?.staffId || `DHL-ID-${Math.floor(1000 + Math.random() * 9000)}`,
      hub: credentials?.hub || 'London Central Gateway',
      vehicleId: credentials?.vehicleId || (targetRole === 'driver' ? 'DHL-EV-402' : undefined),
      department: targetRole === 'superadmin' ? 'Executive Logistics Command' : targetRole === 'admin' ? 'Dispatch Operations' : 'Express Delivery',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    if (targetRole === 'driver') {
      const matchedDriver = drivers.find((d) => d.name.toLowerCase().includes(matchedUser.name.toLowerCase()));
      if (matchedDriver) {
        setActiveDriverId(matchedDriver.id);
      } else {
        setActiveDriverId('drv-101');
      }
    }

    setCurrentUser(matchedUser);
    return true;
  };

  const registerUser = (account: Omit<AuthUser, 'id'>) => {
    const newUser: AuthUser = {
      ...account,
      id: `usr-${Date.now()}`,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setUsersList((prev) => [newUser, ...prev]);
    setRole(account.role);
    setCurrentUser(newUser);
    if (account.role === 'driver') {
      setActiveDriverId('drv-101');
    }
    return true;
  };

  const logoutUser = () => {
    setRole('customer');
    setCurrentUser(null);
  };

  // Navigation & UI state
  const [activeNavSection, setActiveNavSection] = useState<NavSection>('overview_dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<'Today' | 'This Week' | 'This Month' | 'Custom'>('Today');
  
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [trackedShipmentId, setTrackedShipmentId] = useState<string | null>('DHL-8942-01');

  // AI Copilot state
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [initialCopilotPrompt, setInitialCopilotPrompt] = useState<string>('');

  const toggleCopilot = () => setIsCopilotOpen((prev) => !prev);
  const openCopilotWithPrompt = (prompt: string) => {
    setInitialCopilotPrompt(prompt);
    setIsCopilotOpen(true);
  };

  // Prisma + SQLite Database state
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Sync state from SQLite on mount
  const refreshDatabase = async () => {
    try {
      const res = await fetch('/api/db/sync');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.shipments && json.data.shipments.length > 0) setShipments(json.data.shipments);
          if (json.data.drivers && json.data.drivers.length > 0) setDrivers(json.data.drivers);
          if (json.data.vehicles && json.data.vehicles.length > 0) setVehicles(json.data.vehicles);
          if (json.data.warehouses && json.data.warehouses.length > 0) setWarehouses(json.data.warehouses);
          if (json.data.alerts && json.data.alerts.length > 0) setAlerts(json.data.alerts);
          if (json.data.invoices && json.data.invoices.length > 0) setInvoices(json.data.invoices);
          if (json.data.tariffs && json.data.tariffs.length > 0) setTariffs(json.data.tariffs);
          if (json.data.inventory && json.data.inventory.length > 0) setInventory(json.data.inventory);
          if (json.data.permissions && json.data.permissions.length > 0) setPermissions(json.data.permissions);
          if (json.data.governance) setAiGovernance(json.data.governance);
          setDbConnected(true);
        }
      }
    } catch (err) {
      console.warn('SQLite DB sync fallback to local memory state:', err);
    }
  };

  const reseedDatabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/db/reseed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        await refreshDatabase();
        return { success: true, message: json.message || 'Database reseeded successfully!' };
      }
      return { success: false, message: json.error || 'Failed to reseed database' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while reseeding' };
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const res = await fetch('/api/db/sync');
        if (!isMounted) return;
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            if (json.data.shipments && json.data.shipments.length > 0) setShipments(json.data.shipments);
            if (json.data.drivers && json.data.drivers.length > 0) setDrivers(json.data.drivers);
            if (json.data.vehicles && json.data.vehicles.length > 0) setVehicles(json.data.vehicles);
            if (json.data.warehouses && json.data.warehouses.length > 0) setWarehouses(json.data.warehouses);
            if (json.data.alerts && json.data.alerts.length > 0) setAlerts(json.data.alerts);
            if (json.data.invoices && json.data.invoices.length > 0) setInvoices(json.data.invoices);
            if (json.data.tariffs && json.data.tariffs.length > 0) setTariffs(json.data.tariffs);
            if (json.data.inventory && json.data.inventory.length > 0) setInventory(json.data.inventory);
            if (json.data.permissions && json.data.permissions.length > 0) setPermissions(json.data.permissions);
            if (json.data.governance) setAiGovernance(json.data.governance);
            setDbConnected(true);
          }
        }
      } catch (err) {
        console.warn('SQLite DB sync fallback to local memory state:', err);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Simulation effect: Periodically update active driver coordinates and shipment progress
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setShipments((prevShipments) =>
        prevShipments.map((shipment) => {
          if (shipment.status === 'In Transit' || shipment.status === 'Out for Delivery') {
            // Slight jitter lat/lng to simulate vehicle progress on map
            const deltaLat = (Math.random() - 0.48) * 0.0015;
            const deltaLng = (Math.random() - 0.48) * 0.0015;

            const newLat = Number((shipment.currentLocation.lat + deltaLat).toFixed(4));
            const newLng = Number((shipment.currentLocation.lng + deltaLng).toFixed(4));

            return {
              ...shipment,
              currentLocation: {
                ...shipment.currentLocation,
                lat: newLat,
                lng: newLng,
              },
            };
          }
          return shipment;
        })
      );

      // Also move drivers on duty
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          if (driver.status === 'On Duty') {
            const deltaLat = (Math.random() - 0.48) * 0.0012;
            const deltaLng = (Math.random() - 0.48) * 0.0012;
            return {
              ...driver,
              currentLat: Number((driver.currentLat + deltaLat).toFixed(4)),
              currentLng: Number((driver.currentLng + deltaLng).toFixed(4)),
            };
          }
          return driver;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = () => setIsSimulating((prev) => !prev);

  const updateShipmentStatus = (
    id: string,
    newStatus: ShipmentStatus,
    note?: string,
    location?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id || s.trackingId === id) {
          const newTimelineEntry = {
            id: `t-${Date.now()}`,
            status: newStatus,
            location: location || s.currentLocation.address,
            timestamp,
            note: note || `Status updated to ${newStatus}`,
            updatedBy: role === 'driver' ? `Driver (${s.driverName || 'Field Agent'})` : `${role.toUpperCase()} Admin`,
          };

          const isDelivered = newStatus === 'Delivered';
          return {
            ...s,
            status: newStatus,
            actualDelivery: isDelivered ? timestamp : s.actualDelivery,
            timeline: [newTimelineEntry, ...s.timeline],
            proofOfDelivery: isDelivered && !s.proofOfDelivery?.verified
              ? { verified: true, verifiedAt: timestamp, signedByCustomerName: s.customerName }
              : s.proofOfDelivery,
          };
        }
        return s;
      })
    );
  };

  const createShipment = (
    newShipmentData: Omit<Shipment, 'id' | 'createdAt' | 'timeline' | 'routePoints' | 'currentLocation'>
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const id = `ship-${Date.now().toString().slice(-4)}`;
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingId = `DHL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const orderId = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

    const driver = drivers.find((d) => d.id === newShipmentData.driverId);

    const newShipment: Shipment = {
      ...newShipmentData,
      id,
      trackingId,
      orderId,
      createdAt: timestamp,
      driverName: driver ? driver.name : newShipmentData.driverName,
      vehicleNo: driver ? driver.vehicleNo : 'Unassigned',
      currentLocation: {
        lat: driver ? driver.currentLat : 51.5074,
        lng: driver ? driver.currentLng : -0.1278,
        address: `${newShipmentData.originCity} Staging Warehouse`,
      },
      routePoints: [
        { lat: 51.5074, lng: -0.1278, name: `${newShipmentData.originCity} Central Depot`, completed: true, timestamp },
        { lat: 51.52, lng: -0.09, name: `${newShipmentData.destinationCity} Destination`, completed: false },
      ],
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'Pending',
          location: `${newShipmentData.originCity} Central Depot`,
          timestamp,
          note: `Shipment order created by ${role.toUpperCase()}. Assigned to driver: ${driver ? driver.name : 'Pending Dispatch'}`,
          updatedBy: `${role.toUpperCase()} Dispatch`,
        },
      ],
      proofOfDelivery: {
        verified: false,
        otpCode: randomCode,
      },
    };

    setShipments((prev) => [newShipment, ...prev]);

    // If driver assigned, update driver state
    if (driver) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? { ...d, assignedShipmentIds: [...d.assignedShipmentIds, id], status: 'On Duty' }
            : d
        )
      );
    }
  };

  const assignDriverToShipment = (shipmentId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            driverId: driver.id,
            driverName: driver.name,
            vehicleNo: driver.vehicleNo,
            status: s.status === 'Pending' ? 'In Transit' : s.status,
          };
        }
        return s;
      })
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              assignedShipmentIds: d.assignedShipmentIds.includes(shipmentId)
                ? d.assignedShipmentIds
                : [...d.assignedShipmentIds, shipmentId],
              status: 'On Duty',
            }
          : d
      )
    );
  };

  const submitProofOfDelivery = (shipmentId: string, pod: ProofOfDelivery) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId || s.trackingId === shipmentId) {
          return {
            ...s,
            status: 'Delivered',
            actualDelivery: timestamp,
            proofOfDelivery: {
              ...s.proofOfDelivery,
              ...pod,
              verified: true,
              verifiedAt: timestamp,
            },
            timeline: [
              {
                id: `t-${Date.now()}`,
                status: 'Delivered',
                location: s.recipientAddress,
                timestamp,
                note: `Proof of Delivery captured. Signed by: ${pod.signedByCustomerName || s.customerName}. OTP verified.`,
                updatedBy: `Driver (${s.driverName || 'Field Agent'})`,
              },
              ...s.timeline,
            ],
          };
        }
        return s;
      })
    );

    // Update driver completed count
    const targetShipment = shipments.find((s) => s.id === shipmentId || s.trackingId === shipmentId);
    if (targetShipment?.driverId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === targetShipment.driverId ? { ...d, completedToday: d.completedToday + 1 } : d
        )
      );
    }
  };

  const updateDriverStatus = (driverId: string, newStatus: DriverStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: newStatus } : d))
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setExpenses((prev) => [{ ...expenseData, id }, ...prev]);
  };

  const updateVehicleStatus = (vehicleId: string, status: VehicleStatus) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status } : v))
    );
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const id = `veh-${Date.now().toString().slice(-4)}`;
    setVehicles((prev) => [{ ...vehicleData, id }, ...prev]);
  };

  const updateInventoryStock = (itemId: string, newQuantity: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const status: InventoryItem['status'] = 
            newQuantity === 0 ? 'Out of Stock' : newQuantity <= item.minThreshold ? 'Low Stock' : 'In Stock';
          return { ...item, quantity: newQuantity, status };
        }
        return item;
      })
    );
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const id = `inv-${Date.now().toString().slice(-4)}`;
    setInventory((prev) => [{ ...itemData, id }, ...prev]);
  };

  const createInvoice = (invoiceData: Omit<InvoiceRecord, 'id'>) => {
    const id = `inv-rec-${Date.now().toString().slice(-4)}`;
    setInvoices((prev) => [{ ...invoiceData, id }, ...prev]);
  };

  const updateInvoiceStatus = (invoiceId: string, status: InvoiceRecord['status']) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status, paidAt: status === 'Paid' || status === 'COD Collected' ? timestamp : inv.paidAt } : inv))
    );
  };

  const updateTariff = (tariffId: string, updated: Partial<RateTariff>) => {
    setTariffs((prev) =>
      prev.map((t) => (t.id === tariffId ? { ...t, ...updated } : t))
    );
  };

  const togglePermission = (permId: string, targetRole: Role) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === permId) {
          return {
            ...p,
            [targetRole]: !p[targetRole]
          };
        }
        return p;
      })
    );
  };

  // AI Governance, Data Access & Human-in-the-Loop State & Methods
  const toggleAIMasterSwitch = (enabled: boolean) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const actorName = currentUser?.name || (role === 'superadmin' ? 'Superadmin Executive' : 'Superadmin');
    setAiGovernance((prev) => {
      const newAuditLog: AIAuditLog = {
        id: `log-${Date.now()}`,
        timestamp,
        actor: actorName,
        action: enabled ? 'AI Master Switch: ENABLED' : 'AI Master Switch: DISABLED',
        details: `SuperAdmin manually switched AI Operational Status to ${enabled ? 'ACTIVE' : 'OFF (Human-in-the-Loop Override)'}.`,
        status: enabled ? 'Executed' : 'AI Off'
      };
      return {
        ...prev,
        aiEnabled: enabled,
        lastModifiedBy: actorName,
        lastModifiedAt: timestamp,
        auditLogs: [newAuditLog, ...prev.auditLogs]
      };
    });
  };

  const updateAIGovernance = (updated: Partial<AIGovernanceConfig>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const actorName = currentUser?.name || (role === 'superadmin' ? 'Superadmin Executive' : 'Superadmin');
    setAiGovernance((prev) => {
      const newAuditLog: AIAuditLog = {
        id: `log-${Date.now()}`,
        timestamp,
        actor: actorName,
        action: 'AI Governance Policy Updated',
        details: `Updated AI policy configurations: ${Object.keys(updated).join(', ')}`,
        status: 'Executed'
      };
      return {
        ...prev,
        ...updated,
        lastModifiedBy: actorName,
        lastModifiedAt: timestamp,
        auditLogs: [newAuditLog, ...prev.auditLogs]
      };
    });
  };

  const setAIDataAccessMode = (mode: AIDataAccessMode) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const actorName = currentUser?.name || (role === 'superadmin' ? 'Superadmin Executive' : 'Superadmin');
    setAiGovernance((prev) => {
      const newAuditLog: AIAuditLog = {
        id: `log-${Date.now()}`,
        timestamp,
        actor: actorName,
        action: `AI Data Access Tier: ${mode.toUpperCase().replace(/_/g, ' ')}`,
        details: `SuperAdmin updated access mode to ${mode}. Write operations will be ${mode === 'read_only' ? 'strictly blocked' : mode === 'human_in_the_loop' ? 'routed through human approval' : 'executed autonomously'}.`,
        status: 'Executed'
      };
      return {
        ...prev,
        dataAccessMode: mode,
        lastModifiedBy: actorName,
        lastModifiedAt: timestamp,
        auditLogs: [newAuditLog, ...prev.auditLogs]
      };
    });
  };

  const toggleAIReadPermission = (key: keyof AIGovernanceConfig['readPermissions']) => {
    setAiGovernance((prev) => ({
      ...prev,
      readPermissions: {
        ...prev.readPermissions,
        [key]: !prev.readPermissions[key]
      }
    }));
  };

  const toggleAIWritePermission = (key: keyof AIGovernanceConfig['writePermissions']) => {
    setAiGovernance((prev) => ({
      ...prev,
      writePermissions: {
        ...prev.writePermissions,
        [key]: !prev.writePermissions[key]
      }
    }));
  };

  const approveAIAction = (actionId: string) => {
    const action = aiGovernance.pendingActions.find((a) => a.id === actionId);
    if (!action) return { success: false, message: 'Action not found in queue.' };

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const actorName = currentUser?.name || (role === 'superadmin' ? 'Superadmin Executive' : 'Superadmin');

    // Execute corresponding real mutation in state
    if (action.actionType === 'update_shipment_status' && action.payload.shipmentId) {
      updateShipmentStatus(
        action.payload.shipmentId,
        action.payload.newStatus || 'In Transit',
        action.payload.note || 'Approved AI Dispatch Milestone Transition',
        action.payload.location
      );
    } else if (action.actionType === 'assign_driver' && action.payload.shipmentId && action.payload.driverId) {
      assignDriverToShipment(action.payload.shipmentId, action.payload.driverId);
    } else if (action.actionType === 'create_route_alert' && action.payload.alertMessage) {
      const newAlert: LogisticsAlert = {
        id: `alt-${Date.now()}`,
        shipmentId: action.payload.shipmentId || 'ship-001',
        trackingId: action.payload.trackingId || 'DHL-SYS-ALERT',
        type: action.payload.alertType || 'weather',
        severity: action.payload.alertSeverity || 'medium',
        message: action.payload.alertMessage,
        timestamp,
        resolved: false
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else if (action.actionType === 'update_tariff' && action.payload.tariffId) {
      updateTariff(action.payload.tariffId, {
        basePriceUsd: action.payload.basePriceUsd,
        pricePerKgUsd: action.payload.pricePerKgUsd,
        fuelSurchargePct: action.payload.fuelSurchargePct
      });
    }

    // Update pending action status to approved
    setAiGovernance((prev) => {
      const newAuditLog: AIAuditLog = {
        id: `log-${Date.now()}`,
        timestamp,
        actor: actorName,
        action: `Approved AI Action: ${action.title}`,
        details: `Human-in-the-Loop approval confirmed. Executed write operation for ${action.actionType}.`,
        status: 'Approved'
      };
      return {
        ...prev,
        pendingActions: prev.pendingActions.map((a) =>
          a.id === actionId ? { ...a, status: 'approved' } : a
        ),
        auditLogs: [newAuditLog, ...prev.auditLogs]
      };
    });

    return { success: true, message: `Successfully approved & executed: ${action.title}` };
  };

  const rejectAIAction = (actionId: string, reason?: string) => {
    const action = aiGovernance.pendingActions.find((a) => a.id === actionId);
    if (!action) return { success: false, message: 'Action not found.' };

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const actorName = currentUser?.name || (role === 'superadmin' ? 'Superadmin Executive' : 'Superadmin');

    setAiGovernance((prev) => {
      const newAuditLog: AIAuditLog = {
        id: `log-${Date.now()}`,
        timestamp,
        actor: actorName,
        action: `Rejected AI Action: ${action.title}`,
        details: `Human-in-the-Loop decision: Rejected. Reason: ${reason || 'Manual SuperAdmin override'}`,
        status: 'Rejected'
      };
      return {
        ...prev,
        pendingActions: prev.pendingActions.map((a) =>
          a.id === actionId ? { ...a, status: 'rejected' } : a
        ),
        auditLogs: [newAuditLog, ...prev.auditLogs]
      };
    });

    return { success: true, message: `Action rejected: ${action.title}` };
  };

  const executeOrQueueAIAction = (actionData: Omit<PendingAIAction, 'id' | 'status' | 'timestamp'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newActionId = `act-${Date.now()}`;

    if (!aiGovernance.aiEnabled) {
      return { status: 'blocked' as const, message: 'AI is currently turned OFF by SuperAdmin.' };
    }

    if (aiGovernance.dataAccessMode === 'read_only') {
      return { status: 'blocked' as const, message: 'AI Write Access is blocked under Read-Only Mode. Human approval is required.' };
    }

    if (aiGovernance.dataAccessMode === 'read_write') {
      // Direct execute
      const pendingItem: PendingAIAction = {
        ...actionData,
        id: newActionId,
        status: 'approved',
        timestamp
      };

      if (actionData.actionType === 'update_shipment_status' && actionData.payload.shipmentId) {
        updateShipmentStatus(
          actionData.payload.shipmentId,
          actionData.payload.newStatus || 'In Transit',
          actionData.payload.note || 'Autonomous AI Execution',
          actionData.payload.location
        );
      } else if (actionData.actionType === 'assign_driver' && actionData.payload.shipmentId && actionData.payload.driverId) {
        assignDriverToShipment(actionData.payload.shipmentId, actionData.payload.driverId);
      } else if (actionData.actionType === 'create_route_alert' && actionData.payload.alertMessage) {
        const newAlert: LogisticsAlert = {
          id: `alt-${Date.now()}`,
          shipmentId: actionData.payload.shipmentId || 'ship-001',
          trackingId: actionData.payload.trackingId || 'DHL-SYS-ALERT',
          type: actionData.payload.alertType || 'weather',
          severity: actionData.payload.alertSeverity || 'medium',
          message: actionData.payload.alertMessage,
          timestamp,
          resolved: false
        };
        setAlerts((prev) => [newAlert, ...prev]);
      } else if (actionData.actionType === 'update_tariff' && actionData.payload.tariffId) {
        updateTariff(actionData.payload.tariffId, {
          basePriceUsd: actionData.payload.basePriceUsd,
          pricePerKgUsd: actionData.payload.pricePerKgUsd,
          fuelSurchargePct: actionData.payload.fuelSurchargePct
        });
      }

      setAiGovernance((prev) => ({
        ...prev,
        pendingActions: [pendingItem, ...prev.pendingActions],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp,
            actor: 'AI Dispatch Autonomous Agent',
            action: `Autonomous Write: ${actionData.title}`,
            details: `Direct execution without manual approval under Read & Write policy.`,
            status: 'Executed'
          },
          ...prev.auditLogs
        ]
      }));

      return { status: 'executed' as const, message: `Directly executed: ${actionData.title}`, action: pendingItem };
    }

    // Default: 'human_in_the_loop'
    const pendingItem: PendingAIAction = {
      ...actionData,
      id: newActionId,
      status: 'pending',
      timestamp
    };

    setAiGovernance((prev) => ({
      ...prev,
      pendingActions: [pendingItem, ...prev.pendingActions],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp,
          actor: 'AI Dispatch Copilot',
          action: `Queued Action: ${actionData.title}`,
          details: `Drafted write action awaiting SuperAdmin Human-in-the-Loop approval.`,
          status: 'Executed'
        },
        ...prev.auditLogs
      ]
    }));

    return { status: 'queued' as const, message: `Drafted and queued for SuperAdmin approval: ${actionData.title}`, action: pendingItem };
  };

  return (
    <LogisticsContext.Provider
      value={{
        role,
        setRole,
        activeDriverId,
        setActiveDriverId,
        shipments,
        drivers,
        alerts,
        expenses,
        vehicles,
        routes,
        inventory,
        warehouses,
        invoices,
        tariffs,
        permissions,
        activeNavSection,
        setActiveNavSection,
        sidebarCollapsed,
        setSidebarCollapsed,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        isSimulating,
        toggleSimulation,
        trackedShipmentId,
        setTrackedShipmentId,
        updateShipmentStatus,
        createShipment,
        assignDriverToShipment,
        submitProofOfDelivery,
        updateDriverStatus,
        resolveAlert,
        addExpense,
        updateVehicleStatus,
        addVehicle,
        updateInventoryStock,
        addInventoryItem,
        createInvoice,
        updateInvoiceStatus,
        updateTariff,
        togglePermission,
        currentUser,
        usersList,
        loginUser,
        registerUser,
        logoutUser,
        isCopilotOpen,
        setIsCopilotOpen,
        toggleCopilot,
        initialCopilotPrompt,
        openCopilotWithPrompt,
        aiGovernance,
        toggleAIMasterSwitch,
        updateAIGovernance,
        setAIDataAccessMode,
        toggleAIReadPermission,
        toggleAIWritePermission,
        approveAIAction,
        rejectAIAction,
        executeOrQueueAIAction,
        dbConnected,
        refreshDatabase,
        reseedDatabase,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
