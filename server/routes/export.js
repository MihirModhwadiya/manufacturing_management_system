import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import ManufacturingOrder from '../models/ManufacturingOrder.js';
import WorkOrder from '../models/WorkOrder.js';
import BillOfMaterial from '../models/BillOfMaterial.js';
import StockLedger from '../models/StockLedger.js';
import Material from '../models/Material.js';

const router = express.Router(); // Create Express router for export endpoints

// Helper function: converts data to CSV format
const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  // Create CSV header row
  const csvHeaders = headers.join(',');
  
  // Convert each data row to CSV format
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = getNestedProperty(item, header);
      // Wrap values containing commas in quotes and escape existing quotes
      return typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\\n');
};

// Helper function: safely access nested object properties
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// API endpoint: GET /export/users - Export all users to CSV (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch all users with selected fields
    const users = await User.find().select('name email role isActive createdAt lastLogin').lean();
    
    // Define CSV headers matching the data fields
    const headers = ['name', 'email', 'role', 'isActive', 'createdAt', 'lastLogin'];
    
    // Convert users data to CSV format
    const csvData = convertToCSV(users, headers);
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Server error while exporting users.' });
  }
});

// API endpoint: GET /export/manufacturing-orders - Export manufacturing orders (admin only)
router.get('/manufacturing-orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch manufacturing orders with product details
    const orders = await ManufacturingOrder.find()
      .populate('product', 'name code')
      .lean();
    
    // Transform data for CSV export
    const exportData = orders.map(order => ({
      orderNumber: order.orderNumber,
      productName: order.product?.name,
      productCode: order.product?.code,
      quantity: order.quantity,
      priority: order.priority,
      status: order.status,
      dueDate: order.dueDate,
      createdAt: order.createdAt,
      notes: order.notes
    }));
    
    const headers = ['orderNumber', 'productName', 'productCode', 'quantity', 'priority', 'status', 'dueDate', 'createdAt', 'notes'];
    const csvData = convertToCSV(exportData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=manufacturing_orders_export.csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('Export manufacturing orders error:', error);
    res.status(500).json({ message: 'Server error while exporting manufacturing orders.' });
  }
});

// API endpoint: GET /export/work-orders - Export work orders (admin only)
router.get('/work-orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch work orders with related data
    const workOrders = await WorkOrder.find()
      .populate('manufacturingOrder', 'orderNumber')
      .populate('machine', 'name code')
      .populate('assignedTo', 'name email')
      .lean();
    
    // Transform data for CSV export
    const exportData = workOrders.map(order => ({
      workOrderNumber: order.workOrderNumber,
      manufacturingOrder: order.manufacturingOrder?.orderNumber,
      machineName: order.machine?.name,
      machineCode: order.machine?.code,
      assignedTo: order.assignedTo?.name,
      status: order.status,
      startDate: order.startDate,
      estimatedHours: order.estimatedHours,
      actualHours: order.actualHours,
      completedDate: order.completedDate,
      instructions: order.instructions
    }));
    
    const headers = ['workOrderNumber', 'manufacturingOrder', 'machineName', 'machineCode', 'assignedTo', 'status', 'startDate', 'estimatedHours', 'actualHours', 'completedDate', 'instructions'];
    const csvData = convertToCSV(exportData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=work_orders_export.csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('Export work orders error:', error);
    res.status(500).json({ message: 'Server error while exporting work orders.' });
  }
});

// API endpoint: GET /export/bom - Export Bills of Materials (admin only)
router.get('/bom', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch BOMs with product and material details
    const boms = await BillOfMaterial.find()
      .populate('product', 'name code')
      .populate('materials.material', 'name code unit')
      .lean();
    
    // Transform nested materials data for CSV export
    const exportData = [];
    boms.forEach(bom => {
      bom.materials.forEach(mat => {
        exportData.push({
          productName: bom.product?.name,
          productCode: bom.product?.code,
          version: bom.version,
          materialName: mat.material?.name,
          materialCode: mat.material?.code,
          materialUnit: mat.material?.unit,
          quantity: mat.quantity,
          notes: bom.notes,
          isActive: bom.isActive,
          createdAt: bom.createdAt
        });
      });
    });
    
    const headers = ['productName', 'productCode', 'version', 'materialName', 'materialCode', 'materialUnit', 'quantity', 'notes', 'isActive', 'createdAt'];
    const csvData = convertToCSV(exportData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bom_export.csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('Export BOM error:', error);
    res.status(500).json({ message: 'Server error while exporting BOM.' });
  }
});

// API endpoint: GET /export/stock-movements - Export stock ledger movements (admin only)
router.get('/stock-movements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch stock movements with material and user details
    const movements = await StockLedger.find()
      .populate('material', 'name code unit')
      .populate('createdBy', 'name email')
      .lean();
    
    // Transform data for CSV export
    const exportData = movements.map(movement => ({
      materialName: movement.material?.name,
      materialCode: movement.material?.code,
      materialUnit: movement.material?.unit,
      movementType: movement.movementType,
      quantity: movement.quantity,
      balanceAfter: movement.balanceAfter,
      reason: movement.reason,
      reference: movement.reference,
      notes: movement.notes,
      createdBy: movement.createdBy?.name,
      createdAt: movement.createdAt
    }));
    
    const headers = ['materialName', 'materialCode', 'materialUnit', 'movementType', 'quantity', 'balanceAfter', 'reason', 'reference', 'notes', 'createdBy', 'createdAt'];
    const csvData = convertToCSV(exportData, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_movements_export.csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('Export stock movements error:', error);
    res.status(500).json({ message: 'Server error while exporting stock movements.' });
  }
});

// API endpoint: GET /export/materials - Export materials inventory (admin only)
router.get('/materials', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Fetch all materials with stock information
    const materials = await Material.find().lean();
    
    const headers = ['name', 'code', 'description', 'unit', 'stockQuantity', 'minStockLevel', 'maxStockLevel', 'unitCost', 'supplier', 'isActive', 'createdAt'];
    const csvData = convertToCSV(materials, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=materials_export.csv');
    
    res.send(csvData);
  } catch (error) {
    console.error('Export materials error:', error);
    res.status(500).json({ message: 'Server error while exporting materials.' });
  }
});

// API endpoint: GET /export/all - Export all data in a ZIP file (admin only)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // This would require additional libraries like 'archiver' for ZIP creation
    // For now, return JSON format with all data
    const [users, orders, workOrders, boms, movements, materials] = await Promise.all([
      User.find().select('name email role isActive createdAt').lean(),
      ManufacturingOrder.find().populate('product', 'name code').lean(),
      WorkOrder.find().populate('manufacturingOrder machine assignedTo').lean(),
      BillOfMaterial.find().populate('product materials.material').lean(),
      StockLedger.find().populate('material createdBy').lean(),
      Material.find().lean()
    ]);
    
    const exportData = {
      users,
      manufacturingOrders: orders,
      workOrders,
      billsOfMaterials: boms,
      stockMovements: movements,
      materials,
      exportedAt: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=complete_export.json');
    
    res.json(exportData);
  } catch (error) {
    console.error('Export all data error:', error);
    res.status(500).json({ message: 'Server error while exporting all data.' });
  }
});

export default router;