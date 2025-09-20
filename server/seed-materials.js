// Simple seed script to add test materials for Stock Ledger testing
import mongoose from 'mongoose';
import Material from './models/Material.js';
import dotenv from 'dotenv';

dotenv.config();

const seedMaterials = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });

    console.log('Connected to MongoDB');

    // Drop the entire materials collection to remove old schema
    try {
      await mongoose.connection.db.collection('materials').drop();
      console.log('Dropped materials collection to reset schema');
    } catch (err) {
      console.log('Materials collection may not exist yet');
    }

    // Sample materials for testing
    const materials = [
      {
        code: 'MT001',
        name: 'Steel Rod 10mm',
        category: 'raw-material',
        unit: 'kg',
        stockQuantity: 50,
        unitCost: 15.50
      },
      {
        code: 'MT002', 
        name: 'Aluminum Sheet',
        category: 'raw-material',
        unit: 'pcs',
        stockQuantity: 25,
        unitCost: 45.00
      },
      {
        code: 'CP001',
        name: 'Bearing 6205',
        category: 'component',
        unit: 'pcs',
        stockQuantity: 100,
        unitCost: 8.75
      },
      {
        code: 'CP002',
        name: 'Motor 1HP',
        category: 'component',
        unit: 'pcs',
        stockQuantity: 10,
        unitCost: 250.00
      },
      {
        code: 'MT003',
        name: 'Hydraulic Oil',
        category: 'raw-material',
        unit: 'liters',
        stockQuantity: 200,
        unitCost: 12.00
      }
    ];

    const createdMaterials = await Material.insertMany(materials);
    console.log(`Created ${createdMaterials.length} test materials:`);
    
    createdMaterials.forEach(material => {
      console.log(`- ${material.code}: ${material.name} (${material.stockQuantity} ${material.unit})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding materials:', error);
    process.exit(1);
  }
};

seedMaterials();