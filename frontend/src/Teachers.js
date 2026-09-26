import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';

const DEPT_COLORS = {
  'Mathematics': { bg: '#dbeafe', color: '#1e40af' },
  'Science':     { bg: '#dcf0e3', color: '#1a6635' },
  'Humanities':  { bg: '#fef3c7', color: '#92400e' },
  'Arts':        { bg: '#f3e8ff', color: '#7c3aed' },
};
const deptBadge = d => DEPT_COLORS[d] || { bg: '#f1f5f3', color: '#5a7265' };

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // view detail
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ full_name: '', email: '', phone: '', department: '', subjects_taught: '', hire_date: '', bio: '' });
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = () => {
    setLoading(true);
    axios.get('http://localhost:8081/teachers')
      .then(res => { setTeachers(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const openAdd = () => {
    setForm({ full_name: '', email: '', phone: '', department: '', subjects_taught: '', hire_date: '', bio: '' });
    setEditId(null); setError(''); setShowForm(true);
  };

  const openEdit = (t) => {
    setForm({
      full_name: t.full_name, email: t.email, phone: t.phone || '',
      department: t.department || '', subjects_taught: t.subjects_taught || '',
      hire_date: t.hire_date ? t.hire_date.slice(0, 10) : '', bio: t.bio || '',
    });
    setEditId(t.ID); setError(''); setShowForm(true); setSelected(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editId) {
        await axios.put(`http://localhost:8081/teachers/${editId}`, form);
      } else {
        await axios.post('http://localhost:8081/teachers', form);
      }
      setShowForm(false); fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher record?')) return;
    try {
      await axios.delete(`http://localhost:8081/teachers/${id}`);
      fetchTeachers(); if (selected?.ID === id) setSelected(null);
    } catch { alert('Failed to delete'); }
  };

  const iS = {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    border: '1.5px solid var(--border)', fontSize: 13.5,
    outline: 'none', color: 'var(--text-primary)',
    background: 'var(--surface)', fontFamily: 'inherit',
  };
  const focusIn  = e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,0.12)'; };
  const focusOut = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };
  const lS = { display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Teachers</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Staff directory and department overview</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openAdd} style={{
            padding: '9px 18px', borderRadius: 7, background: 'var(--primary)',
            color: '#fff', border: 'none', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ➕ Add Teacher
          </button>
        )}
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                {editId ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              {error && <div style={{ padding: '10px 14px', borderRadius: 7, background: '#fee2e2', color: '#991b1b', marginBottom: 16, fontSize: 13 }}>⚠️ {error}</div>}
              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lS}>Full Name *</label>
                  <input style={iS} value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} required onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label style={lS}>Email *</label>
                  <input type="email" style={iS} value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label style={lS}>Phone</label>
                  <input style={iS} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label style={lS}>Department</label>
                  <select style={{ ...iS, cursor: 'pointer' }} value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">Select…</option>
                    {['Mathematics','Science','Humanities','Arts','Physical Education','Technology','Social Sciences'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lS}>Hire Date</label>
                  <input type="date" style={iS} value={form.hire_date} onChange={e => setForm(f => ({...f, hire_date: e.target.value}))} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lS}>Subjects Taught</label>
                  <input style={iS} placeholder="e.g. Calculus, Linear Algebra" value={form.subjects_taught} onChange={e => setForm(f => ({...f, subjects_taught: e.target.value}))} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lS}>Bio</label>
                  <textarea style={{ ...iS, minHeight: 80, resize: 'vertical' }} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={saving} style={{
                    flex: 1, padding: '10px', borderRadius: 7,
                    background: saving ? '#7aab92' : 'var(--primary)', color: '#fff',
                    border: 'none', fontSize: 14, fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  }}>{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{
                    padding: '10px 20px', borderRadius: 7, background: 'var(--surface)',
                    border: '1.5px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Teacher cards grid */}
        <div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /><p>Loading teachers…</p></div>
          ) : teachers.length === 0 ? (
            <div className="empty-state"><span className="empty-state-icon">🧑‍🏫</span><p>No teachers yet</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {teachers.map(t => {
                const badge = deptBadge(t.department);
                return (
                  <div key={t.ID} className="card" style={{
                    padding: '20px', cursor: 'pointer',
                    outline: selected?.ID === t.ID ? '2px solid var(--primary)' : 'none',
                    transition: 'box-shadow 0.15s',
                  }}
                    onClick={() => setSelected(selected?.ID === t.ID ? null : t)}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)',
                        color: 'var(--primary)', fontSize: 18, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0,
                      }}>
                        {t.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.full_name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{t.email}</div>
                      </div>
                    </div>
                    {t.department && (
                      <span style={{ ...badge, fontSize: 11.5, padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>{t.department}</span>
                    )}
                    {t.subjects_taught && (
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
                        📚 {t.subjects_taught}
                      </p>
                    )}
                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 14 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(t)} style={{ padding: '5px 12px', borderRadius: 6, background: '#fef3c7', color: '#92400e', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(t.ID)} style={{ padding: '5px 12px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{ padding: '24px', position: 'sticky', top: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: 14 }}>
              {selected.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h4 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selected.full_name}</h4>
            {selected.department && <span style={{ ...deptBadge(selected.department), fontSize: 11.5, padding: '3px 10px', borderRadius: 20, fontWeight: 600, display: 'inline-block', marginTop: 6 }}>{selected.department}</span>}
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['📧 Email',       selected.email],
                ['📞 Phone',       selected.phone || '—'],
                ['📚 Subjects',    selected.subjects_taught || '—'],
                ['📅 Hire Date',   selected.hire_date ? new Date(selected.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
              {selected.bio && (
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>📝 Bio</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{selected.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teachers;
