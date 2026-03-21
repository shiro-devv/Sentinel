import React, { useState, useMemo } from 'react';
import { useActiveAlerts } from '../services/api';
import { useAppStore } from '../store';
import MapView from '../components/MapView';
import SidebarFilters from '../components/SidebarFilters';
import { Alert } from '../types';

const MapPage: React.FC = () => {
  const { data: alerts, isLoading } = useActiveAlerts();
  const { filters, setFilters, resetFilters, setSelectedAlert } = useAppStore();
  const [selectedAlertInfo, setSelectedAlertInfo] = useState<Alert | null>(null);

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];

    return alerts.filter((alert) => {
      if (filters.severity !== 'ALL' && alert.severity !== filters.severity) {
        return false;
      }
      if (filters.alertType !== 'ALL' && alert.alert_type !== filters.alertType) {
        return false;
      }
      if (filters.showAnomalies && !alert.is_anomaly) {
        return false;
      }
      return true;
    });
  }, [alerts, filters]);

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlertInfo(alert);
    setSelectedAlert(alert);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Map View</h1>
          <p className="text-slate-400">
            Geographic visualization of disaster alerts
          </p>
        </div>
        <div className="text-sm text-slate-400">
          Showing {filteredAlerts.length} of {alerts?.length || 0} alerts
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SidebarFilters
            severity={filters.severity}
            alertType={filters.alertType}
            showAnomalies={filters.showAnomalies}
            onSeverityChange={(value) => setFilters({ severity: value })}
            onTypeChange={(value) => setFilters({ alertType: value })}
            onAnomaliesChange={(value) => setFilters({ showAnomalies: value })}
            onReset={resetFilters}
          />
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="card h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <MapView
                alerts={filteredAlerts}
                zoom={4}
                onAlertClick={handleAlertClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Selected Alert Info */}
      {selectedAlertInfo && (
        <div className="card bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {selectedAlertInfo.title}
              </h3>
              <p className="text-slate-400 text-white">
                {selectedAlertInfo.location_name || 'Unknown Location'}
              </p>
            </div>
            <button
              onClick={() => setSelectedAlertInfo(null)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Severity</p>
              <p className="font-semibold text-white">{selectedAlertInfo.severity}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Type</p>
              <p className="font-semibold text-white">{selectedAlertInfo.alert_type}</p>
            </div>
            {selectedAlertInfo.magnitude && (
              <div>
                <p className="text-sm text-slate-400">Magnitude</p>
                <p className="font-semibold text-white">
                  {selectedAlertInfo.magnitude.toFixed(1)}
                </p>
              </div>
            )}
            {selectedAlertInfo.wind_speed && (
              <div>
                <p className="text-sm text-slate-400">Wind Speed</p>
                <p className="font-semibold text-white">
                  {selectedAlertInfo.wind_speed.toFixed(0)} mph
                </p>
              </div>
            )}
          </div>

          {selectedAlertInfo.description && (
            <p className="mt-4 text-slate-300">{selectedAlertInfo.description}</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Map Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500"></span>
            <span className="text-sm text-slate-300">Low Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-slate-300">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-orange-500"></span>
            <span className="text-sm text-slate-300">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500"></span>
            <span className="text-sm text-slate-300">Critical Severity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
