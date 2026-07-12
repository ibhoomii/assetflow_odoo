import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  ChevronRight, 
  User, 
  Tag, 
  Settings,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

export default function MaintenanceManagement({
  assets,
  maintenance,
  user,
  selectedAssetId,
  setSelectedAssetId,
  onRaiseMaintenance,
  onResolveMaintenance
}) {
  const [activeTicketId, setActiveTicketId] = useState('');
  const [formAssetId, setFormAssetId] = useState(selectedAssetId || (assets[0]?.id || ''));
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [mockImageUrl, setMockImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const role = user?.role || 'Employee';

  // Sync selectedAssetId
  useEffect(() => {
    if (selectedAssetId) {
      setFormAssetId(selectedAssetId);
    }
  }, [selectedAssetId]);

  // Default active ticket selection
  useEffect(() => {
    if (maintenance.length > 0 && !activeTicketId) {
      setActiveTicketId(maintenance[0].id);
    }
  }, [maintenance, activeTicketId]);

  const selectedTicket = maintenance.find(m => m.id === activeTicketId);
  const selectedTicketAsset = selectedTicket ? assets.find(a => a.id === selectedTicket.assetId) : null;

  // Stepper progress helper
  const stepsList = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

  const getStepIndex = (status) => {
    if (status === 'Pending') return 0;
    if (status === 'Approved') return 1;
    if (status === 'In Progress') return 3;
    if (status === 'Resolved') return 4;
    // For 'Technician Assigned' (IT / technicians listed)
    return 2;
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High': return <span className="badge badge-high" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>High</span>;
      case 'Medium': return <span className="badge badge-medium" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-dark)' }}>Medium</span>;
      default: return <span className="badge badge-low" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>Low</span>;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    onRaiseMaintenance({
      assetId: formAssetId,
      reportedBy: user.name,
      issueDescription: description,
      priority,
      image: mockImageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=60'
    });

    setDescription('');
    setMockImageUrl('');
    alert("Maintenance ticket raised successfully!");
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    const resolution = e.target.elements.resolution.value;
    const tech = e.target.elements.technician.value;
    if (!resolution.trim() || !tech.trim()) return;

    onResolveMaintenance({
      ticketId: selectedTicket.id,
      resolutionNotes: resolution,
      technicianName: tech
    });

    e.target.reset();
  };

  // Mock upload triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Simulate drop attachment
    setMockImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Raise Maintenance Request */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={16} style={{ color: 'var(--primary)' }} /> Raise Maintenance Request
          </h3>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Select Asset */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Inventory Asset</label>
              <select
                className="form-control"
                value={formAssetId}
                onChange={(e) => {
                  setFormAssetId(e.target.value);
                  if (setSelectedAssetId) setSelectedAssetId(e.target.value);
                }}
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                ))}
              </select>
            </div>

            {/* Select Priority */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Urgency Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low (General Repair)</option>
                <option value="Medium">Medium (Operational Issue)</option>
                <option value="High">High (Immediate Action Required)</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Issue Details & Symptoms</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Describe the defect, flickering screen, hardware lockups, damage, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* Upload Attachment Widget */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Diagnostic Photo Attachment</label>
              <div 
                onDragEnter={handleDrag} 
                onDragOver={handleDrag} 
                onDragLeave={handleDrag} 
                onDrop={handleDrop}
                onClick={() => setMockImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60')}
                style={{
                  border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                  backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {mockImageUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={mockImageUrl} 
                      alt="Thumbnail upload preview" 
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--success-dark)', fontWeight: '600' }}>
                      ✓ diagnostic_report_cap.png attached
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                      Drag and drop image here or <strong style={{ color: 'var(--primary)' }}>Click to Upload</strong>
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Supports PNG, JPG (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ marginTop: '8px', padding: '10px' }}
            >
              Submit Ticket Request
            </button>

          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Ticket Tracker & List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Ticket Catalog List */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Operational Repair Tickets ({maintenance.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {maintenance.map(t => {
              const asset = assets.find(a => a.id === t.assetId);
              const isActive = activeTicketId === t.id;
              
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTicketId(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid var(--primary-border)' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className={isActive ? '' : 'card-interactive'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '13px', color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {asset?.tag || 'AF-XXXX'}
                      </strong>
                      {getPriorityBadge(t.priority)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.issueDescription}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge" style={{ 
                      fontSize: '9px',
                      backgroundColor: t.status === 'Resolved' ? 'var(--success-light)' : 'var(--warning-light)',
                      color: t.status === 'Resolved' ? 'var(--success-dark)' : 'var(--warning-dark)'
                    }}>
                      {t.status}
                    </span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Details & Stepper Tracker */}
        {selectedTicket ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Ticket Header */}
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TICKET ID: {selectedTicket.id.toUpperCase()}</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '2px' }}>
                  {selectedTicketAsset?.name || 'Unknown Asset'}
                </h3>
              </div>
              <div>
                {getPriorityBadge(selectedTicket.priority)}
              </div>
            </div>

            {/* PROGRESS WORKFLOW TRACKER STEPPER */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Workflow Progress Tracker
              </h4>
              
              <div style={{ display: 'flex', justify: 'space-between', position: 'relative', padding: '0 8px' }}>
                
                {/* Visual Line in background */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '16px',
                  right: '16px',
                  height: '3px',
                  backgroundColor: 'var(--border-color)',
                  zIndex: 1
                }}>
                  <div style={{
                    width: `${(getStepIndex(selectedTicket.status) / 4) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--success)',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>

                {/* Steps */}
                {stepsList.map((step, idx) => {
                  const activeIdx = getStepIndex(selectedTicket.status);
                  const isCompleted = idx <= activeIdx;
                  const isActive = idx === activeIdx;

                  return (
                    <div 
                      key={step} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        zIndex: 2, 
                        position: 'relative',
                        width: '50px'
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? 'var(--success)' : 'white',
                        border: isCompleted ? '2.5px solid var(--success-border)' : '2px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: '700',
                        transition: 'all 0.25s ease',
                        boxShadow: isActive ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none'
                      }}>
                        {isCompleted && '✓'}
                      </div>
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: isActive ? '700' : '500', 
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        textAlign: 'center',
                        marginTop: '6px',
                        lineHeight: '1.2',
                        width: '60px'
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Ticket Info details */}
            <div style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px', 
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>REPORTER INFO</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontWeight: '600' }}>
                  <User size={13} /> {selectedTicket.reportedBy} • Reported on {selectedTicket.reportedDate}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>ISSUE DESCRIPTION</span>
                <p style={{ marginTop: '2px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {selectedTicket.issueDescription}
                </p>
              </div>

              {selectedTicket.status === 'Resolved' && (
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--success-dark)', fontSize: '11px', display: 'block', fontWeight: '700' }}>RESOLUTION SUMMARY</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontWeight: '600' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> Technician: {selectedTicket.technicianName}
                  </div>
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{selectedTicket.resolutionNotes}"
                  </p>
                </div>
              )}
            </div>

            {/* Action Resolution Form for admin/managers */}
            {selectedTicket.status !== 'Resolved' && ['Admin', 'Asset Manager'].includes(role) && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '12.5px', fontWeight: '700', marginBottom: '10px' }}>
                  Update Ticket Status & Action Resolution
                </h4>
                <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Assign Technician</label>
                      <input 
                        type="text" 
                        name="technician" 
                        className="form-control" 
                        placeholder="e.g. Alice Vance" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Resolution Summary</label>
                      <input 
                        type="text" 
                        name="resolution" 
                        className="form-control" 
                        placeholder="e.g. Cleared dust, thermal paste" 
                        required 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    Mark as Resolved & Complete
                  </button>
                </form>
              </div>
            )}

          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a ticket from the list above to view status workflow details.
          </div>
        )}

      </div>

    </div>
  );
}
