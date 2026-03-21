import React, { useState } from 'react';
import { useAlerts } from '../services/api';
import { useAppStore } from '../store';
import AlertList from '../components/AlertList';
import { Alert } from '../types';

const AlertsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const { filters, setSelectedAlert } = useAppStore();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400">
            {data ? `${data.total} total alerts` : 'Loading alerts...'}
          </p>
        </div>
      </div>

      {error ? (
        <div className="card bg-red-900/50 border-red-700">
          <p className="text-red-300">
            Failed to load alerts. Please try again later.
          </p>
        </div>
      ) : (
        <>
          <AlertList
            alerts={data?.alerts || []}
            isLoading={isLoading}
            onAlertClick={handleAlertClick}
          />

          {/* Pagination */}
          {data && data.total > pageSize && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-slate-400">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Alert Detail Modal would go here */}
      {/* For simplicity, we show it inline or could use a portal */}
    </div>
  );
};

export default AlertsPage;
