'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  BarChart3, 
  Bell, 
  Boxes, 
  Building2, ChevronDown,
  Calculator, ChevronLeft, ChevronRight, 
  HelpCircle, LayoutDashboard, MapPin, 
  Package, Receipt, Route, Send, Settings, Truck, Users 
} from 'lucide-react';
import { NavSection, useLogistics } from '@/context/LogisticsContext';

type NavigationItem = [NavSection, string, LucideIcon];

const navigation: { title: string; icon: LucideIcon; items: NavigationItem[] }[] = [
  { title: 'Overview', icon: LayoutDashboard, items: [['overview_dashboard', 'Dashboard', LayoutDashboard], ['overview_reports', 'Reports & analytics', BarChart3]] },
  { title: 'Orders', icon: Package, items: [['orders_shipments', 'Shipments', Package], ['orders_dispatch', 'Dispatch', Send], ['orders_tracking', 'Live tracking', MapPin]] },
  { title: 'Fleet', icon: Truck, items: [['fleet_vehicles', 'Fleet', Truck], ['fleet_drivers', 'Personnel', Users], ['fleet_routes', 'Routes', Route]] },
  { title: 'Operations', icon: Boxes, items: [['inventory_stock', 'Inventory', Boxes], ['inventory_warehouses', 'Hubs', Building2], ['finance_invoices', 'Invoices', Receipt], ['finance_tariffs', 'Rates', Calculator]] },
  { title: 'System', icon: Settings, items: [['utility_alerts', 'Alerts', Bell], ['utility_settings', 'Settings', Settings], ['utility_help', 'Help', HelpCircle]] },
];

export function DashboardSidebar() {
  const { activeNavSection, setActiveNavSection, sidebarCollapsed, setSidebarCollapsed, currentUser, role } = useLogistics();
  const [open, setOpen] = useState<Record<string, boolean>>({ Overview: true, Orders: true, Fleet: true, Operations: true, System: true });
  const selectSection = (section: NavSection) => {
    setActiveNavSection(section);
    document.getElementById('dashboard-content')?.scrollTo({ top: 0 });
  };

  return (
    <aside className={`sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-gray-200 bg-white transition-all ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && <span className="font-black text-gray-900">DHL Logistics</span>}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="rounded p-2 hover:bg-slate-100" aria-label="Toggle navigation">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      
      <nav className="flex-1 space-y-3 overflow-y-auto p-3">
        {navigation.map(({ title, icon: TitleIcon, items }) => <section key={title}>
          {!sidebarCollapsed && <button className="mb-1 flex w-full items-center gap-2 text-left text-xs font-bold uppercase text-gray-400" onClick={() => setOpen({ ...open, [title]: !open[title] })}><TitleIcon className="h-3.5 w-3.5" />{title}</button>}
          {(sidebarCollapsed || open[title]) && items.map(([id, label, Icon]) => <button key={id} onClick={() => selectSection(id)} title={role === 'superadmin' && id === 'utility_settings' ? 'Governance' : label} className={`mb-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${activeNavSection === id ? 'bg-red-50 font-bold text-[#D40511]' : 'text-gray-600 hover:bg-slate-100'}`}>
            <Icon className={`h-4 w-4 shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!sidebarCollapsed && (role === 'superadmin' && id === 'utility_settings' ? 'Governance' : label)}
          </button>)}
        </section>)}
      </nav>
      {!sidebarCollapsed && <div className="border-t p-4 text-xs text-gray-500">{currentUser?.name}</div>}
    </aside>
  );
}
