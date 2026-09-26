import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';

function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    axios.get('http://localhost:8081/courses')
      .then(res => setCourses(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      setLoading(true);
      axios.get(`http://localhost:8081/attendance/course/${selectedCourse}/date/${selectedDate}`)
        .then(res => setAttendanceRecords(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCourse, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => prev.map(record => 
      record.student_id === studentId ? { ...record, status } : record
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsToSave = attendanceRecords.map(r => ({
        student_id: r.student_id,
        status: r.status
      }));
      await axios.post('http://localhost:8081/attendance/bulk', {
        course_id: selectedCourse,
        date: selectedDate,
        records: recordsToSave
      });
      alert('Attendance saved successfully');
    } catch (err) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const iS = {
    padding: '9px 12px', borderRadius: 7, border: '1.5px solid var(--border)',
    fontSize: 13.5, outline: 'none', background: 'var(--surface)',
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Attendance</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Track and manage student daily attendance</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Course</label>
          <select style={{ ...iS, minWidth: 200 }} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">Select a course...</option>
            {courses.map(c => <option key={c.ID} value={c.ID}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Date</label>
          <input type="date" style={iS} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {selectedCourse && (
        <div className="card">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /><p>Loading register...</p></div>
          ) : attendanceRecords.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}><p>No students enrolled in this course</p></div>
          ) : (
            <div>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', textAlign: 'left', background: 'var(--bg)' }}>
                    <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontSize: 13 }}>Student</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontSize: 13, width: 250 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record.student_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500 }}>{record.student_name}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          {['present', 'absent', 'late'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(record.student_id, status)}
                              style={{
                                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: 'none',
                                background: record.status === status 
                                  ? (status === 'present' ? '#dcf0e3' : status === 'absent' ? '#fee2e2' : '#fef3c7') 
                                  : 'var(--bg)',
                                color: record.status === status 
                                  ? (status === 'present' ? '#1a6635' : status === 'absent' ? '#991b1b' : '#92400e') 
                                  : 'var(--text-secondary)',
                                boxShadow: record.status === status ? 'inset 0 0 0 1px rgba(0,0,0,0.05)' : 'none'
                              }}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSave}
                  disabled={saving || (user?.role !== 'admin' && user?.role !== 'teacher')}
                  style={{
                    padding: '10px 24px', borderRadius: 8, background: 'var(--primary)', color: '#fff',
                    border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Register'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Attendance;
