import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatFullDate, initials } from '../../utils/format';

export default function Profile() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Profile · CyberGuard';
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          ACCOUNT
        </p>
        <h1 className="section-title">
          My <span className="grad-text">profile</span>
        </h1>
      </motion.div>

      <div className="grid grid-2">
        <Card hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--gradient-main)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {initials(user?.name)}
            </div>
            <div>
              <h2 style={{ fontSize: 22 }}>{user?.name}</h2>
              <Badge status={user?.role}>{user?.role}</Badge>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              ['EMAIL', user?.email],
              ['MEMBER SINCE', formatFullDate(user?.created_at)],
              ['ACCOUNT ID', user?.id],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid rgba(30,50,100,0.08)', paddingBottom: 10 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.12em' }}>{k}</span>
                <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-1)', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card hover>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 16 }}>
            ROLE &amp; PERMISSIONS
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Dashboard access', user?.role === 'admin' || true],
              ['Connection history', true],
              ['Security posture view', true],
              ['IP management', user?.role === 'admin'],
              ['User administration', user?.role === 'admin'],
              ['Security events audit', user?.role === 'admin'],
            ].map(([label, has]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 14 }}>{label}</span>
                <span className="mono" style={{ color: has ? 'var(--ok)' : 'var(--text-3)', fontSize: 13 }}>
                  {has ? 'ENABLED' : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
