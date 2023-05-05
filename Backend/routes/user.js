const express = require('express');
const userCtrl = require('../controllers/User')
const router = express.Router();

router.post('/api/auth/signup', userCtrl.signUp);
router.post('/api/auth/login', userCtrl.login);

module.exports = router;