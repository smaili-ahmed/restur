import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatFullDate } from '../../utils/format';

const EVENT_TONES = {
  LOGIN_SUCCESS: 'success',
  LOGIN_FAILED: 'danger',
  LOGIN_BLOCKED: 'danger',
  IP_BLOCKED: 'warn',
  IP_UNBLOCKED: 'info',
  LOGOUT: 'info',
};

export default function SecurityEvents() {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const fetcher = useMemo(
    () => () => api.get(`/security-events?page=${page}&limit=15${type ? `&type=${type}` : ''}`),
    [page, type]
  );

  const { data, loading } = useApi(fetcher, { deps: [page, type] });

  useEffect(() => {
    document.title = 'Security Events · Admin';
  }, []);

  if (loading && !data) return <PageLoader label="LOADING AUDIT TRAIL" />;

  const events = data?.events || [];
  const pg = data?.pagination || { page: 1, pages: 1, total: 0 };
  const types = [...new Set(events.map((e) => e.event_type))].concat(data?.pagination?.types || []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          AUDIT TRAIL
        </p>
        <h1 className="section-title">
          Security <span className="grad-text">events</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Chronological record of every security occurrence</p>
      </motion.div>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <select className="input" style={{ maxWidth: 220 }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All event types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {events.length === 0 && <EmptyState icon="⚠" title="No events" sub="No security events have been recorded yet." />}
          {events.map((e) => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-1)' }}>{e.description}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--primary)' }}>{e.ip_address || '—'}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{e.user_name || 'Unknown'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <Badge status={EVENT_TONES[e.event_type] || 'info'}>{e.event_type.replace(/_/g, ' ')}</Badge>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatFullDate(e.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        <Pagination page={pg.page} pages={pg.pages} total={pg.total} onPage={setPage} />
      </Card>
    </div>
  );
}
