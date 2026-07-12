import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_EMPLOYEES,
  INITIAL_ASSETS,
  INITIAL_ALLOCATIONS,
  INITIAL_TRANSFERS,
  INITIAL_BOOKINGS,
  INITIAL_MAINTENANCE,
  INITIAL_AUDITS,
  INITIAL_NOTIFICATIONS
} from './mockData';

import Authentication from './components/Authentication';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AssetDirectory from './components/AssetDirectory';
import AssetRegistration from './components/AssetRegistration';

// ─── Dashboard Layout (Protected) ──────────────────────────────────────────

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAssetRegistration, setShowAssetRegistration] = useState(false);

  // Raw catalog lists (mock data retained as backup)
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);
  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Asset registration handler
  const handleRegisterAsset = (newAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    setShowAssetRegistration(false);

    const systemNotif = {
      id: 'n-reg-' + Date.now(),
      employeeId: 'all',
      title: 'New Asset Catalogued',
      message: `Asset "${newAsset.name}" (Tag: ${newAsset.tag}) has been registered by ${user.name}.`,
      type: 'info',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  // Notification cleanups
  const handleMarkNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => 
      n.employeeId === 'all' || n.employeeId === user?.id ? { ...n, isRead: true } : n
    ));
  };

  const handleClearNotifications = () => {
    setNotifications(prev => prev.filter(n => 
      n.employeeId !== 'all' && n.employeeId !== user?.id
    ));
  };

  // Trigger quick operations from Dashboard quick links
  const handleOpenQuickAction = (action) => {
    if (action === 'register') {
      setShowAssetRegistration(true);
      setCurrentTab('directory');
    } else if (action === 'allocate') {
      setCurrentTab('allocation');
    } else if (action === 'booking') {
      setCurrentTab('booking');
    } else if (action === 'maintenance') {
      setCurrentTab('maintenance');
    }
  };

  // Badges count calculations
  const unreadNotificationsCount = notifications.filter(n => !n.isRead && (n.employeeId === 'all' || n.employeeId === user?.id)).length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;
  const pendingMaintenanceCount = maintenance.filter(m => m.status === 'Pending').length;

  return (
    <div className="app-container">
      
      {/* Sidebar navigation panel */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setShowAssetRegistration(false);
        }}
        user={user}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadNotificationsCount}
        pendingTransfersCount={pendingTransfersCount}
        pendingMaintenanceCount={pendingMaintenanceCount}
      />

      {/* Main workspace layout */}
      <div className="main-content">
        
        {/* Navbar */}
        <Navbar
          currentTab={showAssetRegistration ? 'register' : currentTab}
          user={user}
          employees={employees}
          onSwitchUser={() => {}} // Role switcher is disabled in real auth mode
          notifications={notifications}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          onClearNotifications={handleClearNotifications}
        />

        {/* Dynamic content tab router */}
        <div style={{ marginTop: '24px', flex: 1 }}>
          
          {showAssetRegistration && currentTab === 'directory' ? (
            <AssetRegistration
              assets={assets}
              categories={categories}
              onRegisterAsset={handleRegisterAsset}
              onCancel={() => setShowAssetRegistration(false)}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  assets={assets}
                  allocations={allocations}
                  bookings={bookings}
                  maintenance={maintenance}
                  transfers={transfers}
                  notifications={notifications}
                  setCurrentTab={setCurrentTab}
                  user={user}
                  onOpenQuickAction={handleOpenQuickAction}
                />
              )}

              {currentTab === 'directory' && (
                <AssetDirectory
                  assets={assets}
                  categories={categories}
                  departments={departments}
                  employees={employees}
                  allocations={allocations}
                  maintenance={maintenance}
                  transfers={transfers}
                  user={user}
                  onEditAsset={(asset) => {
                    alert(`Asset edit panel trigger for ${asset.name}`);
                  }}
                  onDeleteAsset={(id) => {
                    if (confirm('Delete asset from catalog?')) {
                      setAssets(prev => prev.filter(a => a.id !== id));
                    }
                  }}
                  onOpenQuickAction={handleOpenQuickAction}
                />
              )}

              {/* Styled Placeholders for tabs to be designed in future steps */}
              {['allocation', 'booking', 'maintenance', 'audit', 'analytics', 'setup'].includes(currentTab) && (
                <div style={{
                  padding: '40px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <span>⚙️</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', textTransform: 'capitalize' }}>
                    {currentTab.replace('&', ' & ')} Module
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '13.5px' }}>
                    This section will be developed in detail during the next UI sequence. Currently, you can navigate back to the Dashboard or Directory.
                  </p>
                  <button onClick={() => setCurrentTab('dashboard')} className="btn btn-primary">
                    Return to Command Center
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}

// ─── App Root with Routes ───────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth state on initial load
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: '500',
          }}>
            Loading AssetFlow...
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login page — redirects to dashboard if already authenticated */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Authentication />} 
      />

      {/* Protected dashboard — requires authentication */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
