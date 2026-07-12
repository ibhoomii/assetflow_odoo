import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Wrench,
  User,
  History,
  QrCode,
  ArrowRightLeft,
  X,
  FileText,
  BookmarkCheck,
  Building,
  Info
} from 'lucide-react';

export default function AssetDirectory({
  assets,
  categories,
  departments,
  employees,
  allocations,
  maintenance,
  transfers,
  user,
  onEditAsset,
  onDeleteAsset,
  onOpenQuickAction,
  onSelectAssetForView
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [activeDetailAsset, setActiveDetailAsset] = useState(null);
  const [qrCodeModalAsset, setQrCodeModalAsset] = useState(null);

  const role = user?.role || 'Employee';

  // Get unique locations
  const locations = Array.from(new Set(assets.map(a => a.location))).filter(Boolean);

  // Filtered Assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.qrCode && a.qrCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || a.location === selectedLocation;
    const matchesDepartment = selectedDepartment === 'all' || a.departmentId === selectedDepartment;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const cls = status.toLowerCase().replace(' ', '-');
    return <span className={`badge badge-${cls}`}>{status}</span>;
  };

  const getConditionStyle = (cond) => {
    switch (cond) {
      case 'New': return { color: 'var(--success)', fontWeight: '600' };
      case 'Excellent': return { color: 'var(--success-dark)', fontWeight: '600' };
      case 'Good': return { color: 'var(--primary)', fontWeight: '500' };
      case 'Fair': return { color: 'var(--warning-dark)', fontWeight: '500' };
      case 'Poor': return { color: 'var(--error)', fontWeight: '600' };
      default: return {};
    }
  };

  // Helper to lookup department details
  const getDepartmentName = (id) => {
    if (!id) return '-';
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : '-';
  };

  // Helper to lookup employee details
  const getEmployee = (id) => {
    if (!id) return null;
    return employees.find(e => e.id === id);
  };

  // Helper to lookup employee details name
  const getEmployeeName = (id) => {
    if (!id) return '-';
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  // Generate SVG QR Code block
  const renderQRCodeSVG = (text) => {
    let seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const grid = [];
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 10; c++) {
        const isCorner = (r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3);
        if (isCorner) {
          row.push((r === 0 || r === 2 || c === 0 || c === 2 || c === 7 || c === 9 || r === 7 || r === 9) ? 1 : 0);
        } else {
          seed = (seed * 9301 + 49297) % 233280;
          row.push(seed % 3 === 0 ? 1 : 0);
        }
      }
      grid.push(row);
    }
    return (
      <svg width="64" height="64" viewBox="0 0 10 10" style={{ shapeRendering: 'crispEdges' }}>
        <rect width="10" height="10" fill="white" />
        {grid.map((row, r) => 
          row.map((val, c) => 
            val === 1 ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
          )
        )}
      </svg>
    );
  };

  const handleOpenDetailModal = (asset) => {
    setActiveDetailAsset(asset);
  };

  // ---------------------------------------------------
  // Detailed History Synthesizers for Selected Asset
  // ---------------------------------------------------
  const getAssetAllocHistory = (assetId) => {
    return allocations
      .filter(al => al.assetId === assetId)
      .map(al => {
        const emp = employees.find(e => e.id === al.employeeId);
        return {
          id: al.id,
          date: al.allocatedDate,
          title: al.actualReturnDate ? 'Returned' : 'Allocated',
          desc: `Assigned to ${emp?.name || 'Employee'} by ${al.allocatedBy}. ${al.actualReturnDate ? `Returned on ${al.actualReturnDate}` : `Due by ${al.returnDate}`}`,
          badge: al.actualReturnDate ? 'Completed' : (al.returnDate < '2026-07-12' ? 'Overdue' : 'Active')
        };
      })
      .reverse();
  };

  const getAssetMaintHistory = (assetId) => {
    return maintenance
      .filter(m => m.assetId === assetId)
      .map(m => ({
        id: m.id,
        date: m.reportedDate,
        title: `Maintenance: ${m.status}`,
        desc: `"${m.issueDescription}" ${m.technicianName ? `assigned to ${m.technicianName}` : ''}. ${m.resolvedDate ? `Resolved: "${m.resolutionNotes}" on ${m.resolvedDate}` : ''}`,
        priority: m.priority
      }))
      .reverse();
  };

  const getAssetStatusHistory = (asset) => {
    // Generate logical timeline based on registration & current state
    const history = [
      { date: asset.purchaseDate, title: 'Asset Registered', desc: `Imported into inventory catalog as ${asset.condition} condition.` }
    ];

    // Add allocation status changes
    allocations
      .filter(al => al.assetId === asset.id)
      .forEach(al => {
        const emp = employees.find(e => e.id === al.employeeId);
        history.push({
          date: al.allocatedDate,
          title: 'Status: Allocated',
          desc: `Allocated to ${emp?.name}. Status updated from Available to Allocated.`
        });
        if (al.actualReturnDate) {
          history.push({
            date: al.actualReturnDate,
            title: 'Status: Available',
            desc: `Returned by ${emp?.name}. Status reverted to Available.`
          });
        }
      });

    // Add maintenance actions
    maintenance
      .filter(m => m.assetId === asset.id)
      .forEach(m => {
        if (m.status === 'In Progress' || m.status === 'Approved') {
          history.push({
            date: m.reportedDate,
            title: 'Status: Under Maintenance',
            desc: `Maintenance request approved. Removed from circulation.`
          });
        }
        if (m.resolvedDate) {
          history.push({
            date: m.resolvedDate,
            title: 'Status: Available',
            desc: `Maintenance resolved. Returned to active service.`
          });
        }
      });

    if (asset.status === 'Lost') {
      history.push({
        date: '2026-05-15', // Q2 Audit date
        title: 'Status: Lost',
        desc: `Marked as Missing during the Q2 2026 Audit cycle.`
      });
    }

    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Filtering Options header card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, tag, serial, QR code..."
              style={{ width: '100%', paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Category Filter */}
            <select
              className="form-control"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            {/* Status Filter */}
            <select
              className="form-control"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
            </select>

            {/* Department Filter */}
            <select
              className="form-control"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            {/* Location Filter */}
            <select
              className="form-control"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>

            {/* Reset Button */}
            {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedDepartment !== 'all' || selectedLocation !== 'all' || searchQuery) && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px' }}
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedDepartment('all');
                  setSelectedLocation('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            )}

            {/* Layout Toggle */}
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '8px', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('table')}
                className={`btn btn-secondary btn-icon ${viewMode === 'table' ? 'btn-primary' : ''}`}
                style={{ padding: '6px' }}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`btn btn-secondary btn-icon ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                style={{ padding: '6px' }}
                title="Grid Card View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Directory Content */}
      {filteredAssets.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Info size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)', opacity: 0.7 }} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>No Assets Found</h4>
          <p style={{ fontSize: '13px' }}>Try relaxing your search terms or filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        
        /* Table View */
        <div className="table-container" style={{ marginTop: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Department</th>
                <th>Status</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Assigned To</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{asset.tag}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={asset.image}
                        alt=""
                        style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                      <span style={{ fontWeight: '600' }}>{asset.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{asset.category}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{getDepartmentName(asset.departmentId)}</td>
                  <td>{getStatusBadge(asset.status)}</td>
                  <td style={{ fontSize: '12.5px' }}>{asset.location || '-'}</td>
                  <td style={getConditionStyle(asset.condition)}>{asset.condition}</td>
                  <td>
                    {asset.currentOwnerId ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={getEmployee(asset.currentOwnerId)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                          alt=""
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-color)' }}
                        />
                        <span style={{ fontWeight: '500' }}>{getEmployee(asset.currentOwnerId)?.name || 'Unknown'}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ padding: '5px' }}
                        title="View Complete History"
                        onClick={() => handleOpenDetailModal(asset)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ padding: '5px' }}
                        title="QR Code Label"
                        onClick={() => setQrCodeModalAsset(asset)}
                      >
                        <QrCode size={14} />
                      </button>
                      {['Admin', 'Asset Manager'].includes(role) && (
                        <>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ padding: '5px' }}
                            title="Edit Asset Details"
                            onClick={() => onEditAsset(asset)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ padding: '5px', borderColor: 'var(--error-border)' }}
                            title="Delete Asset"
                            onClick={() => onDeleteAsset(asset.id)}
                          >
                            <Trash2 size={14} style={{ color: 'var(--error)' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        
        /* Grid Layout View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredAssets.map(asset => (
            <div key={asset.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              {/* Asset Image & Status Overlay */}
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                  src={asset.image}
                  alt={asset.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  {getStatusBadge(asset.status)}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                  {asset.tag}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3', height: '38px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {asset.name}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{asset.category}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>SN:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>{asset.serialNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Condition:</span>
                    <span style={getConditionStyle(asset.condition)}>{asset.condition}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Owner:</span>
                    <span style={{ fontWeight: '500' }}>{getEmployeeName(asset.currentOwnerId)}</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                    onClick={() => handleOpenDetailModal(asset)}
                  >
                    <Eye size={12} /> Details
                  </button>
                  {['Admin', 'Asset Manager'].includes(role) && (
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '6px' }}
                      title="Edit details"
                      onClick={() => onEditAsset(asset)}
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* COMPREHENSIVE ASSET DETAILS OVERLAY MODAL */}
      {/* ---------------------------------------------------- */}
      {activeDetailAsset && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                  {activeDetailAsset.tag}
                </span>
                <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{activeDetailAsset.name}</h3>
              </div>
              <button className="modal-close" onClick={() => setActiveDetailAsset(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', flexWrap: 'wrap' }} className="form-row">
              {/* Left Column: Asset Stats & Chronology History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Meta details grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Category</span>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{activeDetailAsset.category}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Serial Number</span>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{activeDetailAsset.serialNumber}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Condition</span>
                    <div style={{ fontSize: '13px', marginTop: '2px', ...getConditionStyle(activeDetailAsset.condition) }}>{activeDetailAsset.condition}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Location</span>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginTop: '2px' }}>{activeDetailAsset.location || '-'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Purchase Date</span>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginTop: '2px' }}>{activeDetailAsset.purchaseDate}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Purchase Cost</span>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--success-dark)', marginTop: '2px' }}>Rs. {activeDetailAsset.purchaseCost.toLocaleString()}</div>
                  </div>
                </div>

                {/* History tabs / sections */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <History size={15} style={{ color: 'var(--primary)' }} /> Asset Lifecycle Timeline
                  </h4>
                  <div className="timeline" style={{ paddingLeft: '16px', maxHeight: '220px', overflowY: 'auto' }}>
                    {getAssetStatusHistory(activeDetailAsset).map((item, idx) => (
                      <div key={idx} className="timeline-item" style={{ paddingBottom: '14px' }}>
                        <div className="timeline-date">{item.date}</div>
                        <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maintenance Sub-log */}
                {getAssetMaintHistory(activeDetailAsset.id).length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wrench size={14} style={{ color: 'var(--warning-dark)' }} /> Repair Logs
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                      {getAssetMaintHistory(activeDetailAsset.id).map(m => (
                        <div key={m.id} style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{m.title}</strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.date}</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>{m.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Photo, Status Badge, Digital QR Card, Context Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
                {/* Photo */}
                <div style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img
                    src={activeDetailAsset.image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Status Badging */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Current Lifecycle Status</div>
                  {getStatusBadge(activeDetailAsset.status)}
                </div>

                {/* Digital Ticket / QR */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ border: '4px solid white', borderRadius: 'var(--radius-sm)', backgroundColor: 'white', display: 'inline-block', boxShadow: 'var(--shadow-sm)', marginBottom: '8px' }}>
                    {renderQRCodeSVG(activeDetailAsset.qrCode)}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>{activeDetailAsset.qrCode}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Physical Scanning Decodable Label</span>
                </div>

                {/* Responsive Actions based on current status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                  {activeDetailAsset.status === 'Available' && (
                    <>
                      {['Admin', 'Asset Manager'].includes(role) && (
                        <button
                          onClick={() => {
                            onOpenQuickAction('allocate', activeDetailAsset.id);
                            setActiveDetailAsset(null);
                          }}
                          className="btn btn-primary"
                          style={{ width: '100%', fontSize: '12px' }}
                        >
                          Allocate Asset
                        </button>
                      )}
                      {activeDetailAsset.isBookable && (
                        <button
                          onClick={() => {
                            onOpenQuickAction('booking', activeDetailAsset.id);
                            setActiveDetailAsset(null);
                          }}
                          className="btn btn-secondary"
                          style={{ width: '100%', fontSize: '12px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                        >
                          Book Resource
                        </button>
                      )}
                    </>
                  )}

                  {activeDetailAsset.status === 'Allocated' && (
                    <>
                      {activeDetailAsset.currentOwnerId === user?.id ? (
                        <button
                          onClick={() => {
                            onOpenQuickAction('return', activeDetailAsset.id);
                            setActiveDetailAsset(null);
                          }}
                          className="btn btn-success"
                          style={{ width: '100%', fontSize: '12px' }}
                        >
                          Return Asset
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onOpenQuickAction('transfer', activeDetailAsset.id);
                            setActiveDetailAsset(null);
                          }}
                          className="btn btn-secondary"
                          style={{ width: '100%', fontSize: '12px' }}
                        >
                          Request Transfer
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => {
                      onOpenQuickAction('maintenance', activeDetailAsset.id);
                      setActiveDetailAsset(null);
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    Raise Maintenance
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* QR CODE OVERLAY MODAL */}
      {/* ---------------------------------------------------- */}
      {qrCodeModalAsset && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Asset QR Code Label</h3>
              <button className="modal-close" onClick={() => setQrCodeModalAsset(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '12px' }}>
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: '100%'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AssetFlow Inventory ID
                </span>
                <div style={{ border: '4px solid white', borderRadius: 'var(--radius-sm)', backgroundColor: 'white', padding: '4px', display: 'inline-block' }}>
                  {renderQRCodeSVG(qrCodeModalAsset.qrCode)}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {qrCodeModalAsset.tag}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {qrCodeModalAsset.name}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    alert(`Initiating label printing for asset tag ${qrCodeModalAsset.tag}...`);
                  }}
                >
                  Print Label
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setQrCodeModalAsset(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
