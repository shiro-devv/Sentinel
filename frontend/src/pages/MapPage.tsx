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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Map View</h1>
          <p className="text-slate-400 mt-1">Geographic visualization of disaster alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
            <span className="text-sm text-slate-400">
              Showing <span className="text-white font-semibold">{filteredAlerts.length}</span> of {alerts?.length || 0} alerts
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
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
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="card p-0 overflow-hidden">
            <div className="h-[400px] md:h-[500px] lg:h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full bg-slate-900">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading map data...</p>
                  </div>
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
      </div>

      {/* Selected Alert Info */}
      {selectedAlertInfo && (
        <div className="card animate-slide-up">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {selectedAlertInfo.title}
              </h3>
              <p className="text-slate-400 mt-1">
                {selectedAlertInfo.location_name || 'Unknown Location'}
              </p>
            </div>
            <button
              onClick={() => setSelectedAlertInfo(null)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Severity</p>
              <p className="font-semibold text-white">{selectedAlertInfo.severity}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p>
              <p className="font-semibold text-white">{selectedAlertInfo.alert_type}</p>
            </div>
            {selectedAlertInfo.magnitude && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Magnitude</p>
                <p className="font-semibold text-white">
                  {selectedAlertInfo.magnitude.toFixed(1)}
                </p>
              </div>
            )}
            {selectedAlertInfo.wind_speed && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Wind Speed</p>
                <p className="font-semibold text-white">
                  {selectedAlertInfo.wind_speed.toFixed(0)} mph
                </p>
              </div>
            )}
          </div>

          {selectedAlertInfo.description && (
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <p className="text-sm text-slate-300 leading-relaxed">{selectedAlertInfo.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPage;
