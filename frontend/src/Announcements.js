import React, { useState, useEffect, useContext } from 'react';
import API from './api';
import AuthContext from './context/AuthContext';

const CAT_COLORS = {
  'general': { bg: '#e2e8e4', color: '#1a2e22' },
  'academic': { bg: '#dbeafe', color: '#1e40af' },
  'event': { bg: '#f3e8ff', color: '#7c3aed' },
  'urgent': { bg: '#fee2e2', color: '#991b1b' },
};

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', target_role: 'all', pinned: 0 });
  const [saving, setSaving] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = () => {
    setLoading(true);
    API.get('/announcements')
      .then(res => setAnnouncements(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/announcements', form);
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const iS = { width: '100%', padding: '9px 12px', borderRadius: 7, border: '1.5px solid var(--border)', fontSize: 13.5, background: 'var(--surface)' };
  const lS = { display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 };

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Announcements</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>School-wide news and updates</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button onClick={() => { setForm({ title: '', content: '', category: 'general', target_role: 'all', pinned: 0 }); setShowForm(true); }} style={{
            padding: '9px 18px', borderRadius: 7, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
          }}>
            ➕ Post Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Announcement</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={lS}>Title *</label>
                <input style={iS} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={lS}>Category</label>
                  <select style={iS} value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={lS}>Visibility</label>
                  <select style={iS} value={form.target_role} onChange={e => setForm(f => ({...f, target_role: e.target.value}))}>
                    <option value="all">All Users</option>
                    <option value="teacher">Teachers Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({...f, pinned: e.target.checked ? 1 : 0}))} />
                  📌 Pin to top
                </label>
              </div>
              <div>
                <label style={lS}>Content *</label>
                <textarea style={{ ...iS, minHeight: 120, resize: 'vertical' }} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} required />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 7, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>Save</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 7, background: 'var(--surface)', border: '1.5px solid var(--border)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Loading announcements…</p></div>
      ) : announcements.length === 0 ? (
        <div className="empty-state"><span className="empty-state-icon">📢</span><p>No announcements right now</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
          {announcements.map(a => {
            const colors = CAT_COLORS[a.category] || CAT_COLORS['general'];
            return (
              <div key={a.ID} className="card" style={{ padding: 20, position: 'relative', borderLeft: a.pinned ? `4px solid var(--primary)` : 'none' }}>
                {a.pinned === 1 && <span style={{ position: 'absolute', top: 20, right: 20, fontSize: 16 }}>📌</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ background: colors.bg, color: colors.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {a.category}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {a.target_role !== 'all' && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>
                      🔒 {a.target_role}s only
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)', paddingRight: a.pinned ? 30 : 0 }}>{a.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{a.content}</p>
                
                {user?.role === 'admin' && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <button onClick={() => handleDelete(a.ID)} style={{ background: 'none', border: 'none', color: '#991b1b', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Announcements;
