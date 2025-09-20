import express from 'express';
import ManufacturingOrder from '../models/ManufacturingOrder.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// API endpoint: GET /manufacturing-orders - Get all manufacturing orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all manufacturing orders
    const orders = await ManufacturingOrder.find()
      .populate('createdBy', 'name email') // Include creator info
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get manufacturing orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
});

// API endpoint: POST /manufacturing-orders - Create new manufacturing order (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract order data from request body
    const { product, quantity, priority, dueDate, notes } = req.body;
    
    // Validate required fields
    if (!product || !quantity || !dueDate) {
      return res.status(400).json({ message: 'Product, quantity, and due date are required.' });
    }
    
    // Validate quantity is positive number
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0.' });
    }
    
    // Generate order number
    const orderCount = await ManufacturingOrder.countDocuments();
    const orderNumber = `MO-${String(orderCount + 1).padStart(4, '0')}`;
    
    // Create new manufacturing order in database
    const newOrder = await ManufacturingOrder.create({
      orderNumber,
      product, // Store as string for now
      quantity,
      priority: priority || 'medium', // Default priority if not specified
      dueDate,
      notes: notes || '',
      status: 'pending', // New orders start as pending
      createdBy: req.user.id // Track which admin created the order
    });
    
    res.status(201).json({
      success: true,
      message: 'Manufacturing order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Create manufacturing order error:', error);
    res.status(500).json({ message: 'Server error while creating order.' });
  }
});

// API endpoint: PUT /manufacturing-orders/:id - Update manufacturing order (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract order ID from URL parameters
    const { id } = req.params;
    // Extract update fields from request body
    const { quantity, priority, dueDate, notes, status } = req.body;
    
    // Find the order to update
    const order = await ManufacturingOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found.' });
    }
    
    // Validate quantity if provided
    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0.' });
    }
    
    // Update order fields only if provided in request
    if (quantity !== undefined) order.quantity = quantity;
    if (priority) order.priority = priority;
    if (dueDate) order.dueDate = dueDate;
    if (notes !== undefined) order.notes = notes;
    if (status) order.status = status;
    
    // Save updated order to database
    await order.save();
    
    // Return updated order with product details
    const updatedOrder = await ManufacturingOrder.findById(id)
      .populate('product', 'name code');
    
    res.json({
      success: true,
      message: 'Manufacturing order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update manufacturing order error:', error);
    res.status(500).json({ message: 'Server error while updating order.' });
  }
});

// API endpoint: DELETE /manufacturing-orders/:id - Delete manufacturing order (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract order ID from URL parameters
    const { id } = req.params;
    
    // Find and delete the order
    const order = await ManufacturingOrder.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found.' });
    }
    
    res.json({
      success: true,
      message: 'Manufacturing order deleted successfully'
    });
  } catch (error) {
    console.error('Delete manufacturing order error:', error);
    res.status(500).json({ message: 'Server error while deleting order.' });
  }
});

// API endpoint: GET /manufacturing-orders/:id - Get single manufacturing order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Extract order ID from URL parameters
    const { id } = req.params;
    
    // Find order with product details populated
    const order = await ManufacturingOrder.findById(id)
      .populate('product', 'name code description')
      .populate('createdBy', 'name email'); // Include creator info
    
    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found.' });
    }
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get manufacturing order error:', error);
    res.status(500).json({ message: 'Server error while fetching order.' });
  }
});

export default router;