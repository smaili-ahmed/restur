const crypto = require('crypto');
const pool = require('../config/db');
const config = require('../config');

const hashCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const generateCode = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, '0');

async function saveOtp(userId, email, purpose = 'login') {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + config.otp.expiresMinutes * 60 * 1000);
  const { rows } = await pool.query(
    `INSERT INTO otp_codes (user_id, email, purpose, code_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, email, purpose, hashCode(code), expiresAt]
  );
  return { id: rows[0].id, code };
}

async function consumeOtp(userId, code, purpose = 'login') {
  const { rows } = await pool.query(
    `SELECT id, code_hash, attempts, expires_at, used_at
     FROM otp_codes
     WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, purpose]
  );
  const otp = rows[0];
  if (!otp) return { ok: false, reason: 'NO_CODE' };
  if (otp.expires_at < new Date()) return { ok: false, reason: 'EXPIRED' };
  if (otp.attempts >= config.otp.maxAttempts) return { ok: false, reason: 'TOO_MANY' };

  if (crypto.timingSafeEqual(Buffer.from(otp.code_hash), Buffer.from(hashCode(code)))) {
    await pool.query(
      `UPDATE otp_codes SET used_at = now() WHERE id = $1`,
      [otp.id]
    );
    return { ok: true };
  }

  await pool.query(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, [otp.id]);
  return { ok: false, reason: 'WRONG_CODE', remaining: config.otp.maxAttempts - otp.attempts - 1 };
}

async function cleanupExpired() {
  await pool.query(`DELETE FROM otp_codes WHERE expires_at < now() OR used_at IS NOT NULL`);
}

module.exports = { saveOtp, consumeOtp, cleanupExpired, generateCode, hashCode };
