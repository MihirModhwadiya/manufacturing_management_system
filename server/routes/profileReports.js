// Import required libraries for API routing and authentication
import express from 'express'; // Web framework for creating API routes
import ProfileReport from '../models/ProfileReport.js'; // Profile report database model
import { authenticateToken, requireAdmin } from '../middleware/auth.js'; // Authentication middleware

const router = express.Router(); // Create Express router for profile report endpoints

// API endpoint: GET /profile-reports - Get all profile reports with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { 
      reportType, 
      operatorId, 
      workCenterId, 
      startDate, 
      endDate, 
      status,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Build filter object based on query parameters
    const filter = { isActive: true };
    if (reportType) filter.reportType = reportType;
    if (operatorId) filter.operatorId = operatorId;
    if (workCenterId) filter.workCenterId = workCenterId;
    if (status) filter.status = status;
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.periodStart = {};
      if (startDate) filter.periodStart.$gte = new Date(startDate);
      if (endDate) filter.periodStart.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch profile reports with pagination and population
    const reports = await ProfileReport.find(filter)
      .populate('operatorId', 'name email employeeId')
      .populate('workCenterId', 'code name type location')
      .populate('manufacturingOrderId', 'orderNumber product priority')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalReports = await ProfileReport.countDocuments(filter);
    
    res.json({
      success: true,
      reports: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / parseInt(limit)),
        totalReports: totalReports,
        hasNext: skip + reports.length < totalReports,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get profile reports error:', error);
    res.status(500).json({ message: 'Server error while fetching profile reports.' });
  }
});

// API endpoint: POST /profile-reports - Create new profile report
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Extract profile report data from request body
    const reportData = req.body;
    
    // Validate required fields based on report type
    const { reportType, periodStart, periodEnd } = reportData;
    if (!reportType || !periodStart || !periodEnd) {
      return res.status(400).json({ 
        message: 'Report type, period start, and period end are required.' 
      });
    }
    
    // Validate date range
    if (new Date(periodEnd) <= new Date(periodStart)) {
      return res.status(400).json({ 
        message: 'Period end must be after period start.' 
      });
    }
    
    // Set the user who generated the report
    reportData.generatedBy = req.user.id;
    
    // Create new profile report in database
    const newReport = await ProfileReport.create(reportData);
    
    // Return created report with populated details
    const populatedReport = await ProfileReport.findById(newReport._id)
      .populate('operatorId', 'name email employeeId')
      .populate('workCenterId', 'code name type')
      .populate('manufacturingOrderId', 'orderNumber product')
      .populate('generatedBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Profile report created successfully',
      report: populatedReport
    });
  } catch (error) {
    console.error('Create profile report error:', error);
    res.status(500).json({ message: 'Server error while creating profile report.' });
  }
});

// API endpoint: GET /profile-reports/:id - Get single profile report
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Extract report ID from URL parameters
    const { id } = req.params;
    
    // Find profile report with all populated details
    const report = await ProfileReport.findById(id)
      .populate('operatorId', 'name email employeeId department')
      .populate('workCenterId', 'code name type location hourlyRate')
      .populate('manufacturingOrderId', 'orderNumber product quantity priority dueDate')
      .populate('generatedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('comments.userId', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Profile report not found.' });
    }
    
    res.json({
      success: true,
      report: report
    });
  } catch (error) {
    console.error('Get profile report error:', error);
    res.status(500).json({ message: 'Server error while fetching profile report.' });
  }
});

// API endpoint: PUT /profile-reports/:id - Update profile report
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Extract report ID from URL parameters
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the profile report to update
    const report = await ProfileReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Profile report not found.' });
    }
    
    // Check permissions: only admin, report generator, or assigned operator can update
    const isAuthorized = req.user.role === 'admin' || 
                        report.generatedBy.toString() === req.user.id ||
                        (report.operatorId && report.operatorId.toString() === req.user.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this report.' });
    }
    
    // Update the profile report
    const updatedReport = await ProfileReport.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    )
      .populate('operatorId', 'name email employeeId')
      .populate('workCenterId', 'code name type')
      .populate('manufacturingOrderId', 'orderNumber product')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Profile report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update profile report error:', error);
    res.status(500).json({ message: 'Server error while updating profile report.' });
  }
});

// API endpoint: DELETE /profile-reports/:id - Delete profile report (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Extract report ID from URL parameters
    const { id } = req.params;
    
    // Soft delete by setting isActive to false
    const report = await ProfileReport.findByIdAndUpdate(
      id, 
      { isActive: false },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ message: 'Profile report not found.' });
    }
    
    res.json({
      success: true,
      message: 'Profile report deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile report error:', error);
    res.status(500).json({ message: 'Server error while deleting profile report.' });
  }
});

