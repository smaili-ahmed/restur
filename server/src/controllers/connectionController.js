const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

const getMyConnections = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, ip_address, user_agent, status, created_at
     FROM connections
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user.id]
  );
  res.json({ connections: rows });
});

const getAllConnections = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    ip,
    userId,
    from,
    to,
    sortBy = 'created_at',
    sortDir = 'desc',
  } = req.query;

  const conditions = [];
  const params = [];
  const clampPage = Math.max(1, parseInt(page, 10) || 1);
  const clampLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  if (status) {
    params.push(status);
    conditions.push(`c.status = $${params.length}`);
  }
  if (ip) {
    params.push(`%${ip}%`);
    conditions.push(`c.ip_address ILIKE $${params.length}`);
  }
  if (userId) {
    params.push(userId);
    conditions.push(`c.user_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`c.created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`c.created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSort = { created_at: 'c.created_at', ip_address: 'c.ip_address', status: 'c.status' };
  const orderCol = allowedSort[sortBy] || 'c.created_at';
  const orderDir = sortDir === 'asc' ? 'ASC' : 'DESC';

  const offset = (clampPage - 1) * clampLimit;
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM connections c ${where}`,
    params
  );
  const total = countRows[0].total;

  const { rows } = await pool.query(
    `SELECT c.id, c.ip_address, c.user_agent, c.status, c.created_at,
            u.name AS user_name, u.email AS user_email
     FROM connections c
     LEFT JOIN users u ON u.id = c.user_id
     ${where}
     ORDER BY ${orderCol} ${orderDir}
     LIMIT ${clampLimit} OFFSET ${offset}`,
    params
  );

  res.json({
    connections: rows,
    pagination: { page: clampPage, limit: clampLimit, total, pages: Math.ceil(total / clampLimit) },
  });
});

const getConnectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT c.*, u.name AS user_name, u.email AS user_email
     FROM connections c LEFT JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [id]
  );
  if (!rows[0]) {
    const AppError = require('../utils/AppError');
    throw new AppError('Connection not found.', 404, 'NOT_FOUND');
  }
  res.json({ connection: rows[0] });
});

module.exports = { getMyConnections, getAllConnections, getConnectionById };
