import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, initials } from '../../utils/format';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const fetcher = useMemo(
    () => () => import('../../api/client').then(({ api }) => api.get(`/users?page=${page}&limit=10&q=${encodeURIComponent(debouncedQ)}${role ? `&role=${role}` : ''}`)),
    [page, debouncedQ, role]
  );

  const { data, loading } = useApi(fetcher, { deps: [page, debouncedQ, role] });

  useEffect(() => {
    document.title = 'Users · Admin';
  }, []);

  if (loading && !data) return <PageLoader label="LOADING USERS" />;

  const users = data?.users || [];
  const pg = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          DIRECTORY
        </p>
        <h1 className="section-title">
          Users <span className="grad-text">management</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>All platform accounts and activity</p>
      </motion.div>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ maxWidth: 320 }}
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" style={{ maxWidth: 180 }} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>CONNECTIONS</th>
                <th>LAST IP</th>
                <th>LAST CONNECTION</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5}><EmptyState icon="◉" title="No users found" sub="Try adjusting your search." /></td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--gradient-main)', color: '#04121a', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div className="cell-strong">{u.name}</div>
                        <div className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge status={u.role}>{u.role}</Badge></td>
                  <td className="mono">{u.connection_count}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{u.last_ip || '—'}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{formatDate(u.last_connection)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={pg.page} pages={pg.pages} total={pg.total} onPage={setPage} />
      </Card>
    </div>
  );
}
