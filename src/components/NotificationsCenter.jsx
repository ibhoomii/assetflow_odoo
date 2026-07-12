import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Wrench, 
  ClipboardCheck, 
  ArrowLeftRight, 
  Sparkles,
  Info,
  Tag
} from 'lucide-react';

export default function NotificationsCenter({
  notifications,
  user,
  onMarkNotificationsAsRead,
  onClearNotifications,
  onTriggerMockNotification
}) {
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Unread' | 'Today' | 'Yesterday' | 'This Week'

  // Filter notifications for active user
  const myNotifications = notifications.filter(n => n.employeeId === 'all' || n.employeeId === user?.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  // Filter logic based on tabs
  const getFilteredNotifications = () => {
    return myNotifications.filter(notif => {
      if (filterTab === 'Unread') return !notif.isRead;
      
      const notifDate = new Date(notif.timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - notifDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterTab === 'Today') return diffDays <= 1;
      if (filterTab === 'Yesterday') return diffDays > 1 && diffDays <= 2;
      if (filterTab === 'This Week') return diffDays <= 7;
      
      return true; // 'All'
    });
  };

  const filteredList = getFilteredNotifications();

  // Helper: Match icon with notification topic/type
  const getIconForNotification = (title) => {
    const t = title.toLowerCase();
    if (t.includes('allocated') || t.includes('assign')) {
      return <Tag size={16} style={{ color: 'var(--primary)' }} />;
    }
    if (t.includes('booking') || t.includes('scheduled')) {
      return <Calendar size={16} style={{ color: 'var(--success)' }} />;
    }
    if (t.includes('maintenance') || t.includes('repair')) {
      return <Wrench size={16} style={{ color: 'var(--warning-dark)' }} />;
    }
    if (t.includes('transfer') || t.includes('shift')) {
      return <ArrowLeftRight size={16} style={{ color: 'var(--primary)' }} />;
    }
    if (t.includes('audit') || t.includes('verification')) {
      return <ClipboardCheck size={16} style={{ color: 'indigo' }} />;
    }
    if (t.includes('overdue') || t.includes('late')) {
      return <AlertTriangle size={16} style={{ color: 'var(--error)' }} />;
    }
    return <Bell size={16} style={{ color: 'var(--text-muted)' }} />;
  };

  // Helper: Match background colors
  const getCardStyle = (notif) => {
    if (!notif.isRead) {
      return {
        backgroundColor: 'var(--primary-light)',
        borderStyle: 'solid',
        borderWidth: '1px 1px 1px 4px',
        borderColor: 'var(--border-color) var(--border-color) var(--border-color) var(--primary)'
      };
    }
    return {
      backgroundColor: 'var(--bg-primary)',
      borderStyle: 'solid',
      borderWidth: '1px 1px 1px 4px',
      borderColor: 'var(--border-color) var(--border-color) var(--border-color) var(--border-color)'
    };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Notification List */}
      <div className="card" style={{ padding: '20px' }}>
        
        {/* Header Options */}
        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--primary)' }} /> Notification Inbox
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', backgroundColor: 'var(--error)', color: 'white', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: '700' }}>
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {unreadCount > 0 && (
              <button 
                onClick={onMarkNotificationsAsRead}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={12} /> Mark all read
              </button>
            )}
            {myNotifications.length > 0 && (
              <button 
                onClick={onClearNotifications}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', borderColor: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={12} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'Unread', 'Today', 'Yesterday', 'This Week'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: filterTab === tab ? 'var(--primary-light)' : 'transparent',
                color: filterTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List of Notification Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <Bell size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              <span style={{ fontSize: '13px' }}>No notifications found matching "{filterTab}" filter.</span>
            </div>
          ) : (
            filteredList.map(notif => (
              <div
                key={notif.id}
                style={{
                  ...getCardStyle(notif),
                  display: 'flex',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-color)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {getIconForNotification(notif.title)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'start', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <Clock size={10} />
                    <span>{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Simulator & Configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Alerts & Events Simulator */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Live Event Simulator
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Simulate operational trigger events to check notifications feed reactivity and desktop toasts.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <button
              onClick={() => onTriggerMockNotification({
                title: 'Overdue Return Warning',
                message: 'Asset "MacBook Pro M3 Max 16"" (AF-0001) has passed its return due date of 2026-01-15.',
                type: 'alert'
              })}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'left' }}
            >
              <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
              <span>Simulate Overdue Return Alert</span>
            </button>

            <button
              onClick={() => onTriggerMockNotification({
                title: 'Maintenance Approved',
                message: 'Maintenance ticket M-301 for Epson Pro Cinema 4K Projector has been assigned to Alice Vance.',
                type: 'warning'
              })}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'left' }}
            >
              <Wrench size={14} style={{ color: 'var(--warning-dark)' }} />
              <span>Simulate Maintenance Assigned</span>
            </button>

            <button
              onClick={() => onTriggerMockNotification({
                title: 'Booking Confirmed',
                message: 'Your reservation for Conference Room Delta on 2026-07-13 has been approved.',
                type: 'success'
              })}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'left' }}
            >
              <Calendar size={14} style={{ color: 'var(--success)' }} />
              <span>Simulate Booking Confirmed</span>
            </button>

          </div>
        </div>

        {/* Subscriptions Info */}
        <div className="card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} style={{ color: 'var(--primary)' }} /> Subscription Details
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Your account ({user?.name}) is registered with role <strong>{user?.role}</strong>. You are subscribed to all events from the <strong>{user?.departmentId || 'Engineering'}</strong> department, and direct transfer approvals.
          </p>
        </div>

      </div>

    </div>
  );
}
