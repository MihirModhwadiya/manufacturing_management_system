import express from 'express';
import WorkOrder from '../models/WorkOrder.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// API endpoint: GET /work-orders - Get all work orders (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch all work orders with creator details
    const workOrders = await WorkOrder.find()
      .populate('createdBy', 'name email') // Include creator details
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      success: true,
      workOrders: workOrders
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ message: 'Server error while fetching work orders.' });
  }
});

// API endpoint: POST /work-orders - Create new work order (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract work order data from request body
    const { manufacturingOrder, machine, assignedTo, startDate, estimatedHours, instructions } = req.body;
    
    // Validate required fields
    if (!manufacturingOrder || !machine) {
      return res.status(400).json({ message: 'Manufacturing order and operation are required.' });
    }
    
    // Validate estimated hours if provided
    if (estimatedHours !== undefined && estimatedHours <= 0) {
      return res.status(400).json({ message: 'Estimated hours must be greater than 0.' });
    }
    
    // Generate work order number
    const orderCount = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-${String(orderCount + 1).padStart(4, '0')}`;
    
    // Create new work order in database
    const newWorkOrder = await WorkOrder.create({
      workOrderNumber,
      operation: machine, // Using machine field as operation
      assignedTo: assignedTo || '',
      estimatedHours: estimatedHours || 0,
      instructions: instructions || '',
      status: 'pending',
      priority: 'medium',
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      workOrder: newWorkOrder
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ message: 'Server error while creating work order.' });
  }
});

// API endpoint: PUT /work-orders/:id - Update work order (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, estimatedHours, instructions, status, priority } = req.body;
    
    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found.' });
    }
    
    // Update fields if provided
    if (assignedTo !== undefined) workOrder.assignedTo = assignedTo;
    if (estimatedHours !== undefined) workOrder.estimatedHours = estimatedHours;
    if (instructions !== undefined) workOrder.instructions = instructions;
    if (status) workOrder.status = status;
    if (priority) workOrder.priority = priority;
    
    await workOrder.save();
    
    res.json({
      success: true,
      message: 'Work order updated successfully',
      workOrder: workOrder
    });
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({ message: 'Server error while updating work order.' });
  }
});

// API endpoint: DELETE /work-orders/:id - Delete work order (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found.' });
    }
    
    await WorkOrder.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Work order deleted successfully'
    });
  } catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({ message: 'Server error while deleting work order.' });
  }
});

export default router;