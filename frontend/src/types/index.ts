// Core type definitions for Manufacturing ERP

export type UserRole = 'admin' | 'manager' | 'operator' | 'inventory';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  employeeId?: string;
  phone?: string;
  notifications?: {
    email: boolean;
    workOrders: boolean;
    stockAlerts: boolean;
    systemUpdates: boolean;
  };
  isActive?: boolean;
  isVerified?: boolean;
  lastLogin?: string;
}

export type OrderStatus = 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  status: OrderStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  dueDate: string;
  completedQuantity: number;
  assignedTo?: string;
  progress: number;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  operation: string;
  assignedTo: string;
  status: OrderStatus;
  estimatedHours: number;
  actualHours?: number;
  startTime?: string;
  endTime?: string;
  manufacturingOrderId: string;
}

export interface BOMItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier?: string;
}

export interface BOM {
  id: string;
  productId: string;
  productName: string;
  version: string;
  items: BOMItem[];
  totalCost: number;
}

export interface StockMovement {
  id: string;
  partNumber: string;
  description: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit: string;
  reference: string;
  date: string;
  currentStock: number;
}

export interface KPI {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'percentage' | 'currency';
}