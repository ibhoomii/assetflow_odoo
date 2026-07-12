import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Building2,
  LogOut,
  Bell
} from 'lucide-react';

export default function Sidebar({
  currentTab,
  setCurrentTab,
  user,
  onLogout,
  unreadNotificationsCount,
  pendingTransfersCount,
  pendingMaintenanceCount
}) {
  const role = user?.role || 'Employee';

  // Navigation schema defining roles that can access each tab
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'directory', name: 'Asset Directory', icon: Package, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'allocation', name: 'Allocations & Transfers', icon: ArrowLeftRight, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'], badgeCount: role !== 'Employee' ? pendingTransfersCount : 0 },
    { id: 'booking', name: 'Resource Booking', icon: CalendarDays, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'], badgeCount: ['Admin', 'Asset Manager'].includes(role) ? pendingMaintenanceCount : 0 },
    { id: 'audit', name: 'Asset Audits', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager'] },
    { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { id: 'setup', name: 'Organization Setup', icon: Building2, roles: ['Admin'] }
  ];

  const visibleMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-header">
        <div className="logo-icon">AF</div>
        <div>
          <h1 className="logo-text">AssetFlow</h1>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Enterprise ERP
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {visibleMenu.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                justifyContent: 'space-between',
                paddingRight: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{item.name}</span>
              </div>
              {item.badgeCount > 0 ? (
                <span style={{
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* User Section & Logout */}
      <div className="sidebar-user">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
          alt={user?.name || 'User Avatar'}
          className="user-avatar"
        />
        <div className="user-details">
          <div className="user-name" title={user?.name}>{user?.name || 'Loading...'}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button
          onClick={onLogout}
          className="btn btn-secondary btn-icon"
          title="Sign Out"
          style={{ padding: '6px', minWidth: '32px' }}
        >
          <LogOut size={16} style={{ color: 'var(--error)' }} />
        </button>
      </div>
    </div>
  );
}
