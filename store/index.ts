import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import driverReducer from './slices/driverSlice';
import terminalLogsReducer from './slices/terminalLogsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    driver: driverReducer,
    terminalLogs: terminalLogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
