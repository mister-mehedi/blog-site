const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, updatePassword } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validator');
const authenticateUser = require('../middleware/authentication');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

// Authenticated routes
router.delete('/logout', authenticateUser, logout); // Correctly protecting logout now
router.patch('/updatePassword', authenticateUser, updatePassword); // The route that was missing

module.exports = router;
