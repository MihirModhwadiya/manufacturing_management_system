// Import required libraries for API routing and authentication
import express from 'express'; // Web framework for creating API routes
import Department from '../models/Department.js'; // Department database model
import { authenticateToken, requireAdmin } from '../middleware/auth.js'; // Authentication middleware

const router = express.Router(); // Create Express router for department endpoints

// API endpoint: GET /departments - Get all departments (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all departments with manager details populated
    const departments = await Department.find()
      .populate('managerId', 'name email role') // Include manager user details
      .sort({ departmentCode: 1 }); // Sort by department code
    
    res.json({
      success: true,
      departments: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error while fetching departments.' });
  }
});

// API endpoint: POST /departments - Create new department (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract department data from request body
    const { departmentCode, departmentName, managerId } = req.body;
    
    // Validate required fields
    if (!departmentCode || !departmentName) {
      return res.status(400).json({ 
        message: 'Department code and name are required.' 
      });
    }
    
    // Check if department code already exists
    const existingDepartment = await Department.findOne({ departmentCode });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department code already exists.' });
    }
    
    // Create new department in database
    const newDepartment = await Department.create({
      departmentCode: departmentCode.trim().toUpperCase(), // Normalize code format
      departmentName: departmentName.trim(),
      managerId: managerId || null
    });
    
    // Return created department with populated manager details
    const populatedDepartment = await Department.findById(newDepartment._id)
      .populate('managerId', 'name email role');
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: populatedDepartment
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error while creating department.' });
  }
});

// API endpoint: PUT /departments/:id - Update department (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract department ID from URL parameters
    const { id } = req.params;
    // Extract update fields from request body
    const { departmentName, managerId } = req.body;
    
    // Find the department to update
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    
    // Update department fields only if provided in request
    if (departmentName) department.departmentName = departmentName.trim();
    if (managerId !== undefined) department.managerId = managerId || null;
    
    // Save updated department to database
    await department.save();
    
    // Return updated department with populated manager details
    const updatedDepartment = await Department.findById(id)
      .populate('managerId', 'name email role');
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error while updating department.' });
  }
});

// API endpoint: DELETE /departments/:id - Delete department (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract department ID from URL parameters
    const { id } = req.params;
    
    // Find and delete the department
    const department = await Department.findByIdAndDelete(id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error while deleting department.' });
  }
});

// API endpoint: GET /departments/:id - Get single department (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Extract department ID from URL parameters
    const { id } = req.params;
    
    // Find department with manager details populated
    const department = await Department.findById(id)
      .populate('managerId', 'name email role');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    
    res.json({
      success: true,
      department: department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error while fetching department.' });
  }
});

// API endpoint: GET /departments/:id/work-centers - Get work centers in department
router.get('/:id/work-centers', authenticateToken, async (req, res) => {
  try {
    // Extract department ID from URL parameters
    const { id } = req.params;
    
    // Find department first to ensure it exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    
    // Import WorkCenter model dynamically to avoid circular dependencies
    const WorkCenter = (await import('../models/WorkCenter.js')).default;
    
    // Find all work centers in this department
    const workCenters = await WorkCenter.find({ departmentId: id, isActive: true })
      .populate('managerId', 'name email')
      .sort({ code: 1 });
    
    res.json({
      success: true,
      workCenters: workCenters
    });
  } catch (error) {
    console.error('Get department work centers error:', error);
    res.status(500).json({ message: 'Server error while fetching work centers.' });
  }
});

export default router;