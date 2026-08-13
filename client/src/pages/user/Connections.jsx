import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatFullDate, parseUserAgent } from '../../utils/format';

export default function Connections() {
  const { data, loading } = useApi(() => import('../../api/client').then(({ api }) => api.myConnections()));

  useEffect(() => {
    document.title = 'Connections · CyberGuard';
  }, []);

  if (loading && !data) return <PageLoader label="LOADING HISTORY" />;

  const list = data?.connections || [];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          CONNECTION HISTORY
        </p>
        <h1 className="section-title">
          My <span className="grad-text">connections</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Your last 50 sign-in events</p>
      </motion.div>

      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>IP ADDRESS</th>
                <th>DEVICE</th>
                <th>STATUS</th>
                <th>WHEN</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState icon="⇄" title="No connections yet" sub="Your sign-in activity will appear here." />
                  </td>
                </tr>
              )}
              {list.map((c) => {
                const { browser, os } = parseUserAgent(c.user_agent);
                return (
                  <tr key={c.id}>
                    <td className="mono cell-strong">{c.ip_address}</td>
                    <td>
                      <span className="mono" style={{ fontSize: 13 }}>{browser}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 12, marginLeft: 8 }}>{os}</span>
                    </td>
                    <td>
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                    <td className="mono" style={{ fontSize: 13 }}>{formatFullDate(c.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
