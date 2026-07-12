import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forgotPasswordAPI, resetPasswordAPI } from '../services/api';
import {
  Shield,
  Key,
  Mail,
  User,
  Phone,
  CheckCircle,
  Laptop,
  Car,
  Video,
  QrCode,
  Lock,
  Loader2
} from 'lucide-react';

// Regex patterns for client-side validation
const NAME_REGEX = /^[a-zA-Z\s.']{2,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export default function Authentication() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('d1');
  const [rememberMe, setRememberMe] = useState(true);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password reset specific fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!NAME_REGEX.test(name.trim())) {
      setErrorMsg('Name must contain only letters and spaces (2-50 characters).');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setErrorMsg('Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (!PHONE_REGEX.test(phone.trim())) {
      setErrorMsg('Please enter a valid phone number (7-20 digits).');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: name,
        email: email,
        password: password,
        phone: phone,
        department: dept
      });

      alert("Registration Successful! Please login.");

      setMode("login");
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMsg('');

    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPasswordAPI(email.trim());
      setMsg(response.data.message || 'Password reset token generated.');
      if (response.data.token) {
        setResetToken(response.data.token);
        // Switch to reset mode so the user can directly input their new password
        setTimeout(() => {
          setMode('reset');
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMsg('');

    if (!resetToken || !newPassword) {
      setErrorMsg('Please enter the reset token and new password.');
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setErrorMsg('Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPasswordAPI(resetToken, newPassword);
      setMsg(response.data.message || 'Password reset successfully.');
      setErrorMsg('');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setNewPassword('');
        setResetToken('');
        setMsg('');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (ql) => {
    setEmail(ql.email);
    setPassword('pass123');
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(ql.email, 'pass123');
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed. Make sure the database is seeded.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogins = [
    { name: 'Alex Harrison', role: 'Admin', email: 'alex.h@assetflow.com' },
    { name: 'Marcus Brody', role: 'Asset Manager', email: 'marcus.b@assetflow.com' },
    { name: 'John Doe', role: 'Department Head', email: 'john.d@assetflow.com' },
    { name: 'David Kim', role: 'Employee', email: 'david.k@assetflow.com' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflowX: 'hidden' }}>
      {/* LEFT COLUMN */}
      <div style={{
        flex: 1.2, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', color: 'white', overflow: 'hidden'
      }} className="auth-left-panel">
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, marginBottom: '40px', maxWidth: '480px' }}>
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.25', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            AssetFlow Enterprise <br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Asset & Resource Control
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6' }}>
            A unified operations panel for managing corporate hardware, shared spaces, vehicle bookings, and preventative maintenance schedules.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '460px' }}>
          {/* Mock Asset Cards */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(37,99,235,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Laptop size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>MacBook Pro M3 Max 16"</span>
                <span className="badge badge-allocated" style={{ fontSize: '10px', padding: '2px 8px' }}>Allocated</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                <span>Tag: AF-0001</span><span>Holder: David Kim</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transform: 'translateX(20px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>Boardroom Delta AV Suite</span>
                <span className="badge badge-available" style={{ fontSize: '10px', padding: '2px 8px' }}>Available</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                <span>Floor 4 • 12p capacity</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#60a5fa' }}><QrCode size={11} /> Scan QR</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>Tesla Model 3 Long Range</span>
                <span className="badge badge-reserved" style={{ fontSize: '10px', padding: '2px 8px' }}>Booked</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                <span>Scheduled: 12:00 - 14:00</span><span>By: John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '460px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '40px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '15px' }}>AF</div>
            <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#0f172a' }}>
              Asset<span style={{ color: '#2563eb' }}>Flow</span>
            </span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', border: '1px solid #cbd5e1', padding: '1px 5px', borderRadius: '4px', marginLeft: 'auto', textTransform: 'uppercase' }}>Enterprise</span>
          </div>

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Welcome Back</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '24px' }}>Enter credentials to access AssetFlow ERP environment.</p>

              {errorMsg && (
                <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-dark)', border: '1px solid var(--error-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px' }}>{errorMsg}</div>
              )}

              {msg && (
                <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)', border: '1px solid var(--success-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px' }}>{msg}</div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" className="form-control" placeholder="alex.h@assetflow.com" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" className="form-control" placeholder="••••••••" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                  Remember Me
                </label>
                <button type="button" onClick={() => { setMode('forgot'); setErrorMsg(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Forgot Password?</button>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', marginBottom: '24px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
                New employee? {' '}
                <button type="button" onClick={() => { setMode('signup'); setErrorMsg(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Create Employee Account</button>
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          )}

          {/* SIGNUP MODE */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Create Employee Account</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '24px' }}>Register yourself in the organization catalog directory.</p>

              {errorMsg && (
                <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-dark)', border: '1px solid var(--error-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px' }}>{errorMsg}</div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-control" placeholder="Mike Ross" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" className="form-control" placeholder="name@company.com" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" className="form-control" placeholder="Min. 6 characters, uppercase + number" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input type="tel" className="form-control" placeholder="+1 (555) 016-6655" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isLoading} />
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Department</label>
                <select className="form-control" style={{ borderRadius: '8px' }} value={dept} onChange={(e) => setDept(e.target.value)} disabled={isLoading}>
                  <option value="d1">Engineering</option>
                  <option value="d2">Design & UX</option>
                  <option value="d3">Operations</option>
                  <option value="d4">Human Resources</option>
                  <option value="d5">Finance & Legal</option>
                </select>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', marginBottom: '24px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
                Already registered?{' '}
                <button type="button" onClick={() => { setMode('login'); setErrorMsg(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Sign In</button>
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Reset Password</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '24px' }}>Enter your email address to recover your password details.</p>

              {errorMsg && (
                <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-dark)', border: '1px solid var(--error-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px' }}>{errorMsg}</div>
              )}

              {msg && (
                <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)', border: '1px solid var(--success-border)', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{msg}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" className="form-control" placeholder="name@company.com" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', marginBottom: '24px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {isLoading ? 'Requesting Reset...' : 'Send Reset Link'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
                Remember password?{' '}
                <button type="button" onClick={() => { setMode('login'); setErrorMsg(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Sign In</button>
              </p>
            </form>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Define New Password</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '24px' }}>Submit the recovery token and establish your new secure password.</p>

              {errorMsg && (
                <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-dark)', border: '1px solid var(--error-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px' }}>{errorMsg}</div>
              )}

              {msg && (
                <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-dark)', border: '1px solid var(--success-border)', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12.5px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{msg}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Reset Recovery Token</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-control" placeholder="Paste the token here" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={resetToken} onChange={(e) => setResetToken(e.target.value)} required disabled={isLoading} />
                  <Key size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" className="form-control" placeholder="Min. 6 characters, uppercase + number" style={{ width: '100%', paddingLeft: '38px', borderRadius: '8px' }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isLoading} />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '13.5px', color: '#94a3b8' }} />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', marginBottom: '24px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {isLoading ? 'Resetting Password...' : 'Save New Password'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
                Back to{' '}
                <button type="button" onClick={() => { setMode('login'); setErrorMsg(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>Sign In</button>
              </p>
            </form>
          )}

          {/* Quick-Testing Developer Logins */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px dashed #e2e8f0' }}>
            <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '700' }}>
              <Shield size={12} style={{ color: '#2563eb' }} /> Developer Quick Logins
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {quickLogins.map((ql, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(ql)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', cursor: isLoading ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.15s ease', opacity: isLoading ? 0.6 : 1 }}
                  className="card-interactive"
                >
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{ql.name}</div>
                  <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>{ql.role}</div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
              Password: pass123 (all demo accounts)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
