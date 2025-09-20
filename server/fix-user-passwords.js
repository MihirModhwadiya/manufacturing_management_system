import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixUserPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Users to fix with their correct passwords
    const usersToFix = [
      { email: 'admin@company.com', password: 'Admin@123' },
      { email: 'manager@company.com', password: 'Manager@123' },
      { email: 'operator@company.com', password: 'Operator@123' },
      { email: 'inventory@company.com', password: 'Inventory@123' }
    ];

    for (const userData of usersToFix) {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        // Hash the correct password
        const passwordHash = await bcrypt.hash(userData.password, 10);
        
        // Update user with correct passwordHash
        await User.findByIdAndUpdate(user._id, { passwordHash: passwordHash });
        console.log(`✅ Fixed password for ${userData.email}`);
      } else {
        console.log(`❌ User ${userData.email} not found`);
      }
    }

    console.log('🎉 All user passwords fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
};

fixUserPasswords();