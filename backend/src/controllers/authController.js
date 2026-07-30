const bcrypt = require('bcrypt');
const Admin = require('../models/Admin.model');
const { signToken } = require('../config/jwt');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      const minutes = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account locked. Try again in ${minutes} minute(s)`
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      admin.failedLoginAttempts += 1;

      if (admin.failedLoginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        admin.failedLoginAttempts = 0;
      }

      await admin.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    const token = signToken({ id: admin._id, username: admin.username });

    res.json({
      message: 'Login successful',
      token,
      admin: { id: admin._id, username: admin.username }
    });

  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.admin.id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, changePassword };
