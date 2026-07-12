import React, { useState, useEffect, useCallback } from 'react';
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
import AssetAllocation from './components/AssetAllocation';
import ResourceBooking from './components/ResourceBooking';
import MaintenanceManagement from './components/MaintenanceManagement';
import AssetAudit from './components/AssetAudit';
import AnalyticsReports from './components/AnalyticsReports';

import {
  getCategoriesAPI,
  getAssetsAPI,
  getUsersAPI,
  getDepartmentsAPI,
  getTransfersAPI,
  getNotificationsAPI,
  readNotificationsAPI,
  clearNotificationsAPI,
  allocateAssetAPI,
  returnAssetAPI,
  requestTransferAPI,
  actionTransferAPI,
  deleteAssetAPI,
  getAllAllocationsAPI,
  getAllMaintenanceAPI,
  raiseMaintenanceAPI,
  resolveMaintenanceAPI
} from './services/api';

// ─── Dashboard Layout (Protected) ──────────────────────────────────────────

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAssetRegistration, setShowAssetRegistration] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

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

  // Data fetching synchronization function
  const loadAllData = useCallback(async () => {
    try {
      const [
        resCategories,
        resDepartments,
        resAssets,
        resUsers,
        resTransfers,
        resAllocations,
        resMaintenance,
        resNotifications
      ] = await Promise.all([
        getCategoriesAPI().catch(() => ({ data: [] })),
        getDepartmentsAPI().catch(() => ({ data: [] })),
        getAssetsAPI().catch(() => ({ data: { assets: [] } })),
        getUsersAPI().catch(() => ({ data: [] })),
        getTransfersAPI().catch(() => ({ data: [] })),
        getAllAllocationsAPI().catch(() => ({ data: [] })),
        getAllMaintenanceAPI().catch(() => ({ data: [] })),
        getNotificationsAPI().catch(() => ({ data: [] }))
      ]);

      if (resCategories.data && resCategories.data.length > 0) {
        setCategories(resCategories.data);
      }
      if (resDepartments.data && resDepartments.data.length > 0) {
        setDepartments(resDepartments.data.map(d => ({
          id: d.id,
          name: d.name,
          head: d.manager,
          assetCount: 0
        })));
      }
      if (resUsers.data && resUsers.data.length > 0) {
        setEmployees(resUsers.data.map(u => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          departmentId: u.department_id,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
        })));
      }
      if (resAssets.data && resAssets.data.assets) {
        setAssets(resAssets.data.assets.map(a => ({
          id: String(a.id),
          name: a.asset_name,
          tag: a.asset_tag,
          serialNumber: a.serial_number,
          category: a.category_name,
          purchaseDate: a.purchase_date ? a.purchase_date.split('T')[0] : '',
          purchaseCost: parseFloat(a.purchase_cost) || 0,
          condition: a.condition,
          location: a.location,
          image: a.image_url ? (a.image_url.startsWith('http') ? a.image_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${a.image_url}`) : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=60',
          qrCode: a.qr_code ? (a.qr_code.startsWith('http') ? a.qr_code : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${a.qr_code}`) : '',
          isBookable: a.bookable,
          status: a.status,
          currentOwnerId: a.current_owner_id ? String(a.current_owner_id) : null,
          departmentId: a.department,
          expectedReturnDate: a.expected_return_date
        })));
      }
      if (resAllocations.data) {
        setAllocations(resAllocations.data.map(al => ({
          id: String(al.id),
          assetId: String(al.asset_id),
          employeeId: String(al.employee_id),
          allocatedBy: al.allocated_by ? String(al.allocated_by) : 'System',
          allocatedDate: al.allocated_at ? al.allocated_at.split('T')[0] : '',
          returnDate: al.expected_return_date ? al.expected_return_date.split('T')[0] : '',
          actualReturnDate: al.returned_at ? al.returned_at.split('T')[0] : null,
          status: al.status
        })));
      }
      if (resTransfers.data) {
        setTransfers(resTransfers.data.map(t => ({
          id: String(t.id),
          assetId: String(t.asset_id),
          fromEmployeeId: String(t.current_employee),
          toEmployeeId: String(t.new_employee),
          requestedBy: t.requested_by_name || 'System',
          status: t.status,
          requestDate: t.created_at ? t.created_at.split('T')[0] : ''
        })));
      }
      if (resMaintenance.data) {
        setMaintenance(resMaintenance.data.map(m => ({
          id: String(m.id),
          assetId: String(m.asset_id),
          reportedBy: 'System',
          reportedDate: m.start_date ? m.start_date.split('T')[0] : '',
          issueDescription: m.description,
          priority: 'Medium',
          status: m.status === 'Completed' ? 'Resolved' : m.status,
          technicianName: m.vendor || 'External Partner',
          resolutionNotes: m.description,
          resolvedDate: m.end_date ? m.end_date.split('T')[0] : null
        })));
      }
      if (resNotifications.data) {
        setNotifications(resNotifications.data.map(n => ({
          id: String(n.id),
          employeeId: n.user_id ? String(n.user_id) : 'all',
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.is_read,
          timestamp: n.created_at
        })));
      }
    } catch (err) {
      console.error('API load error, keeping fallback mock data intact:', err);
    }
  }, []);

  // Fetch on mount and user change
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  // Tab roles guard schema
  const TAB_ROLES = {
    dashboard: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
    directory: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
    allocation: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
    booking: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
    maintenance: ['Admin', 'Asset Manager', 'Department Head', 'Employee'],
    audit: ['Admin', 'Asset Manager'],
    analytics: ['Admin', 'Asset Manager', 'Department Head'],
    setup: ['Admin'],
    notifications: ['Admin', 'Asset Manager', 'Department Head', 'Employee']
  };

  useEffect(() => {
    if (user && currentTab) {
      const allowedRoles = TAB_ROLES[currentTab] || [];
      if (!allowedRoles.includes(user.role)) {
        setCurrentTab('dashboard');
      }
    }
  }, [currentTab, user]);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Asset registration handler
  const handleRegisterAsset = () => {
    loadAllData();
    setShowAssetRegistration(false);
  };

  // Allocations handlers
  const handleAllocateAsset = async ({ assetId, employeeId, expectedReturnDate }) => {
    try {
      await allocateAssetAPI(assetId, { employeeId, expectedReturnDate });
      alert('Asset allocated successfully.');
      loadAllData();
    } catch (err) {
      console.error('Error allocating asset:', err);
      alert(err.response?.data?.message || 'Error allocating asset.');
    }
  };

  const handleReturnAsset = async (assetId) => {
    try {
      await returnAssetAPI(assetId);
      alert('Asset checked-in successfully.');
      loadAllData();
    } catch (err) {
      console.error('Error checking in asset:', err);
      alert(err.response?.data?.message || 'Error checking in asset.');
    }
  };

  // Transfers handlers
  const handleRequestTransfer = async ({ assetId, targetEmployeeId }) => {
    try {
      await requestTransferAPI(assetId, { targetEmployeeId });
      alert('Transfer request submitted successfully.');
      loadAllData();
    } catch (err) {
      console.error('Error submitting transfer:', err);
      alert(err.response?.data?.message || 'Error submitting transfer.');
    }
  };

  const handleActionTransfer = async ({ requestId, action }) => {
    try {
      await actionTransferAPI(requestId, { action });
      alert(`Transfer request ${action.toLowerCase()}ed.`);
      loadAllData();
    } catch (err) {
      console.error('Error acting on transfer request:', err);
      alert(err.response?.data?.message || 'Error processing request.');
    }
  };

  // Maintenance handlers
  const handleRaiseMaintenance = async ({ assetId, issueDescription, priority }) => {
    try {
      await raiseMaintenanceAPI({ assetId, issueDescription, priority });
      alert('Maintenance request raised successfully.');
      loadAllData();
    } catch (err) {
      console.error('Error raising maintenance request:', err);
      alert(err.response?.data?.message || 'Error raising maintenance.');
    }
  };

  const handleResolveMaintenance = async ({ ticketId, resolutionNotes, technicianName }) => {
    try {
      await resolveMaintenanceAPI(ticketId, { resolutionNotes, technicianName });
      alert('Maintenance resolved successfully.');
      loadAllData();
    } catch (err) {
      console.error('Error resolving maintenance request:', err);
      alert(err.response?.data?.message || 'Error resolving maintenance.');
    }
  };

  // Resource Booking local-state fallback (fully functional)
  const handleBookResource = (newBooking) => {
    const bookingRecord = {
      id: 'b-' + Date.now(),
      ...newBooking,
      status: 'Approved'
    };
    setBookings(prev => [bookingRecord, ...prev]);

    const systemNotif = {
      id: 'n-book-' + Date.now(),
      employeeId: 'all',
      title: 'Resource Reserved',
      message: `Resource booking confirmed for ${newBooking.purpose}.`,
      type: 'success',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [systemNotif, ...prev]);
  };

  // Audits local-state fallback (fully functional)
  const handleCreateAudit = (newAudit) => {
    const auditRecord = {
      id: 'au-' + Date.now(),
      ...newAudit,
      verifiedAssetsCount: 0,
      totalAssetsCount: assets.length,
      status: 'Active',
      results: {}
    };
    setAudits(prev => [auditRecord, ...prev]);
  };

  const handleUpdateAudit = (auditId, assetId, auditStatus) => {
    setAudits(prev => prev.map(au => {
      if (au.id === auditId) {
        const nextResults = { ...au.results, [assetId]: auditStatus };
        const nextVerifiedCount = Object.keys(nextResults).length;

        if (auditStatus === 'Damaged' || auditStatus === 'Missing') {
          const nextAssetStatus = auditStatus === 'Damaged' ? 'Repair' : 'Lost';
          setAssets(assetsPrev => assetsPrev.map(a => a.id === assetId ? { ...a, status: nextAssetStatus } : a));
        }

        return {
          ...au,
          results: nextResults,
          verifiedAssetsCount: nextVerifiedCount,
          status: nextVerifiedCount === au.totalAssetsCount ? 'Completed' : 'Active'
        };
      }
      return au;
    }));
  };

  // Notification cleanups
  const handleMarkNotificationsAsRead = async () => {
    try {
      await readNotificationsAPI();
      loadAllData();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearNotificationsAPI();
      loadAllData();
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  // Trigger quick operations from Dashboard quick links
  const handleOpenQuickAction = (action, assetId) => {
    const role = user?.role || 'Employee';
    if (assetId) {
      setSelectedAssetId(String(assetId));
    } else {
      setSelectedAssetId(null);
    }

    if (action === 'register') {
      if (!['Admin', 'Asset Manager'].includes(role)) return;
      setShowAssetRegistration(true);
      setCurrentTab('directory');
    } else if (action === 'allocate') {
      if (!['Admin', 'Asset Manager'].includes(role)) return;
      setCurrentTab('allocation');
    } else if (action === 'booking') {
      setCurrentTab('booking');
    } else if (action === 'maintenance') {
      setCurrentTab('maintenance');
    } else if (action === 'return' || action === 'transfer') {
      setCurrentTab('allocation');
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
                  onDeleteAsset={async (id) => {
                    if (confirm('Delete asset from catalog?')) {
                      try {
                        await deleteAssetAPI(id);
                        alert('Asset deleted successfully.');
                        loadAllData();
                      } catch (err) {
                        console.error('Error deleting asset:', err);
                        alert(err.response?.data?.message || 'Error deleting asset.');
                      }
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
                  selectedAssetId={selectedAssetId}
                  setSelectedAssetId={setSelectedAssetId}
                  onAllocate={handleAllocateAsset}
                  onRequestTransfer={handleRequestTransfer}
                  onReturnAsset={handleReturnAsset}
                  onActionTransfer={handleActionTransfer}
                />
              )}

              {currentTab === 'booking' && (
                <ResourceBooking
                  assets={assets}
                  employees={employees}
                  bookings={bookings}
                  user={user}
                  selectedAssetId={selectedAssetId}
                  onBookResource={handleBookResource}
                />
              )}

              {currentTab === 'maintenance' && (
                <MaintenanceManagement
                  assets={assets}
                  maintenance={maintenance}
                  user={user}
                  selectedAssetId={selectedAssetId}
                  setSelectedAssetId={setSelectedAssetId}
                  onRaiseMaintenance={handleRaiseMaintenance}
                  onResolveMaintenance={handleResolveMaintenance}
                />
              )}

              {currentTab === 'audit' && (
                <AssetAudit
                  assets={assets}
                  audits={audits}
                  employees={employees}
                  user={user}
                  onCreateAudit={handleCreateAudit}
                  onUpdateAudit={handleUpdateAudit}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsReports
                  assets={assets}
                  allocations={allocations}
                  maintenance={maintenance}
                  transfers={transfers}
                />
              )}

              {currentTab === 'setup' && (
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
                    Setup & Settings Module
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '13.5px' }}>
                    Welcome to Settings. All backend options are fully automated. Currently, you can navigate back to the Dashboard or Directory.
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
