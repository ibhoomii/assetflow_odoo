import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Check, ShieldAlert, Sparkles, User, RefreshCw } from 'lucide-react';

export default function Navbar({
  currentTab,
  user,
  employees,
  onSwitchUser,
  notifications,
  onMarkNotificationsAsRead,
  onClearNotifications
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const notificationRef = useRef(null);
  const switcherRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setShowUserSwitcher(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead && (n.employeeId === 'all' || n.employeeId === user?.id));
  const myNotifications = notifications.filter(n => n.employeeId === 'all' || n.employeeId === user?.id);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Command Center';
      case 'directory': return 'Asset Directory';
      case 'allocation': return 'Allocations & Transfers';
      case 'booking': return 'Resource Booking';
      case 'maintenance': return 'Maintenance Workflows';
      case 'audit': return 'Asset Auditing & Verifications';
      case 'analytics': return 'Reports & Analytics';
      case 'setup': return 'Organization Settings';
      default: return 'AssetFlow';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>;
      case 'alert': return <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--error)' }}></div>;
      case 'warning': return <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning)' }}></div>;
      default: return <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>;
    }
  };

  return (
    <div className="navbar">
      {/* View Title */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>
          {getTabTitle()}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Enterprise Asset & Resource Management
        </p>
      </div>

      {/* Action items on right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Role Switcher Widget */}
        <div ref={switcherRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="btn btn-secondary"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderColor: 'var(--primary-border)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={14} />
            <span>Role Switcher</span>
          </button>
          
          {showUserSwitcher && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius-md)',
              width: '260px',
              padding: '8px 0',
              zIndex: 999
            }}>
              <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                Test AssetFlow as:
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      onSwitchUser(emp);
                      setShowUserSwitcher(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    className="sidebar-item"
                  >
                    <img src={emp.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {emp.name} {emp.id === user?.id && <Check size={12} style={{ color: 'var(--success)' }} />}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{emp.role} • {emp.email.split('@')[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div ref={notificationRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadNotifications.length > 0) {
                onMarkNotificationsAsRead();
              }
            }}
            className="btn btn-secondary btn-icon"
            style={{ position: 'relative' }}
          >
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            {unreadNotifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--error)',
                color: 'white',
                fontSize: '9px',
                fontWeight: '700',
                height: '16px',
                minWidth: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px'
              }}>
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 'var(--radius-lg)',
              width: '360px',
              padding: '16px',
              zIndex: 999
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Inbox Notifications</h4>
                {myNotifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myNotifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                    <Bell size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                    <span style={{ fontSize: '12px' }}>Your notification inbox is empty.</span>
                  </div>
                ) : (
                  myNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: notif.isRead ? 'var(--bg-primary)' : 'var(--primary-light)',
                        borderLeft: notif.isRead ? '3px solid var(--border-color)' : '3px solid var(--primary)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ marginTop: '5px' }}>{getNotificationIcon(notif.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{notif.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{notif.message}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User initials badge */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '13px',
          border: '1px solid var(--primary-border)'
        }}>
          {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  );
}
