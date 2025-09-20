import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@company.com',
        password: 'Admin@123',
        role: 'admin',
        department: 'IT',
        employeeId: 'EMP001'
      },
      {
        name: 'Morgan Manager',
        email: 'manager@company.com',
        password: 'Manager@123',
        role: 'manager',
        department: 'Production',
        employeeId: 'EMP002'
      },
      {
        name: 'Oscar Operator',
        email: 'operator@company.com',
        password: 'Operator@123',
        role: 'operator',
        department: 'Manufacturing',
        employeeId: 'EMP003'
      },
      {
        name: 'Ivy Inventory',
        email: 'inventory@company.com',
        password: 'Inventory@123',
        role: 'inventory',
        department: 'Warehouse',
        employeeId: 'EMP004'
      }
    ];

    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      const passwordHash = await bcrypt.hash(userData.password, 10);
      const avatar = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        avatar,
        department: userData.department,
        employeeId: userData.employeeId,
        isVerified: true,
        isActive: true
      });

      console.log(`Created user: ${user.name} (${user.email}) with role: ${user.role}`);
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

// Run the seed
seedUsers();