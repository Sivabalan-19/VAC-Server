const express = require('express');

const controllers = require('../controllers/controllers');
const { authenticateToken } = require('../middlewares/middleware');

const router = express.Router();

router.post('/register', controllers.register);
router.post('/login', controllers.login);
router.get('/me', authenticateToken, controllers.me);

module.exports = router;
