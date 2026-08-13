const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const connectionController = require('../controllers/connectionController');

router.get('/mine', authRequired, connectionController.getMyConnections);
router.get('/', authRequired, adminRequired, connectionController.getAllConnections);
router.get('/:id', authRequired, adminRequired, connectionController.getConnectionById);

module.exports = router;
