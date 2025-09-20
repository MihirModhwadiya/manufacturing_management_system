import express from 'express';
import Material from '../models/Material.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// API endpoint: GET /materials - Get all materials
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch materials with pagination and filtering
    const materials = await Material.find(filter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalCount = await Material.countDocuments(filter);
    
    res.json({
      success: true,
      materials: materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Server error while fetching materials.' });
  }
});

// API endpoint: POST /materials - Create new material (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, name, category, unit, stockQuantity, unitCost } = req.body;
    
    // Validate required fields
    if (!code || !name || !category || !unit || unitCost === undefined) {
      return res.status(400).json({ message: 'Code, name, category, unit, and unit cost are required.' });
    }
    
    // Check if material code already exists
    const existingMaterial = await Material.findOne({ code });
    if (existingMaterial) {
      return res.status(400).json({ message: 'Material code already exists.' });
    }
    
    // Create new material
    const material = await Material.create({
      code,
      name,
      category,
      unit,
      stockQuantity: stockQuantity || 0,
      unitCost
    });
    
    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      material: material
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ message: 'Server error while creating material.' });
  }
});

// API endpoint: GET /materials/:id - Get single material (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    
    res.json({
      success: true,
      material: material
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Server error while fetching material.' });
  }
});

// API endpoint: PUT /materials/:id - Update material (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, category, unit, stockQuantity, unitCost } = req.body;
    
    // Find material to update
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    
    // Check if code is being changed and if it conflicts
    if (code && code !== material.code) {
      const existingMaterial = await Material.findOne({ code });
      if (existingMaterial) {
        return res.status(400).json({ message: 'Material code already exists.' });
      }
    }
    
    // Update fields
    if (code) material.code = code;
    if (name) material.name = name;
    if (category) material.category = category;
    if (unit) material.unit = unit;
    if (stockQuantity !== undefined) material.stockQuantity = stockQuantity;
    if (unitCost !== undefined) material.unitCost = unitCost;
    
    await material.save();
    
    res.json({
      success: true,
      message: 'Material updated successfully',
      material: material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Server error while updating material.' });
  }
});

// API endpoint: DELETE /materials/:id - Delete material (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    
    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Server error while deleting material.' });
  }
});

export default router;