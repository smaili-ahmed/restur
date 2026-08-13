import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { api, ApiError } from '../../api/client';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatFullDate, timeAgo } from '../../utils/format';

export default function IpManagement() {
  const { success, error } = useToast();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const fetcher = useMemo(
    () => () => api.get(`/ips?page=${page}&limit=12&q=${encodeURIComponent(debouncedQ)}&status=${status}`),
    [page, debouncedQ, status]
  );

  const { data, loading, run } = useApi(fetcher, { deps: [page, debouncedQ, status] });

  useEffect(() => {
    document.title = 'IP Management · Admin';
  }, []);

  if (loading && !data) return <PageLoader label="LOADING IP INDEX" />;

  const ips = data?.ips || [];
  const pg = data?.pagination || { page: 1, pages: 1, total: 0 };

  const openBlock = (ip) => {
    setTarget(ip);
    setReason('');
    setAction('block');
  };
  const openUnblock = (ip) => {
    setTarget(ip);
    setAction('unblock');
  };

  const confirm = async () => {
    if (!target || busy) return;
    setBusy(true);
    try {
      if (action === 'block') {
        await api.post(`/ips/${encodeURIComponent(target.ip_address)}/block`, { reason });
        success(`IP ${target.ip_address} blocked.`);
      } else {
        await api.del(`/ips/${encodeURIComponent(target.ip_address)}/block`);
        success(`IP ${target.ip_address} unblocked.`);
      }
      setTarget(null);
      run().catch(() => {});
    } catch (e) {
      error(e instanceof ApiError ? e.message : 'Operation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          ACCESS CONTROL
        </p>
        <h1 className="section-title">
          IP <span className="grad-text">management</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Block and unblock addresses detected by the platform</p>
      </motion.div>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 300 }} placeholder="Search IP…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" style={{ maxWidth: 170 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="allowed">Allowed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>IP ADDRESS</th>
                <th>USER</th>
                <th>STATUS</th>
                <th>REASON</th>
                <th>LAST CONNECTION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {ips.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon="⌗" title="No IPs found" sub="Try adjusting your filters." /></td></tr>
              )}
              {ips.map((ip) => (
                <tr key={ip.ip_address}>
                  <td className="mono cell-strong">{ip.ip_address}</td>
                  <td>
                    <div className="cell-strong">{ip.last_user || 'Unknown'}</div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{ip.connection_count} connections</span>
                  </td>
                  <td>
                    <Badge status={ip.status === 'blocked' ? 'blocked' : 'allowed'}>{ip.status.toUpperCase()}</Badge>
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{ip.block_reason || '—'}</span>
                    {ip.blocked_at && (
                      <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{timeAgo(ip.blocked_at)}</div>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{formatFullDate(ip.last_seen)}</td>
                  <td>
                    {ip.status === 'blocked' ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => openUnblock(ip)}>
                        UNBLOCK
                      </button>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => openBlock(ip)}>
                        BLOCK
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={pg.page} pages={pg.pages} total={pg.total} onPage={setPage} />
      </Card>

      <Modal
        open={!!target}
        title={action === 'block' ? 'Block this IP?' : 'Unblock this IP?'}
        confirmLabel={action === 'block' ? 'Block' : 'Unblock'}
        danger={action === 'block'}
        onClose={() => setTarget(null)}
        onConfirm={confirm}
      >
        {action === 'block' ? (
          <>
            <p style={{ marginBottom: 16 }}>
              You are about to <strong style={{ color: 'var(--danger)' }}>block</strong> the address{' '}
              <span className="mono" style={{ color: 'var(--text-1)' }}>{target?.ip_address}</span>. Users from this
              address will be denied access immediately.
            </p>
            <div className="field">
              <label className="field-label">Reason (optional)</label>
              <input
                className="input"
                placeholder="e.g. Brute-force attempt"
                value={reason}
                maxLength={300}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </>
        ) : (
          <p>
            You are about to <strong style={{ color: 'var(--ok)' }}>unblock</strong> the address{' '}
            <span className="mono" style={{ color: 'var(--text-1)' }}>{target?.ip_address}</span>. Users from this
            address will be able to log in again.
          </p>
        )}
      </Modal>
    </div>
  );
}
