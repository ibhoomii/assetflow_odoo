import React, { useState } from 'react';
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
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AssetDirectory from './components/AssetDirectory';
import AssetRegistration from './components/AssetRegistration';

export default function App() {
  // Global relational states
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAssetRegistration, setShowAssetRegistration] = useState(false);

  // Raw catalog lists
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

  // Authentication Handlers
  const handleLogin = (selectedUser, isNewSignup = false) => {
    setUser(selectedUser);
    if (isNewSignup) {
      setEmployees(prev => [...prev, selectedUser]);
      // Trigger standard onboarding notification
      const welcomeNotif = {
        id: 'n-welcome-' + Date.now(),
        employeeId: selectedUser.id,
        title: 'Welcome to AssetFlow ERP',
        message: `Hello ${selectedUser.name}! Your account has been registered under department Engineering.`,
        type: 'success',
        isRead: false,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [welcomeNotif, ...prev]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTab('dashboard');
    setShowAssetRegistration(false);
  };

  const handleSwitchUser = (selectedUser) => {
    setUser(selectedUser);
  };

  // Asset registration handler
  const handleRegisterAsset = (newAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    setShowAssetRegistration(false);

    // Create system notification
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

  if (!user) {
    return <Authentication onLogin={handleLogin} employees={employees} />;
  }

  // Badges count calculations
  const unreadNotificationsCount = notifications.filter(n => !n.isRead && (n.employeeId === 'all' || n.employeeId === user.id)).length;
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
          onSwitchUser={handleSwitchUser}
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
