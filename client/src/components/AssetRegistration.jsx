import React, { useState, useEffect } from 'react';
import { Package, QrCode, Tag, DollarSign, MapPin, Calendar, Clipboard, AlertCircle, CheckCircle } from 'lucide-react';

const CATEGORY_PRESETS = {
  'Laptops & Workstations': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=60',
  'Conference Rooms': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=60',
  'Office Furniture': 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300&auto=format&fit=crop&q=60',
  'Vehicles': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&auto=format&fit=crop&q=60',
  'AV & Presentation': 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&auto=format&fit=crop&q=60',
  'Lab Equipment': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=60'
};

export default function AssetRegistration({ assets, categories, onRegisterAsset, onCancel }) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-07-12');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [condition, setCondition] = useState('New');
  const [location, setLocation] = useState('San Francisco - HQ');
  const [isBookable, setIsBookable] = useState(false);
  const [status, setStatus] = useState('Available');
  const [imageOption, setImageOption] = useState('preset'); // 'preset' | 'url'
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successTag, setSuccessTag] = useState('');

  // Auto-generate Tag
  const [nextTag, setNextTag] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  useEffect(() => {
    // Generate next tag: find highest tag number and increment
    const tagNumbers = assets
      .map(a => {
        const match = a.tag.match(/AF-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
    const maxNum = Math.max(...tagNumbers, 0);
    const nextNum = maxNum + 1;
    const formattedTag = `AF-${String(nextNum).padStart(4, '0')}`;
    setNextTag(formattedTag);
  }, [assets]);

  // Adjust bookable check based on category
  useEffect(() => {
    if (category === 'Conference Rooms' || category === 'Vehicles' || category === 'Lab Equipment') {
      setIsBookable(true);
    } else {
      setIsBookable(false);
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !serialNumber || !purchaseCost) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    // Check duplicate serial number
    if (assets.some(a => a.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase())) {
      setErrorMsg(`Serial Number "${serialNumber}" is already registered to another asset.`);
      return;
    }

    const finalImage = imageOption === 'preset'
      ? (CATEGORY_PRESETS[category] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=60')
      : (customImageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=60');

    const newAsset = {
      id: 'a' + (assets.length + 1),
      name: name.trim(),
      tag: nextTag,
      serialNumber: serialNumber.trim().toUpperCase(),
      category,
      purchaseDate,
      purchaseCost: parseFloat(purchaseCost),
      condition,
      location: location.trim(),
      image: finalImage,
      qrCode: `${nextTag}-${serialNumber.trim().toUpperCase()}`,
      isBookable,
      status,
      currentOwnerId: null,
      departmentId: null,
      expectedReturnDate: null
    };

    onRegisterAsset(newAsset);
    setSuccessTag(nextTag);
    
    // Clear form
    setName('');
    setSerialNumber('');
    setPurchaseCost('');
    setCustomImageUrl('');
  };

  // Helper to draw a pixelated grid for a mock QR code
  const renderMockQRCodeSVG = (tag, serial) => {
    // A 10x10 pseudo-random grid seeded by tag + serial
    const text = `${tag}-${serial}`;
    const grid = [];
    let seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 10; c++) {
        // corners are always filled (QR positioning squares)
        const isCorner = 
          (r < 3 && c < 3) || 
          (r < 3 && c > 6) || 
          (r > 6 && c < 3);
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
      <svg width="80" height="80" viewBox="0 0 10 10" style={{ shapeRendering: 'crispEdges' }}>
        <rect width="10" height="10" fill="white" />
        {grid.map((row, r) => 
          row.map((val, c) => 
            val === 1 ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
          )
        )}
      </svg>
    );
  };

  if (successTag) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'center', padding: '40px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <CheckCircle size={36} />
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Asset Registered Successfully!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px' }}>
          The asset has been logged in the system catalog under tag <strong>{successTag}</strong>.
        </p>

        {/* QR Ticket Panel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '20px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'left',
          maxWidth: '380px',
          margin: '0 auto 30px'
        }}>
          <div style={{ border: '4px solid white', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', backgroundColor: 'white' }}>
            {renderMockQRCodeSVG(successTag, serialNumber)}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>AssetFlow Tag</div>
            <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '4px' }}>{successTag}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Condition: <strong>{condition}</strong></div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Loc: {location}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setSuccessTag('')}>
            Register Another
          </button>
          <button className="btn btn-primary" onClick={onCancel}>
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>Register New Physical Asset</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Enter asset details to include it in the inventory tracking lifecycle.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--primary-border)', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)', fontWeight: '700', fontSize: '13px' }}>
          <Tag size={14} /> {nextTag}
        </div>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: 'var(--error-light)',
          color: 'var(--error-dark)',
          border: '1px solid var(--error-border)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Row 1: Name and Category */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Asset Name <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. MacBook Pro M3 14 inch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Asset Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Serial Number and Location */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Serial Number / Unique Identifier <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CN-0N86H8-XXXXX"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Storage Location / Base Office</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SF - Floor 3 HQ"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: Purchase Date, Cost and Condition */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              className="form-control"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Cost (USD) <span style={{ color: 'var(--error)' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                style={{ width: '100%', paddingLeft: '28px' }}
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                required
              />
              <DollarSign size={14} style={{ position: 'absolute', left: '10px', top: '14px', color: 'var(--text-secondary)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Asset Condition</label>
            <select
              className="form-control"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Image Selection */}
        <div className="card" style={{ padding: '16px', margin: '8px 0 20px', backgroundColor: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
          <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Asset Image Asset</label>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            <label className="form-checkbox-label" style={{ fontWeight: imageOption === 'preset' ? '600' : '400' }}>
              <input
                type="radio"
                name="imageOption"
                checked={imageOption === 'preset'}
                onChange={() => setImageOption('preset')}
                className="form-checkbox"
              />
              Use Category Preset Image
            </label>
            <label className="form-checkbox-label" style={{ fontWeight: imageOption === 'url' ? '600' : '400' }}>
              <input
                type="radio"
                name="imageOption"
                checked={imageOption === 'url'}
                onChange={() => setImageOption('url')}
                className="form-checkbox"
              />
              Paste Custom Image URL
            </label>
          </div>

          {imageOption === 'preset' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={CATEGORY_PRESETS[category] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=60'}
                alt=""
                style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Using professional preset image for <strong>{category}</strong>.
              </span>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="form-control"
                placeholder="https://images.unsplash.com/photo-..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Toggles & Options */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <label className="form-checkbox-label" style={{ fontWeight: '500' }}>
            <input
              type="checkbox"
              checked={isBookable}
              onChange={(e) => setIsBookable(e.target.checked)}
              className="form-checkbox"
            />
            Configure as Shared Resource (Bookable by employees)
          </label>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Initial Lifecycle Status:</span>
            <select
              className="form-control"
              style={{ padding: '4px 8px', fontSize: '12px' }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Preview QR Code Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', marginBottom: '24px' }}>
          <div style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}>
            {renderMockQRCodeSVG(nextTag, serialNumber || 'PREVIEW')}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <QrCode size={14} style={{ color: 'var(--primary)' }} /> QR Label Auto-Generator
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
              Scanning this label in the physical world will link to tag <strong>{nextTag}</strong>. Decodes as: <code>{nextTag}-{serialNumber.toUpperCase() || 'SERIAL'}</code>
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Register Asset
          </button>
        </div>

      </form>
    </div>
  );
}
