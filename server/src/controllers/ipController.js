const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const pool = require('../config/db');
const { normalizeIp, isPrivateIp } = require('../utils/ipDetection');
const { addSecurityEvent } = require('../services/securityService');

const getIps = asyncHandler(async (req, res) => {
  const { q, status, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];
  const clampPage = Math.max(1, parseInt(page, 10) || 1);
  const clampLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  if (q) {
    params.push(`%${q}%`);
    conditions.push(`ip.ip_address ILIKE $${params.length}`);
  }
  if (status === 'blocked') conditions.push(`b.ip_address IS NOT NULL`);
  if (status === 'allowed') conditions.push(`b.ip_address IS NULL`);
  if (status === 'failed') {
    params.push('failed');
    conditions.push(`EXISTS (SELECT 1 FROM connections c WHERE c.ip_address = ip.ip_address AND c.status = $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const baseFrom = `
    FROM connections ip
    LEFT JOIN connections c ON c.ip_address = ip.ip_address
    LEFT JOIN blocked_ips b ON b.ip_address = ip.ip_address AND b.unblocked_at IS NULL
    LEFT JOIN users bu ON bu.id = b.blocked_by`;

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM (SELECT ip.ip_address ${baseFrom} ${where} GROUP BY ip.ip_address, b.id, b.reason, b.blocked_at, bu.name) t`,
    params
  );

  const offset = (clampPage - 1) * clampLimit;
  const { rows } = await pool.query(
    `SELECT ip.ip_address,
            COUNT(c.id)::int AS connection_count,
            MAX(c.created_at) AS last_seen,
            (SELECT u.name FROM connections c2 JOIN users u ON u.id = c2.user_id
              WHERE c2.ip_address = ip.ip_address AND c2.user_id IS NOT NULL
              ORDER BY c2.created_at DESC LIMIT 1) AS last_user,
            b.id AS blocked_id, b.reason AS block_reason, b.blocked_at,
            bu.name AS blocked_by_name
     ${baseFrom}
     ${where}
     GROUP BY ip.ip_address, b.id, b.reason, b.blocked_at, bu.name
     ORDER BY MAX(c.created_at) DESC
     LIMIT ${clampLimit} OFFSET ${offset}`,
    params
  );

  const total = countRows[0].total;
  const ips = rows.map((r) => ({
    ip_address: r.ip_address,
    connection_count: r.connection_count,
    last_seen: r.last_seen,
    last_user: r.last_user,
    status: r.blocked_id ? 'blocked' : 'allowed',
    block_reason: r.block_reason,
    blocked_at: r.blocked_at,
    blocked_by: r.blocked_by_name,
  }));

  res.json({ ips, pagination: { page: clampPage, limit: clampLimit, total, pages: Math.ceil(total / clampLimit) } });
});

const getBlockedIps = asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT b.ip_address, b.reason, b.blocked_at, u.name AS blocked_by_name
     FROM blocked_ips b LEFT JOIN users u ON u.id = b.blocked_by
     WHERE b.unblocked_at IS NULL
     ORDER BY b.blocked_at DESC`
  );
  res.json({ blockedIps: rows });
});

const blockIp = asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const { reason } = req.body;
  const normalized = normalizeIp(ip);
  if (!normalized) throw new AppError('Invalid IP address.', 422, 'VALIDATION_ERROR');
  if (isPrivateIp(normalized)) throw new AppError('Cannot block a private/local IP.', 422, 'VALIDATION_ERROR');

  const { rows } = await pool.query(
    `INSERT INTO blocked_ips (ip_address, reason, blocked_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (ip_address)
     DO UPDATE SET reason = EXCLUDED.reason, blocked_by = EXCLUDED.blocked_by,
                   blocked_at = now(), unblocked_at = NULL
     RETURNING ip_address, reason, blocked_at`,
    [normalized, (reason || 'Blocked by administrator').slice(0, 300), req.user.id]
  );
  await addSecurityEvent(req.user.id, normalized, 'IP_BLOCKED', `IP ${normalized} blocked`);
  res.json({ blockedIp: rows[0] });
});

const unblockIp = asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const normalized = normalizeIp(ip);
  if (!normalized) throw new AppError('Invalid IP address.', 422, 'VALIDATION_ERROR');

  const { rows } = await pool.query(
    `UPDATE blocked_ips SET unblocked_at = now()
     WHERE ip_address = $1 AND unblocked_at IS NULL
     RETURNING ip_address`,
    [normalized]
  );
  if (rows.length === 0) throw new AppError('IP was not blocked.', 404, 'NOT_FOUND');
  await addSecurityEvent(req.user.id, normalized, 'IP_UNBLOCKED', `IP ${normalized} unblocked`);
  res.json({ message: 'IP unblocked.', ip: rows[0].ip_address });
});

module.exports = { getIps, getBlockedIps, blockIp, unblockIp };
