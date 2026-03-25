import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Alert, AlertListResponse, AlertStats, MetricsData } from '../types';
import config from '../config';
import { mockAlerts, mockAlertStats, mockMetrics } from './mockData';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

// Check if backend is available
let backendAvailable = true;
let backendChecked = false;

const checkBackend = async (): Promise<boolean> => {
  if (backendChecked) return backendAvailable;
  try {
    await api.get('/health', { timeout: 3000 });
    backendAvailable = true;
  } catch {
    console.warn('Backend not available, using demo data');
    backendAvailable = false;
  }
  backendChecked = true;
  return backendAvailable;
};

// Alerts API
export function useAlerts(params?: {
  page?: number;
  pageSize?: number;
  severity?: string;
  alertType?: string;
  isActive?: boolean;
  isAnomaly?: boolean;
}) {
  return useQuery<AlertListResponse>({
    queryKey: ['alerts', params],
    queryFn: async () => {
      const isAvailable = await checkBackend();
      if (!isAvailable) {
        // Return mock data with pagination
        let filteredAlerts = [...mockAlerts];
        
        if (params?.severity) {
          filteredAlerts = filteredAlerts.filter(a => a.severity === params.severity);
        }
        if (params?.alertType) {
          filteredAlerts = filteredAlerts.filter(a => a.alert_type === params.alertType);
        }
        if (params?.isAnomaly) {
          filteredAlerts = filteredAlerts.filter(a => a.is_anomaly);
        }
        if (params?.isActive !== undefined) {
          filteredAlerts = filteredAlerts.filter(a => a.is_active === params.isActive);
        }
        
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 5;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          alerts: filteredAlerts.slice(start, end),
          total: filteredAlerts.length,
          page,
          page_size: pageSize,
        };
      }
      const { data } = await api.get('/alerts', {
        params: {
          ...params,
          page_size: params?.pageSize,
          alert_type: params?.alertType,
          is_anomaly: params?.isAnomaly,
          is_active: params?.isActive,
        },
      });
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useAlert(id: string) {
  return useQuery<Alert>({
    queryKey: ['alert', id],
    queryFn: async () => {
      const { data } = await api.get(`/alerts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useActiveAlerts() {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'active'],
    queryFn: async () => {
      const isAvailable = await checkBackend();
      if (!isAvailable) {
        return mockAlerts.filter(a => a.is_active);
      }
      const { data } = await api.get('/alerts/active');
      return data;
    },
    refetchInterval: 15000,
  });
}

export function useRecentAlerts(hours: number = 24) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'recent', hours],
    queryFn: async () => {
      const { data } = await api.get('/alerts/recent', {
        params: { hours },
      });
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useAlertStats() {
  return useQuery<AlertStats>({
    queryKey: ['alerts', 'stats'],
    queryFn: async () => {
      const isAvailable = await checkBackend();
      if (!isAvailable) {
        return mockAlertStats;
      }
      const { data } = await api.get('/alerts/stats');
      return data;
    },
    refetchInterval: 60000,
  });
}

// Metrics API
export function useMetrics(hours: number = 24) {
  return useQuery<MetricsData>({
    queryKey: ['metrics', hours],
    queryFn: async () => {
      const isAvailable = await checkBackend();
      if (!isAvailable) {
        return mockMetrics;
      }
      const { data } = await api.get('/metrics', {
        params: { hours },
      });
      return data;
    },
    refetchInterval: 60000,
  });
}

export function useHourlyMetrics(hours: number = 24) {
  return useQuery({
    queryKey: ['metrics', 'hourly', hours],
    queryFn: async () => {
      const { data } = await api.get('/metrics/hourly', {
        params: { hours },
      });
      return data;
    },
    refetchInterval: 300000,
  });
}

export function useSeverityTrend(days: number = 7) {
  return useQuery({
    queryKey: ['metrics', 'severity-trend', days],
    queryFn: async () => {
      const { data } = await api.get('/metrics/severity-trend', {
        params: { days },
      });
      return data;
    },
    refetchInterval: 300000,
  });
}

// Health API
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get('/health');
      return data;
    },
    refetchInterval: 60000,
    retry: 3,
  });
}

// Mutation hooks
export function useAcknowledgeAlert() {
  return {
    mutate: async (alertId: string) => {
      const { data } = await api.post(`/alerts/${alertId}/acknowledge`);
      return data;
    },
  };
}

export function useDeactivateAlert() {
  return {
    mutate: async (alertId: string) => {
      const { data } = await api.post(`/alerts/${alertId}/deactivate`);
      return data;
    },
  };
}

export default api;
