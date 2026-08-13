const AppError = require('../utils/AppError');

const ipRequest = (req, _res, next) => {
  const { detectClientIp } = require('../utils/ipDetection');
  req.clientIp = detectClientIp(req);
  next();
};

const validate = (schema) => (req, _res, next) => {
  const { validationResult } = require('express-validator');
  for (const rule of schema) rule(req, _res, (err) => { if (err) throw err; });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return next(new AppError(first.msg, 422, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

module.exports = { ipRequest, validate };
