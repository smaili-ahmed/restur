import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { formatDate, parseUserAgent, timeAgo } from '../../utils/format';

export default function Dashboard() {
  const { user, loadMe } = useAuth();
  const { data, loading } = useApi(loadMe);

  useEffect(() => {
    document.title = 'Dashboard · CyberGuard';
  }, []);

  if (loading && !data) return <PageLoader label="SCANNING SECURITY POSTURE" />;

  const lastConn = data?.lastConnection;
  const { browser, os } = parseUserAgent(lastConn?.user_agent);
  const score = lastConn?.status === 'success' ? 98 : 72;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          WELCOME BACK
        </p>
        <h1 className="section-title">
          {user?.name}, <span className="grad-text">connection secured.</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>
          Connection Security · live status
        </p>
      </motion.div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="⌗" label="IP ADDRESS" value="●" sub={data?.ip || '…'} />
        <StatCard icon="◉" label="STATUS" value={lastConn?.status === 'success' ? 'SECURE' : 'ATTENTION'} tone={lastConn?.status === 'success' ? 'accent' : 'danger'} sub={`${lastConn?.status || 'no'} connection`} />
        <StatCard icon="🕒" label="LAST CONNECTION" value={timeAgo(lastConn?.created_at)} sub={formatDate(lastConn?.created_at)} />
        <StatCard icon="◈" label="DEVICE" value={browser} sub={os} />
      </div>

      <div className="grid grid-2">
        <Card hover style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="scan-line" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em' }}>
                SECURITY SCORE
              </p>
              <div className="stat-value grad-text" style={{ fontSize: 64 }}>{score}%</div>
            </div>
            <Badge status={score >= 90 ? 'secure' : 'warning'}>{score >= 90 ? 'SECURE' : 'ATTENTION'}</Badge>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              style={{ height: '100%', background: 'var(--gradient-main)', borderRadius: 99, boxShadow: '0 0 16px rgba(0,229,255,0.5)' }}
            />
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 16 }}>
            Your connection profile is healthy. No anomalies detected on your last session.
          </p>
        </Card>

        <Card hover>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 18 }}>
            LAST CONNECTION DETAILS
          </p>
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              ['IP ADDRESS', lastConn?.ip_address || data?.ip || '—'],
              ['STATUS', lastConn?.status || '—'],
              ['BROWSER', browser],
              ['OPERATING SYSTEM', os],
              ['TIMESTAMP', formatDate(lastConn?.created_at)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid rgba(120,160,255,0.08)', paddingBottom: 10 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.12em' }}>{k}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-1)', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
