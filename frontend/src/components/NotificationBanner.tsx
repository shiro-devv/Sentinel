import React, { useState, useEffect } from 'react';
import { Alert } from '../types';

interface NotificationBannerProps {
  alert: Alert | null;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ alert }) => {
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (alert) {
      setCurrentAlert(alert);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!visible || !currentAlert) return null;

  const severityColors = {
    LOW: 'bg-green-600 border-green-400',
    MEDIUM: 'bg-yellow-600 border-yellow-400',
    HIGH: 'bg-orange-600 border-orange-400',
    CRITICAL: 'bg-red-600 border-red-400 animate-pulse',
  };

  const severityIcons = {
    LOW: '⚡',
    MEDIUM: '⚠️',
    HIGH: '🔶',
    CRITICAL: '🚨',
  };

  return (
    <div
      className={`${
        severityColors[currentAlert.severity as keyof typeof severityColors] || severityColors.LOW
      } border-b px-4 py-3 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {severityIcons[currentAlert.severity as keyof typeof severityIcons] || '⚠️'}
          </span>
          <div>
            <p className="font-semibold text-white">
              {currentAlert.severity} ALERT: {currentAlert.title}
            </p>
            <p className="text-sm text-white/80">
              {currentAlert.location_name || 'Unknown Location'} •{' '}
              {new Date(currentAlert.event_time).toLocaleString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setVisible(false)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
