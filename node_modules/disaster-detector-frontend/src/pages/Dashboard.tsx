import React from 'react';
import { useAlerts, useAlertStats, useActiveAlerts } from '../services/api';
import { useAppStore } from '../store';
import AlertList from '../components/AlertList';
import MapView from '../components/MapView';

const Dashboard: React.FC = () => {
  const { data: alertsData, isLoading: alertsLoading } = useAlerts({ pageSize: 5 });
  const { data: stats, isLoading: statsLoading } = useAlertStats();
  const { data: activeAlerts } = useActiveAlerts();
  const { setSelectedAlert } = useAppStore();

  const statsCards = [
    {
      label: 'Total Alerts',
      value: stats?.total_alerts || 0,
      icon: '📊',
      color: 'blue',
    },
    {
      label: 'Active Alerts',
      value: stats?.active_alerts || 0,
      icon: '🚨',
      color: 'orange',
    },
    {
      label: 'Last 24 Hours',
      value: stats?.recent_24h || 0,
      icon: '⏱️',
      color: 'purple',
    },
    {
      label: 'Anomalies',
      value: stats?.anomalies_detected || 0,
      icon: '⚡',
      color: 'red',
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-900/50 border-blue-700',
    orange: 'bg-orange-900/50 border-orange-700',
    purple: 'bg-purple-900/50 border-purple-700',
    red: 'bg-red-900/50 border-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Real-time disaster monitoring overview</p>
        </div>
        <div className="text-sm text-slate-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className={`${colorClasses[stat.color]} border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-white">
                {statsLoading ? (
                  <span className="animate-pulse bg-slate-700 rounded w-12 h-8 inline-block"></span>
                ) : (
                  stat.value
                )}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Alerts</h2>
          <AlertList
            alerts={(alertsData?.alerts || []).slice(0, 2)}
            isLoading={alertsLoading}
            onAlertClick={setSelectedAlert}
            showFilters={false}
          />
          {alertsData?.alerts && alertsData.alerts.length > 0 && (
            <div className="mt-4 text-center">
              <a
                href="/alerts"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View all alerts →
              </a>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Live Map</h2>
          <div className="h-[400px]">
            <MapView
              alerts={activeAlerts || []}
              zoom={3}
              onAlertClick={setSelectedAlert}
            />
          </div>
        </div>
      </div>

      {/* Alerts by Severity */}
      {stats?.alerts_by_severity && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Alerts by Severity
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.alerts_by_severity).map(([severity, count]) => (
              <div
                key={severity}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg"
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    severity === 'CRITICAL'
                      ? 'bg-red-500'
                      : severity === 'HIGH'
                      ? 'bg-orange-500'
                      : severity === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <span className="text-slate-200">{severity}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts by Type */}
      {stats?.alerts_by_type && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Alerts by Type
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.alerts_by_type).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg"
              >
                <span className="text-xl">
                  {type === 'EARTHQUAKE'
                    ? '🌋'
                    : type === 'STORM'
                    ? '⛈️'
                    : type === 'FLOOD'
                    ? '🌊'
                    : '⚠️'}
                </span>
                <span className="text-slate-200">{type}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
