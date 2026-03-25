import React, { useState } from 'react';
import { useMetrics, useHourlyMetrics, useSeverityTrend } from '../services/api';

const StatsPage: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState(24);
  const { data: metrics, isLoading: metricsLoading } = useMetrics(timeWindow);
  const { data: hourlyData } = useHourlyMetrics(timeWindow);
  const { data: trendData } = useSeverityTrend(7);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Statistics</h1>
          <p className="text-slate-400 mt-1">System metrics and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">Time Window:</label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="input min-w-[160px]"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="stat-card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-300">Total Alerts</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 rounded animate-pulse" />
            ) : (
              metrics?.alerts?.total || 0
            )}
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-500/20 rounded-xl">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-purple-300">Total Events</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 rounded animate-pulse" />
            ) : (
              metrics?.events?.total || 0
            )}
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-500/20 rounded-xl">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-red-300">Anomalies Detected</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 rounded animate-pulse" />
            ) : (
              metrics?.anomalies?.detected || 0
            )}
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-emerald-300">Predictions Made</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {metricsLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 rounded animate-pulse" />
            ) : (
              metrics?.predictions?.total || 0
            )}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts by Severity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Alerts by Severity</h2>
          <div className="space-y-4">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => {
              const count = metrics?.alerts?.by_severity?.[severity] || 0;
              const total = metrics?.alerts?.total || 1;
              const percentage = (count / total) * 100;
              
              return (
                <div key={severity} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          severity === 'CRITICAL'
                            ? 'bg-red-500'
                            : severity === 'HIGH'
                            ? 'bg-orange-500'
                            : severity === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-300">{severity}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        severity === 'CRITICAL'
                          ? 'bg-gradient-to-r from-red-600 to-red-500'
                          : severity === 'HIGH'
                          ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                          : severity === 'MEDIUM'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
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
          <h2 className="text-lg font-semibold text-white mb-6">Alerts by Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(metrics?.alerts?.by_type || {}).map(([type, count]) => (
              <div
                key={type}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center text-xl">
                    {type === 'EARTHQUAKE'
                      ? '🌋'
                      : type === 'STORM'
                      ? '⛈️'
                      : type === 'FLOOD'
                      ? '🌊'
                      : type === 'FIRE'
                      ? '🔥'
                      : '⚠️'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{type}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events by Type */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">Events by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics?.events?.by_type || {}).map(([type, count]) => (
            <div
              key={type}
              className="bg-slate-800/50 rounded-xl p-5 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <p className="text-3xl font-bold text-white mb-2">{count}</p>
              <p className="text-sm text-slate-400">{type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend */}
      {trendData?.daily_trend && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">7-Day Trend</h2>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-right py-3 px-4 font-medium">Critical</th>
                  <th className="text-right py-3 px-4 font-medium">High</th>
                  <th className="text-right py-3 px-4 font-medium">Medium</th>
                  <th className="text-right py-3 px-4 font-medium">Low</th>
                  <th className="text-right py-3 px-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {trendData.daily_trend.map((day: Record<string, unknown>) => (
                  <tr
                    key={day.date as string}
                    className="text-slate-300 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{day.date as string}</td>
                    <td className="text-right py-3 px-4 text-red-400">{day.critical as number}</td>
                    <td className="text-right py-3 px-4 text-orange-400">{day.high as number}</td>
                    <td className="text-right py-3 px-4 text-amber-400">{day.medium as number}</td>
                    <td className="text-right py-3 px-4 text-emerald-400">{day.low as number}</td>
                    <td className="text-right py-3 px-4 font-semibold text-white">{day.total as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">API Version</p>
            <p className="text-lg font-semibold text-white">1.0.0</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Time Window</p>
            <p className="text-lg font-semibold text-white">{timeWindow} hours</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Last Updated</p>
            <p className="text-sm font-medium text-white">
              {metrics?.timestamp
                ? new Date(metrics.timestamp).toLocaleString()
                : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Data Sources</p>
            <p className="text-sm font-medium text-white">USGS, OpenWeather</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
