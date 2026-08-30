import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DashboardViewType =
  | 'overview'
  | 'shipments'
  | 'dispatch'
  | 'drivers'
  | 'fleet'
  | 'warehouses'
  | 'routes'
  | 'tariffs'
  | 'inventory'
  | 'invoices'
  | 'alerts'
  | 'settings'
  | 'help'
  | 'driver_portal'
  | 'public_tracker';

interface UIState {
  activeView: DashboardViewType;
  searchQuery: string;
  isSidebarCollapsed: boolean;
  selectedTrackingId: string | null;
  isCopilotModalOpen: boolean;
  isTerminalLogsModalOpen: boolean;
  activeRoleWorkspace: 'superadmin' | 'admin' | 'driver' | 'customer';
  filterStatus: string;
}

const initialState: UIState = {
  activeView: 'overview',
  searchQuery: '',
  isSidebarCollapsed: false,
  selectedTrackingId: null,
  isCopilotModalOpen: false,
  isTerminalLogsModalOpen: false,
  activeRoleWorkspace: 'admin',
  filterStatus: 'all',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveView: (state, action: PayloadAction<DashboardViewType>) => {
      state.activeView = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setSelectedTrackingId: (state, action: PayloadAction<string | null>) => {
      state.selectedTrackingId = action.payload;
    },
    setCopilotModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCopilotModalOpen = action.payload;
    },
    setTerminalLogsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTerminalLogsModalOpen = action.payload;
    },
    setActiveRoleWorkspace: (state, action: PayloadAction<'superadmin' | 'admin' | 'driver' | 'customer'>) => {
      state.activeRoleWorkspace = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
  },
});

export const {
  setActiveView,
  setSearchQuery,
  toggleSidebar,
  setSidebarCollapsed,
  setSelectedTrackingId,
  setCopilotModalOpen,
  setTerminalLogsModalOpen,
  setActiveRoleWorkspace,
  setFilterStatus,
} = uiSlice.actions;

export default uiSlice.reducer;
