import React from 'react';
import { Alert } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const severityConfig = {
    LOW: {
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      badge: 'severity-low',
      dot: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20',
    },
    MEDIUM: {
      gradient: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      badge: 'severity-medium',
      dot: 'bg-amber-500',
      glow: 'shadow-amber-500/20',
    },
    HIGH: {
      gradient: 'from-orange-500/10 to-orange-600/5',
      border: 'border-orange-500/20',
      badge: 'severity-high',
      dot: 'bg-orange-500',
      glow: 'shadow-orange-500/20',
    },
    CRITICAL: {
      gradient: 'from-red-500/10 to-red-600/5',
      border: 'border-red-500/20',
      badge: 'severity-critical',
      dot: 'bg-red-500',
      glow: 'shadow-red-500/20',
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
      className={`card bg-gradient-to-br ${config.gradient} backdrop-blur-xl cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="text-2xl">{typeIcons[alert.alert_type] || '⚠️'}</span>
            <span className={`severity-badge ${config.badge}`}>
              {alert.severity}
            </span>
            {alert.is_anomaly && (
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ⚡ ANOMALY
              </span>
            )}
          </div>

          <h3 className="font-semibold text-white mb-2 line-clamp-1">{alert.title}</h3>

          <p className="text-sm text-slate-400 mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {alert.location_name || 'Unknown Location'}
          </p>

          {alert.description && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {alert.description}
            </p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDistanceToNow(new Date(alert.event_time), { addSuffix: true })}
          </div>

          {alert.magnitude && (
            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/50 ${config.glow} shadow-lg`}>
              <span className="text-sm font-medium text-slate-400">M</span>
              <span className="text-lg font-bold text-white">{alert.magnitude.toFixed(1)}</span>
            </div>
          )}

          {alert.wind_speed && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/50 shadow-lg">
              <span className="text-lg font-bold text-white">{alert.wind_speed.toFixed(0)}</span>
              <span className="text-xs text-slate-400">mph</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {alert.source}
        </span>
        <div className="flex items-center gap-2">
          {alert.sms_sent && (
            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
              SMS ✓
            </span>
          )}
          {alert.email_sent && (
            <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">
              Email ✓
            </span>
          )}
          {alert.acknowledged && (
            <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
              Acked ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
