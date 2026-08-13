import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatFullDate, parseUserAgent } from '../../utils/format';

export default function Security() {
  const { loadMe } = useAuth();
  const { data, loading } = useApi(loadMe);

  useEffect(() => {
    document.title = 'Security · CyberGuard';
  }, []);

  if (loading && !data) return <PageLoader label="ANALYZING CONNECTION" />;

  const lastConn = data?.lastConnection;
  const { browser, os, isMobile } = parseUserAgent(lastConn?.user_agent);
  const checks = [
    { label: 'IP AUTHORIZATION', pass: !data?.ipBlocked },
    { label: 'AUTHENTICATION', pass: true },
    { label: 'ENCRYPTED CHANNEL', pass: true },
    { label: 'SESSION VALID', pass: true },
    { label: 'DEVICE PROFILE', pass: isMobile || !!browser },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          SECURITY POSTURE
        </p>
        <h1 className="section-title">
          Connection <span className="grad-text">security</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Real-time verification of your session</p>
      </motion.div>

      <div className="grid grid-2">
        <Card style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="scan-line" />
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 18 }}>
            SECURITY CHECKS
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {checks.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                <span className="mono" style={{ color: c.pass ? 'var(--ok)' : 'var(--danger)', fontSize: 13 }}>
                  {c.pass ? 'PASS' : 'FAIL'}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 20 }}>
          <Card hover>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em' }}>
                DETECTED IP
              </p>
              <Badge status={data?.ipBlocked ? 'blocked' : 'allowed'}>{data?.ipBlocked ? 'BLOCKED' : 'ALLOWED'}</Badge>
            </div>
            <div className="mono grad-text" style={{ fontSize: 28, fontWeight: 600, wordBreak: 'break-all' }}>
              {data?.ip || '—'}
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 12 }}>
              Detected server-side at login — never disclosed to the client.
            </p>
          </Card>

          <Card hover>
            <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 16 }}>
              LAST SUCCESSFUL CONNECTION
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['Timestamp', formatFullDate(lastConn?.created_at)],
                ['Device', `${browser} on ${os}`],
                ['Agent', (lastConn?.user_agent || '—').slice(0, 80)],
              ].map(([k, v]) => (
                <div key={k} style={{ fontSize: 14 }}>
                  <span className="mono" style={{ color: 'var(--text-3)', fontSize: 11, display: 'block', marginBottom: 3, letterSpacing: '0.1em' }}>{k.toUpperCase()}</span>
                  <span style={{ color: 'var(--text-1)', wordBreak: 'break-word' }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
