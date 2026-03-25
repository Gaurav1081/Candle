const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already taken' 
      });
    }

    // Hash password with higher salt rounds
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Log successful registration
    console.log(`✅ New user registered: ${username} (${email})`);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        stats: user.stats,
        vsStats: user.vsStats,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ],
      isActive: true
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Log successful login
    console.log(`✅ User logged in: ${user.username}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        stats: user.stats,
        vsStats: user.vsStats,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        avatar: req.user.avatar,
        stats: req.user.stats,
        vsStats: req.user.vsStats,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    
    if (fullName) req.user.fullName = fullName;
    if (avatar !== undefined) req.user.avatar = avatar;
    
    await req.user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        avatar: req.user.avatar,
        stats: req.user.stats,
        vsStats: req.user.vsStats,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Change user password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, req.user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'New password must be different from current password' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    req.user.password = hashedPassword;
    await req.user.save();

    // Log password change
    console.log(`🔒 Password changed for user: ${req.user.username}`);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

/**
 * Delete user account
 * DELETE /api/auth/account
 */
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Validate password is provided
    if (!password) {
      return res.status(400).json({ 
        message: 'Password is required to delete account' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Password is incorrect' 
      });
    }

    const userId = req.user._id;
    const username = req.user.username;
    const email = req.user.email;

    // Soft delete - set isActive to false instead of actually deleting
    // This preserves data integrity for predictions, VS matches, etc.
    req.user.isActive = false;
    await req.user.save();

    // Alternative: Hard delete (uncomment if you want to actually delete the user)
    // await User.findByIdAndDelete(userId);
    
    // Note: You might want to also delete or anonymize related data:
    // - Predictions
    // - Community posts
    // - VS matches
    // This should be done in a transaction or with proper cascade logic

    // Log account deletion
    console.log(`🗑️ Account deleted: ${username} (${email})`);

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error during account deletion' });
  }
};

/**
 * Search users by username
 * GET /api/auth/search-users?q=username
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }
    
    // Search for users whose username starts with the query (case-insensitive)
    const users = await User.find({
      username: { $regex: `^${q}`, $options: 'i' },
      isActive: true
    })
    .select('_id username fullName email avatar')
    .limit(10);
    
    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
};

module.exports = { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile,
  changePassword,
  deleteAccount,
  searchUsers
};