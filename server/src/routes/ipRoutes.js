const router = require('express').Router();
const { body } = require('express-validator');
const { authRequired, adminRequired } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { blockLimiter } = require('../middleware/rateLimit');
const ipController = require('../controllers/ipController');

router.get('/', authRequired, adminRequired, ipController.getIps);
router.get('/blocked', authRequired, adminRequired, ipController.getBlockedIps);
router.post(
  '/:ip/block',
  authRequired,
  adminRequired,
  blockLimiter,
  validate([body('reason').optional().isLength({ max: 300 }).withMessage('Reason too long.')]),
  ipController.blockIp
);
router.delete('/:ip/block', authRequired, adminRequired, ipController.unblockIp);

module.exports = router;
