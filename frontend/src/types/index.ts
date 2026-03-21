export interface Alert {
  id: string;
  alert_type: 'EARTHQUAKE' | 'STORM' | 'FLOOD' | 'GENERAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  country?: string;
  magnitude?: number;
  depth?: number;
  wind_speed?: number;
  rainfall?: number;
  source: string;
  external_id?: string;
  event_data?: Record<string, unknown>;
  is_active: boolean;
  is_anomaly: boolean;
  acknowledged: boolean;
  event_time: string;
  acknowledged_at?: string;
  created_at: string;
  updated_at: string;
  sms_sent: boolean;
  email_sent: boolean;
}

export interface AlertListResponse {
  alerts: Alert[];
  total: number;
  page: number;
  page_size: number;
}

export interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  alerts_by_severity: Record<string, number>;
  alerts_by_type: Record<string, number>;
  recent_24h: number;
  anomalies_detected: number;
}

export interface MetricsData {
  time_window_hours: number;
  alerts: {
    total: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
  };
  events: {
    total: number;
    by_type: Record<string, number>;
  };
  anomalies: {
    detected: number;
  };
  predictions: {
    total: number;
  };
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'alert' | 'metrics' | 'prediction' | 'connected' | 'pong' | 'stats';
  timestamp: string;
  data?: unknown;
  client_id?: string;
  message?: string;
}

export interface FilterState {
  severity: string;
  alertType: string;
  showAnomalies: boolean;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}
