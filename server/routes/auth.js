import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import { authenticateToken, authorizeRoles, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper: send email
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  const mailOptions = {
    from: `"MERN Auth App" <${process.env.EMAIL_FROM}>`,
    to: to,
    subject: subject,
    html: html
  };
  
  await transporter.sendMail(mailOptions);
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role = 'operator' } = req.body;
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required.' });
    }
    
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'operator', 'inventory'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate avatar initials
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    const user = await User.create({ 
      name, 
      email, 
      passwordHash, 
      role,
      avatar,
      isVerified: false 
    });
    
    // Email verification token
    const emailToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verifyLink = `${process.env.CLIENT_URL}/verify/${emailToken}`;
    
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Welcome to ManufactureERP!</h2>
        <p>Thank you for signing up. Your account has been created with the role: <strong>${role}</strong></p>
        <p>Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link: ${verifyLink}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `;
    
    await sendEmail(email, 'Verify your account - ManufactureERP', emailHtml);
    res.status(201).json({ 
      message: 'Signup successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Email verification
router.get('/verify/:token', async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=invalid-link`);
    }
    
    if (user.isVerified) {
      return res.redirect(`${process.env.CLIENT_URL}/login?message=already-verified`);
    }
    
    user.isVerified = true;
    await user.save();
    res.redirect(`${process.env.CLIENT_URL}/login?message=verified`);
  } catch (error) {
    console.error('Verification error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=expired-link`);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Optional role validation - if role is provided, it must match
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. Expected role: ${user.role}` });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Enhanced JWT payload with role information
    const token = jwt.sign({ 
      id: user._id,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        employeeId: user.employeeId,
        lastLogin: user.lastLogin
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Forgot password
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email required.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found.' });
    }
    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.CLIENT_URL}/reset/${resetToken}`;
    
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your MERN Auth App account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link: ${resetLink}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `;
    
    await sendEmail(email, 'Password Reset - MERN Auth App', emailHtml);
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Reset password
router.post('/reset/:token', async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const { password, confirmPassword } = req.body;
    
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset link.' });
    }
    
    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
    
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired reset link.' });
  }
});

// Get current user profile (Protected)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        employeeId: user.employeeId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update user profile (Protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, department, employeeId } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (employeeId) updateData.employeeId = employeeId;

    // Generate new avatar if name changed
    if (name) {
      updateData.avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true }
    ).select('-passwordHash');

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Change password (Protected)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user.id);
    const validCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!validCurrentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { passwordHash: newPasswordHash });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create user (Admin only)
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const validRoles = ['admin', 'manager', 'operator', 'inventory'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      avatar,
      department,
      employeeId,
      isVerified: true, // Admin-created users are auto-verified
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        employeeId: user.employeeId,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;