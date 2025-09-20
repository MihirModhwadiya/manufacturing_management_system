// Create a fresh admin user with known password
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createFreshAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth');
    console.log('📡 Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@company.com' });
    console.log('🗑️ Deleted existing admin user');

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed');

    // Create new admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@company.com',
      passwordHash: passwordHash,
      role: 'admin',
      avatar: 'SA',
      department: 'IT',
      employeeId: 'EMP001',
      isActive: true,
      isVerified: true
    });

    console.log('✅ Fresh admin user created:');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('   Name:', adminUser.name);
    console.log('   Role:', adminUser.role);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('💾 Database connection closed');
  }
};

createFreshAdmin();