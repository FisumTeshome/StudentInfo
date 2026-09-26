import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/* ── Grouped navigation structure ─────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Academics',
    icon: '📋',
    items: [
      { path: '/',        label: 'Students',    icon: '👥' },
      { path: '/courses', label: 'Courses',     icon: '📚' },
      { path: '/create',  label: 'Add Student', icon: '➕', authOnly: true },
    ],
  },
  {
    label: 'Analytics',
    icon: '📊',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '📈' },
    ],
  },
  {
    label: 'Operations',
    icon: '✅',
    items: [
      { path: '/attendance',   label: 'Attendance',   icon: '📅' },
      { path: '/announcements', label: 'Announcements', icon: '📢' },
    ],
  },
  {
    label: 'Staff',
    icon: '👩‍🏫',
    items: [
      { path: '/teachers', label: 'Teachers', icon: '🧑‍🏫' },
    ],
  },
];

const isActive = (path, location) =>
  path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

/* ── Single nav item ──────────────────────────────────────── */
function NavItem({ item, location, onClick }) {
  const active = isActive(item.path, location);
  return (
    <Link
      to={item.path}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px', borderRadius: 8, marginBottom: 2,
        color: active ? 'var(--sidebar-active-tx)' : 'var(--sidebar-text)',
        background: active ? 'var(--sidebar-active-bg)' : 'transparent',
        textDecoration: 'none', fontSize: 13.5, fontWeight: active ? 700 : 500,
        transition: 'all 0.15s ease',
        boxShadow: active ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

/* ── Main Layout ──────────────────────────────────────────── */
function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    navigate('/login');
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid var(--sidebar-border)',
      }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          🏫 SchoolMS
        </div>
        <div style={{ fontSize: 11, color: 'var(--sidebar-muted)', marginTop: 3, letterSpacing: 0.3 }}>
          School Management System
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div style={{
          margin: '14px 12px 8px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '10px 12px',
          border: '1px solid var(--sidebar-border)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--sidebar-muted)', marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, wordBreak: 'break-all' }}>
            {user.email}
          </div>
          <span style={{
            display: 'inline-block', marginTop: 6,
            fontSize: 10, background: 'rgba(255,255,255,0.15)', color: 'var(--sidebar-text)',
            borderRadius: 20, padding: '2px 8px',
            textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700,
          }}>
            {user.role}
          </span>
        </div>
      )}

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(i => !i.authOnly || user);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} style={{ marginBottom: 6 }}>
              <div style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8,
                color: 'var(--sidebar-muted)', textTransform: 'uppercase',
                padding: '10px 14px 4px',
              }}>
                {group.label}
              </div>
              {visibleItems.map(item => (
                <NavItem key={item.path} item={item} location={location} onClick={() => setOpen(false)} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid var(--sidebar-border)' }}>
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid var(--sidebar-border)',
              color: 'var(--sidebar-text)', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            <span style={{ fontSize: 15 }}>🚪</span> Logout
          </button>
        ) : (
          <Link to="/login" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.1)', color: '#fff',
            fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
          }}>
            <span>🔑</span> Login
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40,
        }} />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside style={{
        width: 232, minWidth: 232,
        background: 'var(--sidebar-bg)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transition: 'transform 0.25s ease',
        boxShadow: '2px 0 16px rgba(0,0,0,0.2)',
      }} className={`app-sidebar${open ? ' sidebar-open' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 45,
        background: 'var(--sidebar-bg)', padding: '12px 16px',
        alignItems: 'center', gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <button onClick={() => setOpen(!open)} style={{
          background: 'none', border: 'none', color: '#fff',
          fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1,
        }}>☰</button>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>🏫 SchoolMS</span>
      </div>

      {/* Main content */}
      <main className="app-main" style={{
        flex: 1, marginLeft: 232, minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        <div style={{ padding: '32px 32px 48px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .app-sidebar  { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0) !important; }
          .app-main     { margin-left: 0 !important; padding-top: 56px !important; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default Layout;
