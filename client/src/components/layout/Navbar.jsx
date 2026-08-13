import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_PATH } from '../../config';

const LINKS = [
  { label: 'La Carte', to: '/#carte' },
  { label: 'Espace membre', to: '/#espace' },
  { label: 'Réservation', to: '/#reservation' },
];

export function Navbar({ transparent = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 'var(--nav-h)',
        display: 'flex',
        alignItems: 'center',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo brand="restaurant" />
        <nav data-nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
            {LINKS.map((l) => (
              <a key={l.to} href={l.to} className="nav-link" style={{ fontSize: 14, color: 'var(--text-2)', transition: 'color 0.2s' }}>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to={ADMIN_PATH} className="btn btn-ghost btn-sm">
                    Administration
                  </Link>
                )}
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/login" className="btn btn-primary">
                  Explore Platform
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          style={{ width: 40, height: 40, placeItems: 'center', border: '1px solid var(--border-strong)', borderRadius: 10 }}
          className="mobile-burger"
        >
          <span style={{ fontSize: 18 }}>{open ? '✕' : '☰'}</span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'absolute',
              top: 'var(--nav-h)',
              left: 0,
              right: 0,
              background: 'rgba(255,255,255,0.97)',
              borderBottom: '1px solid var(--border)',
              padding: '16px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {LINKS.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} style={{ color: 'var(--text-1)', fontSize: 15 }}>
                {l.label}
              </a>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to={ADMIN_PATH} onClick={() => setOpen(false)} className="btn btn-ghost" style={{ width: '100%' }}>
                    Administration
                  </Link>
                )}
                <button className="btn btn-ghost" onClick={() => { setOpen(false); handleLogout(); }} style={{ width: '100%' }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
