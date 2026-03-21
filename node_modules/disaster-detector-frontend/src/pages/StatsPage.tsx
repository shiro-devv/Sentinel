import React, { useState } from 'react';
import { useMetrics, useHourlyMetrics, useSeverityTrend } from '../services/api';

const StatsPage: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState(24);
  const { data: metrics, isLoading: metricsLoading } = useMetrics(timeWindow);
  const { data: hourlyData } = useHourlyMetrics(timeWindow);
  const { data: trendData } = useSeverityTrend(7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Statistics</h1>
          <p className="text-slate-400">System metrics and analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Time Window:</label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={12}>Last 12 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={48}>Last 48 Hours</option>
            <option value={168}>Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-blue-900/30 border-blue-700">
          <p className="text-sm text-blue-300">Total Alerts</p>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? '...' : metrics?.alerts?.total || 0}
          </p>
        </div>
        <div className="card bg-purple-900/30 border-purple-700">
          <p className="text-sm text-purple-300">Total Events</p>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? '...' : metrics?.events?.total || 0}
          </p>
        </div>
        <div className="card bg-red-900/30 border-red-700">
          <p className="text-sm text-red-300">Anomalies Detected</p>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? '...' : metrics?.anomalies?.detected || 0}
          </p>
        </div>
        <div className="card bg-green-900/30 border-green-700">
          <p className="text-sm text-green-300">Predictions Made</p>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? '...' : metrics?.predictions?.total || 0}
          </p>
        </div>
      </div>

      {/* Alerts by Severity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Alerts by Severity</h2>
        <div className="space-y-4">
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => {
            const count = metrics?.alerts?.by_severity?.[severity] || 0;
            const total = metrics?.alerts?.total || 1;
            const percentage = (count / total) * 100;
            
            return (
              <div key={severity}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{severity}</span>
                  <span className="text-sm text-slate-400">{count}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      severity === 'CRITICAL'
                        ? 'bg-red-500'
                        : severity === 'HIGH'
                        ? 'bg-orange-500'
                        : severity === 'MEDIUM'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts by Type */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Alerts by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics?.alerts?.by_type || {}).map(([type, count]) => (
            <div
              key={type}
              className="bg-slate-700 rounded-lg p-4 text-center"
            >
              <span className="text-3xl mb-2 block">
                {type === 'EARTHQUAKE'
                  ? '🌋'
                  : type === 'STORM'
                  ? '⛈️'
                  : type === 'FLOOD'
                  ? '🌊'
                  : '⚠️'}
              </span>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-sm text-slate-400">{type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Events by Type */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Events by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics?.events?.by_type || {}).map(([type, count]) => (
            <div
              key={type}
              className="bg-slate-700 rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-sm text-slate-400">{type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend */}
      {trendData?.daily_trend && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">7-Day Trend</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-right py-2 px-4">Critical</th>
                  <th className="text-right py-2 px-4">High</th>
                  <th className="text-right py-2 px-4">Medium</th>
                  <th className="text-right py-2 px-4">Low</th>
                  <th className="text-right py-2 px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {trendData.daily_trend.map((day: Record<string, unknown>) => (
                  <tr
                    key={day.date as string}
                    className="text-slate-300 border-b border-slate-700/50"
                  >
                    <td className="py-2 px-4">{day.date as string}</td>
                    <td className="text-right py-2 px-4 text-red-400">{day.critical as number}</td>
                    <td className="text-right py-2 px-4 text-orange-400">{day.high as number}</td>
                    <td className="text-right py-2 px-4 text-yellow-400">{day.medium as number}</td>
                    <td className="text-right py-2 px-4 text-green-400">{day.low as number}</td>
                    <td className="text-right py-2 px-4 font-semibold">{day.total as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">API Version</p>
            <p className="text-white">1.0.0</p>
          </div>
          <div>
            <p className="text-slate-400">Time Window</p>
            <p className="text-white">{timeWindow} hours</p>
          </div>
          <div>
            <p className="text-slate-400">Last Updated</p>
            <p className="text-white">
              {metrics?.timestamp
                ? new Date(metrics.timestamp).toLocaleString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Data Sources</p>
            <p className="text-white">USGS, OpenWeather</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
