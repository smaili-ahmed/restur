const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.', code: 'RATE_LIMITED' },
  skipSuccessfulRequests: true,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new AppError('Too many requests. Slow down.', 429, 'RATE_LIMITED')),
});

const blockLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new AppError('Too many requests. Slow down.', 429, 'RATE_LIMITED')),
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many code attempts. Please try again later.', code: 'RATE_LIMITED' },
  skipSuccessfulRequests: true,
});

module.exports = { loginLimiter, apiLimiter, blockLimiter, otpLimiter };
