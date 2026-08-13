const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const securityEventController = require('../controllers/securityEventController');

router.get('/', authRequired, adminRequired, securityEventController.getSecurityEvents);

module.exports = router;
