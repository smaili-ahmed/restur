const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  signOtpToken,
} = require('../middleware/auth');
const {
  findUserByEmail,
  findUserById,
  createConnection,
  isIpBlocked,
  addSecurityEvent,
} = require('../services/securityService');
const { saveOtp, consumeOtp } = require('../services/otpService');
const { sendOtpEmail } = require('../services/emailService');
const { detectClientIp } = require('../utils/ipDetection');

const requestOtp = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = detectClientIp(req);
  const userAgent = (req.headers['user-agent'] || 'unknown').slice(0, 500);

  let user = await findUserByEmail(email);
  if (!user) {
    const name = email.split('@')[0];
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await require('../config/db').query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, password_hash, role`,
      [name, email, hash]
    );
    user = rows[0];
    await addSecurityEvent(null, ip, 'ACCOUNT_CREATED', `New account created for ${email}`);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    await addSecurityEvent(user.id, ip, 'LOGIN_FAILED', 'Wrong password');
    await createConnection(user.id, ip, userAgent, 'failed');
    throw new AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS');
  }

  const blocked = await isIpBlocked(ip);
  if (blocked) {
    await addSecurityEvent(user.id, ip, 'LOGIN_BLOCKED', `IP blocked: ${blocked.reason}`);
    await createConnection(user.id, ip, userAgent, 'blocked');
    const err = new AppError('Your IP address has been blocked.', 403, 'IP_BLOCKED');
    err.details = { ip };
    throw err;
  }

  const { code } = await saveOtp(user.id, user.email, 'login');
  await sendOtpEmail(user.email, code, user.name);
  await addSecurityEvent(user.id, ip, 'OTP_SENT', `Verification code sent to ${user.email}`);

  const pendingToken = signOtpToken(user, ip);
  res.json({
    message: 'Verification code sent to your email.',
    pendingToken,
    email: user.email,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { pendingToken, code } = req.body;
  const ip = detectClientIp(req);
  const userAgent = (req.headers['user-agent'] || 'unknown').slice(0, 500);

  let payload;
  try {
    payload = jwt.verify(pendingToken, config.jwt.secret);
  } catch {
    throw new AppError('Session expired. Please log in again.', 401, 'OTP_TOKEN_INVALID');
  }
  if (payload.type !== 'otp') throw new AppError('Invalid token.', 401, 'OTP_TOKEN_INVALID');
  if (payload.ip && payload.ip !== ip) {
    throw new AppError('Session IP mismatch. Please log in again.', 401, 'IP_MISMATCH');
  }

  const user = await findUserById(payload.sub);
  if (!user) throw new AppError('User not found.', 401, 'UNAUTHORIZED');

  const result = await consumeOtp(user.id, code, 'login');
  if (!result.ok) {
    const map = {
      NO_CODE: ['No code requested. Please log in again.', 401, 'OTP_MISSING'],
      EXPIRED: ['Code expired. Please request a new one.', 401, 'OTP_EXPIRED'],
      TOO_MANY: ['Too many attempts. Please request a new code.', 429, 'OTP_LIMIT'],
      WRONG_CODE: [`Incorrect code${result.remaining >= 0 ? ` (${result.remaining} attempts left)` : ''}.`, 401, 'OTP_INVALID'],
    };
    const [message, status, codeOut] = map[result.reason];
    throw new AppError(message, status, codeOut);
  }

  await createConnection(user.id, ip, userAgent, 'success');
  await addSecurityEvent(user.id, ip, 'LOGIN_SUCCESS', 'Successful login');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ip,
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { pendingToken } = req.body;
  const ip = detectClientIp(req);

  let payload;
  try {
    payload = jwt.verify(pendingToken, config.jwt.secret);
  } catch {
    throw new AppError('Session expired. Please log in again.', 401, 'OTP_TOKEN_INVALID');
  }
  if (payload.type !== 'otp') throw new AppError('Invalid token.', 401, 'OTP_TOKEN_INVALID');

  const user = await findUserById(payload.sub);
  if (!user) throw new AppError('User not found.', 401, 'UNAUTHORIZED');

  const { code } = await saveOtp(user.id, user.email, 'login');
  await sendOtpEmail(user.email, code, user.name);
  await addSecurityEvent(user.id, ip, 'OTP_SENT', `Resent verification code to ${user.email}`);

  res.json({
    message: 'A new code has been sent.',
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refresh_token } = req.cookies;
  if (!refresh_token) throw new AppError('No refresh token.', 401, 'UNAUTHORIZED');
  let payload;
  try {
    payload = jwt.verify(refresh_token, config.jwt.secret);
  } catch {
    throw new AppError('Invalid refresh token.', 401, 'UNAUTHORIZED');
  }
  if (payload.type !== 'refresh') throw new AppError('Invalid token type.', 401, 'UNAUTHORIZED');
  const user = await findUserById(payload.sub);
  if (!user) throw new AppError('User not found.', 401, 'UNAUTHORIZED');
  res.json({ accessToken: signAccessToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

const me = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await findUserById(id);
  const ip = detectClientIp(req);
  const blocked = await isIpBlocked(ip);

  const { rows: lastConnections } = await require('../config/db').query(
    `SELECT ip_address, status, user_agent, created_at FROM connections
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [id]
  );

  res.json({
    user,
    ip,
    ipBlocked: !!blocked,
    lastConnection: lastConnections[0] || null,
  });
});

const logout = asyncHandler(async (req, res) => {
  const ip = detectClientIp(req);
  if (req.user) {
    await addSecurityEvent(req.user.id, ip, 'LOGOUT', 'User logged out');
  }
  res.clearCookie('refresh_token', { path: '/api/auth' });
  res.json({ message: 'Logged out.' });
});

module.exports = { requestOtp, verifyOtp, resendOtp, refresh, me, logout };
