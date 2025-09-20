import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ManufacturingOrder from '../models/ManufacturingOrder.js';
import WorkOrder from '../models/WorkOrder.js';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard analytics and KPIs
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // Default 30 days
    const daysBack = parseInt(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Get current period data
    const [
      currentOrders,
      currentWorkOrders,
      totalUsers
    ] = await Promise.all([
      ManufacturingOrder.find({ createdAt: { $gte: startDate } }),
      WorkOrder.find({ createdAt: { $gte: startDate } }),
      User.countDocuments({ isActive: true })
    ]);
    
    // Get previous period data for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysBack);
    const prevEndDate = new Date(startDate);
    
    const [
      prevOrders,
      prevWorkOrders
    ] = await Promise.all([
      ManufacturingOrder.find({ 
        createdAt: { $gte: prevStartDate, $lt: prevEndDate } 
      }),
      WorkOrder.find({ 
        createdAt: { $gte: prevStartDate, $lt: prevEndDate } 
      })
    ]);
    
    // Calculate trends
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    const getTrend = (change) => {
      if (change > 0) return 'up';
      if (change < 0) return 'down';
      return 'neutral';
    };
    
    // Current period metrics
    const totalOrdersNow = currentOrders.length;
    const completedOrdersNow = currentOrders.filter(o => o.status === 'completed').length;
    const activeWorkOrdersNow = currentWorkOrders.filter(wo => wo.status === 'in-progress').length;
    
    // Previous period metrics
    const totalOrdersPrev = prevOrders.length;
    const completedOrdersPrev = prevOrders.filter(o => o.status === 'completed').length;
    const activeWorkOrdersPrev = prevWorkOrders.filter(wo => wo.status === 'in-progress').length;
    
    // Calculate on-time delivery
    const completedWithDates = currentOrders.filter(o => 
      o.status === 'completed' && o.completedAt && o.dueDate
    );
    const onTimeOrders = completedWithDates.filter(o => 
      new Date(o.completedAt) <= new Date(o.dueDate)
    );
    const onTimeRate = completedWithDates.length > 0 
      ? Math.round((onTimeOrders.length / completedWithDates.length) * 100)
      : 0;
    
    // Previous on-time delivery
    const prevCompletedWithDates = prevOrders.filter(o => 
      o.status === 'completed' && o.completedAt && o.dueDate
    );
    const prevOnTimeOrders = prevCompletedWithDates.filter(o => 
      new Date(o.completedAt) <= new Date(o.dueDate)
    );
    const prevOnTimeRate = prevCompletedWithDates.length > 0 
      ? Math.round((prevOnTimeOrders.length / prevCompletedWithDates.length) * 100)
      : 0;
    
    // Calculate changes
    const totalOrdersChange = calculateChange(totalOrdersNow, totalOrdersPrev);
    const activeWorkOrdersChange = calculateChange(activeWorkOrdersNow, activeWorkOrdersPrev);
    const completedTodayChange = calculateChange(completedOrdersNow, completedOrdersPrev);
    const onTimeDeliveryChange = calculateChange(onTimeRate, prevOnTimeRate);
    
    const analytics = {
      kpis: [
        {
          title: 'Total Orders',
          value: totalOrdersNow,
          change: totalOrdersChange,
          trend: getTrend(totalOrdersChange),
          format: 'number'
        },
        {
          title: 'Active Work Orders',
          value: activeWorkOrdersNow,
          change: activeWorkOrdersChange,
          trend: getTrend(activeWorkOrdersChange),
          format: 'number'
        },
        {
          title: 'Completed Orders',
          value: completedOrdersNow,
          change: completedTodayChange,
          trend: getTrend(completedTodayChange),
          format: 'number'
        },
        {
          title: 'On-Time Delivery',
          value: `${onTimeRate}%`,
          change: onTimeDeliveryChange,
          trend: getTrend(onTimeDeliveryChange),
          format: 'percentage'
        }
      ],
      summary: {
        totalOrders: totalOrdersNow,
        completedOrders: completedOrdersNow,
        activeWorkOrders: activeWorkOrdersNow,
        onTimeDeliveryRate: onTimeRate,
        totalUsers
      }
    };
    
    res.json({
      success: true,
      analytics,
      timeframe: `${daysBack} days`
    });
    
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get recent activity feed
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent manufacturing orders and work orders
    const [recentOrders, recentWorkOrders] = await Promise.all([
      ManufacturingOrder.find()
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit) / 2)
        .select('orderNumber status updatedAt productName'),
      WorkOrder.find()
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit) / 2)
        .select('orderNumber status updatedAt operation assignedTo')
    ]);
    
    // Combine and format activities
    const activities = [
      ...recentOrders.map(order => ({
        id: order._id,
        type: 'manufacturing_order',
        title: `Order ${order.orderNumber}`,
        description: order.status === 'completed' ? 
          `Manufacturing order completed` : 
          `Manufacturing order ${order.status}`,
        status: order.status,
        timestamp: order.updatedAt,
        details: {
          productName: order.productName,
          orderNumber: order.orderNumber
        }
      })),
      ...recentWorkOrders.map(wo => ({
        id: wo._id,
        type: 'work_order',
        title: `Work Order ${wo.orderNumber}`,
        description: wo.status === 'completed' ? 
          `Work order completed` : 
          `Work order ${wo.status}`,
        status: wo.status,
        timestamp: wo.updatedAt,
        details: {
          operation: wo.operation,
          assignedTo: wo.assignedTo,
          orderNumber: wo.orderNumber
        }
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      activities
    });
    
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;