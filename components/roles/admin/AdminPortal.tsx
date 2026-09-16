'use client';

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { KPIOverview } from '@/components/dashboard/KPIOverview';
import { LiveMapAndList } from '@/components/dashboard/LiveMapAndList';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { OrderDispatchTable } from '@/components/dashboard/OrderDispatchTable';
import { FinancialSnapshotView } from '@/components/dashboard/FinancialSnapshotView';

// Dedicated Sub-views
import { ShipmentsOrdersView } from '@/components/dashboard/views/ShipmentsOrdersView';
import { DispatchBookingView } from '@/components/dashboard/views/DispatchBookingView';
import { DriversPersonnelView } from '@/components/dashboard/views/DriversPersonnelView';
import { FleetManagementView } from '@/components/dashboard/views/FleetManagementView';
import { WarehousesHubsView } from '@/components/dashboard/views/WarehousesHubsView';
import { RoutesPlanningView } from '@/components/dashboard/views/RoutesPlanningView';
import { RatesTariffsView } from '@/components/dashboard/views/RatesTariffsView';
import { InventoryStockView } from '@/components/dashboard/views/InventoryStockView';
import { InvoicesPaymentsView } from '@/components/dashboard/views/InvoicesPaymentsView';
import { SystemAlertsView } from '@/components/dashboard/views/SystemAlertsView';
import { SystemSettingsView } from '@/components/dashboard/views/SystemSettingsView';
import { HelpSupportView } from '@/components/dashboard/views/HelpSupportView';
import { OverviewReportsView } from '@/components/dashboard/views/OverviewReportsView';
import { SuperAdminPortal } from '@/components/roles/superadmin/SuperAdminPortal';
import { useLogistics } from '@/context/LogisticsContext';

export function AdminPortal() {
  const { activeNavSection, setActiveNavSection, role } = useLogistics();

  const views = {
    overview_dashboard: <div className="space-y-6"><KPIOverview /><LiveMapAndList /><AnalyticsCharts /><OrderDispatchTable /><FinancialSnapshotView /></div>,
    overview_reports: <OverviewReportsView />,
    orders_shipments: <ShipmentsOrdersView onOpenCreateOrder={() => setActiveNavSection('orders_dispatch')} />, orders_dispatch: <DispatchBookingView />, orders_tracking: <LiveMapAndList />,
    fleet_vehicles: <FleetManagementView />, fleet_drivers: <DriversPersonnelView />, fleet_routes: <RoutesPlanningView />,
    inventory_stock: <InventoryStockView />, inventory_warehouses: <WarehousesHubsView />,
    finance_invoices: <InvoicesPaymentsView />, finance_tariffs: <RatesTariffsView />,
    utility_alerts: <SystemAlertsView />,
    utility_settings: role === 'superadmin' ? <SuperAdminPortal /> : <SystemSettingsView />,
    utility_help: <HelpSupportView />,
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <main id="dashboard-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{views[activeNavSection]}</div>
      </main>
    </div>
  );
}
