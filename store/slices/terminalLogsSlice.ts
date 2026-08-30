import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LogEntry } from '@/lib/logger';

interface TerminalLogsState {
  logs: LogEntry[];
  filterLevel: string;
  autoScroll: boolean;
}

const initialState: TerminalLogsState = {
  logs: [],
  filterLevel: 'ALL',
  autoScroll: true,
};

export const terminalLogsSlice = createSlice({
  name: 'terminalLogs',
  initialState,
  reducers: {
    setLogs: (state, action: PayloadAction<LogEntry[]>) => {
      state.logs = action.payload;
    },
    addLog: (state, action: PayloadAction<LogEntry>) => {
      state.logs.unshift(action.payload);
      if (state.logs.length > 200) state.logs.pop();
    },
    setFilterLevel: (state, action: PayloadAction<string>) => {
      state.filterLevel = action.payload;
    },
    setAutoScroll: (state, action: PayloadAction<boolean>) => {
      state.autoScroll = action.payload;
    },
    clearLogs: (state) => {
      state.logs = [];
    },
  },
});

export const { setLogs, addLog, setFilterLevel, setAutoScroll, clearLogs } = terminalLogsSlice.actions;
export default terminalLogsSlice.reducer;
