import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data to check if account is still active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated.' });
    }

    // Attach user data to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Middleware to authorize specific roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Helper function to check if user has admin privileges
export const requireAdmin = authorizeRoles('admin');

// Helper function to check if user has manager or admin privileges
export const requireManagerOrAdmin = authorizeRoles('admin', 'manager');

// Helper function to check if user has any management role
export const requireManagement = authorizeRoles('admin', 'manager');

// Helper function to check if user can access manufacturing operations
export const requireManufacturingAccess = authorizeRoles('admin', 'manager', 'operator');

// Helper function to check if user can access inventory operations
export const requireInventoryAccess = authorizeRoles('admin', 'manager', 'inventory');