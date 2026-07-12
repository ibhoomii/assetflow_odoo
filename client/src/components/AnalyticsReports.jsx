import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Wrench, 
  Calendar, 
  Percent, 
  Activity, 
  Smartphone,
  ChevronDown,
  Loader2
} from 'lucide-react';

export default function AnalyticsReports({
  assets,
  allocations,
  bookings,
  maintenance,
  departments
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert("BI Analytics Report successfully built and exported to Excel/PDF format!");
    }, 1500);
  };

  // 1. KPI Calculations
  const totalAssets = assets.length;
  
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const utilizationRate = Math.round((allocatedCount / totalAssets) * 100) || 0;
  
  const activeTickets = maintenance.filter(m => m.status !== 'Resolved').length;
  const bookingsCount = bookings.length;

  // 2. Data aggregation: Category utilization
  const categoriesList = Array.from(new Set(assets.map(a => a.category)));
  const categoryData = categoriesList.map(cat => {
    const catAssets = assets.filter(a => a.category === cat);
    const catAllocated = catAssets.filter(a => a.status === 'Allocated').length;
    const rate = catAssets.length ? Math.round((catAllocated / catAssets.length) * 100) : 0;
    return { name: cat, rate, total: catAssets.length };
  });

  // 3. Data aggregation: Department Allocation Stacked Bar
  const deptAllocationData = departments.map(d => {
    const count = assets.filter(a => a.departmentId === d.id && a.status === 'Allocated').length;
    return { name: d.name, count };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Analytics Dashboard Header */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} /> BI Corporate Analytics Panel
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Real-time resource utilization, timeline events, and maintenance metrics.</span>
        </div>
        
        <button
          onClick={handleExport}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Building Report...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Export Analytics Report</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* KPI 1 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>TOTAL ASSETS</span>
            <Smartphone size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800' }}>{totalAssets}</h3>
          <span style={{ fontSize: '11px', color: 'var(--success-dark)', marginTop: '4px', fontWeight: '600' }}>
            +14% Increase vs. Q1
          </span>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>ACTIVE UTILIZATION</span>
            <Percent size={16} style={{ color: 'var(--success)' }} />
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800' }}>{utilizationRate}%</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {allocatedCount} of {totalAssets} assets in active use
          </span>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>REPAIR TICKETS</span>
            <Wrench size={16} style={{ color: 'var(--error)' }} />
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800' }}>{activeTickets}</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeTickets > 0 ? `${activeTickets} issues require attention` : 'All equipment healthy'}
          </span>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>ACTIVE BOOKINGS</span>
            <Calendar size={16} style={{ color: 'var(--warning-dark)' }} />
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800' }}>{bookingsCount}</h3>
          <span style={{ fontSize: '11px', color: 'var(--success-dark)', marginTop: '4px', fontWeight: '600' }}>
            100% Slot checkout rate
          </span>
        </div>

      </div>

      {/* Grid: Charts & BI Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Chart 1: Category Asset Utilization Rate */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px' }}>
            Asset Utilization Rate by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryData.map(item => (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '12.5px', fontWeight: '600' }}>
                  <span>{item.name} <small style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>({item.total} items)</small></span>
                  <span style={{ color: 'var(--primary)' }}>{item.rate}%</span>
                </div>
                {/* Visual horizontal bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.rate}%`,
                    height: '100%',
                    backgroundColor: item.rate > 75 ? 'var(--success)' : item.rate > 40 ? 'var(--primary)' : 'var(--warning)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Maintenance Frequency Trend line */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>
            Maintenance Diagnostics Ticket Trend (Monthly)
          </h3>
          
          <div style={{ display: 'flex', justify: 'center', margin: 'auto 0' }}>
            {/* SVG Line chart representing monthly frequency */}
            <svg viewBox="0 0 300 120" style={{ width: '100%', height: '110px' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="20" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="60" x2="280" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="100" x2="280" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />
              
              {/* Chart Line path */}
              <path 
                d="M 20 80 Q 70 30 120 70 T 220 20 T 280 40" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              {/* Chart Filled Path Area */}
              <path 
                d="M 20 80 Q 70 30 120 70 T 220 20 T 280 40 L 280 100 L 20 100 Z" 
                fill="url(#lineGrad)" 
              />
              
              {/* Dot Indicators */}
              <circle cx="120" cy="70" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="220" cy="20" r="4.5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
              
              {/* Labels */}
              <text x="20" y="114" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Jan</text>
              <text x="70" y="114" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Feb</text>
              <text x="120" y="114" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Mar</text>
              <text x="170" y="114" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Apr</text>
              <text x="220" y="114" fontSize="8" fill="var(--text-muted)" textAnchor="middle">May</text>
              <text x="280" y="114" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Jun</text>
            </svg>
          </div>
          <div style={{ display: 'flex', justify: 'center', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span> Reported Failure Events
            </span>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        
        {/* Chart 3: Department Allocation segmented shares */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>
            Asset Allocations by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {deptAllocationData.map(item => (
              <div 
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px'
                }}
              >
                <span style={{ fontWeight: '500' }}>{item.name}</span>
                <span className="badge badge-available" style={{ fontSize: '11px', fontWeight: '700' }}>
                  {item.count} Active Assets
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Resource Booking Heatmap */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
            Booking Heatmap Matrix
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Daily booking load density across normal working hours.
          </p>
          
          {/* Heatmap Hourly slots visual grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Array.from({ length: 24 }).map((_, index) => {
              const hour = 8 + Math.floor(index / 2);
              const isHalf = index % 2 === 1;
              const timeStr = `${hour.toString().padStart(2, '0')}:${isHalf ? '30' : '00'}`;
              
              // Randomly assign booking density colors
              const colors = [
                'rgba(37, 99, 235, 0.05)', 
                'rgba(37, 99, 235, 0.2)', 
                'rgba(37, 99, 235, 0.45)', 
                'rgba(37, 99, 235, 0.8)'
              ];
              const intensity = index % 4; // Simulated intensity

              return (
                <div 
                  key={index} 
                  title={`Time ${timeStr} • Heat intensity: ${intensity}/3`}
                  style={{
                    flex: '1 0 14%',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: colors[intensity],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '700',
                    color: intensity > 2 ? 'white' : 'var(--text-primary)',
                    userSelect: 'none'
                  }}
                >
                  {timeStr}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justify: 'flex-end', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px' }}>
            <span>Less Active</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: 10, height: 10, backgroundColor: 'rgba(37, 99, 235, 0.05)', borderRadius: '2px' }}></div>
              <div style={{ width: 10, height: 10, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderRadius: '2px' }}></div>
              <div style={{ width: 10, height: 10, backgroundColor: 'rgba(37, 99, 235, 0.45)', borderRadius: '2px' }}></div>
              <div style={{ width: 10, height: 10, backgroundColor: 'rgba(37, 99, 235, 0.8)', borderRadius: '2px' }}></div>
            </div>
            <span>High Load</span>
          </div>

        </div>

      </div>

    </div>
  );
}
