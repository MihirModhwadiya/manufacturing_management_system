// Import required libraries for API routing and authentication
import express from 'express'; // Web framework for creating API routes
import WorkCenter from '../models/WorkCenter.js'; // Work center database model
import { authenticateToken, requireAdmin } from '../middleware/auth.js'; // Authentication middleware

const router = express.Router(); // Create Express router for work center endpoints

// API endpoint: GET /work-centers - Get all work centers (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all work centers
    const workCenters = await WorkCenter.find({ isActive: true })
      .populate('createdBy', 'name email') // Include creator details
      .sort({ code: 1 }); // Sort by work center code
    
    res.json({
      success: true,
      workCenters: workCenters
    });
  } catch (error) {
    console.error('Get work centers error:', error);
    res.status(500).json({ message: 'Server error while fetching work centers.' });
  }
});

// API endpoint: POST /work-centers - Create new work center (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract work center data from request body
    const { 
      code, name, description, type, location, capacity, hourlyRate
    } = req.body;
    
    console.log('Received work center data:', {
      code, name, description, type, location, capacity, hourlyRate
    });
    
    // Validate required fields
    if (!code || !name || !location) {
      console.log('Validation failed - missing required fields:', { code, name, location });
      return res.status(400).json({ 
        message: 'Code, name, and location are required.' 
      });
    }
    
    // Validate capacity and hourly rate
    if (capacity !== undefined && capacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be greater than 0.' });
    }
    
    if (hourlyRate !== undefined && hourlyRate < 0) {
      return res.status(400).json({ message: 'Hourly rate cannot be negative.' });
    }
    
    // Check for duplicate work center code
    const existingWorkCenter = await WorkCenter.findOne({ code: code.trim() });
    if (existingWorkCenter) {
      return res.status(400).json({ message: 'Work center with this code already exists.' });
    }
    
    // Create new work center in database
    const newWorkCenter = await WorkCenter.create({
      code: code.trim(),
      name: name.trim(),
      description: description || '',
      type: type || 'manufacturing',
      location: location.trim(),
      capacity: capacity || 1,
      hourlyRate: hourlyRate || 0,
      status: 'available',
      isActive: true,
      createdBy: req.user?.id || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Work center created successfully',
      workCenter: newWorkCenter
    });
  } catch (error) {
    console.error('Create work center error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (error.code === 11000) {
      res.status(400).json({ message: 'Work center code must be unique.' });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ message: `Validation error: ${error.message}` });
    } else {
      res.status(500).json({ message: 'Server error while creating work center.' });
    }
  }
});

// API endpoint: PUT /work-centers/:id - Update work center (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, location, capacity, hourlyRate, status } = req.body;
    
    const workCenter = await WorkCenter.findById(id);
    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found.' });
    }
    
    // Update fields if provided
    if (name) workCenter.name = name.trim();
    if (description !== undefined) workCenter.description = description;
    if (type) workCenter.type = type;
    if (location) workCenter.location = location.trim();
    if (capacity !== undefined) workCenter.capacity = capacity;
    if (hourlyRate !== undefined) workCenter.hourlyRate = hourlyRate;
    if (status) workCenter.status = status;
    
    await workCenter.save();
    
    res.json({
      success: true,
      message: 'Work center updated successfully',
      workCenter: workCenter
    });
  } catch (error) {
    console.error('Update work center error:', error);
    res.status(500).json({ message: 'Server error while updating work center.' });
  }
});

// API endpoint: DELETE /work-centers/:id - Delete work center (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const workCenter = await WorkCenter.findById(id);
    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found.' });
    }
    
    // Soft delete by marking as inactive
    workCenter.isActive = false;
    await workCenter.save();
    
    res.json({
      success: true,
      message: 'Work center deleted successfully'
    });
  } catch (error) {
    console.error('Delete work center error:', error);
    res.status(500).json({ message: 'Server error while deleting work center.' });
  }
});

export default router;