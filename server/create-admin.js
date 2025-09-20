// Quick script to create a verified admin user for testing
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

console.log('🔗 Connecting to MongoDB...');
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manufacture-erp');

try {
  // First, let's check if the admin user exists and what fields it has
  const existingAdmin = await User.findOne({ email: 'admin@company.com' });
  console.log('📋 Existing admin user:', existingAdmin ? 'Found' : 'Not found');
  
  // Create or update admin user with correct password field
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const adminUser = await User.findOneAndUpdate(
    { email: 'admin@company.com' },
    {
      name: 'Admin User',
      email: 'admin@company.com', 
      password: hashedPassword, // Using 'password' field consistently
      role: 'admin',
      isActive: true,
      isVerified: true // Make sure admin is verified
    },
    { 
      upsert: true, // Create if doesn't exist
      new: true,
      setDefaultsOnInsert: true 
    }
  );

  console.log('✅ Admin user created/updated successfully:');
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log(`   Verified: ${adminUser.isVerified}`);
  console.log(`   Active: ${adminUser.isActive}`);
  console.log(`   Password field exists: ${!!adminUser.password}`);
  
  // Test password verification
  const isPasswordValid = await bcrypt.compare('Admin@123', adminUser.password);
  console.log(`   Password verification test: ${isPasswordValid ? '✅ PASS' : '❌ FAIL'}`);
  
} catch (error) {
  console.error('❌ Error creating admin user:', error);
} finally {
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
}