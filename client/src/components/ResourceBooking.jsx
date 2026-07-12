import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Video, 
  Car, 
  Projector, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  X,
  Check
} from 'lucide-react';

export default function ResourceBooking({
  assets,
  employees,
  bookings,
  user,
  selectedAssetId,
  onBookResource
}) {
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-07-12'); // Mock system date
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [conflictPopup, setConflictPopup] = useState(null);

  // Form states
  const [bookEmployeeId, setBookEmployeeId] = useState(user?.id || employees[0]?.id || '');
  const [bookStartTime, setBookStartTime] = useState('09:00');
  const [bookEndTime, setBookEndTime] = useState('10:00');
  const [bookPurpose, setBookPurpose] = useState('');

  // Group assets that can be booked (isBookable === true)
  const bookableResources = assets.filter(a => a.isBookable);

  useEffect(() => {
    if (selectedAssetId) {
      setSelectedResourceId(selectedAssetId);
    } else if (bookableResources.length > 0 && !selectedResourceId) {
      setSelectedResourceId(bookableResources[0].id);
    }
  }, [bookableResources, selectedResourceId, selectedAssetId]);

  useEffect(() => {
    if (user?.id) {
      setBookEmployeeId(String(user.id));
    }
  }, [user]);

  const selectedResource = assets.find(a => a.id === selectedResourceId);

  // Filter bookings for the selected resource on the selected date
  const resourceBookingsToday = bookings.filter(
    b => b.resourceId === selectedResourceId && b.date === bookingDate && b.status === 'Approved'
  );

  const getResourceIcon = (category) => {
    switch (category) {
      case 'Conference Rooms': return <Video size={16} />;
      case 'Vehicles': return <Car size={16} />;
      default: return <Projector size={16} />;
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  // Convert "HH:MM" to float hours for rendering on the grid
  const timeToHours = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  // Check overlap conflict helper
  const checkOverlap = (date, start, end, resourceId) => {
    const startHour = timeToHours(start);
    const endHour = timeToHours(end);
    
    return bookings.find(b => {
      if (b.resourceId !== resourceId || b.date !== date || b.status !== 'Approved') return false;
      const bStart = timeToHours(b.startTime);
      const bEnd = timeToHours(b.endTime);
      
      // Overlap condition
      return (startHour < bEnd && endHour > bStart);
    });
  };

  // Handle Booking Form Submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (timeToHours(bookStartTime) >= timeToHours(bookEndTime)) {
      alert("End time must be after start time.");
      return;
    }

    const conflict = checkOverlap(bookingDate, bookStartTime, bookEndTime, selectedResourceId);
    if (conflict) {
      const conflictEmp = employees.find(e => e.id === conflict.employeeId);
      setConflictPopup({
        employeeName: conflictEmp ? conflictEmp.name : 'Another Employee',
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        purpose: conflict.purpose
      });
      return;
    }

    onBookResource({
      resourceId: selectedResourceId,
      employeeId: bookEmployeeId,
      date: bookingDate,
      startTime: bookStartTime,
      endTime: bookEndTime,
      purpose: bookPurpose
    });

    setShowBookingModal(false);
    setBookPurpose('');
  };

  // Hours to show in calendar view (8:00 AM to 6:00 PM)
  const hoursGrid = Array.from({ length: 11 }, (_, i) => 8 + i);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Resource directory & upcoming slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Book Resource CTA Button */}
        <button 
          onClick={() => setShowBookingModal(true)} 
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13.5px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
        >
          <Plus size={16} /> Book Resource
        </button>

        {/* Resources Selector Catalog */}
        <div className="card" style={{ padding: '16px 12px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '8px' }}>
            Bookable Resources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {bookableResources.map(res => (
              <button
                key={res.id}
                onClick={() => setSelectedResourceId(res.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: selectedResourceId === res.id ? 'var(--primary-light)' : 'transparent',
                  color: selectedResourceId === res.id ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  color: selectedResourceId === res.id ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {getResourceIcon(res.category)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {res.name}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>
                    {res.category.split(' ')[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings Panel */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} style={{ color: 'var(--info)' }} /> Upcoming Today
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {resourceBookingsToday.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                No active bookings scheduled today.
              </div>
            ) : (
              resourceBookingsToday.map(b => (
                <div 
                  key={b.id} 
                  style={{ 
                    padding: '10px', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--bg-secondary)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontWeight: '500' }}>
                    {b.purpose}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Booked by: {getEmployeeName(b.employeeId)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Scheduler Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Calendar Navigation & Info Header */}
        <div className="card" style={{ padding: '14px 20px', display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setBookingDate('2026-07-11')} 
                className="btn btn-secondary btn-icon" 
                style={{ padding: '5px' }}
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setBookingDate('2026-07-12')} 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Today
              </button>
              <button 
                onClick={() => setBookingDate('2026-07-13')} 
                className="btn btn-secondary btn-icon" 
                style={{ padding: '5px' }}
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={18} style={{ color: 'var(--primary)' }} /> 
              {new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
          </div>

          {selectedResource && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span className={`badge badge-available`} style={{ fontSize: '9px' }}>Active Grid</span>
              <strong>{selectedResource.name}</strong> ({selectedResource.location})
            </div>
          )}
        </div>

        {/* Schedule Grid Layout */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          
          {/* Hour slots display list */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {hoursGrid.map((h, index) => {
              const hourStr = `${h.toString().padStart(2, '0')}:00`;
              
              // Find if any booking falls on this hour
              const activeBooking = resourceBookingsToday.find(b => {
                const bStart = timeToHours(b.startTime);
                const bEnd = timeToHours(b.endTime);
                return (h >= bStart && h < bEnd);
              });

              return (
                <div 
                  key={h}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr',
                    height: '60px',
                    borderBottom: index === hoursGrid.length - 1 ? 'none' : '1px solid var(--border-color)',
                    position: 'relative'
                  }}
                >
                  {/* Left Column: Time label */}
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    paddingTop: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    userSelect: 'none'
                  }}>
                    {hourStr}
                  </div>

                  {/* Right Column: Interactive Schedule Slot */}
                  <div 
                    onClick={() => {
                      if (!activeBooking) {
                        const start = `${h.toString().padStart(2, '0')}:00`;
                        const end = `${(h + 1).toString().padStart(2, '0')}:00`;
                        setBookStartTime(start);
                        setBookEndTime(end);
                        setShowBookingModal(true);
                      }
                    }}
                    style={{
                      position: 'relative',
                      backgroundColor: 'transparent',
                      cursor: activeBooking ? 'default' : 'pointer',
                      transition: 'background-color 0.1s ease'
                    }}
                    className={activeBooking ? '' : 'btn-secondary'}
                  >
                    {!activeBooking && (
                      <div className="hover-slot" style={{
                        position: 'absolute',
                        top: 0, right: 0, bottom: 0, left: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        opacity: 0,
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: 'rgba(37, 99, 235, 0.02)'
                      }}>
                        + CLICK TO BOOK SLOT
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Absolute Positioned Booked blocks layer to support overlapping start/end blocks */}
            {resourceBookingsToday.map(b => {
              const startVal = timeToHours(b.startTime);
              const endVal = timeToHours(b.endTime);
              
              // Calculate top offset and height relative to hoursGrid start (8 AM)
              const topOffset = (startVal - 8) * 60;
              const blockHeight = (endVal - startVal) * 60;

              return (
                <div
                  key={b.id}
                  style={{
                    position: 'absolute',
                    top: `${topOffset}px`,
                    left: '71px',
                    right: '12px',
                    height: `${blockHeight - 2}px`,
                    backgroundColor: 'var(--primary-light)',
                    borderLeft: '4px solid var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {b.startTime} - {b.endTime}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {b.purpose}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    Booked by: {getEmployeeName(b.employeeId)}
                  </div>
                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* BOOKING INPUT MODAL OVERLAY */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Book {selectedResource?.name || 'Resource'}</h3>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Date */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Booking Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              {/* Time Slots row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={bookStartTime}
                    onChange={(e) => setBookStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={bookEndTime}
                    onChange={(e) => setBookEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Book Employee */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reserved By</label>
                <select
                  className="form-control"
                  value={bookEmployeeId}
                  onChange={(e) => setBookEmployeeId(e.target.value)}
                  disabled={!['Admin', 'Asset Manager'].includes(user?.role)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Purpose / Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Roadmap planning sync, client visit, etc."
                  value={bookPurpose}
                  onChange={(e) => setBookPurpose(e.target.value)}
                  required
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Booking
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OVERLAP CONFLICT DIALOG POPUP */}
      {conflictPopup && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', borderColor: 'var(--error-border)' }}>
            <div style={{ color: 'var(--error)', margin: '0 auto 12px', display: 'inline-flex', padding: '10px', borderRadius: '50%', backgroundColor: 'var(--error-light)' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Overlap Conflict Alert</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>
              This resource is already booked by <strong>{conflictPopup.employeeName}</strong> for <em>"{conflictPopup.purpose}"</em> during <strong>{conflictPopup.startTime} - {conflictPopup.endTime}</strong>.
            </p>
            <button 
              className="btn btn-danger" 
              style={{ width: '100%' }}
              onClick={() => setConflictPopup(null)}
            >
              Acknowledge & Adjust Time
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
