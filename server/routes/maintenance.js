import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Equipment from '../models/Equipment.js';
import MaintenanceSchedule from '../models/MaintenanceSchedule.js';

const router = express.Router();

// Equipment Routes

// Get all equipment with filters
router.get('/equipment', authenticateToken, async (req, res) => {
  try {
    const { status, type, location, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const equipment = await Equipment.find(filter)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Equipment.countDocuments(filter);

    res.json({
      equipment,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalEquipment: total
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get equipment by ID
router.get('/equipment/:id', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new equipment
router.post('/equipment', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      location,
      installationDate,
      maintenanceInterval
    } = req.body;

    const equipment = new Equipment({
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      location,
      installationDate,
      maintenanceInterval,
      status: 'operational',
      efficiency: 100,
      downtimeHours: 0,
      lastMaintenanceDate: installationDate,
      nextMaintenanceDate: new Date(Date.now() + maintenanceInterval * 24 * 60 * 60 * 1000)
    });

    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update equipment
router.put('/equipment/:id', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete equipment
router.delete('/equipment/:id', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Maintenance Schedule Routes

// Get all maintenance schedules with filters
router.get('/schedules', authenticateToken, async (req, res) => {
  try {
    const { status, equipmentId, priority, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (equipmentId) filter.equipmentId = equipmentId;
    if (priority) filter.priority = priority;

    const schedules = await MaintenanceSchedule.find(filter)
      .populate('equipmentId', 'name equipmentId')
      .populate('assignedTechnician', 'name email')
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MaintenanceSchedule.countDocuments(filter);

    res.json({
      schedules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalSchedules: total
    });
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new maintenance schedule
router.post('/schedules', authenticateToken, async (req, res) => {
  try {
    const {
      equipmentId,
      maintenanceType,
      scheduledDate,
      priority,
      assignedTechnician,
      description,
      estimatedDuration,
      parts
    } = req.body;

    const schedule = new MaintenanceSchedule({
      equipmentId,
      maintenanceType,
      scheduledDate,
      priority,
      assignedTechnician,
      description,
      estimatedDuration,
      parts: parts || [],
      status: 'scheduled',
      createdBy: req.user.userId
    });

    await schedule.save();
    await schedule.populate('equipmentId', 'name equipmentId');
    await schedule.populate('assignedTechnician', 'name email');

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating maintenance schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update maintenance schedule
router.put('/schedules/:id', authenticateToken, async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Maintenance schedule not found' });
    }

    const updatedSchedule = await MaintenanceSchedule.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('equipmentId', 'name equipmentId')
     .populate('assignedTechnician', 'name email');

    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating maintenance schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get maintenance metrics/statistics
router.get('/metrics/overview', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Equipment metrics
    const totalEquipment = await Equipment.countDocuments();
    const operationalEquipment = await Equipment.countDocuments({ status: 'operational' });
    const equipmentInMaintenance = await Equipment.countDocuments({ status: 'maintenance' });
    const equipmentBreakdown = await Equipment.countDocuments({ status: 'breakdown' });

    // Maintenance schedule metrics
    const scheduledMaintenanceCount = await MaintenanceSchedule.countDocuments({
      ...dateFilter,
      status: 'scheduled'
    });
    const overdueMaintenance = await MaintenanceSchedule.countDocuments({
      scheduledDate: { $lt: new Date() },
      status: 'scheduled'
    });

    // Calculate average downtime
    const equipmentWithDowntime = await Equipment.find({ downtimeHours: { $gt: 0 } });
    const avgDowntime = equipmentWithDowntime.length > 0 
      ? equipmentWithDowntime.reduce((sum, eq) => sum + eq.downtimeHours, 0) / equipmentWithDowntime.length
      : 0;

    // Calculate maintenance compliance (scheduled vs completed on time)
    const completedOnTime = await MaintenanceSchedule.countDocuments({
      ...dateFilter,
      status: 'completed',
      $expr: { $lte: ['$completedDate', '$scheduledDate'] }
    });
    const totalCompleted = await MaintenanceSchedule.countDocuments({
      ...dateFilter,
      status: 'completed'
    });
    const maintenanceCompliance = totalCompleted > 0 ? (completedOnTime / totalCompleted) * 100 : 100;

    // Mock maintenance cost calculation
    const totalMaintenanceCost = await MaintenanceSchedule.aggregate([
      { $match: dateFilter },
      { $unwind: { path: '$parts', preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: null,
        totalCost: { $sum: { $multiply: ['$parts.quantity', '$parts.cost'] } }
      }}
    ]);

    res.json({
      totalEquipment,
      operationalEquipment,
      equipmentInMaintenance,
      equipmentBreakdown,
      avgDowntime: parseFloat(avgDowntime.toFixed(1)),
      maintenanceCompliance: parseFloat(maintenanceCompliance.toFixed(1)),
      totalMaintenanceCost: totalMaintenanceCost[0]?.totalCost || 0,
      scheduledMaintenanceCount,
      overdueMaintenance
    });
  } catch (error) {
    console.error('Error fetching maintenance metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;