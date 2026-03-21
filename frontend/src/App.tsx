import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NotificationBanner from './components/NotificationBanner';
import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/AlertsPage';
import MapPage from './pages/MapPage';
import StatsPage from './pages/StatsPage';

function App() {
  const { isConnected, lastAlert } = useWebSocket();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header isConnected={isConnected} />
      
      <NotificationBanner alert={lastAlert} />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
      
      <footer className="bg-slate-800 border-t border-slate-700 px-4 py-3 text-center text-slate-400 text-sm">
        <p>Disaster Detector v1.0.0 - Real-time Calamity Intelligence Platform</p>
      </footer>
    </div>
  );
}

export default App;
