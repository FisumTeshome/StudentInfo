import API from './api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateStudent() {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [clas, setClass]  = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const iS = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid var(--border)', fontSize: 14,
    outline: 'none', color: 'var(--text-primary)',
    background: 'var(--surface)', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const focusIn  = e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,0.12)'; };
  const focusOut = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  useEffect(() => {
    let mounted = true;
    API.get('/students/' + id)
      .then(res => {
        if (!mounted) return;
        setName(res.data.Name || '');
        setEmail(res.data.email || '');
        setClass(res.data.class || '');
      })
      .catch(err => console.log(err));
    return () => { mounted = false; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !clas) { setError('All fields are required'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    try {
      await API.put('/update/' + id, { name, email, clas });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Edit Student</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Update student information
        </p>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <div style={{ padding: '28px 32px' }}>
          {error && (
            <div style={{
              padding: '11px 14px', borderRadius: 8, marginBottom: 20,
              background: '#fee2e2', color: '#991b1b',
              borderLeft: '3px solid #dc2626', fontSize: 13.5,
              display: 'flex', gap: 8,
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Full Name *
              </label>
              <input id="name" type="text" placeholder="Full name"
                style={iS} value={name} onChange={e => setName(e.target.value)}
                onFocus={focusIn} onBlur={focusOut} required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Email Address *
              </label>
              <input id="email" type="email" placeholder="Email"
                style={iS} value={email} onChange={e => setEmail(e.target.value)}
                onFocus={focusIn} onBlur={focusOut} required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Class *
              </label>
              <input id="class" type="text" placeholder="Class"
                style={iS} value={clas} onChange={e => setClass(e.target.value)}
                onFocus={focusIn} onBlur={focusOut} required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '11px', borderRadius: 8,
                background: loading ? '#7aab92' : 'var(--primary)', color: '#fff',
                border: 'none', fontSize: 14.5, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)'; }}
              >
                {loading ? 'Saving…' : '💾 Save Changes'}
              </button>
              <button type="button" onClick={() => navigate('/')} style={{
                padding: '11px 20px', borderRadius: 8,
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateStudent;
