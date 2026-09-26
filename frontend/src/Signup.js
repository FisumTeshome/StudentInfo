import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from './context/AuthContext';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #e2e8e4', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
    color: '#1a2e22',
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#5a7265',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4,
  };
  const focusIn  = e => { e.target.style.borderColor = '#2e7d52'; e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,0.12)'; };
  const focusOut = e => { e.target.style.borderColor = '#e2e8e4'; e.target.style.boxShadow = 'none'; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(username, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Signup failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f1 0%, #e8ede9 100%)',
      padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, background: '#1e3a2f', borderRadius: 16,
            fontSize: 26, marginBottom: 14, boxShadow: '0 4px 12px rgba(30,58,47,0.3)',
          }}>🏫</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a2e22', margin: 0 }}>SchoolMS</h1>
          <p style={{ fontSize: 14, color: '#5a7265', marginTop: 4 }}>School Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8e4',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2e22', marginBottom: 6 }}>Create account</h2>
          <p style={{ fontSize: 13.5, color: '#8fa898', marginBottom: 24 }}>
            New accounts are created with <strong>Teacher</strong> role by default.
          </p>

          {error && (
            <div style={{
              padding: '11px 14px', borderRadius: 8, marginBottom: 20,
              background: '#fee2e2', color: '#991b1b',
              borderLeft: '3px solid #dc2626', fontSize: 13.5,
              display: 'flex', gap: 8,
            }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" id="username" placeholder="Choose a username"
                value={username} onChange={e => setUsername(e.target.value)} required
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" id="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" id="password" placeholder="At least 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 8,
              background: loading ? '#7aab92' : '#2e7d52', color: '#fff',
              border: 'none', fontSize: 14.5, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', marginTop: 4, fontFamily: 'inherit',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#236040'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2e7d52'; }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8e4', textAlign: 'center' }}>
            <p style={{ fontSize: 13.5, color: '#8fa898' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2e7d52', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
