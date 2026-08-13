const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

const getSecurityEvents = asyncHandler(async (req, res) => {
  const { type, q, page = 1, limit = 30 } = req.query;
  const conditions = [];
  const params = [];
  const clampPage = Math.max(1, parseInt(page, 10) || 1);
  const clampLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

  if (type) {
    params.push(type);
    conditions.push(`e.event_type = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(e.description ILIKE $${params.length} OR e.ip_address ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM security_events e ${where}`,
    params
  );
  const offset = (clampPage - 1) * clampLimit;
  const { rows } = await pool.query(
    `SELECT e.id, e.ip_address, e.event_type, e.description, e.created_at,
            u.name AS user_name, u.email AS user_email
     FROM security_events e LEFT JOIN users u ON u.id = e.user_id
     ${where}
     ORDER BY e.created_at DESC
     LIMIT ${clampLimit} OFFSET ${offset}`,
    params
  );
  res.json({ events: rows, pagination: { page: clampPage, limit: clampLimit, total: countRows[0].total, pages: Math.ceil(countRows[0].total / clampLimit) } });
});

module.exports = { getSecurityEvents };
