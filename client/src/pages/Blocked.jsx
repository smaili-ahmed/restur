import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/layout/Logo';
import { ParticleField } from '../components/3d/ParticleField';

export default function Blocked() {
  const location = useLocation();
  const from = location.state?.from || '';

  useEffect(() => {
    document.title = 'Access Denied · Le Gourmet';
  }, []);

  return (
    <div className="page restaurant-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticleField count={140} color="#e3b04b" color1="rgba(227,176,75,0.22)" color2="rgba(138,109,59,0.2)" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: 20 }}>
        <Logo brand="restaurant" />
      </div>

      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '0 20px 60px', position: 'relative', zIndex: 2 }}>
        <motion.div
          className="card corner-frame"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 460, padding: '44px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          <span className="scan-line" />

          <motion.div
            animate={{ boxShadow: ['0 0 40px rgba(255,77,109,0.25)', '0 0 70px rgba(255,77,109,0.5)', '0 0 40px rgba(255,77,109,0.25)'] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{
              width: 86,
              height: 86,
              margin: '0 auto 22px',
              borderRadius: '50%',
              border: '2px solid rgba(255,77,109,0.55)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--danger)',
              fontSize: 34,
            }}
          >
            ⏻
          </motion.div>

          <motion.p
            className="mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: 'var(--danger)', letterSpacing: '0.35em', fontSize: 13, marginBottom: 14 }}
          >
            ACCESS DENIED
          </motion.p>

          <h2 style={{ fontSize: 30, marginBottom: 12 }}>Your connection has been blocked.</h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: 15, marginBottom: 26 }}>
            This IP address is not authorized to access the platform. If you believe this is an error,
            please contact the administrator.
          </p>

          <div className="card" style={{ padding: '18px', marginBottom: 26, background: 'rgba(255,77,109,0.05)', borderColor: 'rgba(255,77,109,0.25)' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.2em', marginBottom: 8 }}>
              IP ADDRESS
            </div>
            <div className="mono grad-text" style={{ fontSize: 22, fontWeight: 600, wordBreak: 'break-all' }}>
              {from || 'Detected automatically'}
            </div>
            <div style={{ marginTop: 14 }}>
              <span className="badge badge-danger" style={{ padding: '6px 16px' }}>
                <span className="dot" /> BLOCKED
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-ghost">
              Try again
            </Link>
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
