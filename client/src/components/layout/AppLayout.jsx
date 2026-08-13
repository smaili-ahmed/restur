import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_PATH } from '../../config';

const ICONS = {
  overview: '⌂',
  users: '◉',
  connections: '⇄',
  ips: '⌗',
  events: '⚠',
  analytics: '◔',
};

const ADMIN_NAV = [
  { key: 'overview', label: 'Overview', to: ADMIN_PATH, end: true },
  { key: 'users', label: 'Users', to: `${ADMIN_PATH}/users` },
  { key: 'connections', label: 'Connections', to: `${ADMIN_PATH}/connections` },
  { key: 'ips', label: 'IP Management', to: `${ADMIN_PATH}/ips` },
  { key: 'events', label: 'Security Events', to: `${ADMIN_PATH}/events` },
  { key: 'analytics', label: 'Analytics', to: `${ADMIN_PATH}/analytics` },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
        <Logo />
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => (isActive ? 'active' : '')}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 14px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? 'var(--primary)' : 'var(--text-2)',
              background: isActive ? 'rgba(0,229,255,0.08)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,229,255,0.22)' : 'transparent'}`,
              transition: 'all 0.2s ease',
            })}
          >
            <span className="mono" style={{ width: 18, textAlign: 'center' }}>{ICONS[item.key]}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--gradient-main)',
            color: '#04121a',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            fontSize: 14,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{user?.role}</div>
        </div>
        <button onClick={handleLogout} title="Logout" className="btn btn-ghost btn-sm">⏻</button>
      </div>
    </div>
  );
}

export function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="page">
      <aside
        className="app-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'var(--sidebar-w)',
          background: 'rgba(6,10,20,0.92)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidebarContent />
      </aside>

      <div data-main style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header
          className="mobile-topbar"
          style={{
            display: 'none',
            height: 'var(--nav-h)',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(6,10,20,0.92)',
            backdropFilter: 'blur(18px)',
            position: 'sticky',
            top: 0,
            zIndex: 45,
          }}
        >
          <Logo size={28} />
          <button onClick={() => setMobileOpen(true)} aria-label="Menu" style={{ width: 42, height: 42, border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 20 }}>
            ☰
          </button>
        </header>

        <main style={{ flex: 1, padding: '28px 28px 48px' }}>{children}</main>

        <footer style={{ padding: '18px 28px', borderTop: '1px solid var(--border)', color: 'var(--text-3)', fontSize: 12 }}>
          <span className="mono">CyberGuard © {new Date().getFullYear()} · Secure Access Platform</span>
        </footer>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              width: 'min(300px, 82vw)',
              background: 'rgba(6,10,20,0.98)',
              borderRight: '1px solid var(--border-strong)',
              zIndex: 90,
              boxShadow: 'var(--shadow-m)',
            }}
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close"
              style={{ position: 'absolute', top: 16, right: 14, width: 36, height: 36, border: '1px solid var(--border-strong)', borderRadius: 9, fontSize: 16 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .app-sidebar { display: none; }
          .mobile-topbar { display: flex !important; }
          [data-main] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
