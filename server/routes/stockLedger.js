import express from 'express';
import StockLedger from '../models/StockLedger.js';
import Material from '../models/Material.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// API endpoint: GET /stock-ledger - Get all stock movements
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { material, movementType, page = 1, limit = 50 } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    if (material) filter.material = material;
    if (movementType) filter.movementType = movementType;
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Fetch stock movements with pagination and filtering
    const movements = await StockLedger.find(filter)
      .populate('material', 'name code unit') // Include material details
      .populate('createdBy', 'name email') // Include user who created the movement
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await StockLedger.countDocuments(filter);
    
    res.json({
      success: true,
      movements: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Server error while fetching stock movements.' });
  }
});

// API endpoint: POST /stock-ledger - Record new stock movement
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Extract stock movement data from request body
    const { material, movementType, quantity, reason, reference, notes } = req.body;
    
    // Validate required fields
    if (!material || !movementType || !quantity || !reason) {
      return res.status(400).json({ message: 'Material, movement type, quantity, and reason are required.' });
    }
    
    // Validate movement type
    const validMovementTypes = ['in', 'out', 'adjustment', 'transfer'];
    if (!validMovementTypes.includes(movementType)) {
      return res.status(400).json({ message: 'Invalid movement type. Must be: in, out, adjustment, or transfer.' });
    }
    
    // Validate quantity is positive
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0.' });
    }
    
    // Find the material to update stock quantity
    const materialDoc = await Material.findById(material);
    if (!materialDoc) {
      return res.status(404).json({ message: 'Material not found.' });
    }
    
    // Calculate new stock quantity based on movement type
    let newStockQuantity = materialDoc.stockQuantity || 0;
    const movementQuantity = movementType === 'out' ? -quantity : quantity;
    newStockQuantity += movementQuantity;
    
    // Prevent negative stock for 'out' movements
    if (newStockQuantity < 0) {
      return res.status(400).json({ message: 'Insufficient stock quantity for this movement.' });
    }
    
    // Create stock movement record
    const stockMovement = await StockLedger.create({
      material,
      movementType,
      quantity,
      balanceAfter: newStockQuantity,
      reason,
      reference: reference || '',
      notes: notes || '',
      createdBy: req.user.id // Track which admin recorded the movement
    });
    
    // Update material stock quantity
    materialDoc.stockQuantity = newStockQuantity;
    await materialDoc.save();
    
    // Return created movement with populated details
    const populatedMovement = await StockLedger.findById(stockMovement._id)
      .populate('material', 'name code unit')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Stock movement recorded successfully',
      movement: populatedMovement
    });
  } catch (error) {
    console.error('Record stock movement error:', error);
    res.status(500).json({ message: 'Server error while recording stock movement.' });
  }
});

// API endpoint: GET /stock-ledger/material/:materialId - Get movements for specific material (admin only)
router.get('/material/:materialId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract material ID from URL parameters
    const { materialId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Fetch movements for specific material
    const movements = await StockLedger.find({ material: materialId })
      .populate('material', 'name code unit')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await StockLedger.countDocuments({ material: materialId });
    
    res.json({
      success: true,
      movements: movements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get material movements error:', error);
    res.status(500).json({ message: 'Server error while fetching material movements.' });
  }
});

// API endpoint: GET /stock-ledger/summary - Get stock movement summary (admin only)
router.get('/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get summary of stock movements by type
    const summary = await StockLedger.aggregate([
      {
        $group: {
          _id: '$movementType',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent movements (last 10)
    const recentMovements = await StockLedger.find()
      .populate('material', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      summary: summary,
      recentMovements: recentMovements
    });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ message: 'Server error while fetching stock summary.' });
  }
});

// API endpoint: DELETE /stock-ledger/:id - Delete stock movement (admin only - use with caution)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract movement ID from URL parameters
    const { id } = req.params;
    
    // Find the movement to delete
    const movement = await StockLedger.findById(id).populate('material');
    if (!movement) {
      return res.status(404).json({ message: 'Stock movement not found.' });
    }
    
    // Reverse the stock quantity change
    const material = movement.material;
    const reverseQuantity = movement.movementType === 'out' ? movement.quantity : -movement.quantity;
    material.stockQuantity += reverseQuantity;
    
    // Prevent negative stock after reversal
    if (material.stockQuantity < 0) {
      return res.status(400).json({ message: 'Cannot delete movement - would result in negative stock.' });
    }
    
    // Delete the movement and update material stock
    await StockLedger.findByIdAndDelete(id);
    await material.save();
    
    res.json({
      success: true,
      message: 'Stock movement deleted and stock quantity adjusted'
    });
  } catch (error) {
    console.error('Delete stock movement error:', error);
    res.status(500).json({ message: 'Server error while deleting stock movement.' });
  }
});

export default router;