// API endpoint: POST /profile-reports/:id/approve - Approve profile report
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    // Extract report ID from URL parameters
    const { id } = req.params;
    
    // Check if user has approval permissions (manager or admin)
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to approve reports.' });
    }
    
    // Update report status to approved
    const report = await ProfileReport.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    )
      .populate('operatorId', 'name email')
      .populate('workCenterId', 'code name')
      .populate('approvedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Profile report not found.' });
    }
    
    res.json({
      success: true,
      message: 'Profile report approved successfully',
      report: report
    });
  } catch (error) {
    console.error('Approve profile report error:', error);
    res.status(500).json({ message: 'Server error while approving profile report.' });
  }
});

// API endpoint: POST /profile-reports/:id/comments - Add comment to report
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    // Extract report ID and comment from request
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment is required.' });
    }
    
    // Add comment to the report
    const report = await ProfileReport.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            userId: req.user.id,
            comment: comment.trim(),
            createdAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('comments.userId', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Profile report not found.' });
    }
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      report: report
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment.' });
  }
});

// API endpoint: GET /profile-reports/analytics/performance - Get performance analytics
router.get('/analytics/performance', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { operatorId, workCenterId, startDate, endDate } = req.query;
    
    // Build filter for analytics query
    const filter = { isActive: true, status: 'approved' };
    if (operatorId) filter.operatorId = operatorId;
    if (workCenterId) filter.workCenterId = workCenterId;
    if (startDate || endDate) {
      filter.periodStart = {};
      if (startDate) filter.periodStart.$gte = new Date(startDate);
      if (endDate) filter.periodStart.$lte = new Date(endDate);
    }
    
    // Aggregate performance metrics
    const performanceMetrics = await ProfileReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          avgEfficiency: { $avg: '$metrics.efficiency' },
          avgUtilization: { $avg: '$metrics.utilization' },
          avgProductivity: { $avg: '$metrics.productivity' },
          totalUnitsProduced: { $sum: '$metrics.unitsProduced' },
          totalWorkTime: { $sum: '$metrics.totalWorkTime' },
          avgQualityScore: { $avg: '$metrics.qualityScore' },
          totalCost: { $sum: '$metrics.totalCost' },
          avgOnTimeDelivery: { $avg: '$metrics.onTimeDelivery' }
        }
      }
    ]);
    
    // Get trend data (daily averages for the period)
    const trendData = await ProfileReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$periodStart' } },
          efficiency: { $avg: '$metrics.efficiency' },
          utilization: { $avg: '$metrics.utilization' },
          productivity: { $avg: '$metrics.productivity' },
          qualityScore: { $avg: '$metrics.qualityScore' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        summary: performanceMetrics[0] || {},
        trends: trendData
      }
    });
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching performance analytics.' });
  }
});

// API endpoint: GET /profile-reports/analytics/operators - Get operator performance comparison
router.get('/analytics/operators', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = { isActive: true, status: 'approved' };
    if (startDate || endDate) {
      dateFilter.periodStart = {};
      if (startDate) dateFilter.periodStart.$gte = new Date(startDate);
      if (endDate) dateFilter.periodStart.$lte = new Date(endDate);
    }
    
    // Aggregate operator performance
    const operatorPerformance = await ProfileReport.aggregate([
      { $match: dateFilter },
      { $match: { operatorId: { $exists: true } } },
      {
        $group: {
          _id: '$operatorId',
          totalReports: { $sum: 1 },
          avgEfficiency: { $avg: '$metrics.efficiency' },
          avgUtilization: { $avg: '$metrics.utilization' },
          totalUnitsProduced: { $sum: '$metrics.unitsProduced' },
          totalWorkTime: { $sum: '$metrics.totalWorkTime' },
          avgQualityScore: { $avg: '$metrics.qualityScore' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'operator'
        }
      },
      { $unwind: '$operator' },
      {
        $project: {
          operatorName: '$operator.name',
          operatorId: '$operator.employeeId',
          totalReports: 1,
          avgEfficiency: { $round: ['$avgEfficiency', 2] },
          avgUtilization: { $round: ['$avgUtilization', 2] },
          totalUnitsProduced: 1,
          totalWorkTime: 1,
          avgQualityScore: { $round: ['$avgQualityScore', 2] }
        }
      },
      { $sort: { avgEfficiency: -1 } }
    ]);
    
    res.json({
      success: true,
      operatorPerformance: operatorPerformance
    });
  } catch (error) {
    console.error('Get operator analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching operator analytics.' });
  }
});

export default router;