import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageLoader } from '../../components/ui/Loading';
import { Card } from '../../components/ui/Card';
import { ConnectionsAreaChart, IpsBarChart, StatusDonut, EventsLineChart } from '../../components/charts';

export default function Analytics() {
  const [days, setDays] = useState(14);

  const fetcher = useMemo(() => () => api.get(`/admin/analytics?days=${days}`), [days]);
  const { data, loading } = useApi(fetcher, { deps: [days] });

  useEffect(() => {
    document.title = 'Analytics · Admin';
  }, []);

  if (loading && !data) return <PageLoader label="PROCESSING ANALYTICS" />;

  const a = data?.analytics || {};
  const eventsByType = a.eventsByType || [];
  const eventsSeries = eventsByType.map((e) => ({ day: e.event_type.replace(/_/g, ' '), total: e.total }));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
        <p className="mono" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: 12, marginBottom: 8 }}>
          INTELLIGENCE
        </p>
        <h1 className="section-title">
          Analytics <span className="grad-text">& trends</span>
        </h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Deep visibility into connection behavior</p>
      </motion.div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em' }}>
            TIME RANGE
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[7, 14, 30].map((d) => (
              <button key={d} className={`btn btn-ghost btn-sm ${days === d ? 'btn-primary' : ''}`} onClick={() => setDays(d)}>
                {d} days
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 14 }}>
            CONNECTIONS PER DAY
          </p>
          <ConnectionsAreaChart data={(a.connectionsByDay || []).map((d) => ({ day: d.day, success: d.success, failed: d.failed, blocked: d.blocked }))} />
          <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 10 }}>
            {(a.connectionsByDay || []).length > 0
              ? `${a.connectionsByDay[0].day} → ${a.connectionsByDay[a.connectionsByDay.length - 1].day}`
              : 'No data in range'}
          </p>
        </Card>

        <Card>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 14 }}>
            TOP IPS
          </p>
          <IpsBarChart data={a.topIps || []} />
        </Card>

        <Card>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 14 }}>
            STATUS BREAKDOWN
          </p>
          <StatusDonut data={a.statusBreakdown || []} />
        </Card>

        <Card>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.18em', marginBottom: 14 }}>
            SECURITY EVENTS BY TYPE
          </p>
          <EventsLineChart data={eventsSeries} />
        </Card>
      </div>
    </div>
  );
}
