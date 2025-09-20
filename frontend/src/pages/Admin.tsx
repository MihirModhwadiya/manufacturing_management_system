import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, Settings, BarChart3, Database, UserPlus, Trash2, Edit, Shield, Activity,
  Package, ClipboardList, Factory, FileText, Warehouse, Plus, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  userAPI, manufacturingOrderAPI, workOrderAPI, workCenterAPI, 
  bomAPI, stockLedgerAPI, profileReportAPI 
} from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  manufacturingOrders: number;
  workOrders: number;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    manufacturingOrders: 0,
    workOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator'
  });
  
  // Manufacturing management state
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [boms, setBoms] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [profileReports, setProfileReports] = useState([]);
  
  // Dialog states
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showCreateWorkOrder, setShowCreateWorkOrder] = useState(false);
  const [showCreateWorkCenter, setShowCreateWorkCenter] = useState(false);
  const [showCreateBOM, setShowCreateBOM] = useState(false);
  const [showRecordMovement, setShowRecordMovement] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  
  // Manufacturing order form state
  const [newOrder, setNewOrder] = useState({
    product: '',
    quantity: '',
    priority: 'medium',
    dueDate: '',
    notes: ''
  });
  
  // Work order form state
  const [newWorkOrder, setNewWorkOrder] = useState({
    operation: '',
    assignedTo: '',
    priority: 'medium',
    estimatedHours: '',
    instructions: ''
  });
  
  // Work center form state
  const [newWorkCenter, setNewWorkCenter] = useState({
    code: '',
    name: '',
    description: '',
    type: 'manufacturing',
    location: '',
    capacity: '',
    hourlyRate: ''
  });
  
  // Stock movement form state
  const [newMovement, setNewMovement] = useState({
    material: '',
    movementType: 'in',
    quantity: '',
    reason: '',
    reference: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        { users: usersData }, 
        systemStats,
        ordersResponse,
        workOrdersResponse,
        workCentersResponse,
        bomsResponse,
        stockResponse,
        reportsResponse
      ] = await Promise.all([
        userAPI.getAllUsers(),
        userAPI.getSystemStats(),
        manufacturingOrderAPI.getAll().catch(() => ({ orders: [] })),
        workOrderAPI.getAll().catch(() => ({ workOrders: [] })),
        workCenterAPI.getAll().catch(() => []),
        bomAPI.getAll().catch(() => ({ boms: [] })),
        stockLedgerAPI.getAll({ limit: 50 }).catch(() => ({ movements: [] })),
        profileReportAPI.getAll({ limit: 20 }).catch(() => ({ reports: [] }))
      ]);
      
      setUsers(usersData || []);
      setManufacturingOrders(ordersResponse.orders || []);
      setWorkOrders(workOrdersResponse.workOrders || []);
      setWorkCenters(workCentersResponse || []);
      setBoms(bomsResponse.boms || []);
      setStockMovements(stockResponse.movements || []);
      setProfileReports(reportsResponse.reports || []);
      
      setStats({
        totalUsers: systemStats.users?.total || 0,
        activeUsers: systemStats.users?.active || 0,
        manufacturingOrders: systemStats.manufacturing?.orders || 0,
        workOrders: systemStats.manufacturing?.workOrders || 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive"
        });
        return;
      }

      await userAPI.createUser(newUser);
      toast({
        title: "Success",
        description: "User created successfully"
      });
      
      setShowCreateUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'operator' });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await userAPI.updateUser(userId, updates);
      toast({
        title: "Success",
        description: "User updated successfully"
      });
      // Clear editing state and refresh data to show changes
      setEditingUser(null);
      loadData(); // Refresh data
    } catch (error: any) {
      // Display error message from server or fallback message
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive"
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      loadData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = async (user: User) => {
    await handleUpdateUser(user._id, { isActive: !user.isActive });
  };

  // Handle manufacturing order creation
  const handleCreateManufacturingOrder = async () => {
    try {
      // Form validation
      if (!newOrder.product || !newOrder.quantity || !newOrder.dueDate) {
        toast({
          title: "Validation Error",
          description: "Product name, quantity, and due date are required",
          variant: "destructive"
        });
        return;
      }

      const quantity = parseInt(newOrder.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast({
          title: "Validation Error",
          description: "Quantity must be a positive number",
          variant: "destructive"
        });
        return;
      }

      // Create manufacturing order via API
      await manufacturingOrderAPI.create({
        product: newOrder.product,
        quantity: quantity,
        priority: newOrder.priority,
        dueDate: newOrder.dueDate,
        notes: newOrder.notes
      });

      toast({
        title: "Success",
        description: "Manufacturing order created successfully"
      });
      
      // Reset form and close dialog
      setNewOrder({
        product: '',
        quantity: '',
        priority: 'medium',
        dueDate: '',
        notes: ''
      });
      setShowCreateOrder(false);
      
      // Refresh data to show new order
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create manufacturing order",
        variant: "destructive"
      });
    }
  };

  // Handle work order creation
  const handleCreateWorkOrder = async () => {
    try {
      // Form validation
      if (!newWorkOrder.operation) {
        toast({
          title: "Validation Error",
          description: "Operation is required",
          variant: "destructive"
        });
        return;
      }

      // Create work order via API (orderNumber will be auto-generated)
      await workOrderAPI.create({
        manufacturingOrder: newWorkOrder.operation, // Use operation as manufacturing order for now
        machine: newWorkOrder.operation,
        assignedTo: newWorkOrder.assignedTo,
        startDate: new Date().toISOString(),
        estimatedHours: newWorkOrder.estimatedHours ? parseFloat(newWorkOrder.estimatedHours) : undefined,
        instructions: newWorkOrder.instructions
      });

      toast({
        title: "Success",
        description: "Work order created successfully"
      });
      
      // Reset form and close dialog
      setNewWorkOrder({
        operation: '',
        assignedTo: '',
        priority: 'medium',
        estimatedHours: '',
        instructions: ''
      });
      setShowCreateWorkOrder(false);
      
      // Refresh data to show new work order
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create work order",
        variant: "destructive"
      });
    }
  };

  // Handle work center creation
  const handleCreateWorkCenter = async () => {
    try {
      // Form validation
      if (!newWorkCenter.code || !newWorkCenter.name || !newWorkCenter.location) {
        toast({
          title: "Validation Error",
          description: "Code, name, and location are required",
          variant: "destructive"
        });
        return;
      }

      // Create work center via API
      await workCenterAPI.create({
        code: newWorkCenter.code,
        name: newWorkCenter.name,
        description: newWorkCenter.description,
        type: newWorkCenter.type,
        location: newWorkCenter.location,
        capacity: newWorkCenter.capacity ? parseInt(newWorkCenter.capacity) : undefined,
        hourlyRate: newWorkCenter.hourlyRate ? parseFloat(newWorkCenter.hourlyRate) : undefined,
        departmentId: '507f1f77bcf86cd799439011' // Default department ID for now
      });

      toast({
        title: "Success",
        description: "Work center created successfully"
      });
      
      // Reset form and close dialog
      setNewWorkCenter({
        code: '',
        name: '',
        description: '',
        type: 'manufacturing',
        location: '',
        capacity: '',
        hourlyRate: ''
      });
      setShowCreateWorkCenter(false);
      
      // Refresh data to show new work center
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create work center",
        variant: "destructive"
      });
    }
  };

  // Handle stock movement recording
  const handleRecordMovement = async () => {
    try {
      // Form validation
      if (!newMovement.material || !newMovement.quantity || !newMovement.reason) {
        toast({
          title: "Validation Error",
          description: "Material, quantity, and reason are required",
          variant: "destructive"
        });
        return;
      }

      // Create stock movement via API
      await stockLedgerAPI.recordMovement({
        material: newMovement.material,
        movementType: newMovement.movementType,
        quantity: parseFloat(newMovement.quantity),
        reason: newMovement.reason,
        reference: newMovement.reference,
        date: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Stock movement recorded successfully"
      });
      
      // Reset form and close dialog
      setNewMovement({
        material: '',
        movementType: 'in',
        quantity: '',
        reason: '',
        reference: ''
      });
      setShowRecordMovement(false);
      
      // Refresh data to show new movement
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record movement",
        variant: "destructive"
      });
    }
  };

  // Role badge colors
  const getRoleBadgeColor = (role: string) => {
    return 'bg-green-100 text-green-800'; // Default to operator styling
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>
        
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate role assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password (min 8 characters)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-active">User is active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingUser && handleUpdateUser(editingUser._id, editingUser)}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturing Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.manufacturingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="orders">Manufacturing Orders</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="workcenters">Work Centers</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="stock">Stock Ledger</TabsTrigger>
          <TabsTrigger value="reports">Profile Reports</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage system users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Manufacturing Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Manufacturing Orders</h3>
              <p className="text-sm text-muted-foreground">Create and manage manufacturing orders</p>
            </div>
            <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Manufacturing Order</DialogTitle>
                  <DialogDescription>Add a new manufacturing order to the system</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Product Name</Label>
                    <Input 
                      id="product"
                      value={newOrder.product}
                      onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                      placeholder="Enter product name" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity"
                      type="number" 
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                      placeholder="Enter quantity" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newOrder.priority} 
                      onValueChange={(value) => setNewOrder({ ...newOrder, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate"
                      type="date" 
                      value={newOrder.dueDate}
                      onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes"
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                      placeholder="Enter any notes or special instructions" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateOrder(false)}>Cancel</Button>
                  <Button onClick={handleCreateManufacturingOrder}>Create Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {manufacturingOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No manufacturing orders found. Create your first order above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufacturingOrders.slice(0, 10).map((order: any) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.product || order.productName}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={order.priority === 'urgent' ? 'destructive' : 'default'}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Work Orders Tab */}
        <TabsContent value="workorders" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Work Orders</h3>
              <p className="text-sm text-muted-foreground">Create and assign work orders</p>
            </div>
            <Button className="gap-2" onClick={() => setShowCreateWorkOrder(true)}>
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {workOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No work orders found. Create your first work order above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.slice(0, 10).map((wo: any) => (
                      <TableRow key={wo._id}>
                        <TableCell className="font-medium">{wo.orderNumber}</TableCell>
                        <TableCell>{wo.operation}</TableCell>
                        <TableCell>{wo.assignedTo}</TableCell>
                        <TableCell>
                          <Badge variant={wo.status === 'completed' ? 'default' : 'secondary'}>
                            {wo.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Centers Tab */}
        <TabsContent value="workcenters" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Work Centers</h3>
              <p className="text-sm text-muted-foreground">Manage production work centers</p>
            </div>
            <Button className="gap-2" onClick={() => setShowCreateWorkCenter(true)}>
              <Plus className="h-4 w-4" />
              Add Work Center
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                Work centers management - Create and configure production work centers
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOM Tab */}
        <TabsContent value="bom" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Bill of Materials</h3>
              <p className="text-sm text-muted-foreground">Manage product BOMs</p>
            </div>
            <Button className="gap-2" onClick={() => setShowCreateBOM(true)}>
              <Plus className="h-4 w-4" />
              Create BOM
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                BOM management - Define material requirements for products
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Ledger Tab */}
        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Stock Ledger</h3>
              <p className="text-sm text-muted-foreground">Record inventory movements</p>
            </div>
            <Button className="gap-2" onClick={() => setShowRecordMovement(true)}>
              <Plus className="h-4 w-4" />
              Record Movement
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {stockMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No stock movements found. Record your first movement above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.slice(0, 10).map((movement: any) => (
                      <TableRow key={movement._id}>
                        <TableCell>{new Date(movement.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{movement.material}</TableCell>
                        <TableCell>
                          <Badge variant={movement.movementType === 'in' ? 'default' : 'secondary'}>
                            {movement.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>{movement.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Profile Reports</h3>
              <p className="text-sm text-muted-foreground">Generate performance reports</p>
            </div>
            <Button className="gap-2" onClick={() => setShowCreateReport(true)}>
              <Plus className="h-4 w-4" />
              Create Report
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {profileReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No profile reports found. Create your first report above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profileReports.slice(0, 10).map((report: any) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">{report.reportId}</TableCell>
                        <TableCell>{report.reportType}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Manage system-wide settings and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Default User Role</Label>
                  <Select defaultValue="operator">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="1440" className="w-[200px]" />
                </div>
                

                
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                View system usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">

                
                <div>
                  <h4 className="text-sm font-medium mb-2">Role Distribution</h4>
                  <div className="space-y-2">
                    {['operator'].map(role => {
                      const count = users.filter(u => u.role === role).length;
                      const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <span className="capitalize">{role}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manufacturing Creation Dialogs */}
      
      {/* Create Work Order Dialog */}
      <Dialog open={showCreateWorkOrder} onOpenChange={setShowCreateWorkOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Work Order</DialogTitle>
            <DialogDescription>
              Assign operations to workers or work centers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="operation">Operation</Label>
              <Input 
                id="operation" 
                value={newWorkOrder.operation}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, operation: e.target.value })}
                placeholder="Operation description" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input 
                id="assignedTo" 
                value={newWorkOrder.assignedTo}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, assignedTo: e.target.value })}
                placeholder="Worker or work center" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={newWorkOrder.priority} 
                onValueChange={(value) => setNewWorkOrder({ ...newWorkOrder, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input 
                id="estimatedHours" 
                type="number"
                value={newWorkOrder.estimatedHours}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, estimatedHours: e.target.value })}
                placeholder="Estimated completion hours" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea 
                id="instructions"
                value={newWorkOrder.instructions}
                onChange={(e) => setNewWorkOrder({ ...newWorkOrder, instructions: e.target.value })}
                placeholder="Work instructions and notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWorkOrder(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkOrder}>Create Work Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Work Center Dialog */}
      <Dialog open={showCreateWorkCenter} onOpenChange={setShowCreateWorkCenter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Work Center</DialogTitle>
            <DialogDescription>
              Configure a new production work center
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="wcCode">Work Center Code</Label>
              <Input 
                id="wcCode" 
                value={newWorkCenter.code}
                onChange={(e) => setNewWorkCenter({ ...newWorkCenter, code: e.target.value })}
                placeholder="Unique work center code" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wcName">Work Center Name</Label>
              <Input 
                id="wcName" 
                value={newWorkCenter.name}
                onChange={(e) => setNewWorkCenter({ ...newWorkCenter, name: e.target.value })}
                placeholder="Work center name" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wcType">Type</Label>
              <Select 
                value={newWorkCenter.type} 
                onValueChange={(value) => setNewWorkCenter({ ...newWorkCenter, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work center type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wcLocation">Location</Label>
              <Input 
                id="wcLocation" 
                value={newWorkCenter.location}
                onChange={(e) => setNewWorkCenter({ ...newWorkCenter, location: e.target.value })}
                placeholder="Physical location" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wcCapacity">Capacity (units/hour)</Label>
              <Input 
                id="wcCapacity" 
                type="number" 
                value={newWorkCenter.capacity}
                onChange={(e) => setNewWorkCenter({ ...newWorkCenter, capacity: e.target.value })}
                placeholder="Production capacity per hour" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wcHourlyRate">Hourly Rate ($)</Label>
              <Input 
                id="wcHourlyRate" 
                type="number" 
                step="0.01"
                value={newWorkCenter.hourlyRate}
                onChange={(e) => setNewWorkCenter({ ...newWorkCenter, hourlyRate: e.target.value })}
                placeholder="Hourly operating rate" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wcDescription">Description</Label>
              <Textarea 
                id="wcDescription" 
                value={newWorkCenter.description}
                onChange={(e) => setNewWorkCenter({ ...newWorkCenter, description: e.target.value })}
                placeholder="Work center description and capabilities" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWorkCenter(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkCenter}>Add Work Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create BOM Dialog */}
      <Dialog open={showCreateBOM} onOpenChange={setShowCreateBOM}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bill of Materials</DialogTitle>
            <DialogDescription>
              Define material requirements for a product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bomProduct">Product</Label>
              <Input id="bomProduct" placeholder="Product name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bomVersion">Version</Label>
              <Input id="bomVersion" placeholder="BOM version (e.g., v1.0)" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bomQuantity">Base Quantity</Label>
              <Input id="bomQuantity" type="number" placeholder="Base production quantity" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bomMaterials">Materials Required</Label>
              <Textarea id="bomMaterials" placeholder="List required materials, quantities, and specifications" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBOM(false)}>Cancel</Button>
            <Button type="submit">Create BOM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Movement Dialog */}
      <Dialog open={showRecordMovement} onOpenChange={setShowRecordMovement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
            <DialogDescription>
              Record inventory in/out movements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="material">Material</Label>
              <Input 
                id="material" 
                placeholder="Material name or code" 
                value={newMovement.material}
                onChange={(e) => setNewMovement({ ...newMovement, material: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="movementType">Movement Type</Label>
              <Select value={newMovement.movementType} onValueChange={(value) => setNewMovement({ ...newMovement, movementType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smQuantity">Quantity</Label>
              <Input 
                id="smQuantity" 
                type="number" 
                placeholder="Movement quantity" 
                value={newMovement.quantity}
                onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input 
                id="reason" 
                placeholder="Reason for movement" 
                value={newMovement.reason}
                onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference</Label>
              <Input 
                id="reference" 
                placeholder="Order number or reference" 
                value={newMovement.reference}
                onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordMovement(false)}>Cancel</Button>
            <Button onClick={handleRecordMovement}>Record Movement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Report Dialog */}
      <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Profile Report</DialogTitle>
            <DialogDescription>
              Generate performance and profile reports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reportPeriod">Period</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reportFormat">Format</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateReport(false)}>Cancel</Button>
            <Button type="submit">Generate Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}