// Direct MongoDB approach to create admin user
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/manufacture-erp';
const client = new MongoClient(uri);

try {
  await client.connect();
  console.log('🔗 Connected to MongoDB directly');
  
  const db = client.db();
  const users = db.collection('users');
  
  // Delete existing admin user
  await users.deleteOne({ email: 'admin@company.com' });
  console.log('🗑️ Deleted existing admin user');
  
  // Create new admin user directly in MongoDB
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  console.log('🔒 Created password hash:', hashedPassword.substring(0, 20) + '...');
  
  const adminUser = {
    name: 'Admin User',
    email: 'admin@company.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    isVerified: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await users.insertOne(adminUser);
  console.log('✅ Created admin user with ID:', result.insertedId);
  
  // Verify the user was created correctly
  const createdUser = await users.findOne({ email: 'admin@company.com' });
  console.log('📋 Verification - User found:', !!createdUser);
  console.log('   Has password field:', !!createdUser.password);
  console.log('   Password hash starts with:', createdUser.password.substring(0, 7));
  
  // Test password verification
  const isValid = await bcrypt.compare('Admin@123', createdUser.password);
  console.log('✅ Password verification test:', isValid ? 'PASS' : 'FAIL');
  
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await client.close();
  console.log('🔌 Connection closed');
}