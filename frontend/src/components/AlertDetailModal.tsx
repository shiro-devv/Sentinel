import React from 'react';
import { Alert } from '../types';
import { formatDistanceToNow, format } from 'date-fns';

interface AlertDetailModalProps {
  alert: Alert;
  onClose: () => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose }) => {
  const severityConfig = {
    LOW: {
      gradient: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/30',
      badge: 'severity-low',
      glow: 'shadow-emerald-500/20',
      text: 'text-emerald-400',
    },
    MEDIUM: {
      gradient: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/30',
      badge: 'severity-medium',
      glow: 'shadow-amber-500/20',
      text: 'text-amber-400',
    },
    HIGH: {
      gradient: 'from-orange-500/20 to-orange-600/10',
      border: 'border-orange-500/30',
      badge: 'severity-high',
      glow: 'shadow-orange-500/20',
      text: 'text-orange-400',
    },
    CRITICAL: {
      gradient: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/30',
      badge: 'severity-critical',
      glow: 'shadow-red-500/20',
      text: 'text-red-400',
    },
  };

  const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.LOW;

  const typeIcons: Record<string, string> = {
    EARTHQUAKE: '🌋',
    STORM: '⛈️',
    FLOOD: '🌊',
    FIRE: '🔥',
    GENERAL: '⚠️',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br ${config.gradient} backdrop-blur-xl border ${config.border} shadow-2xl animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/30 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{typeIcons[alert.alert_type] || '⚠️'}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`severity-badge ${config.badge}`}>{alert.severity}</span>
                {alert.is_anomaly && (
                  <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ⚡ ANOMALY
                  </span>
                )}
                {alert.acknowledged && (
                  <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Acknowledged
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{alert.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </p>
              <p className="font-semibold text-white">{alert.location_name || 'Unknown Location'}</p>
              {alert.country && <p className="text-sm text-slate-400 mt-1">{alert.country}</p>}
              <p className="text-xs text-slate-500 mt-1">
                {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time
              </p>
              <p className="font-semibold text-white">
                {format(new Date(alert.event_time), 'MMM d, yyyy h:mm a')}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {formatDistanceToNow(new Date(alert.event_time), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {/* TYPE — always shown */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 text-center min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Type</p>
              <p className="font-bold text-white text-xs tracking-widest truncate">{alert.alert_type}</p>
              <p className="text-xs text-slate-500 mt-0.5">&nbsp;</p>
            </div>

            {alert.magnitude !== undefined && alert.magnitude !== null && (
              <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 text-center min-w-0 ${config.glow} shadow-lg`}>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Magnitude</p>
                <p className="font-bold text-white text-xl">{alert.magnitude.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-0.5">&nbsp;</p>
              </div>
            )}

            {alert.wind_speed !== undefined && alert.wind_speed !== null && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 text-center min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Wind Speed</p>
                <p className="font-bold text-white text-xl">{alert.wind_speed.toFixed(0)}</p>
                <p className="text-xs text-slate-400 mt-0.5">mph</p>
              </div>
            )}

            {alert.depth !== undefined && alert.depth !== null && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 text-center min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Depth</p>
                <p className="font-bold text-white text-xl">{alert.depth.toFixed(1)}</p>
                <p className="text-xs text-slate-400 mt-0.5">km</p>
              </div>
            )}

            {alert.rainfall !== undefined && alert.rainfall !== null && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 text-center min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Rainfall</p>
                <p className="font-bold text-white text-xl">{alert.rainfall.toFixed(1)}</p>
                <p className="text-xs text-slate-400 mt-0.5">mm</p>
              </div>
            )}
          </div>

          {/* Description */}
          {alert.description && (
            <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </p>
              <p className="text-slate-300 leading-relaxed">{alert.description}</p>
            </div>
          )}

          {/* Status & Notifications */}
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status & Notifications
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <span className={`badge justify-center ${alert.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700/50 text-slate-400 border-slate-600/30'} border`}>
                {alert.is_active ? '● Active' : '○ Inactive'}
              </span>
              {alert.sms_sent && (
                <span className="badge justify-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SMS ✓
                </span>
              )}
              {alert.email_sent && (
                <span className="badge justify-center bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Email ✓
                </span>
              )}
              {alert.acknowledged && (
                <span className="badge justify-center bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Acked ✓
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center gap-2 text-xs text-slate-500">
              <span>Source: {alert.source}</span>
              {alert.external_id && <span>• ID: {alert.external_id}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
