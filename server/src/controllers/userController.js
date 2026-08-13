const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

const getUsers = asyncHandler(async (req, res) => {
  const { q, role, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];
  const clampPage = Math.max(1, parseInt(page, 10) || 1);
  const clampLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }
  if (role) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM users u ${where}`,
    params
  );
  const offset = (clampPage - 1) * clampLimit;

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
            (SELECT COUNT(*)::int FROM connections c WHERE c.user_id = u.id) AS connection_count,
            (SELECT MAX(c.created_at) FROM connections c WHERE c.user_id = u.id) AS last_connection,
            (SELECT c.ip_address FROM connections c WHERE c.user_id = u.id ORDER BY c.created_at DESC LIMIT 1) AS last_ip
     FROM users u
     ${where}
     ORDER BY u.created_at DESC
     LIMIT ${clampLimit} OFFSET ${offset}`,
    params
  );

  res.json({ users: rows, pagination: { page: clampPage, limit: clampLimit, total: countRows[0].total, pages: Math.ceil(countRows[0].total / clampLimit) } });
});

module.exports = { getUsers };
