import express from 'express';
const router = express.Router();
import { authenticateToken as auth } from '../middleware/auth.js';
import QualityInspection from '../models/QualityInspection.js';

// Get all quality inspections with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, inspectorId, productType, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (inspectorId) filter.inspectorId = inspectorId;
    if (productType) filter.productType = productType;
    if (dateFrom || dateTo) {
      filter.inspectionDate = {};
      if (dateFrom) filter.inspectionDate.$gte = new Date(dateFrom);
      if (dateTo) filter.inspectionDate.$lte = new Date(dateTo);
    }

    const inspections = await QualityInspection.find(filter)
      .populate('inspectorId', 'name email')
      .populate('workOrderId', 'workOrderNumber')
      .sort({ inspectionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QualityInspection.countDocuments(filter);

    res.json({
      inspections,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalInspections: total
    });
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inspection by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const inspection = await QualityInspection.findById(req.params.id)
      .populate('inspectorId', 'name email')
      .populate('workOrderId', 'workOrderNumber');
    
    if (!inspection) {
      return res.status(404).json({ message: 'Quality inspection not found' });
    }

    res.json(inspection);
  } catch (error) {
    console.error('Error fetching quality inspection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new quality inspection
router.post('/', auth, async (req, res) => {
  try {
    const {
      workOrderId,
      productType,
      batchNumber,
      quantityInspected,
      inspectionCriteria,
      testResults,
      defects,
      notes
    } = req.body;

    // Calculate overall status based on test results
    const passedTests = testResults.filter(test => test.result === 'pass').length;
    const totalTests = testResults.length;
    const passRate = (passedTests / totalTests) * 100;
    
    let status = 'pending';
    if (passRate >= 95) {
      status = 'approved';
    } else if (passRate >= 80) {
      status = 'conditional';
    } else {
      status = 'rejected';
    }

    const inspection = new QualityInspection({
      workOrderId,
      inspectorId: req.user.userId,
      productType,
      batchNumber,
      quantityInspected,
      inspectionCriteria,
      testResults,
      defects,
      notes,
      status,
      inspectionDate: new Date()
    });

    await inspection.save();
    await inspection.populate('inspectorId', 'name email');
    await inspection.populate('workOrderId', 'workOrderNumber');

    res.status(201).json(inspection);
  } catch (error) {
    console.error('Error creating quality inspection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quality inspection
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      productType,
      batchNumber,
      quantityInspected,
      inspectionCriteria,
      testResults,
      defects,
      notes,
      status
    } = req.body;

    const inspection = await QualityInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ message: 'Quality inspection not found' });
    }

    // Update fields
    inspection.productType = productType || inspection.productType;
    inspection.batchNumber = batchNumber || inspection.batchNumber;
    inspection.quantityInspected = quantityInspected || inspection.quantityInspected;
    inspection.inspectionCriteria = inspectionCriteria || inspection.inspectionCriteria;
    inspection.testResults = testResults || inspection.testResults;
    inspection.defects = defects || inspection.defects;
    inspection.notes = notes || inspection.notes;
    inspection.status = status || inspection.status;
    inspection.updatedAt = new Date();

    await inspection.save();
    await inspection.populate('inspectorId', 'name email');
    await inspection.populate('workOrderId', 'workOrderNumber');

    res.json(inspection);
  } catch (error) {
    console.error('Error updating quality inspection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete quality inspection
router.delete('/:id', auth, async (req, res) => {
  try {
    const inspection = await QualityInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ message: 'Quality inspection not found' });
    }

    await QualityInspection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quality inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality inspection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quality metrics/statistics
router.get('/metrics/overview', auth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.inspectionDate = {};
      if (dateFrom) dateFilter.inspectionDate.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.inspectionDate.$lte = new Date(dateTo);
    }

    // Get metrics
    const totalInspections = await QualityInspection.countDocuments(dateFilter);
    const approvedInspections = await QualityInspection.countDocuments({
      ...dateFilter,
      status: 'approved'
    });
    const rejectedInspections = await QualityInspection.countDocuments({
      ...dateFilter,
      status: 'rejected'
    });
    const pendingInspections = await QualityInspection.countDocuments({
      ...dateFilter,
      status: 'pending'
    });

    // Calculate quality rate
    const qualityRate = totalInspections > 0 ? 
      ((approvedInspections / totalInspections) * 100).toFixed(1) : 0;

    // Get defect statistics
    const defectStats = await QualityInspection.aggregate([
      { $match: dateFilter },
      { $unwind: '$defects' },
      { $group: {
        _id: '$defects.type',
        count: { $sum: 1 },
        severity: { $first: '$defects.severity' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalInspections,
      approvedInspections,
      rejectedInspections,
      pendingInspections,
      qualityRate: parseFloat(qualityRate),
      defectStats,
      metrics: {
        approvalRate: totalInspections > 0 ? ((approvedInspections / totalInspections) * 100).toFixed(1) : 0,
        rejectionRate: totalInspections > 0 ? ((rejectedInspections / totalInspections) * 100).toFixed(1) : 0,
        avgInspectionTime: '2.5', // Mock data - could be calculated from actual inspection times
        defectRate: defectStats.length > 0 ? ((defectStats.reduce((acc, curr) => acc + curr.count, 0) / totalInspections) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching quality metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;