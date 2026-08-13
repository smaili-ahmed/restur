const pool = require('../config/db');

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createConnection(userId, ip, userAgent, status) {
  const { rows } = await pool.query(
    `INSERT INTO connections (user_id, ip_address, user_agent, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, ip, userAgent, status]
  );
  return rows[0];
}

async function isIpBlocked(ip) {
  const { rows } = await pool.query(
    'SELECT * FROM blocked_ips WHERE ip_address = $1 AND unblocked_at IS NULL',
    [ip]
  );
  return rows[0] || null;
}

async function addSecurityEvent(userId, ip, eventType, description) {
  const { rows } = await pool.query(
    `INSERT INTO security_events (user_id, ip_address, event_type, description)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, ip, eventType, description]
  );
  return rows[0];
}

module.exports = { findUserByEmail, findUserById, createConnection, isIpBlocked, addSecurityEvent };
