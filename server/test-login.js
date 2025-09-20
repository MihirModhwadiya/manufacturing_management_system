// Simple test script to check login functionality directly
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

console.log('🔗 Connecting to MongoDB...');
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manufacture-erp');

try {
  console.log('🔍 Testing login process...');
  
  // Find admin user
  const user = await User.findOne({ email: 'admin@company.com' });
  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }
  
  console.log('✅ User found:', user.name);
  console.log('   Email:', user.email);
  console.log('   Role:', user.role);
  console.log('   Verified:', user.isVerified);
  console.log('   Active:', user.isActive);
  
  // Test password comparison
  const isValidPassword = await bcrypt.compare('Admin@123', user.password);
  console.log('   Password valid:', isValidPassword ? '✅' : '❌');
  
  if (!isValidPassword) {
    console.log('❌ Password validation failed');
    process.exit(1);
  }
  
  // Test JWT creation
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-testing';
  console.log('   JWT Secret exists:', !!jwtSecret);
  
  try {
    const token = jwt.sign({ 
      id: user._id,
      email: user.email,
      role: user.role
    }, jwtSecret, { expiresIn: '24h' });
    
    console.log('✅ JWT token created successfully');
    console.log('   Token length:', token.length);
    
    // Test user response object
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin
    };
    
    console.log('✅ User response object created:', JSON.stringify(userResponse, null, 2));
    
  } catch (jwtError) {
    console.error('❌ JWT Error:', jwtError.message);
  }
  
} catch (error) {
  console.error('❌ Test Error:', error.message);
  console.error('Stack:', error.stack);
} finally {
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
}