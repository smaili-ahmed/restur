const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

const getStatistics = asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(*)::int FROM users WHERE role = 'admin') AS admin_users,
      (SELECT COUNT(*)::int FROM connections WHERE status = 'success') AS successful_connections,
      (SELECT COUNT(*)::int FROM connections WHERE status = 'failed') AS failed_connections,
      (SELECT COUNT(*)::int FROM connections WHERE status = 'blocked') AS blocked_connections,
      (SELECT COUNT(*)::int FROM blocked_ips WHERE unblocked_at IS NULL) AS blocked_ips,
      (SELECT COUNT(*)::int FROM security_events) AS security_events,
      (SELECT COUNT(DISTINCT ip_address) FROM connections) AS detected_ips,
      (SELECT COUNT(*)::int FROM users WHERE created_at >= now() - interval '24 hours') AS users_24h,
      (SELECT COUNT(*)::int FROM connections WHERE created_at >= now() - interval '24 hours') AS connections_24h
  `);

  const { rows: latestEvents } = await pool.query(
    `SELECT e.id, e.ip_address, e.event_type, e.description, e.created_at,
            u.name AS user_name
     FROM security_events e LEFT JOIN users u ON u.id = e.user_id
     ORDER BY e.created_at DESC LIMIT 8`
  );

  const { rows: statusBreakdown } = await pool.query(
    `SELECT status, COUNT(*)::int AS total FROM connections GROUP BY status`
  );

  const { rows: connectionsByDay } = await pool.query(
    `SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
            COUNT(*) FILTER (WHERE status = 'success')::int AS success,
            COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
            COUNT(*) FILTER (WHERE status = 'blocked')::int AS blocked
     FROM connections
     WHERE created_at >= now() - interval '14 days'
     GROUP BY day ORDER BY day ASC`
  );

  res.json({
    statistics: {
      ...rows[0],
      latest_events: latestEvents,
      status_breakdown: statusBreakdown,
      connections_by_day: connectionsByDay,
    },
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 14));

  const { rows: connectionsByDay } = await pool.query(
    `SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'success')::int AS success,
            COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
            COUNT(*) FILTER (WHERE status = 'blocked')::int AS blocked
     FROM connections
     WHERE created_at >= now() - ($1 || ' days')::interval
     GROUP BY day ORDER BY day ASC`,
    [days]
  );

  const { rows: topIps } = await pool.query(
    `SELECT ip_address, COUNT(*)::int AS total, MAX(created_at) AS last_seen
     FROM connections
     WHERE created_at >= now() - ($1 || ' days')::interval
     GROUP BY ip_address ORDER BY total DESC LIMIT 10`,
    [days]
  );

  const { rows: topUsers } = await pool.query(
    `SELECT u.name, u.email, COUNT(c.id)::int AS total
     FROM connections c JOIN users u ON u.id = c.user_id
     WHERE c.created_at >= now() - ($1 || ' days')::interval
     GROUP BY u.id, u.name, u.email ORDER BY total DESC LIMIT 10`,
    [days]
  );

  const { rows: eventsByType } = await pool.query(
    `SELECT event_type, COUNT(*)::int AS total
     FROM security_events
     WHERE created_at >= now() - ($1 || ' days')::interval
     GROUP BY event_type ORDER BY total DESC`,
    [days]
  );

  const { rows: statusBreakdown } = await pool.query(
    `SELECT status, COUNT(*)::int AS total FROM connections GROUP BY status`
  );

  res.json({ analytics: { connectionsByDay, topIps, topUsers, eventsByType, statusBreakdown } });
});

module.exports = { getStatistics, getAnalytics };
