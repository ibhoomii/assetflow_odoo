import React, { useState, useEffect } from 'react';
import {
  Package,
  QrCode,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  Clipboard,
  AlertCircle,
  CheckCircle,
  Upload,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { createAssetAPI, uploadAssetImageAPI } from '../services/api';

const CATEGORY_PRESETS = {
  'Laptops & Workstations': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
  'Conference Rooms': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60',
  'Office Furniture': 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60',
  'Vehicles': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60',
  'AV & Presentation': 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60',
  'Lab Equipment': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60'
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
  
  // Image handling
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successTag, setSuccessTag] = useState('');
  const [nextTag, setNextTag] = useState('');

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Calculate next auto tag
  useEffect(() => {
    const tagNumbers = assets.map(a => {
      const match = a.tag.match(/AF-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = Math.max(...tagNumbers, 0);
    const nextNum = maxNum + 1;
    const formattedTag = `AF-${String(nextNum).padStart(4, '0')}`;
    setNextTag(formattedTag);
  }, [assets]);

  // Change bookable state by category default
  useEffect(() => {
    if (category === 'Conference Rooms' || category === 'Vehicles' || category === 'Lab Equipment') {
      setIsBookable(true);
    } else {
      setIsBookable(false);
    }
  }, [category]);

  // Fallback / default preview image
  const activePreviewImage = imagePreviewUrl || CATEGORY_PRESETS[category] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!name || !serialNumber || !purchaseCost) {
      setErrorMsg('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      let finalImageUrl = activePreviewImage;

      // 1. Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await uploadAssetImageAPI(formData);
        finalImageUrl = uploadRes.data.imageUrl;
      }

      // 2. Find selected category ID
      const selectedCat = categories.find(c => c.name === category);
      const categoryId = selectedCat ? selectedCat.id : null;

      // 3. Create asset in PostgreSQL database
      const res = await createAssetAPI({
        name: name.trim(),
        serialNumber: serialNumber.trim(),
        categoryId,
        brand: '',
        model: '',
        purchaseDate,
        purchaseCost: parseFloat(purchaseCost),
        vendor: '',
        warrantyExpiry: null,
        condition,
        location: location.trim(),
        imageUrl: finalImageUrl,
        bookable: isBookable,
        status
      });

      // 4. Update parent list
      onRegisterAsset(res.data);
      setSuccessTag(res.data.asset_tag);
    } catch (error) {
      console.error('Error registering asset:', error);
      setErrorMsg(error.response?.data?.message || 'Server error creating asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper mock QR code generator
  const renderMockQRCodeSVG = (tag, serial) => {
    const text = `${tag}-${serial}`;
    const grid = [];
    let seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
      <svg width="70" height="70" viewBox="0 0 10 10" style={{ shapeRendering: 'crispEdges' }}>
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
      <div className="card" style={{ maxWidth: '580px', margin: '30px auto', textAlign: 'center', padding: '40px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 12px rgba(16,185,129,0.15)'
        }}>
          <CheckCircle size={32} />
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Asset Registered!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          The item is officially registered as <strong>{successTag}</strong> in the organizational directory.
        </p>

        {/* QR Ticket Block */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          textAlign: 'left',
          maxWidth: '360px',
          margin: '0 auto 32px'
        }}>
          <div style={{ border: '3px solid white', borderRadius: '6px', backgroundColor: 'white', display: 'flex' }}>
            {renderMockQRCodeSVG(successTag, serialNumber)}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Tag ID</div>
            <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: '1px 0' }}>{successTag}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Condition: <strong style={{ color: 'var(--text-primary)' }}>{condition}</strong></div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Location: {location}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setSuccessTag(''); setName(''); setSerialNumber(''); setPurchaseCost(''); setImagePreviewUrl(''); }}>
            Register Another
          </button>
          <button className="btn btn-primary" onClick={onCancel} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', border: 'none' }}>
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Back navigation header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700' }}>Register Physical Asset</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Create a hardware or resource tracking index with active barcodes.
          </p>
        </div>
        <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '6px 14px' }}>
          Cancel & Exit
        </button>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: 'var(--error-light)',
          color: 'var(--error-dark)',
          border: '1px solid var(--error-border)',
          padding: '12px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Modern Forms Block */}
        <div className="card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Asset Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Asset Name <span style={{ color: 'var(--error)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MacBook Pro M3 Max 16 inch"
                  style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Package size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
              </div>
            </div>

            {/* Row: Category & Asset Tag */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Category</label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px', appearance: 'none' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <Layers size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#64748b' }}>Asset Tag (Auto)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: '700', color: 'var(--primary)' }}
                    value={nextTag}
                    disabled
                  />
                  <Tag size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* Row: Serial Number & Condition */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Serial Number <span style={{ color: 'var(--error)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. S/N SN1029XU2"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    required
                  />
                  <Clipboard size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Condition</label>
                <select
                  className="form-control"
                  style={{ width: '100%', borderRadius: '8px' }}
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

            {/* Row: Purchase Date & Purchase Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Purchase Date</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                  <Calendar size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Purchase Cost (Rs.) <span style={{ color: 'var(--error)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    required
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '10.5px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Rs.</span>
                </div>
              </div>
            </div>

            {/* Row: Location & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Location / Office Site</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. San Francisco - HQ"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Initial Status</label>
                <select
                  className="form-control"
                  style={{ width: '100%', borderRadius: '8px' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Upload Image Section */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Upload Image</label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? 'var(--primary-light)' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                  }}
                />
                <Upload size={22} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {imageFile ? imageFile.name : 'Drag and drop image here'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  or click to browse local files
                </div>
              </div>
            </div>

            {/* Bookable Toggle Switches */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>Bookable Resource</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>Permit employee reservations on catalog.</div>
              </div>
              
              {/* Custom Toggle Switch */}
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '42px',
                height: '24px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isBookable}
                  onChange={(e) => setIsBookable(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: isBookable ? 'var(--primary)' : '#cbd5e1',
                  borderRadius: '34px',
                  transition: '0.2s',
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: isBookable ? '20px' : '4px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}></span>
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ borderRadius: '8px' }} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', border: 'none', borderRadius: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Asset'}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Asset Preview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '88px' }}>
          
          <div className="card" style={{ padding: '0px', overflow: 'hidden', borderRadius: '16px' }}>
            {/* Header Badge overlay */}
            <div style={{ position: 'relative' }}>
              <img
                src={activePreviewImage}
                alt="Asset Preview"
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                color: 'white',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Live Preview
              </div>
            </div>

            {/* Preview Details */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category || 'Laptops & Workstations'}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                    {name || 'Asset Model Name'}
                  </h3>
                </div>
                <span className={`badge badge-${status.toLowerCase() === 'under maintenance' ? 'maintenance' : 'available'}`}>
                  {status}
                </span>
              </div>

              {/* Specifications block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '20px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '500' }}>ASSET TAG ID</div>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', marginTop: '2px' }}>{nextTag}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '500' }}>SERIAL NUMBER</div>
                  <div style={{ fontWeight: '600', color: '#334155', marginTop: '2px', textTransform: 'uppercase' }}>{serialNumber || 'CN-XXXXXX'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '500' }}>BASE LOCATION</div>
                  <div style={{ fontWeight: '600', color: '#334155', marginTop: '2px' }}>{location || 'HQ Office'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '500' }}>PURCHASE VALUE</div>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {purchaseCost ? `Rs. ${parseFloat(purchaseCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Rs. 0.00'}
                  </div>
                </div>
              </div>

              {/* Tag / QR Code Ticket Block */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}>
                <div style={{ border: '2px solid white', backgroundColor: 'white', display: 'flex', borderRadius: '4px' }}>
                  {renderMockQRCodeSVG(nextTag, serialNumber || 'PREVIEW')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <QrCode size={13} style={{ color: 'var(--primary)' }} /> QR Label Active
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: '1.3' }}>
                    Scan code to edit catalog data or log logs.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Guidelines info card */}
          <div style={{
            padding: '16px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            display: 'flex',
            gap: '12px'
          }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a' }}>Audited Lifecycle Index</div>
              <div style={{ fontSize: '11.5px', color: '#1e40af', marginTop: '2px', lineHeight: '1.4' }}>
                Upon registration, a tracking payload is indexed into the asset system and a physical QR barcode label is generated.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
