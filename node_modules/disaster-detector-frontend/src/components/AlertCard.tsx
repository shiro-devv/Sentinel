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
      bg: 'bg-green-900/50',
      border: 'border-green-700',
      badge: 'severity-low',
      icon: 'text-green-400',
    },
    MEDIUM: {
      bg: 'bg-yellow-900/50',
      border: 'border-yellow-700',
      badge: 'severity-medium',
      icon: 'text-yellow-400',
    },
    HIGH: {
      bg: 'bg-orange-900/50',
      border: 'border-orange-700',
      badge: 'severity-high',
      icon: 'text-orange-400',
    },
    CRITICAL: {
      bg: 'bg-red-900/50',
      border: 'border-red-700',
      badge: 'severity-critical',
      icon: 'text-red-400',
    },
  };

  const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.LOW;

  const typeIcons: Record<string, string> = {
    EARTHQUAKE: '🌋',
    STORM: '⛈️',
    FLOOD: '🌊',
    GENERAL: '⚠️',
  };

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg p-4 cursor-pointer hover:bg-slate-800 transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{typeIcons[alert.alert_type] || '⚠️'}</span>
            <span className={`severity-badge ${config.badge}`}>
              {alert.severity}
            </span>
            {alert.is_anomaly && (
              <span className="severity-badge bg-purple-900 text-purple-300 border border-purple-700">
                ANOMALY
              </span>
            )}
          </div>

          <h3 className="font-semibold text-white mb-1">{alert.title}</h3>

          <p className="text-sm text-slate-300 mb-2 text-white">
            {alert.location_name || 'Unknown Location'}
          </p>

          {alert.description && (
            <p className="text-sm text-slate-400 line-clamp-2">
              {alert.description}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(alert.event_time), { addSuffix: true })}
          </p>

          {alert.magnitude && (
            <p className="text-lg font-bold text-white mt-1">
              M{alert.magnitude.toFixed(1)}
            </p>
          )}

          {alert.wind_speed && (
            <p className="text-sm text-slate-300">
              {alert.wind_speed.toFixed(0)} mph
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>Source: {alert.source}</span>
        <div className="flex items-center gap-3">
          {alert.sms_sent && <span>SMS ✓</span>}
          {alert.email_sent && <span>Email ✓</span>}
          {alert.acknowledged && <span>Acknowledged ✓</span>}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
