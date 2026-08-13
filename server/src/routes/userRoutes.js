const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/', authRequired, adminRequired, userController.getUsers);

module.exports = router;
