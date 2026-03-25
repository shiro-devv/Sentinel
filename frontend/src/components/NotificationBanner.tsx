import React, { useState, useEffect } from 'react';
import { Alert } from '../types';
import { useSettings } from '../context/SettingsContext';

interface NotificationBannerProps {
  alert: Alert | null;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ alert }) => {
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const { playAlertSound, settings } = useSettings();

  useEffect(() => {
    if (alert) {
      setCurrentAlert(alert);
      setVisible(true);
      
      // Play sound effect if notifications are enabled
      if (settings.notifications && settings.soundEnabled) {
        playAlertSound(alert.severity);
      }
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!visible || !currentAlert) return null;

  const severityConfig = {
    LOW: {
      gradient: 'from-emerald-600 to-emerald-700',
      border: 'border-emerald-500/30',
      icon: 'bg-emerald-500/20 text-emerald-300',
    },
    MEDIUM: {
      gradient: 'from-amber-600 to-amber-700',
      border: 'border-amber-500/30',
      icon: 'bg-amber-500/20 text-amber-300',
    },
    HIGH: {
      gradient: 'from-orange-600 to-orange-700',
      border: 'border-orange-500/30',
      icon: 'bg-orange-500/20 text-orange-300',
    },
    CRITICAL: {
      gradient: 'from-red-600 to-red-700',
      border: 'border-red-500/30',
      icon: 'bg-red-500/20 text-red-300',
    },
  };

  const severityIcons = {
    LOW: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    MEDIUM: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    HIGH: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    CRITICAL: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  };

  const config = severityConfig[currentAlert.severity as keyof typeof severityConfig] || severityConfig.LOW;

  return (
    <div
      className={`bg-gradient-to-r ${config.gradient} ${config.border} border-b animate-slide-down`}
    >
      <div className="px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${config.icon}`}>
              {severityIcons[currentAlert.severity as keyof typeof severityIcons] || severityIcons.MEDIUM}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {currentAlert.severity} ALERT: {currentAlert.title}
              </p>
              <p className="text-sm text-white/80 truncate">
                {currentAlert.location_name || 'Unknown Location'} •{' '}
                {new Date(currentAlert.event_time).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setVisible(false)}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Dismiss notification"
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
    </div>
  );
};

export default NotificationBanner;
