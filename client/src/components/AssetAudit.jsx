import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  User, 
  MapPin, 
  Building, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  FileSpreadsheet, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function AssetAudit({
  assets,
  employees,
  departments,
  audits,
  user,
  onStartAuditCycle,
  onCompleteAuditCycle
}) {
  const [auditorId, setAuditorId] = useState(employees[0]?.id || '');
  const [deptId, setDeptId] = useState('all');
  const [location, setLocation] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Active audit cycle state
  const [activeCycle, setActiveCycle] = useState(null);
  const [checklistStates, setChecklistStates] = useState({}); // { assetId: 'Verified' | 'Missing' | 'Damaged' }

  const locationsList = Array.from(new Set(assets.map(a => a.location))).filter(Boolean);

  const getDepartmentName = (id) => {
    if (!id) return '-';
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : '-';
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  // Handle starting a new audit cycle
  const handleStartCycle = (e) => {
    e.preventDefault();
    
    // Filter assets matching the criteria
    const targetAssets = assets.filter(a => {
      const matchDept = deptId === 'all' || a.departmentId === deptId;
      const matchLoc = location === 'all' || a.location === location;
      return matchDept && matchLoc;
    });

    if (targetAssets.length === 0) {
      alert("No assets found matching the selected criteria. Try expanding filters.");
      return;
    }

    const newCycle = {
      id: `cycle-${Date.now()}`,
      auditorId,
      departmentId: deptId,
      location,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      assetsToAudit: targetAssets
    };

    setActiveCycle(newCycle);

    // Initialize all checklist items as "Verified" by default
    const initialChecklist = {};
    targetAssets.forEach(a => {
      initialChecklist[a.id] = 'Verified';
    });
    setChecklistStates(initialChecklist);
  };

  // Update a single checklist item status
  const handleUpdateItem = (assetId, status) => {
    setChecklistStates(prev => ({
      ...prev,
      [assetId]: status
    }));
  };

  // Handle final audit cycle report generation
  const handleGenerateReport = () => {
    if (!activeCycle) return;

    const total = activeCycle.assetsToAudit.length;
    const verified = Object.values(checklistStates).filter(s => s === 'Verified').length;
    const missing = Object.values(checklistStates).filter(s => s === 'Missing').length;
    const damaged = Object.values(checklistStates).filter(s => s === 'Damaged').length;

    onCompleteAuditCycle({
      id: activeCycle.id,
      auditorName: getEmployeeName(activeCycle.auditorId),
      departmentName: activeCycle.departmentId === 'all' ? 'All Departments' : getDepartmentName(activeCycle.departmentId),
      locationName: activeCycle.location === 'all' ? 'All Locations' : activeCycle.location,
      date: new Date().toISOString().split('T')[0],
      summary: `${verified} Verified, ${missing} Missing, ${damaged} Damaged (${total} Total)`,
      status: 'Completed',
      verifiedCount: verified,
      missingCount: missing,
      damagedCount: damaged,
      totalCount: total
    });

    // Update asset conditions/statuses in database based on checklist
    // (In real app, we would update status 'Lost' for Missing, and condition 'Poor'/'Fair' for Damaged)

    setActiveCycle(null);
    setChecklistStates({});
    alert("Audit cycle completed and report logged successfully!");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: activeCycle ? '1.2fr 1fr' : '1fr 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* COLUMN 1: Create Cycle / Active Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {!activeCycle ? (
          /* CREATE AUDIT CYCLE FORM */
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck size={18} style={{ color: 'var(--primary)' }} /> Create Asset Audit Cycle
            </h3>
            <form onSubmit={handleStartCycle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Auditor */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign Lead Auditor</label>
                <select
                  className="form-control"
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Department</label>
                <select
                  className="form-control"
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Location</label>
                <select
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locationsList.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Date range grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit btn */}
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ marginTop: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Plus size={16} /> Initialize Verification Cycle
              </button>

            </form>
          </div>
        ) : (
          /* ACTIVE CHECKLIST INTERFACE */
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-allocated" style={{ marginBottom: '4px' }}>Active Audit Cycle</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Checklist Verification</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Audited by: <strong>{getEmployeeName(activeCycle.auditorId)}</strong>
                </span>
              </div>
              <button 
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                onClick={() => {
                  if (confirm("Cancel active audit? Progress will be lost.")) {
                    setActiveCycle(null);
                  }
                }}
              >
                Cancel Audit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
              {activeCycle.assetsToAudit.map(asset => {
                const currentStatus = checklistStates[asset.id] || 'Verified';
                return (
                  <div 
                    key={asset.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={asset.image} 
                        alt="" 
                        style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700' }}>
                          <span style={{ color: 'var(--primary)' }}>{asset.tag}</span> • {asset.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Loc: {asset.location || 'Unknown'} • Cond: {asset.condition}
                        </div>
                      </div>
                    </div>

                    {/* Verification Toggle Pill Buttons */}
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(asset.id, 'Verified')}
                        style={{
                          border: 'none',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: currentStatus === 'Verified' ? 'var(--success)' : 'transparent',
                          color: currentStatus === 'Verified' ? 'white' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Verified
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(asset.id, 'Damaged')}
                        style={{
                          border: 'none',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: currentStatus === 'Damaged' ? 'var(--warning-dark)' : 'transparent',
                          color: currentStatus === 'Damaged' ? 'white' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Damaged
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(asset.id, 'Missing')}
                        style={{
                          border: 'none',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: currentStatus === 'Missing' ? 'var(--error)' : 'transparent',
                          color: currentStatus === 'Missing' ? 'white' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Missing
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generate Report Button */}
            <button
              onClick={handleGenerateReport}
              className="btn btn-success"
              style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FileSpreadsheet size={16} /> Generate & Log Audit Report
            </button>
          </div>
        )}

      </div>

      {/* COLUMN 2: Audit History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Verification metrics KPI card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
              Audit Compliance Level
            </span>
            <TrendingUp size={16} style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
            94.2%
          </h2>
          <p style={{ fontSize: '11.5px', opacity: 0.9, marginTop: '4px' }}>
            Average asset match rate across corporate departments this quarter.
          </p>
        </div>

        {/* Audit Runs Log History */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>
            Historical Audit Runs Log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {audits.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                No past audit records log found.
              </div>
            ) : (
              audits.map(aud => (
                <div 
                  key={aud.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{aud.departmentName}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '6px' }}>({aud.locationName})</span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 5px' }}>{aud.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {aud.summary}
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span>Auditor: {aud.auditorName}</span>
                    <span>Completed: {aud.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
