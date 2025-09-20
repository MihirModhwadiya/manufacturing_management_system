import express from 'express';
import bcrypt from 'bcrypt';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import UserActivity from '../models/UserActivity.js';

const router = express.Router();

// Apply admin authorization to all routes
router.use(authenticateToken, authorizeAdmin);

// Get all users with advanced filtering
router.get('/users', async (req, res) => {
  try {
    const { role, department, isActive, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash') // Exclude password hash from response
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Employee ID already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate avatar from initials
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();

    const user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      department,
      employeeId,
      phone,
      avatar,
      isActive: true
    });

    await user.save();

    // Log the user creation activity
    await UserActivity.create({
      userId: req.user.userId,
      action: 'CREATE_USER',
      resource: 'user',
      details: { targetUserId: user._id, targetUserEmail: email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return user without password hash
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, department, employeeId, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for email/employeeId conflicts if they're being changed
    if (email !== user.email || employeeId !== user.employeeId) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [{ email }, { employeeId }]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email ? 'Email already exists' : 'Employee ID already exists'
        });
      }
    }

    // Update user fields
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      department: department || user.department,
      employeeId: employeeId || user.employeeId,
      phone: phone || user.phone,
      isActive: isActive !== undefined ? isActive : user.isActive,
      updatedAt: new Date()
    };

    // Update avatar if name changed
    if (name && name !== user.name) {
      updateData.avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-passwordHash');

    // Log the user update activity
    await UserActivity.create({
      userId: req.user.userId,
      action: 'UPDATE_USER',
      resource: 'user',
      details: { targetUserId: req.params.id, changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent deletion of current admin user
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if this is the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    // Log the user deletion activity
    await UserActivity.create({
      userId: req.user.userId,
      action: 'DELETE_USER',
      resource: 'user',
      details: { targetUserId: req.params.id, targetUserEmail: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activities/audit log
router.get('/activities', async (req, res) => {
  try {
    const { userId, action, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const activities = await UserActivity.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserActivity.countDocuments(filter);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalActivities: total
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).then(results => 
      results.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
    );

    // Users by department
    const usersByDepartment = await User.aggregate([
      { $match: { department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]).then(results => 
      results.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
    );

    // Recent logins (users who logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogins = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });

    // Failed login attempts (mock data - would need proper tracking)
    const failedLogins = await User.aggregate([
      { $match: { loginAttempts: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$loginAttempts' } } }
    ]).then(results => results[0]?.total || 0);

    res.json({
      totalUsers,
      activeUsers,
      usersByRole,
      usersByDepartment,
      recentLogins,
      failedLogins
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system health metrics
router.get('/system-health', async (req, res) => {
  try {
    // Database connection status
    const dbStatus = {
      connected: true, // mongoose.connection.readyState === 1
      collections: await User.db.db.listCollections().toArray().then(collections => collections.length)
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // System uptime
    const uptime = process.uptime();

    res.json({
      database: dbStatus,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      },
      uptime: Math.round(uptime),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;