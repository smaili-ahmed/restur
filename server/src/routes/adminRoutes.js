const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/statistics', authRequired, adminRequired, adminController.getStatistics);
router.get('/analytics', authRequired, adminRequired, adminController.getAnalytics);

module.exports = router;
