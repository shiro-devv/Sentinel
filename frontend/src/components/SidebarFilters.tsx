import React from 'react';

interface SidebarFiltersProps {
  severity: string;
  alertType: string;
  showAnomalies: boolean;
  onSeverityChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onAnomaliesChange: (value: boolean) => void;
  onReset: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  severity,
  alertType,
  showAnomalies,
  onSeverityChange,
  onTypeChange,
  onAnomaliesChange,
  onReset,
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Reset all
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Severity Level</label>
          <div className="space-y-2">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
              <label
                key={level}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  severity === level 
                    ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="severity"
                    value={level}
                    checked={severity === level}
                    onChange={(e) => onSeverityChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    severity === level 
                      ? 'border-cyan-400 bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                      : 'border-slate-600 bg-transparent'
                  }`}>
                    {severity === level && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <span className={`text-sm flex-1 ${severity === level ? 'text-white' : 'text-slate-300'}`}>
                  {level === 'ALL' ? 'All Levels' : level}
                </span>
                {level !== 'ALL' && (
                  <span
                    className={`w-3 h-3 rounded-full shadow-lg ${
                      level === 'CRITICAL'
                        ? 'bg-red-500 shadow-red-500/30'
                        : level === 'HIGH'
                        ? 'bg-orange-500 shadow-orange-500/30'
                        : level === 'MEDIUM'
                        ? 'bg-amber-500 shadow-amber-500/30'
                        : 'bg-emerald-500 shadow-emerald-500/30'
                    }`}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
        
        {/* Alert Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Alert Type</label>
          <select
            value={alertType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="input"
          >
            <option value="ALL">All Types</option>
            <option value="EARTHQUAKE">🌋 Earthquake</option>
            <option value="STORM">⛈️ Storm</option>
            <option value="FLOOD">🌊 Flood</option>
            <option value="FIRE">🔥 Fire</option>
            <option value="GENERAL">⚠️ General</option>
          </select>
        </div>
        
        {/* Anomalies Filter */}
        <div>
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                id="anomalies-filter"
                checked={showAnomalies}
                onChange={(e) => onAnomaliesChange(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                showAnomalies 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-transparent border-slate-600'
              }`}>
                {showAnomalies && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm text-white font-medium">Show Anomalies Only</span>
              <p className="text-xs text-slate-500 mt-0.5">Filter to show only detected anomalies</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-800">
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Filters apply to both list and map views
        </p>
      </div>
    </div>
  );
};

export default SidebarFilters;
