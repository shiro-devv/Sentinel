import React, { useState } from 'react';
import { Alert } from '../types';
import AlertCard from './AlertCard';

interface AlertListProps {
  alerts: Alert[];
  isLoading?: boolean;
  onAlertClick?: (alert: Alert) => void;
  showFilters?: boolean;
}

const AlertList: React.FC<AlertListProps> = ({
  alerts,
  isLoading,
  onAlertClick,
  showFilters = true,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== 'ALL' && alert.severity !== filterSeverity) return false;
    if (filterType !== 'ALL' && alert.alert_type !== filterType) return false;
    if (showAnomaliesOnly && !alert.is_anomaly) return false;
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800 rounded-lg">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
            >
              <option value="ALL">All Types</option>
              <option value="EARTHQUAKE">Earthquake</option>
              <option value="STORM">Storm</option>
              <option value="FLOOD">Flood</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anomalies-only"
              checked={showAnomaliesOnly}
              onChange={(e) => setShowAnomaliesOnly(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700"
            />
            <label htmlFor="anomalies-only" className="text-sm text-slate-300">
              Anomalies Only
            </label>
          </div>
          
          <div className="ml-auto text-sm text-slate-400">
            {filteredAlerts.length} of {alerts.length} alerts
          </div>
        </div>
      )}
      
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No alerts match your filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => onAlertClick?.(alert)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertList;
