const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimit');
const { validate, ipRequest } = require('../middleware/validation');

router.post(
  '/request-otp',
  ipRequest,
  loginLimiter,
  validate([
    body('email').trim().isEmail().withMessage('A valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ]),
  authController.requestOtp
);

router.post(
  '/verify-otp',
  ipRequest,
  otpLimiter,
  validate([
    body('pendingToken').isString().withMessage('A pending token is required.'),
    body('code').matches(/^\d{6}$/).withMessage('The code must be 6 digits.'),
  ]),
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  ipRequest,
  otpLimiter,
  validate([body('pendingToken').isString().withMessage('A pending token is required.')]),
  authController.resendOtp
);

router.post('/refresh', authController.refresh);
router.get('/me', authRequired, authController.me);
router.post('/logout', authRequired, authController.logout);

router.post(
  '/forgot-password',
  ipRequest,
  loginLimiter,
  validate([body('email').trim().isEmail().withMessage('A valid email is required.')]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  ipRequest,
  otpLimiter,
  validate([
    body('pendingToken').isString().withMessage('A pending token is required.'),
    body('code').matches(/^\d{6}$/).withMessage('The code must be 6 digits.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ]),
  authController.resetPassword
);

module.exports = router;
