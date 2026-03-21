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
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Reset
        </button>
      </div>
      
      <div>
        <label className="block text-sm text-slate-400 mb-2">Severity Level</label>
        <div className="space-y-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
            <label
              key={level}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                severity === level ? 'bg-slate-700' : 'hover:bg-slate-700/50'
              }`}
            >
              <input
                type="radio"
                name="severity"
                value={level}
                checked={severity === level}
                onChange={(e) => onSeverityChange(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm text-slate-200">
                {level === 'ALL' ? 'All Levels' : level}
              </span>
              {level !== 'ALL' && (
                <span
                  className={`ml-auto w-3 h-3 rounded-full ${
                    level === 'CRITICAL'
                      ? 'bg-red-500'
                      : level === 'HIGH'
                      ? 'bg-orange-500'
                      : level === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
              )}
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-slate-400 mb-2">Alert Type</label>
        <select
          value={alertType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All Types</option>
          <option value="EARTHQUAKE">Earthquake</option>
          <option value="STORM">Storm</option>
          <option value="FLOOD">Flood</option>
          <option value="GENERAL">General</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anomalies-filter"
          checked={showAnomalies}
          onChange={(e) => onAnomaliesChange(e.target.checked)}
          className="rounded border-slate-600 bg-slate-700"
        />
        <label htmlFor="anomalies-filter" className="text-sm text-slate-300">
          Show Anomalies Only
        </label>
      </div>
      
      <div className="pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Filters apply to both list and map views
        </p>
      </div>
    </div>
  );
};

export default SidebarFilters;
