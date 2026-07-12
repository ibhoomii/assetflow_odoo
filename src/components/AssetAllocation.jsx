import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  ArrowRightLeft, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Building,
  History,
  FileText,
  Search
} from 'lucide-react';

export default function AssetAllocation({
  assets,
  employees,
  departments,
  allocations,
  transfers,
  user,
  selectedAssetId,
  setSelectedAssetId,
  onAllocate,
  onRequestTransfer,
  onReturnAsset
}) {
  const [activeAssetId, setActiveAssetId] = useState(selectedAssetId || (assets[0]?.id || ''));
  const [targetEmployeeId, setTargetEmployeeId] = useState(employees[0]?.id || '');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [showAssetList, setShowAssetList] = useState(false);

  const role = user?.role || 'Employee';

  // Synchronize internal state with parent-provided pre-selection
  useEffect(() => {
    if (selectedAssetId) {
      setActiveAssetId(selectedAssetId);
    }
  }, [selectedAssetId]);

  const selectedAsset = assets.find(a => a.id === activeAssetId);
  const targetEmployee = employees.find(e => e.id === targetEmployeeId);

  // Set default return date (e.g. 1 year from now)
  useEffect(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    setExpectedReturnDate(oneYearLater.toISOString().split('T')[0]);
  }, []);

  const getDepartmentName = (deptId) => {
    if (!deptId) return '-';
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : '-';
  };

  // Find current allocation
  const currentAllocation = allocations.find(al => al.assetId === activeAssetId && al.actualReturnDate === null);
  const currentOwner = currentAllocation ? employees.find(e => e.id === currentAllocation.employeeId) : null;

  // History timeline calculations
  const allocationHistory = allocations
    .filter(al => al.assetId === activeAssetId)
    .map(al => {
      const emp = employees.find(e => e.id === al.employeeId);
      return {
        id: al.id,
        date: al.allocatedDate,
        title: al.actualReturnDate ? 'Returned' : 'Allocated',
        desc: `Assigned to ${emp?.name || 'Employee'} by ${al.allocatedBy}. ${al.actualReturnDate ? `Returned on ${al.actualReturnDate}` : `Expected return by ${al.returnDate}`}`,
        type: al.actualReturnDate ? 'return' : 'allocation'
      };
    });

  const transferHistory = transfers
    .filter(t => t.assetId === activeAssetId)
    .map(t => {
      const fromEmp = employees.find(e => e.id === t.fromEmployeeId);
      const toEmp = employees.find(e => e.id === t.toEmployeeId);
      return {
        id: t.id,
        date: t.requestDate,
        title: `Transfer: ${t.status}`,
        desc: `Request to transfer from ${fromEmp?.name || 'Unknown'} to ${toEmp?.name || 'Unknown'} by ${t.requestedBy}. ${t.approvedDate ? `Approved on ${t.approvedDate}` : ''}`,
        type: 'transfer'
      };
    });

  const timelineEvents = [...allocationHistory, ...transferHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Handle Form Submission
  const handleAllocate = (e) => {
    e.preventDefault();
    if (!selectedAsset || selectedAsset.status !== 'Available') return;
    
    onAllocate({
      assetId: selectedAsset.id,
      employeeId: targetEmployeeId,
      expectedReturnDate,
      allocatedBy: user.name
    });
  };

  const handleTransfer = () => {
    if (!selectedAsset || selectedAsset.status !== 'Allocated' || !currentOwner) return;
    if (currentOwner.id === targetEmployeeId) {
      alert("Asset is already assigned to this employee.");
      return;
    }

    onRequestTransfer({
      assetId: selectedAsset.id,
      fromEmployeeId: currentOwner.id,
      toEmployeeId: targetEmployeeId,
      requestedBy: user.name
    });
  };

  const handleReturn = () => {
    if (!selectedAsset || !currentAllocation) return;
    if (confirm(`Confirm return for ${selectedAsset.name}?`)) {
      onReturnAsset(currentAllocation.id);
    }
  };

  const filteredSearchAssets = assets.filter(a =>
    a.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    a.tag.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Form & Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Custom Autocomplete / Combobox Asset Selector */}
        <div className="card" style={{ position: 'relative' }}>
          <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
            Select Corporate Asset
          </label>
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-primary)'
              }}
              onClick={() => setShowAssetList(!showAssetList)}
            >
              {selectedAsset ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={selectedAsset.image} 
                    alt="" 
                    style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                  />
                  <div>
                    <strong style={{ color: 'var(--primary)' }}>{selectedAsset.tag}</strong>
                    <span style={{ marginLeft: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {selectedAsset.name}
                    </span>
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Choose an asset...</span>
              )}
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            {showAssetList && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                marginTop: '6px',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', sticky: 'top', backgroundColor: '#fff' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by tag, name..."
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {filteredSearchAssets.map(a => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--bg-tertiary)',
                      backgroundColor: activeAssetId === a.id ? 'var(--primary-light)' : 'transparent'
                    }}
                    onClick={() => {
                      setActiveAssetId(a.id);
                      if (setSelectedAssetId) setSelectedAssetId(a.id);
                      setShowAssetList(false);
                      setFilterSearch('');
                    }}
                  >
                    <img 
                      src={a.image} 
                      alt="" 
                      style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        <span style={{ color: 'var(--primary)' }}>{a.tag}</span> • {a.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Category: {a.category} • Location: {a.location}
                      </div>
                    </div>
                    <span className={`badge badge-${a.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px' }}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Asset Details Card */}
        {selectedAsset && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <img 
                src={selectedAsset.image} 
                alt={selectedAsset.name} 
                style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className={`badge badge-${selectedAsset.status.toLowerCase().replace(' ', '-')}`} style={{ alignSelf: 'start', marginBottom: '6px' }}>
                  {selectedAsset.status}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedAsset.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <MapPin size={12} /> {selectedAsset.location || 'No Location Assigned'}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '12.5px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>CATEGORY</span>
                <span style={{ fontWeight: '600' }}>{selectedAsset.category}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>CONDITION</span>
                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{selectedAsset.condition}</span>
              </div>
            </div>
          </div>
        )}

        {/* Allocation Form */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} style={{ color: 'var(--primary)' }} /> Assignment Details
          </h3>
          <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Target Employee */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assign To Employee</label>
              <select
                className="form-control"
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({getDepartmentName(emp.departmentId)})
                  </option>
                ))}
              </select>
            </div>

            {/* Department Autofill Display */}
            {targetEmployee && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', padding: '4px 6px' }}>
                <Building size={14} style={{ color: 'var(--text-muted)' }} /> Department:
                <strong style={{ color: 'var(--text-primary)' }}>
                  {getDepartmentName(targetEmployee.departmentId)}
                </strong>
              </div>
            )}

            {/* Expected Return Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Expected Return Date</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '100%' }}
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button Actions */}
            {selectedAsset?.status === 'Available' ? (
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: '8px', padding: '10px' }}
              >
                Allocate Corporate Asset
              </button>
            ) : selectedAsset?.status === 'Allocated' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: '8px',
                  backgroundColor: 'var(--error-light)',
                  border: '1px solid var(--error-border)',
                  color: 'var(--error-dark)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    This asset is already assigned to <strong>{currentOwner?.name || 'another employee'}</strong>.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, borderColor: 'var(--primary-border)', color: 'var(--primary)' }}
                    onClick={handleTransfer}
                  >
                    <ArrowRightLeft size={14} /> Request Transfer
                  </button>
                  {['Admin', 'Asset Manager'].includes(role) && (
                    <button
                      type="button"
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      onClick={handleReturn}
                    >
                      Check-In / Return
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                disabled
                style={{ marginTop: '8px', padding: '10px' }}
              >
                Asset Unavailable ({selectedAsset?.status || 'N/A'})
              </button>
            )}

          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: Current Allocation & History Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Current Assignment Details panel */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: 'var(--primary)' }} /> Current Allocation
          </h3>
          {currentAllocation && currentOwner ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={currentOwner.avatar} 
                  alt="" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{currentOwner.name}</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {currentOwner.role} • {getDepartmentName(currentOwner.departmentId)}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '12px',
                fontSize: '12.5px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>ALLOCATED DATE</span>
                  <strong>{currentAllocation.allocatedDate}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>DUE DATE</span>
                  <strong style={{ color: currentAllocation.returnDate < '2026-07-12' ? 'var(--error)' : 'inherit' }}>
                    {currentAllocation.returnDate} {currentAllocation.returnDate < '2026-07-12' && '(Overdue)'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              This asset is currently in storage (Available).
            </div>
          )}
        </div>

        {/* Transfer Requests for Selected Asset */}
        {transfers.filter(t => t.assetId === activeAssetId && t.status === 'Pending').length > 0 && (
          <div className="card" style={{ borderColor: 'var(--warning-border)', backgroundColor: 'var(--warning-light)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: 'var(--warning-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowRightLeft size={15} /> Pending Transfer Requests
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transfers
                .filter(t => t.assetId === activeAssetId && t.status === 'Pending')
                .map(t => {
                  const fromEmp = employees.find(e => e.id === t.fromEmployeeId);
                  const toEmp = employees.find(e => e.id === t.toEmployeeId);
                  return (
                    <div 
                      key={t.id} 
                      style={{ 
                        padding: '10px', 
                        backgroundColor: 'white', 
                        border: '1px solid var(--warning-border)', 
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px' }}>
                        <strong>Transfer Request</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.requestDate}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        From <strong>{fromEmp?.name}</strong> to <strong>{toEmp?.name}</strong>.
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Requested by: {t.requestedBy}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Historical Timeline */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} style={{ color: 'var(--primary)' }} /> Allocation History Timeline
          </h3>
          {timelineEvents.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No allocation events logged for this asset.
            </div>
          ) : (
            <div className="timeline" style={{ paddingLeft: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {timelineEvents.map((item, idx) => (
                <div key={idx} className="timeline-item" style={{ paddingBottom: '16px' }}>
                  <div className="timeline-date">{item.date}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
