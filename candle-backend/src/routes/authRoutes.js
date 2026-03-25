const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile,
  changePassword,
  deleteAccount,
  searchUsers
} = require('../controllers/authController');
const { validateRegistration, validateLogin, validateProfileUpdate } = require('../validators/authValidators');
const handleValidationErrors = require('../middleware/validate');
const authenticateToken = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// Public routes
router.post('/register', authLimiter, validateRegistration, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);
router.get('/search-users', authenticateToken, searchUsers);

module.exports = router;