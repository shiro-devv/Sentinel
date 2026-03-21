import { create } from 'zustand';
import { Alert, FilterState, AlertStats } from '../types';

interface AppStore {
  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  
  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  // Stats
  stats: AlertStats | null;
  setStats: (stats: AlertStats) => void;
  
  // UI State
  selectedAlert: Alert | null;
  setSelectedAlert: (alert: Alert | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Connection
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

const initialFilters: FilterState = {
  severity: 'ALL',
  alertType: 'ALL',
  showAnomalies: false,
  dateRange: {
    start: null,
    end: null,
  },
};

export const useAppStore = create<AppStore>((set) => ({
  // Alerts
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 1000),
    })),
  
  // Filters
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
  
  // Stats
  stats: null,
  setStats: (stats) => set({ stats }),
  
  // UI State
  selectedAlert: null,
  setSelectedAlert: (alert) => set({ selectedAlert: alert }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Connection
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
