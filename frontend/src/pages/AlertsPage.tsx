import React, { useState } from 'react';
import { useAlerts } from '../services/api';
import { useAppStore } from '../store';
import AlertList from '../components/AlertList';
import SidebarFilters from '../components/SidebarFilters';
import { Alert } from '../types';

const AlertsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const { filters, setFilters, resetFilters, setSelectedAlert } = useAppStore();

  const { data, isLoading, error } = useAlerts({
    page,
    pageSize,
    severity: filters.severity !== 'ALL' ? filters.severity : undefined,
    alertType: filters.alertType !== 'ALL' ? filters.alertType : undefined,
    isAnomaly: filters.showAnomalies ? true : undefined,
  });

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400 mt-1">
            {data ? `${data.total} total alerts` : 'Loading alerts...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
            <span className="text-sm text-slate-400">
              Page <span className="text-white font-semibold">{page}</span> of {totalPages}
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="card bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-300">Failed to load alerts</p>
              <p className="text-sm text-red-400/70">Please try again later.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <SidebarFilters
              severity={filters.severity}
              alertType={filters.alertType}
              showAnomalies={filters.showAnomalies}
              onSeverityChange={(value) => setFilters({ severity: value })}
              onTypeChange={(value) => setFilters({ alertType: value })}
              onAnomaliesChange={(value) => setFilters({ showAnomalies: value })}
              onReset={resetFilters}
            />
          </div>

          {/* Alerts List */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <AlertList
              alerts={data?.alerts || []}
              isLoading={isLoading}
              onAlertClick={handleAlertClick}
              showFilters={false}
            />

            {/* Pagination */}
            {data && data.total > pageSize && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 
                      ? i + 1 
                      : page >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : page - 2 + i;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          pageNum === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
