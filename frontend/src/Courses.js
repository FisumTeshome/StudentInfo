import React, { useState, useEffect } from 'react';
import API from './api';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = () => {
    setLoading(true);
    API.get('/courses')
      .then(res => { setCourses(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Courses</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage school courses and curriculum</p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Loading courses…</p></div>
      ) : courses.length === 0 ? (
        <div className="empty-state"><span className="empty-state-icon">📚</span><p>No courses available</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {courses.map(c => (
            <div key={c.ID} className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{c.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Code: {c.code}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Instructor ID: {c.instructor_id || 'Not assigned'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Credits: {c.credits || 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
