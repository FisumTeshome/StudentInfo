import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Muted, harmonious chart palette
const CHART_COLORS = ['#4a9e6b', '#6b8fa3', '#c0956a', '#8a6ba8', '#c07070'];

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, fontSize: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '20', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8081/analytics/dashboard')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center" style={{ minHeight: 400 }}>
      <div className="spinner" />
      <p>Loading dashboard…</p>
    </div>
  );
  if (!data) return (
    <div className="empty-state" style={{ minHeight: 400 }}>
      <span className="empty-state-icon">📊</span>
      <p>No data available</p>
    </div>
  );

  const chartTooltipStyle = {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Real-time insights and performance metrics
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Students"   value={data.totals.students}   icon="👥" color="#4a9e6b" />
        <StatCard label="Total Courses"    value={data.totals.courses}    icon="📚" color="#6b8fa3" />
        <StatCard label="Total Enrollments" value={data.totals.enrollments} icon="✅" color="#8a6ba8" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Bar chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Students per Class
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.studentsPerClass} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="class" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" fill="#4a9e6b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            Grade Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.gradeDistribution} dataKey="count" nameKey="letter_grade"
                cx="50%" cy="50%" outerRadius={90} innerRadius={44} paddingAngle={3}>
                {data.gradeDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Top students */}
        <div className="card">
          <div style={{ padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              ⭐ Top Performing Students
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th style={{ textAlign: 'right' }}>Avg Score</th></tr>
              </thead>
              <tbody>
                {data.topStudents.map((s, i) => (
                  <tr key={i}>
                    <td style={{ width: 36 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, borderRadius: '50%',
                        width: 24, height: 24, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f3' : '#f9faf9',
                        color: i === 0 ? '#92400e' : 'var(--text-muted)',
                      }}>{i + 1}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.Name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {s.avg_score ? parseFloat(s.avg_score).toFixed(1) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular courses */}
        <div className="card">
          <div style={{ padding: '20px 24px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              🎯 Most Popular Courses
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Course</th><th>Code</th><th style={{ textAlign: 'right' }}>Enrolled</th></tr>
              </thead>
              <tbody>
                {data.popularCourses.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {c.code}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {c.enrollment_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
