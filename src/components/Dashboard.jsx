import React, { useState } from 'react';
import {
  Package,
  CheckCircle2,
  Users,
  Wrench,
  AlertTriangle,
  Calendar,
  ArrowRightLeft,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CalendarRange,
  Sparkles,
  Bell,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({
  assets,
  allocations,
  bookings,
  maintenance,
  transfers,
  notifications,
  setCurrentTab,
  user,
  onOpenQuickAction
}) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const role = user?.role || 'Employee';
  const todayStr = '2026-07-12';

  // 1. KPI Calculations
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const allocatedAssets = assets.filter(a => a.status === 'Allocated').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Approved').length;
  const maintenanceToday = maintenance.filter(m => m.status === 'Pending' || m.status === 'In Progress').length;
  
  // Overdue Returns (returnDate < todayStr and status is Active)
  const overdueAllocations = allocations.filter(al => al.status === 'Active' && al.returnDate < todayStr);
  const overdueCount = overdueAllocations.length;

  // 2. Upcoming Returns (next 14 days, from 2026-07-12 to 2026-07-26)
  const upcomingReturns = allocations
    .filter(al => al.status === 'Active' && al.returnDate >= todayStr && al.returnDate <= '2026-07-26')
    .map(al => {
      const asset = assets.find(a => a.id === al.assetId);
      const emp = assets.find(a => a.id === al.assetId) ? empLookup(al.employeeId) : { name: 'Unknown' };
      return { ...al, assetName: asset?.name, employeeName: emp.name, tag: asset?.tag };
    });

  // Helper Employee Lookup
  function empLookup(id) {
    const names = {
      e1: 'Alex Harrison', e2: 'Marcus Brody', e3: 'John Doe', e4: 'Sarah Connor',
      e5: 'Emma Watson', e6: 'David Kim', e7: 'Elena Rostova', e8: 'Robert Vance',
      e9: 'Harvey Specter', e10: 'Mike Ross'
    };
    return { name: names[id] || 'Unknown Employee' };
  }

  // 3. Donut Chart Calculations (Asset Status Pie Chart)
  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    Available: '#10b981',      // Emerald Green
    Allocated: '#2563eb',      // Blue
    Reserved: '#6366f1',       // Indigo
    'Under Maintenance': '#f59e0b', // Amber
    Lost: '#ef4444',           // Red
    Retired: '#64748b'
  };

  const donutData = Object.keys(statusColors).map(status => ({
    name: status,
    value: statusCounts[status] || 0,
    color: statusColors[status]
  })).filter(item => item.value > 0);

  const totalDonutValue = donutData.reduce((sum, item) => sum + item.value, 0);

  let accumulatedAngle = 0;
  const donutRadius = 65;
  const circumference = 2 * Math.PI * donutRadius;

  // 4. Bar Chart Calculations (Asset Distribution by Department)
  const deptNames = {
    d1: 'Engineering',
    d2: 'Design & UX',
    d3: 'Operations',
    d4: 'HR',
    d5: 'Finance'
  };

  const deptCounts = assets.reduce((acc, asset) => {
    if (asset.status === 'Allocated' && asset.departmentId) {
      const name = deptNames[asset.departmentId] || 'Other';
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {});

  const barData = Object.values(deptNames).map(name => ({
    name,
    value: deptCounts[name] || 0
  }));

  const maxBarValue = Math.max(...barData.map(b => b.value), 1);

  // 5. Maintenance Trend Data (SVG Line Chart)
  // Mock monthly tickets trend (Jan to Jul 2026)
  const trendData = [
    { month: 'Jan', tickets: 2 },
    { month: 'Feb', tickets: 5 },
    { month: 'Mar', tickets: 3 },
    { month: 'Apr', tickets: 8 },
    { month: 'May', tickets: 4 },
    { month: 'Jun', tickets: 6 },
    { month: 'Jul', tickets: 7 }
  ];
  const maxTrendValue = 10;

  // 6. Recent Activity List
  const recentActivities = () => {
    const list = [];
    
    // Allocations
    allocations.forEach(al => {
      const asset = assets.find(a => a.id === al.assetId);
      const emp = empLookup(al.employeeId);
      if (asset) {
        list.push({
          id: `act-al-${al.id}`,
          date: al.allocatedDate,
          type: 'Allocation',
          title: 'Asset Allocated',
          detail: `"${asset.name}" assigned to ${emp.name}`,
          user: al.allocatedBy,
          status: al.status
        });
      }
    });

    // Maintenance
    maintenance.forEach(m => {
      const asset = assets.find(a => a.id === m.assetId);
      if (asset) {
        list.push({
          id: `act-m-${m.id}`,
          date: m.reportedDate,
          type: 'Maintenance',
          title: `Ticket Created`,
          detail: `"${asset.name}": ${m.issueDescription.substring(0, 30)}...`,
          user: m.reportedBy || 'System',
          status: m.status
        });
      }
    });

    // Transfers
    transfers.forEach(t => {
      const asset = assets.find(a => a.id === t.assetId);
      const toEmp = empLookup(t.toEmployeeId);
      if (asset) {
        list.push({
          id: `act-t-${t.id}`,
          date: t.requestDate,
          type: 'Transfer',
          title: 'Transfer Requested',
          detail: `"${asset.name}" to ${toEmp.name}`,
          user: t.requestedBy,
          status: t.status
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome & Dashboard Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} /> Active Session Overview
          </span>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '4px', marginBottom: '6px' }}>
            Welcome back, {user?.name || 'Operations'}!
          </h2>
          <p style={{ opacity: 0.9, fontSize: '13.5px' }}>
            Role: <strong style={{ textDecoration: 'underline' }}>{role}</strong>. Here is the operational state of your organization assets today.
          </p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
          📅 Current System Date: <strong>July 12, 2026</strong>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        
        {/* KPI 1: Total Assets */}
        <div className="card kpi-card card-interactive" onClick={() => setCurrentTab('directory')} style={{ cursor: 'pointer' }}>
          <div className="kpi-details">
            <span className="kpi-title">Total Assets</span>
            <span className="kpi-value">{totalAssets}</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Package size={22} />
          </div>
        </div>

        {/* KPI 2: Available Assets */}
        <div className="card kpi-card card-interactive" onClick={() => setCurrentTab('directory')} style={{ cursor: 'pointer' }}>
          <div className="kpi-details">
            <span className="kpi-title">Available Assets</span>
            <span className="kpi-value" style={{ color: 'var(--success-dark)' }}>{availableAssets}</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* KPI 3: Allocated Assets */}
        <div className="card kpi-card card-interactive" onClick={() => setCurrentTab('directory')} style={{ cursor: 'pointer' }}>
          <div className="kpi-details">
            <span className="kpi-title">Allocated Assets</span>
            <span className="kpi-value">{allocatedAssets}</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Users size={22} />
          </div>
        </div>

        {/* KPI 4: Active Bookings */}
        <div className="card kpi-card card-interactive" onClick={() => setCurrentTab('booking')} style={{ cursor: 'pointer' }}>
          <div className="kpi-details">
            <span className="kpi-title">Active Bookings</span>
            <span className="kpi-value">{activeBookingsCount}</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <CalendarRange size={22} />
          </div>
        </div>

        {/* KPI 5: Maintenance Today */}
        <div className="card kpi-card card-interactive" onClick={() => setCurrentTab('maintenance')} style={{ cursor: 'pointer' }}>
          <div className="kpi-details">
            <span className="kpi-title">Maintenance Today</span>
            <span className="kpi-value" style={{ color: 'var(--warning-dark)' }}>{maintenanceToday}</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Wrench size={22} />
          </div>
        </div>

        {/* KPI 6: Overdue Returns */}
        <div className="card kpi-card card-interactive" onClick={() => setCurrentTab('allocation')} style={{ cursor: 'pointer' }}>
          <div className="kpi-details">
            <span className="kpi-title">Overdue Returns</span>
            <span className="kpi-value" style={{ color: overdueCount > 0 ? 'var(--error)' : 'inherit' }}>{overdueCount}</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Quick Operations Panel
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => onOpenQuickAction('register')} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
            <PlusCircle size={15} /> Register Asset
          </button>
          <button onClick={() => onOpenQuickAction('allocate')} className="btn btn-secondary" style={{ borderColor: 'var(--primary-border)', color: 'var(--primary)' }}>
            <Users size={15} /> Allocate Asset
          </button>
          <button onClick={() => onOpenQuickAction('booking')} className="btn btn-secondary">
            <Calendar size={15} /> Book Resource
          </button>
          <button onClick={() => onOpenQuickAction('maintenance')} className="btn btn-secondary">
            <Wrench size={15} /> Raise Maintenance Request
          </button>
        </div>
      </div>

      {/* Charts Display Grid */}
      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        
        {/* Chart 1: Donut Lifecycle Chart (Asset Status Pie Chart) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Asset Status Pie Chart</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Catalog items distributed by availability & operational states</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px', flexWrap: 'wrap' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={donutRadius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="16" />
                {donutData.map((slice, i) => {
                  const percentage = slice.value / totalDonutValue;
                  const dashArray = percentage * circumference;
                  const dashOffset = circumference - (accumulatedAngle / totalDonutValue) * circumference;
                  accumulatedAngle += slice.value;

                  const isHovered = hoveredSlice === slice.name;

                  return (
                    <circle
                      key={slice.name}
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={isHovered ? '20' : '16'}
                      strokeDasharray={`${dashArray} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 80 80)"
                      style={{
                        transition: 'stroke-width 0.15s ease, stroke 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={() => setHoveredSlice(slice.name)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>
              {/* Overlay inside donut */}
              <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
                  {hoveredSlice ? donutData.find(d => d.name === hoveredSlice)?.value : totalAssets}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  {hoveredSlice ? hoveredSlice : 'Total Items'}
                </span>
              </div>
            </div>

            {/* Interactive Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '130px', flex: 1 }}>
              {donutData.map(slice => (
                <div
                  key={slice.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: hoveredSlice === slice.name ? 'var(--bg-secondary)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredSlice(slice.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: slice.color }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: hoveredSlice === slice.name ? '600' : '400' }}>
                      {slice.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700' }}>{slice.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Asset Distribution by Department */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Asset Distribution</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Active allocated corporate assets by departments</p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
            {barData.map(dept => {
              const widthPct = (dept.value / maxBarValue) * 100;
              const isHovered = hoveredBar === dept.name;

              return (
                <div
                  key={dept.name}
                  style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                  onMouseEnter={() => setHoveredBar(dept.name)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: isHovered ? '600' : '500' }}>{dept.name}</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{dept.value} allocated</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      background: isHovered 
                        ? 'linear-gradient(90deg, var(--primary) 0%, var(--info) 100%)'
                        : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Maintenance Trend Line Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Maintenance Trend</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Monthly ticket volume trend (last 7 months)</p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* SVG Line Graph */}
            <div style={{ width: '100%', height: '120px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Trend Path */}
                <path
                  d={`M 20,${100 - (trendData[0].tickets / maxTrendValue) * 80}
                     L 60,${100 - (trendData[1].tickets / maxTrendValue) * 80}
                     L 100,${100 - (trendData[2].tickets / maxTrendValue) * 80}
                     L 140,${100 - (trendData[3].tickets / maxTrendValue) * 80}
                     L 180,${100 - (trendData[4].tickets / maxTrendValue) * 80}
                     L 220,${100 - (trendData[5].tickets / maxTrendValue) * 80}
                     L 260,${100 - (trendData[6].tickets / maxTrendValue) * 80}`}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Under Fill Gradient Effect */}
                <path
                  d={`M 20,100 
                     L 20,${100 - (trendData[0].tickets / maxTrendValue) * 80}
                     L 60,${100 - (trendData[1].tickets / maxTrendValue) * 80}
                     L 100,${100 - (trendData[2].tickets / maxTrendValue) * 80}
                     L 140,${100 - (trendData[3].tickets / maxTrendValue) * 80}
                     L 180,${100 - (trendData[4].tickets / maxTrendValue) * 80}
                     L 220,${100 - (trendData[5].tickets / maxTrendValue) * 80}
                     L 260,${100 - (trendData[6].tickets / maxTrendValue) * 80}
                     L 260,100 Z`}
                  fill="rgba(37, 99, 235, 0.08)"
                />

                {/* Data Points */}
                {trendData.map((d, index) => {
                  const cx = 20 + index * 40;
                  const cy = 100 - (d.tickets / maxTrendValue) * 80;
                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#ffffff"
                      stroke="var(--primary)"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* X Axis Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                {trendData.map((d, idx) => <span key={idx}>{d.month}</span>)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Third Row: Recent Activity Table vs Side Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left Side: Recent Activity Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--primary)' }} /> Recent Activity
          </h3>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px' }}>Event</th>
                  <th style={{ padding: '8px 12px' }}>Detail</th>
                  <th style={{ padding: '8px 12px' }}>Actor</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities().map(act => (
                  <tr key={act.id}>
                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        backgroundColor: act.type === 'Allocation' ? 'var(--primary-light)' : act.type === 'Maintenance' ? 'var(--warning-light)' : '#f3e8ff',
                        color: act.type === 'Allocation' ? 'var(--primary)' : act.type === 'Maintenance' ? 'var(--warning-dark)' : '#7e22ce'
                      }}>{act.type}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{act.detail}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: '500' }}>{act.user}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge" style={{
                        padding: '1px 6px',
                        fontSize: '9px',
                        backgroundColor: act.status === 'Active' || act.status === 'Approved' ? 'var(--success-light)' : 'var(--bg-tertiary)',
                        color: act.status === 'Active' || act.status === 'Approved' ? 'var(--success-dark)' : 'var(--text-secondary)'
                      }}>{act.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Upcoming Returns & Notifications Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upcoming Returns Panel */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--info)' }} /> Upcoming Returns (14 Days)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingReturns.length === 0 ? (
                <div style={{ padding: '14px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  No upcoming asset returns scheduled.
                </div>
              ) : (
                upcomingReturns.slice(0, 3).map(al => (
                  <div key={al.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{al.assetName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Held by: {al.employeeName} • {al.tag}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>{al.returnDate}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '600', textTransform: 'uppercase' }}>Due Date</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} style={{ color: 'var(--error)' }} /> System Notifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {notifications.slice(0, 3).map(notif => (
                <div
                  key={notif.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${notif.type === 'alert' ? 'var(--error)' : notif.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}`,
                    backgroundColor: 'var(--bg-secondary)',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: 'var(--text-primary)' }}>
                    <span>{notif.title}</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px', lineHeight: '1.3' }}>
                    {notif.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
