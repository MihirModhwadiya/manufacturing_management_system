import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUserStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'email isVerified isActive role');
    console.log('User status check:');
    users.forEach(user => {
      console.log(`${user.email} - Verified: ${user.isVerified}, Active: ${user.isActive}, Role: ${user.role}`);
    });

    // Ensure all users are verified and active
    await User.updateMany({}, { 
      $set: { 
        isVerified: true, 
        isActive: true 
      }
    });
    
    console.log('✅ All users set to verified and active');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUserStatus();