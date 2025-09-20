# Manufacturing ERP Backend Requirements

## Current Status Analysis

### ✅ What We Already Have (MERN Auth Backend)
- Basic authentication system with JWT
- User registration with email verification 
- Password reset functionality
- SMTP email configuration with Gmail
- Express server with MongoDB integration
- Basic user model with email/password

### 🔄 What Needs Modification

## 1. USER MODEL ENHANCEMENT

### Current User Schema:
```javascript
{
  name: String,
  email: String, 
  password: String,
  verified: Boolean,
  resetToken: String,
  resetTokenExpiry: Date
}
```

### Required User Schema:
```javascript
{
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator', 'inventory'],
    required: true
  },
  avatar: String, // Optional avatar initials or URL
  department: String, // Optional department
  employeeId: String, // Optional employee ID
  permissions: [String], // Granular permissions array
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdBy: ObjectId, // Who created this user (admin/manager)
  verified: Boolean,
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 2. AUTHENTICATION ENHANCEMENTS

### A. Role-Based Login
- Modify login endpoint to accept and validate roles
- Return user role in JWT token payload
- Frontend expects: `{ user: { id, name, email, role, avatar }, token }`

### B. Registration with Role Assignment
- Only admins/managers can create new users
- Default role assignment based on creator's permissions
- Email verification still required

### C. JWT Token Enhancement
```javascript
// JWT Payload should include:
{
  userId: ObjectId,
  email: String,
  role: String,
  permissions: [String],
  iat: Number,
  exp: Number
}
```

## 3. ROLE-BASED ACCESS CONTROL (RBAC)

### A. Middleware Implementation
```javascript
// Required middleware functions:
- authenticateToken() // Verify JWT
- authorizeRole(['admin', 'manager']) // Role-based access
- authorizePermission('create_orders') // Permission-based access
```

### B. Permission System
```javascript
const rolePermissions = {
  admin: ['*'], // All permissions
  manager: [
    'view_dashboard', 'create_manufacturing_orders', 'update_manufacturing_orders',
    'view_manufacturing_orders', 'create_work_orders', 'assign_work_orders',
    'view_work_orders', 'update_work_orders', 'view_bom', 'create_bom',
    'update_bom', 'view_stock', 'view_reports', 'manage_users'
  ],
  operator: [
    'view_dashboard', 'view_my_work_orders', 'update_my_work_orders',
    'view_manufacturing_orders', 'update_work_status'
  ],
  inventory: [
    'view_dashboard', 'view_bom', 'update_bom', 'view_stock',
    'update_stock', 'create_stock_movements', 'view_stock_reports'
  ]
}
```

## 4. NEW DATA MODELS REQUIRED

### A. Manufacturing Order Model
```javascript
{
  orderNumber: String, // Auto-generated: MO-YYYY-001
  productName: String,
  productId: ObjectId, // Reference to Product model
  quantity: Number,
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'delayed', 'cancelled'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: Date,
  dueDate: Date,
  completedQuantity: { type: Number, default: 0 },
  assignedTo: ObjectId, // Reference to User (operator)
  progress: { type: Number, default: 0 },
  bomId: ObjectId, // Reference to BOM
  workOrders: [ObjectId], // References to WorkOrder
  notes: String,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### B. Work Order Model
```javascript
{
  orderNumber: String, // Auto-generated: WO-YYYY-001
  operation: String, // Operation name/description
  assignedTo: ObjectId, // Reference to User (operator)
  manufacturingOrderId: ObjectId, // Reference to Manufacturing Order
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'delayed', 'cancelled'],
    default: 'planned'
  },
  estimatedHours: Number,
  actualHours: Number,
  startTime: Date,
  endTime: Date,
  instructions: String,
  notes: String,
  sequence: Number, // Order of operations
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### C. Product Model
```javascript
{
  productCode: String, // Unique product identifier
  productName: String,
  description: String,
  category: String,
  unitOfMeasure: String,
  standardCost: Number,
  isActive: { type: Boolean, default: true },
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### D. Bill of Materials (BOM) Model
```javascript
{
  productId: ObjectId, // Reference to Product
  productName: String, // Denormalized for quick access
  version: String, // BOM version (v1.0, v1.1, etc.)
  isActive: { type: Boolean, default: true },
  totalCost: Number, // Calculated field
  items: [{
    partNumber: String,
    description: String,
    quantity: Number,
    unit: String,
    cost: Number,
    supplier: String,
    leadTime: Number // Days
  }],
  createdBy: ObjectId,
  approvedBy: ObjectId,
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### E. Stock Movement Model
```javascript
{
  partNumber: String,
  description: String,
  movementType: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'transfer'],
    required: true
  },
  quantity: Number,
  unit: String,
  reference: String, // Work order, PO number, etc.
  referenceType: String, // 'work_order', 'purchase_order', etc.
  currentStock: Number, // Stock level after movement
  cost: Number,
  location: String, // Warehouse location
  reason: String, // Reason for movement
  performedBy: ObjectId, // User who made the movement
  createdAt: Date
}
```

## 5. API ENDPOINTS REQUIRED

### A. Authentication Endpoints (Modify Existing)
```
POST /api/auth/register     # Admin/Manager only - create user with role
POST /api/auth/login        # Enhanced with role validation
GET  /api/auth/profile      # Get current user profile
PUT  /api/auth/profile      # Update profile (limited fields)
POST /api/auth/change-password # Change password
```

### B. User Management (New)
```
GET  /api/users             # List users (Admin/Manager)
GET  /api/users/:id         # Get user details
PUT  /api/users/:id         # Update user (Admin/Manager)
PUT  /api/users/:id/status  # Activate/Deactivate user
DELETE /api/users/:id       # Soft delete user
```

### C. Manufacturing Orders (New)
```
GET  /api/manufacturing-orders      # List orders (role-based filter)
POST /api/manufacturing-orders      # Create order (Manager/Admin)
GET  /api/manufacturing-orders/:id  # Get order details
PUT  /api/manufacturing-orders/:id  # Update order
DELETE /api/manufacturing-orders/:id # Cancel order
PUT  /api/manufacturing-orders/:id/status # Update status
```

### D. Work Orders (New)
```
GET  /api/work-orders           # List work orders (role-based)
POST /api/work-orders           # Create work order (Manager/Admin)
GET  /api/work-orders/:id       # Get work order details
PUT  /api/work-orders/:id       # Update work order
PUT  /api/work-orders/:id/start # Start work order (Operator)
PUT  /api/work-orders/:id/complete # Complete work order (Operator)
```

### E. Bill of Materials (New)
```
GET  /api/bom                   # List BOMs
POST /api/bom                   # Create BOM (Manager/Admin/Inventory)
GET  /api/bom/:id               # Get BOM details
PUT  /api/bom/:id               # Update BOM
PUT  /api/bom/:id/approve       # Approve BOM (Manager/Admin)
```

### F. Stock Management (New)
```
GET  /api/stock                 # List stock items
GET  /api/stock/:partNumber     # Get stock details
POST /api/stock/movement        # Create stock movement
GET  /api/stock/movements       # List stock movements
GET  /api/stock/report          # Stock level report
```

### G. Dashboard/Reports (New)
```
GET  /api/dashboard/kpis        # Get KPI data (role-based)
GET  /api/reports/production    # Production reports
GET  /api/reports/inventory     # Inventory reports
GET  /api/reports/efficiency    # Efficiency reports
```

## 6. DATABASE SEEDING REQUIREMENTS

### A. Default Admin User
```javascript
{
  name: "System Administrator",
  email: "admin@company.com",
  password: "hashedPassword",
  role: "admin",
  verified: true,
  isActive: true
}
```

### B. Sample Data for Testing
- 3-4 users with different roles
- 5-10 manufacturing orders in different statuses
- 10-15 work orders linked to manufacturing orders
- 2-3 BOMs with items
- Stock movement history

## 7. TECHNICAL REQUIREMENTS

### A. Environment Variables Update
```
# Existing
MONGO_URI=mongodb://localhost:27017/manufacturing-erp
JWT_SECRET=your-jwt-secret
PORT=5000
CLIENT_URL=http://localhost:5173

# New additions
JWT_EXPIRY=24h
BCRYPT_ROUNDS=12
DEFAULT_ADMIN_EMAIL=admin@company.com
DEFAULT_ADMIN_PASSWORD=Admin@123
COMPANY_NAME=ManufactureERP
```

### B. Package Dependencies to Add
```json
{
  "express-rate-limit": "^6.7.0",     // Rate limiting
  "helmet": "^6.0.1",                 // Security headers
  "express-validator": "^6.14.3",     // Input validation
  "multer": "^1.4.5",                 // File uploads (for avatars)
  "moment": "^2.29.4"                 // Date manipulation
}
```

## 8. SECURITY ENHANCEMENTS

### A. Input Validation
- Validate all inputs using express-validator
- Sanitize user inputs
- File upload restrictions

### B. Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- API calls: 100 per hour per user
- Password reset: 3 per hour per email

### C. Security Headers
- Helmet.js for security headers
- CORS configuration for frontend domain only
- XSS protection

## 9. IMPLEMENTATION PRIORITY

### Phase 1 (Core Authentication)
1. ✅ User model enhancement with roles
2. ✅ Role-based login modification
3. ✅ JWT enhancement with role info
4. ✅ Basic RBAC middleware

### Phase 2 (Core Manufacturing Features)
1. Manufacturing Orders CRUD
2. Work Orders CRUD  
3. Basic dashboard KPIs
4. User management

### Phase 3 (Advanced Features)
1. BOM management
2. Stock management
3. Reports and analytics
4. Advanced permissions

### Phase 4 (Polish & Security)
1. Rate limiting
2. Advanced validation
3. File uploads
4. Audit logging

## 10. FRONTEND INTEGRATION POINTS

### A. API Base URL Configuration
Frontend needs to configure: `VITE_API_BASE_URL=http://localhost:5000`

### B. Authentication Context Update
The existing AuthContext.tsx needs to be updated to:
- Make real API calls instead of mock authentication
- Handle JWT token storage and refresh
- Implement proper error handling
- Support logout with token cleanup

### C. Data Fetching
Replace all mock data imports with real API calls using:
- Axios or fetch for HTTP requests
- React Query for caching and state management
- Proper loading and error states

This comprehensive backend will support the full manufacturing ERP frontend while maintaining security and scalability.