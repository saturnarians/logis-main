import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DriverWorkflowState {
  isScannerActive: boolean;
  selectedStopIndex: number;
  completedStops: string[];
  vehicleChecklist: {
    tiresInspected: boolean;
    fuelChecked: boolean;
    cargoSecured: boolean;
    documentsVerified: boolean;
  };
  offlineDeliveriesQueue: any[];
}

const initialState: DriverWorkflowState = {
  isScannerActive: false,
  selectedStopIndex: 0,
  completedStops: [],
  vehicleChecklist: {
    tiresInspected: true,
    fuelChecked: true,
    cargoSecured: true,
    documentsVerified: true,
  },
  offlineDeliveriesQueue: [],
};

export const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setScannerActive: (state, action: PayloadAction<boolean>) => {
      state.isScannerActive = action.payload;
    },
    setSelectedStopIndex: (state, action: PayloadAction<number>) => {
      state.selectedStopIndex = action.payload;
    },
    markStopCompleted: (state, action: PayloadAction<string>) => {
      if (!state.completedStops.includes(action.payload)) {
        state.completedStops.push(action.payload);
      }
    },
    toggleChecklistItem: (
      state,
      action: PayloadAction<keyof DriverWorkflowState['vehicleChecklist']>
    ) => {
      state.vehicleChecklist[action.payload] = !state.vehicleChecklist[action.payload];
    },
    queueOfflineDelivery: (state, action: PayloadAction<any>) => {
      state.offlineDeliveriesQueue.push(action.payload);
    },
    clearOfflineQueue: (state) => {
      state.offlineDeliveriesQueue = [];
    },
  },
});

export const {
  setScannerActive,
  setSelectedStopIndex,
  markStopCompleted,
  toggleChecklistItem,
  queueOfflineDelivery,
  clearOfflineQueue,
} = driverSlice.actions;

export default driverSlice.reducer;
