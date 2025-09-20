// Check user data in database directly
import mongoose from 'mongoose';
import User from './models/User.js';

await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern-auth');

try {
  // Get the raw user document with all fields
  const user = await User.findOne({ email: 'admin@company.com' }).lean();
  
  console.log('📋 Raw user document from database:');
  console.log(JSON.stringify(user, null, 2));
  
  // Get user with specific field selection
  const userWithPassword = await User.findOne({ email: 'admin@company.com' }).select('+password');
  console.log('\n📋 User with password field:');
  console.log({
    email: userWithPassword?.email,
    hasPassword: !!userWithPassword?.password,
    passwordLength: userWithPassword?.password?.length
  });
  
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.connection.close();
}