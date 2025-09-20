import express from 'express';
import BillOfMaterial from '../models/BillOfMaterial.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /bom - Get all Bills of Materials (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const boms = await BillOfMaterial.find()
        .populate('product', 'name code')
      .populate('materials.material', 'name code unit') 
      .sort({ createdAt: -1 }); 
    
    res.json({
      success: true,
      boms: boms
    });
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ message: 'Server error while fetching BOMs.' });
  }
});

// POST /bom - Create new Bill of Materials (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { product, materials, version, notes } = req.body;
    
    // Validate required fields
    if (!product || !materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ message: 'Product and materials list are required.' });
    }
    
    // Validate each material in the list
    for (const mat of materials) {
      if (!mat.material || !mat.quantity || mat.quantity <= 0) {
        return res.status(400).json({ message: 'Each material must have a valid material ID and quantity > 0.' });
      }
    }
    
    // Create new BOM in database
    const newBOM = await BillOfMaterial.create({
      product,
      materials,
      version: version || '1.0', // Default version if not specified
      notes: notes || '',
      isActive: true, // New BOMs are active by default
      createdBy: req.user.id // Track which admin created the BOM
    });
    
    // Return created BOM with populated details
    const populatedBOM = await BillOfMaterial.findById(newBOM._id)
      .populate('product', 'name code')
      .populate('materials.material', 'name code unit');
    
    res.status(201).json({
      success: true,
      message: 'Bill of Materials created successfully',
      bom: populatedBOM
    });
  } catch (error) {
    console.error('Create BOM error:', error);
    res.status(500).json({ message: 'Server error while creating BOM.' });
  }
});

// API endpoint: PUT /bom/:id - Update Bill of Materials (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract BOM ID from URL parameters
    const { id } = req.params;
    // Extract update fields from request body
    const { materials, version, notes, isActive } = req.body;
    
    // Find the BOM to update
    const bom = await BillOfMaterial.findById(id);
    if (!bom) {
      return res.status(404).json({ message: 'Bill of Materials not found.' });
    }
    
    // Validate materials if provided
    if (materials) {
      if (!Array.isArray(materials) || materials.length === 0) {
        return res.status(400).json({ message: 'Materials must be a non-empty array.' });
      }
      
      // Validate each material in the updated list
      for (const mat of materials) {
        if (!mat.material || !mat.quantity || mat.quantity <= 0) {
          return res.status(400).json({ message: 'Each material must have a valid material ID and quantity > 0.' });
        }
      }
    }
    
    // Update BOM fields only if provided in request
    if (materials) bom.materials = materials;
    if (version) bom.version = version;
    if (notes !== undefined) bom.notes = notes;
    if (isActive !== undefined) bom.isActive = isActive;
    
    // Save updated BOM to database
    await bom.save();
    
    // Return updated BOM with populated details
    const updatedBOM = await BillOfMaterial.findById(id)
      .populate('product', 'name code')
      .populate('materials.material', 'name code unit');
    
    res.json({
      success: true,
      message: 'Bill of Materials updated successfully',
      bom: updatedBOM
    });
  } catch (error) {
    console.error('Update BOM error:', error);
    res.status(500).json({ message: 'Server error while updating BOM.' });
  }
});

// API endpoint: DELETE /bom/:id - Delete Bill of Materials (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract BOM ID from URL parameters
    const { id } = req.params;
    
    // Find and delete the BOM
    const bom = await BillOfMaterial.findByIdAndDelete(id);
    if (!bom) {
      return res.status(404).json({ message: 'Bill of Materials not found.' });
    }
    
    res.json({
      success: true,
      message: 'Bill of Materials deleted successfully'
    });
  } catch (error) {
    console.error('Delete BOM error:', error);
    res.status(500).json({ message: 'Server error while deleting BOM.' });
  }
});

// API endpoint: GET /bom/:id - Get single Bill of Materials (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract BOM ID from URL parameters
    const { id } = req.params;
    
    // Find BOM with all related details populated
    const bom = await BillOfMaterial.findById(id)
      .populate('product', 'name code description')
      .populate('materials.material', 'name code unit stockQuantity')
      .populate('createdBy', 'name email');
    
    if (!bom) {
      return res.status(404).json({ message: 'Bill of Materials not found.' });
    }
    
    res.json({
      success: true,
      bom: bom
    });
  } catch (error) {
    console.error('Get BOM error:', error);
    res.status(500).json({ message: 'Server error while fetching BOM.' });
  }
});

// API endpoint: GET /bom/product/:productId - Get BOMs for specific product (admin only)
router.get('/product/:productId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract product ID from URL parameters
    const { productId } = req.params;
    
    // Find all BOMs for the specified product
    const boms = await BillOfMaterial.find({ product: productId })
      .populate('materials.material', 'name code unit stockQuantity')
      .sort({ version: -1 }); // Sort by version descending (newest version first)
    
    res.json({
      success: true,
      boms: boms
    });
  } catch (error) {
    console.error('Get product BOMs error:', error);
    res.status(500).json({ message: 'Server error while fetching product BOMs.' });
  }
});

export default router;