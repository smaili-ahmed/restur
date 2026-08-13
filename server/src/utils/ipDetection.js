const net = require('net');

const PRIVATE_IPV4_RE =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/;
const PRIVATE_IPV6_RE = /^(::1|fc|fd|fe8|fe9|fea|feb|ff)/i;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return PRIVATE_IPV4_RE.test(ip);
  if (net.isIPv6(ip)) return PRIVATE_IPV6_RE.test(ip);
  return true;
}

function normalizeIp(raw) {
  if (!raw) return null;
  let ip = String(raw).trim();
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  if (ip === '::1') ip = '127.0.0.1';
  if (net.isIP(ip) === 0) return null;
  return ip;
}

/**
 * Best-effort client IP extraction.
 * Priority: CF-Connecting-IP (only if not client-controlled in dev) ->
 * X-Forwarded-For (walk from left, skip client-provided / private entries) ->
 * socket remote address.
 */
function detectClientIp(req, options = {}) {
  const trustXff = options.trustXff !== false;

  if (trustXff) {
    const cf = req.headers['cf-connecting-ip'];
    if (cf) {
      const ip = normalizeIp(cf.split(',')[0]);
      if (ip) return ip;
    }
  }

  const xff = req.headers['x-forwarded-for'];
  if (trustXff && xff) {
    const parts = xff.split(',').map((p) => p.trim());
    for (const part of parts) {
      const ip = normalizeIp(part);
      if (ip && !isPrivateIp(ip)) return ip;
    }
    const first = normalizeIp(parts[0]);
    if (first) return first;
  }

  const fallback = normalizeIp(req.socket && req.socket.remoteAddress);
  if (fallback) return fallback;

  const viaReq = normalizeIp(req.ip);
  if (viaReq) return viaReq;

  return 'unknown';
}

module.exports = { detectClientIp, normalizeIp, isPrivateIp };
