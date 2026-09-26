import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function StudentProfile() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8081/students/${studentId}/profile`)
      .then(res => { setStudent(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentId]);

  const handleExportGrades = () => {
    axios.get(`http://localhost:8081/export/students/${studentId}/grades`, { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url; a.setAttribute('download', `student_${studentId}_grades.csv`);
        document.body.appendChild(a); a.click(); a.parentElement.removeChild(a);
      })
      .catch(() => alert('Export failed'));
  };

  const gradeStyle = (g) => {
    if (g === 'A') return { background: '#dcf0e3', color: '#1a6635' };
    if (g === 'B') return { background: '#dbeafe', color: '#1e40af' };
    if (g === 'C') return { background: '#fef3c7', color: '#92400e' };
    return { background: '#fee2e2', color: '#991b1b' };
  };

  if (loading) return (
    <div className="loading-center" style={{ minHeight: 400 }}>
      <div className="spinner" /><p>Loading profile…</p>
    </div>
  );
  if (!student) return (
    <div className="empty-state" style={{ minHeight: 400 }}>
      <span className="empty-state-icon">❌</span>
      <p>Student not found</p>
    </div>
  );

  const avgScore = student.enrollments.length > 0
    ? (student.enrollments.reduce((s, e) => s + (e.final_score || 0), 0) / student.enrollments.length).toFixed(1)
    : null;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {student.Name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Student Profile</p>
        </div>
        <button onClick={handleExportGrades} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 7,
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          📥 Export Grades
        </button>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Email', value: student.email, icon: '📧' },
          { label: 'Class', value: student.class, icon: '🏫' },
          { label: 'Avg Score', value: avgScore ? `${avgScore} / 100` : '—', icon: '📈' },
          { label: 'Enrolled Since', value: new Date(student.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), icon: '📅' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Courses & grades table */}
      <div className="card">
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Courses & Grades
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>
              ({student.enrollments.length} enrolled)
            </span>
          </h3>
        </div>

        {student.enrollments.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <span className="empty-state-icon">📚</span>
            <p>No course enrollments yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th className="hide-mobile">Code</th>
                  <th style={{ textAlign: 'center' }}>Midterm</th>
                  <th style={{ textAlign: 'center' }}>Final</th>
                  <th style={{ textAlign: 'center' }}>Grade</th>
                  <th style={{ textAlign: 'center' }} className="hide-mobile">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {student.enrollments.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{e.course_name}</td>
                    <td className="hide-mobile">
                      <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {e.code}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>{e.midterm_score ?? '—'}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>{e.final_score ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {e.letter_grade ? (
                        <span style={{ ...gradeStyle(e.letter_grade), fontSize: 12.5, padding: '3px 12px', borderRadius: 20, fontWeight: 700 }}>
                          {e.letter_grade}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }} className="hide-mobile">
                      {e.attendance_percentage ? `${e.attendance_percentage}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;
