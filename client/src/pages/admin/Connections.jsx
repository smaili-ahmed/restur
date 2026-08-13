import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatFullDate, parseUserAgent } from '../../utils/format';

const STATUS = ['', 'success', 'failed', 'blocked'];

export default function AdminConnections() {
  const [status, setStatus] = useState('');
  const [ip, setIp] = useState('');
  const [debouncedIp, setDebouncedIp] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedIp(ip), 350);
    return () => clearTimeout(t);
  }, [ip]);

  const fetcher = useMemo(
    () => () => import('../../api/client').then(({ api }) => api.get(`/connections?page=${page}&limit=12&status=${status}&ip=${encodeURIComponent(debouncedIp)}`)),
    [page, status, debouncedIp]
  );

  const { data, loading } = useApi(fetcher, { deps: [page, status, debouncedIp] });

  useEffect(() => {
    document.title = 'Connections · Admin';
  }, []);

  if (loading && !data) return <PageLoader label="LOADING CONNECTIONS" />;

  const list = data?.connections || [];
  const pg = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          CONNECTION LOG
        </p>
        <h1 className="section-title">
          All <span className="grad-text">connections</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Every authentication attempt across the platform</p>
      </motion.div>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 300 }} placeholder="Filter by IP…" value={ip} onChange={(e) => setIp(e.target.value)} />
          <select className="input" style={{ maxWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s ? s : 'All statuses'}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>IP ADDRESS</th>
                <th>USER</th>
                <th>DEVICE</th>
                <th>STATUS</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={5}><EmptyState icon="⇄" title="No connections" sub="No activity matches these filters." /></td></tr>
              )}
              {list.map((c) => {
                const { browser, os } = parseUserAgent(c.user_agent);
                return (
                  <tr key={c.id}>
                    <td className="mono cell-strong">{c.ip_address}</td>
                    <td>
                      <div className="cell-strong">{c.user_name || 'Unknown'}</div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.user_email || '—'}</div>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 13 }}>{browser}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 12, marginLeft: 8 }}>{os}</span>
                    </td>
                    <td><Badge status={c.status}>{c.status}</Badge></td>
                    <td className="mono" style={{ fontSize: 13 }}>{formatFullDate(c.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination page={pg.page} pages={pg.pages} total={pg.total} onPage={setPage} />
      </Card>
    </div>
  );
}
