import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/Loading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ConnectionsAreaChart, StatusDonut } from '../../components/charts';
import { formatDate, timeAgo } from '../../utils/format';
import { ADMIN_PATH } from '../../config';

export default function AdminOverview() {
  const { user } = useAuth();
  const { data, loading } = useApi(() => import('../../api/client').then(({ api }) => api.get('/admin/statistics')).then((d) => d));

  useEffect(() => {
    document.title = 'Overview · Admin';
  }, []);

  if (loading && !data) return <PageLoader label="GATHERING TELEMETRY" />;

  const s = data?.statistics || {};

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          ADMIN CONSOLE
        </p>
        <h1 className="section-title">
          Overview, <span className="grad-text">{user?.name}</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Live platform statistics</p>
      </motion.div>

      <div className="grid grid-stats" style={{ marginBottom: 24 }}>
        <StatCard icon="◉" label="Total Users" value={s.total_users} sub={`${s.users_24h} in last 24h`} />
        <StatCard icon="⇄" label="Connections (24h)" value={s.connections_24h} tone="accent" sub={`${s.successful_connections} successful total`} />
        <StatCard icon="⌗" label="Detected IPs" value={s.detected_ips} />
        <StatCard icon="⚠" label="Security Events" value={s.security_events} tone="danger" sub={`${s.blocked_connections} blocked connections`} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <Card>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 16 }}>
            RECENT ACTIVITY
          </p>
          <div style={{ display: 'grid', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
            {((s.latest_events) || []).map((e) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '11px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.ip_address}</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Badge status={e.event_type === 'LOGIN_FAILED' || e.event_type === 'IP_BLOCKED' || e.event_type === 'LOGIN_BLOCKED' ? 'danger' : e.event_type === 'IP_BLOCKED' ? 'warning' : 'info'}>{e.event_type.replace(/_/g, ' ')}</Badge>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{timeAgo(e.created_at)}</div>
                </div>
              </div>
            ))}
            {!s.latest_events && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 12px', borderRadius: 10, background: '#f8fafc' }}>
                <span style={{ fontSize: 13.5 }}>Successful login</span>
                <Badge status="success">LOGIN SUCCESS</Badge>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to={`${ADMIN_PATH}/events`} className="btn btn-ghost btn-sm">View all events →</Link>
          </div>
        </Card>

        <Card>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 16 }}>
            STATUS BREAKDOWN
          </p>
          <StatusDonut data={s.status_breakdown || []} />
        </Card>
      </div>

      <Card>
        <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 16 }}>
          CONNECTIONS TREND
        </p>
        <ConnectionsAreaChart data={(s.connections_by_day || []).map((d) => ({ day: d.day, success: d.success, failed: d.failed }))} />
      </Card>
    </div>
  );
}
