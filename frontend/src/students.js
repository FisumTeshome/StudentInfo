import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from './context/AuthContext';

function Students() {
  const [students, setStudents]           = useState([]);
  const [filteredStudents, setFiltered]   = useState([]);
  const [search, setSearch]               = useState('');
  const [classFilter, setClassFilter]     = useState('');
  const [sortBy, setSortBy]               = useState('Name');
  const [sortOrder, setSortOrder]         = useState('ASC');
  const [classes, setClasses]             = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    let result = [...students];
    if (search) result = result.filter(s =>
      s.Name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
    if (classFilter) result = result.filter(s => s.class === classFilter);
    result.sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      return sortOrder === 'ASC' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    setFiltered(result);
  }, [search, classFilter, sortBy, sortOrder, students]);

  const fetchStudents = () => {
    axios.get('http://localhost:8081/students')
      .then(res => {
        setStudents(res.data);
        setClasses([...new Set(res.data.map(s => s.class))]);
      })
      .catch(err => console.log(err));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try {
      await axios.delete('http://localhost:8081/students/' + id);
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const handleExport = () => {
    axios.get('http://localhost:8081/export/students', { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url; a.setAttribute('download', 'students.csv');
        document.body.appendChild(a); a.click(); a.parentElement.removeChild(a);
      })
      .catch(() => alert('Export failed'));
  };

  const gradeVariant = g => {
    if (g === 'A') return { background: '#dcf0e3', color: '#1a6635' };
    if (g === 'B') return { background: '#dbeafe', color: '#1e40af' };
    if (g === 'C') return { background: '#fef3c7', color: '#92400e' };
    return { background: '#fee2e2', color: '#991b1b' };
  };

  const iS = { // input style
    width: '100%', padding: '9px 12px', borderRadius: 7,
    border: '1.5px solid var(--border)', fontSize: 13.5,
    outline: 'none', color: 'var(--text-primary)',
    background: 'var(--surface)', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Students</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Manage and view all enrolled students
        </p>
      </div>

      {/* Filter + action bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Search</label>
              <input style={iS} placeholder="Name or email…" value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Class</label>
              <select style={{ ...iS, cursor: 'pointer' }} value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                <option value=''>All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Sort By</label>
              <select style={{ ...iS, cursor: 'pointer' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value='Name'>Name</option>
                <option value='email'>Email</option>
                <option value='class'>Class</option>
              </select>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Order</label>
              <select style={{ ...iS, cursor: 'pointer' }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value='ASC'>Ascending</option>
                <option value='DESC'>Descending</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredStudents.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{students.length}</strong> students
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {user && (
                <Link to="/create" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 7,
                  background: 'var(--primary)', color: '#fff',
                  textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                >
                  ➕ Add Student
                </Link>
              )}
              <button onClick={handleExport} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 7,
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                📥 Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hide-mobile">Email</th>
                <th className="hide-mobile">Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={4}>
                  <div className="empty-state">
                    <span className="empty-state-icon">👥</span>
                    <p>No students found</p>
                  </div>
                </td></tr>
              ) : filteredStudents.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.Name}</div>
                    <div className="show-mobile-only" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.email}</div>
                    <div className="show-mobile-only" style={{ marginTop: 3 }}>
                      <span style={{ ...gradeVariant(''), fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: '#f1f5f3', color: 'var(--text-secondary)' }}>{s.class}</span>
                    </div>
                  </td>
                  <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td className="hide-mobile">
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {s.class}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link to={`/student/${s.ID}`} style={{
                        padding: '5px 12px', borderRadius: 6,
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        textDecoration: 'none', fontSize: 12.5, fontWeight: 600,
                        transition: 'background 0.15s',
                      }}>Profile</Link>
                      {user && (<>
                        <Link to={`update/${s.ID}`} style={{
                          padding: '5px 12px', borderRadius: 6,
                          background: '#fef3c7', color: '#92400e',
                          textDecoration: 'none', fontSize: 12.5, fontWeight: 600,
                        }}>Edit</Link>
                        <button onClick={() => handleDelete(s.ID)} style={{
                          padding: '5px 12px', borderRadius: 6,
                          background: '#fee2e2', color: '#991b1b',
                          border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                        }}>Delete</button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Students;