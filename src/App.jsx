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
import AssetAllocation from './components/AssetAllocation';
import ResourceBooking from './components/ResourceBooking';
import MaintenanceManagement from './components/MaintenanceManagement';
import AssetAudit from './components/AssetAudit';
import AnalyticsReports from './components/AnalyticsReports';
import NotificationsCenter from './components/NotificationsCenter';

export default function App() {
  // Global relational states
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedAssetIdForTab, setSelectedAssetIdForTab] = useState(null);
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
  const handleLogin = (employee) => {
    setUser(employee);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSwitchUser = (selectedUser) => {
    setUser(selectedUser);
  };

  // Asset Registration
  const handleRegisterAsset = (newAssetData) => {
    const newAsset = {
      id: `a${assets.length + 1}`,
      ...newAssetData,
      status: 'Available',
      currentOwnerId: null
    };
    setAssets(prev => [...prev, newAsset]);
    setShowAssetRegistration(false);

    // Create system audit & notification logs
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId: 'all',
      title: 'New Asset Registered',
      message: `Asset "${newAsset.name}" has been registered successfully with tag ${newAsset.tag}.`,
      type: 'info',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  // Stage, commit, and update operational states
  const handleAllocateAsset = ({ assetId, employeeId, expectedReturnDate, allocatedBy }) => {
    const newAlloc = {
      id: `al${allocations.length + 1}`,
      assetId,
      employeeId,
      allocatedDate: new Date().toISOString().split('T')[0],
      returnDate: expectedReturnDate,
      actualReturnDate: null,
      allocatedBy
    };
    setAllocations(prev => [...prev, newAlloc]);

    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'Allocated', currentOwnerId: employeeId } : a));

    const targetEmp = employees.find(e => e.id === employeeId);
    const asset = assets.find(a => a.id === assetId);
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId,
      title: 'Asset Allocated',
      message: `Asset "${asset?.name}" (${asset?.tag}) has been assigned to you. Due by ${expectedReturnDate}.`,
      type: 'info',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  const handleRequestTransfer = ({ assetId, fromEmployeeId, toEmployeeId, requestedBy }) => {
    const newTransfer = {
      id: `t${transfers.length + 1}`,
      assetId,
      fromEmployeeId,
      toEmployeeId,
      requestedBy,
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
      approvedDate: null
    };
    setTransfers(prev => [...prev, newTransfer]);

    const asset = assets.find(a => a.id === assetId);
    const fromEmp = employees.find(e => e.id === fromEmployeeId);
    const toEmp = employees.find(e => e.id === toEmployeeId);
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId: 'all',
      title: 'Transfer Request Raised',
      message: `Transfer requested for "${asset?.name}" from ${fromEmp?.name} to ${toEmp?.name} by ${requestedBy}.`,
      type: 'warning',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  const handleReturnAsset = (allocationId) => {
    const alloc = allocations.find(al => al.id === allocationId);
    if (!alloc) return;

    setAllocations(prev => prev.map(al => al.id === allocationId ? { ...al, actualReturnDate: new Date().toISOString().split('T')[0] } : al));

    setAssets(prev => prev.map(a => a.id === alloc.assetId ? { ...a, status: 'Available', currentOwnerId: null } : a));

    const asset = assets.find(a => a.id === alloc.assetId);
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId: alloc.employeeId,
      title: 'Asset Returned',
      message: `Asset "${asset?.name}" (${asset?.tag}) has been successfully checked in.`,
      type: 'success',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  const handleBookResource = ({ resourceId, employeeId, date, startTime, endTime, purpose }) => {
    const newBooking = {
      id: `b${bookings.length + 1}`,
      resourceId,
      employeeId,
      date,
      startTime,
      endTime,
      purpose,
      status: 'Approved',
      bookedAt: new Date().toISOString().split('T')[0]
    };
    setBookings(prev => [...prev, newBooking]);

    const asset = assets.find(a => a.id === resourceId);
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId,
      title: 'Resource Booking Confirmed',
      message: `Booking for "${asset?.name}" on ${date} (${startTime} - ${endTime}) has been approved.`,
      type: 'success',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  const handleRaiseMaintenance = ({ assetId, reportedBy, issueDescription, priority, image }) => {
    const newTicket = {
      id: `m${maintenance.length + 1}`,
      assetId,
      reportedBy,
      reportedDate: new Date().toISOString().split('T')[0],
      issueDescription,
      priority,
      status: 'Pending',
      technicianName: null,
      resolutionNotes: null,
      image
    };
    setMaintenance(prev => [...prev, newTicket]);

    const asset = assets.find(a => a.id === assetId);
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId: 'all',
      title: 'New Maintenance Ticket',
      message: `[${priority}] Maintenance raised for "${asset?.name}" by ${reportedBy}.`,
      type: 'warning',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  const handleResolveMaintenance = ({ ticketId, resolutionNotes, technicianName }) => {
    setMaintenance(prev => prev.map(t => t.id === ticketId ? { 
      ...t, 
      status: 'Resolved', 
      resolutionNotes, 
      technicianName 
    } : t));

    const ticket = maintenance.find(t => t.id === ticketId);
    if (ticket) {
      const asset = assets.find(a => a.id === ticket.assetId);
      const systemNotif = {
        id: `n${notifications.length + 1}`,
        employeeId: 'all',
        title: 'Maintenance Ticket Resolved',
        message: `Maintenance for "${asset?.name}" has been resolved by ${technicianName}.`,
        type: 'success',
        isRead: false,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [systemNotif, ...prev]);
    }
  };

  const handleCompleteAuditCycle = (newAudit) => {
    setAudits(prev => [newAudit, ...prev]);

    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId: 'all',
      title: 'Audit Cycle Completed',
      message: `Audit run for ${newAudit.departmentName} completed by ${newAudit.auditorName}. compliance status logged.`,
      type: 'success',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  const handleTriggerMockNotification = ({ title, message, type }) => {
    const systemNotif = {
      id: `n${notifications.length + 1}`,
      employeeId: user?.id || 'all',
      title,
      message,
      type,
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
  const handleOpenQuickAction = (action, assetId = null) => {
    if (assetId) {
      setSelectedAssetIdForTab(assetId);
    }
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
        
        <Navbar
          currentTab={showAssetRegistration ? 'register' : currentTab}
          user={user}
          employees={employees}
          onSwitchUser={handleSwitchUser}
          notifications={notifications}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          onClearNotifications={handleClearNotifications}
          onNavigate={setCurrentTab}
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

              {currentTab === 'allocation' && (
                <AssetAllocation
                  assets={assets}
                  employees={employees}
                  departments={departments}
                  allocations={allocations}
                  transfers={transfers}
                  user={user}
                  selectedAssetId={selectedAssetIdForTab}
                  setSelectedAssetId={setSelectedAssetIdForTab}
                  onAllocate={handleAllocateAsset}
                  onRequestTransfer={handleRequestTransfer}
                  onReturnAsset={handleReturnAsset}
                />
              )}

              {currentTab === 'booking' && (
                <ResourceBooking
                  assets={assets}
                  employees={employees}
                  bookings={bookings}
                  user={user}
                  onBookResource={handleBookResource}
                />
              )}

              {currentTab === 'maintenance' && (
                <MaintenanceManagement
                  assets={assets}
                  maintenance={maintenance}
                  user={user}
                  selectedAssetId={selectedAssetIdForTab}
                  setSelectedAssetId={setSelectedAssetIdForTab}
                  onRaiseMaintenance={handleRaiseMaintenance}
                  onResolveMaintenance={handleResolveMaintenance}
                />
              )}

              {currentTab === 'audit' && (
                <AssetAudit
                  assets={assets}
                  employees={employees}
                  departments={departments}
                  audits={audits}
                  user={user}
                  onStartAuditCycle={() => {}}
                  onCompleteAuditCycle={handleCompleteAuditCycle}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsReports
                  assets={assets}
                  allocations={allocations}
                  bookings={bookings}
                  maintenance={maintenance}
                  departments={departments}
                />
              )}

              {currentTab === 'notifications' && (
                <NotificationsCenter
                  notifications={notifications}
                  user={user}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onClearNotifications={handleClearNotifications}
                  onTriggerMockNotification={handleTriggerMockNotification}
                />
              )}

              {/* Styled Placeholders for tabs to be designed in future steps */}
              {['setup'].includes(currentTab) && (
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
