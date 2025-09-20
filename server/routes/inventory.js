import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import InventoryItem from '../models/InventoryItem.js';
import Supplier from '../models/Supplier.js';
import ReorderAlert from '../models/ReorderAlert.js';
import InventoryMovement from '../models/InventoryMovement.js';
import InventoryForecast from '../models/InventoryForecast.js';

const router = express.Router();

// Get all inventory items with advanced filtering
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      supplier,
      location,
      search,
      sortBy = 'partNumber',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (location) filter.location = new RegExp(location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { partNumber: new RegExp(escapedSearch, 'i') },
        { material: new RegExp(escapedSearch, 'i') },
        { description: new RegExp(escapedSearch, 'i') }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await InventoryItem.find(filter)
      .populate('supplier', 'name leadTime rating')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryItem.countDocuments(filter);

    res.json({
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory item by ID with history
router.get('/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('supplier', 'name contact leadTime rating');
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Get movement history for this item
    const movements = await InventoryMovement.find({ 
      inventoryItem: req.params.id 
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      item,
      movements
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new inventory item
router.post('/items', authenticateToken, authorizeRoles('admin', 'manager', 'inventory'), async (req, res) => {
  try {
    const {
      material,
      partNumber,
      description,
      minStock,
      maxStock,
      reorderPoint,
      location,
      supplier,
      currentStock = 0,
      averageCost = 0
    } = req.body;

    // Check if part number already exists
    const existingItem = await InventoryItem.findOne({ partNumber });
    if (existingItem) {
      return res.status(400).json({ message: 'Part number already exists' });
    }

    // Determine initial status
    let status = 'in-stock';
    if (currentStock === 0) status = 'out-of-stock';
    else if (currentStock <= reorderPoint) status = 'low-stock';
    else if (currentStock >= maxStock) status = 'overstock';

    const item = new InventoryItem({
      material,
      partNumber,
      description,
      currentStock,
      minStock,
      maxStock,
      reorderPoint,
      averageCost,
      status,
      location,
      supplier,
      createdBy: req.user.id
    });

    await item.save();
    
    // Populate supplier info
    await item.populate('supplier', 'name leadTime rating');

    // Create initial movement record
    const movement = new InventoryMovement({
      inventoryItem: item._id,
      movementType: 'initial',
      quantity: currentStock,
      previousStock: 0,
      newStock: currentStock,
      reason: 'Initial stock entry',
      createdBy: req.user.id
    });
    await movement.save();

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory item
router.put('/items/:id', authenticateToken, authorizeRoles('admin', 'manager', 'inventory'), async (req, res) => {
  try {
    const updates = req.body;
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // If stock is being updated, create movement record
    if (updates.currentStock !== undefined && updates.currentStock !== item.currentStock) {
      const movement = new InventoryMovement({
        inventoryItem: item._id,
        movementType: updates.currentStock > item.currentStock ? 'in' : 'out',
        quantity: Math.abs(updates.currentStock - item.currentStock),
        previousStock: item.currentStock,
        newStock: updates.currentStock,
        reason: updates.reason || 'Stock adjustment',
        reference: updates.reference,
        createdBy: req.user.id
      });
      await movement.save();

      // Update status based on new stock level
      let status = 'in-stock';
      if (updates.currentStock === 0) status = 'out-of-stock';
      else if (updates.currentStock <= item.reorderPoint) status = 'low-stock';
      else if (updates.currentStock >= item.maxStock) status = 'overstock';
      updates.status = status;
    }

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { ...updates, lastUpdated: new Date() },
      { new: true }
    ).populate('supplier', 'name leadTime rating');

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete inventory item
router.delete('/items/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Delete related movements
    await InventoryMovement.deleteMany({ inventoryItem: req.params.id });
    
    // Delete related reorder alerts
    await ReorderAlert.deleteMany({ inventoryItem: req.params.id });

    await InventoryItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all suppliers
router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: new RegExp(escapedSearch, 'i') },
        { contact: new RegExp(escapedSearch, 'i') },
        { email: new RegExp(escapedSearch, 'i') }
      ];
    }

    const suppliers = await Supplier.find(filter)
      .populate('materials', 'partNumber material')
      .sort({ name: 1 });

    res.json({ data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new supplier
router.post('/suppliers', authenticateToken, authorizeRoles('admin', 'manager', 'purchasing'), async (req, res) => {
  try {
    const {
      name,
      contact,
      email,
      phone,
      address,
      leadTime,
      paymentTerms,
      materials = []
    } = req.body;

    const supplier = new Supplier({
      name,
      contact,
      email,
      phone,
      address,
      leadTime,
      paymentTerms,
      materials,
      rating: 5.0,
      status: 'active',
      createdBy: req.user.id
    });

    await supplier.save();
    await supplier.populate('materials', 'partNumber material');

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update supplier
router.put('/suppliers/:id', authenticateToken, authorizeRoles('admin', 'manager', 'purchasing'), async (req, res) => {
  try {
    const updates = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { ...updates, lastUpdated: new Date() },
      { new: true }
    ).populate('materials', 'partNumber material');

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reorder alerts
router.get('/reorder-alerts', authenticateToken, async (req, res) => {
  try {
    const { priority, supplier } = req.query;
    const filter = {};
    
    if (priority) filter.priority = priority;
    if (supplier) filter.supplier = supplier;

    const alerts = await ReorderAlert.find(filter)
      .populate('inventoryItem', 'partNumber material description currentStock reorderPoint')
      .populate('supplier', 'name leadTime')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ data: alerts });
  } catch (error) {
    console.error('Error fetching reorder alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create reorder alert
router.post('/reorder-alerts', authenticateToken, authorizeRoles('admin', 'manager', 'inventory'), async (req, res) => {
  try {
    const {
      inventoryItem,
      supplier,
      suggestedQuantity,
      priority = 'medium',
      notes
    } = req.body;

    // Get inventory item details
    const item = await InventoryItem.findById(inventoryItem)
      .populate('supplier', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Calculate estimated cost
    const estimatedCost = suggestedQuantity * item.averageCost;

    const alert = new ReorderAlert({
      inventoryItem,
      supplier: supplier || item.supplier._id,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      suggestedQuantity,
      priority,
      estimatedCost,
      notes,
      createdBy: req.user.id
    });

    await alert.save();
    await alert.populate([
      { path: 'inventoryItem', select: 'partNumber material description' },
      { path: 'supplier', select: 'name leadTime' }
    ]);

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating reorder alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory forecasts
router.get('/forecasts', authenticateToken, async (req, res) => {
  try {
    const forecasts = await InventoryForecast.find({ isActive: true })
      .populate('inventoryItem', 'partNumber material currentStock minStock maxStock')
      .sort({ confidence: -1, predictedStockOutDate: 1 });

    res.json({ data: forecasts });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate inventory forecasts (admin only)
router.post('/forecasts/generate', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    // This would typically involve complex calculations based on historical data
    // For now, we'll create sample forecasts
    
    const items = await InventoryItem.find({ status: { $ne: 'out-of-stock' } })
      .limit(20);

    const forecasts = [];

    for (const item of items) {
      // Get recent movements to calculate average usage
      const recentMovements = await InventoryMovement.find({
        inventoryItem: item._id,
        movementType: 'out',
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
      });

      if (recentMovements.length > 0) {
        const totalUsage = recentMovements.reduce((sum, mov) => sum + mov.quantity, 0);
        const averageMonthlyUsage = totalUsage / 3; // 3 months

        if (averageMonthlyUsage > 0) {
          const daysUntilStockOut = Math.floor(item.currentStock / (averageMonthlyUsage / 30));
          const recommendedOrder = Math.max(
            item.minStock,
            Math.ceil(averageMonthlyUsage * 2) // 2 months supply
          );

          const confidence = Math.min(95, 60 + (recentMovements.length * 5));

          const forecast = new InventoryForecast({
            inventoryItem: item._id,
            currentStock: item.currentStock,
            averageMonthlyUsage,
            predictedStockOutDate: new Date(Date.now() + daysUntilStockOut * 24 * 60 * 60 * 1000),
            recommendedOrderQuantity: recommendedOrder,
            confidence,
            generatedBy: req.user.id
          });

          await forecast.save();
          forecasts.push(forecast);
        }
      }
    }

    res.json({ 
      message: `Generated ${forecasts.length} forecasts`,
      data: forecasts 
    });
  } catch (error) {
    console.error('Error generating forecasts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Basic inventory stats
    const totalItems = await InventoryItem.countDocuments();
    const lowStockItems = await InventoryItem.countDocuments({ status: 'low-stock' });
    const outOfStockItems = await InventoryItem.countDocuments({ status: 'out-of-stock' });
    
    // Calculate total inventory value
    const inventoryValue = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$averageCost'] } }
        }
      }
    ]);

    // Movement analytics
    const recentMovements = await InventoryMovement.find({
      createdAt: { $gte: startDate }
    });

    const movementsByType = recentMovements.reduce((acc, mov) => {
      acc[mov.movementType] = (acc[mov.movementType] || 0) + mov.quantity;
      return acc;
    }, {});

    // Top moving items
    const topMovers = await InventoryMovement.aggregate([
      { $match: { createdAt: { $gte: startDate }, movementType: 'out' } },
      {
        $group: {
          _id: '$inventoryItem',
          totalMovement: { $sum: '$quantity' },
          movementCount: { $sum: 1 }
        }
      },
      { $sort: { totalMovement: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' }
    ]);

    // Supplier performance
    const supplierPerformance = await Supplier.aggregate([
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id',
          foreignField: 'supplier',
          as: 'items'
        }
      },
      {
        $project: {
          name: 1,
          rating: 1,
          leadTime: 1,
          itemCount: { $size: '$items' },
          totalValue: {
            $sum: {
              $map: {
                input: '$items',
                as: 'item',
                in: { $multiply: ['$$item.currentStock', '$$item.averageCost'] }
              }
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      summary: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: inventoryValue[0]?.totalValue || 0,
        period: parseInt(period)
      },
      movements: {
        byType: movementsByType,
        total: recentMovements.length
      },
      topMovers: topMovers.slice(0, 10),
      suppliers: supplierPerformance.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;