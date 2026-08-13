const AppError = require('../utils/AppError');

const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404, 'NOT_FOUND'));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let { statusCode, message, code, details } = err;
  if (!err.isOperational) {
    console.error('[error]', err);
    statusCode = statusCode || 500;
    code = code || 'SERVER_ERROR';
    message = 'Server temporarily unavailable.';
  }

  const body = { message, code };
  if (details) body.details = details;
  res.status(statusCode).json(body);
};

module.exports = { notFoundHandler, errorHandler };
