const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const { findUserById } = require('../services/securityService');
const asyncHandler = require('../utils/asyncHandler');

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpires,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpires,
  });

const signOtpToken = (user, ip) =>
  jwt.sign({ sub: user.id, type: 'otp', ip }, config.jwt.secret, {
    expiresIn: `${config.otp.expiresMinutes}m`,
  });

const authRequired = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    throw new AppError('Session expired or invalid.', 401, 'UNAUTHORIZED');
  }

  const user = await findUserById(payload.sub);
  if (!user) throw new AppError('User not found.', 401, 'UNAUTHORIZED');
  req.user = user;
  req.tokenPayload = payload;
  next();
});

const adminRequired = (req, _res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden. Administrator access required.', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = { signAccessToken, signRefreshToken, signOtpToken, authRequired, adminRequired };
