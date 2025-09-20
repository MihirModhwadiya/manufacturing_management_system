import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { inventoryAPI, materialAPI } from '@/lib/api';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, 
  Search, Plus, Edit, Eye, Settings, Users,
  Calendar, BarChart3, Truck, Clock, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: string;
  material: string;
  partNumber: string;
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  averageCost: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
  location: string;
  supplier: string;
  lastUpdated: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  rating: number;
  leadTime: number;
  materials: string[];
  status: 'active' | 'inactive';
}

interface ReorderAlert {
  id: string;
  material: string;
  partNumber: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  priority: 'high' | 'medium' | 'low';
  supplier: string;
  estimatedCost: number;
}

interface InventoryForecast {
  material: string;
  currentStock: number;
  averageUsage: number;
  predictedStockOut: string;
  recommendedOrder: number;
  confidence: number;
}

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reorderAlerts, setReorderAlerts] = useState<ReorderAlert[]>([]);
  const [forecasts, setForecasts] = useState<InventoryForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    material: '',
    partNumber: '',
    description: '',
    minStock: '',
    maxStock: '',
    reorderPoint: '',
    location: '',
    supplier: ''
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    leadTime: '',
    materials: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [itemsRes, suppliersRes, alertsRes, forecastsRes] = await Promise.all([
        inventoryAPI.getItems(),
        inventoryAPI.getSuppliers(),
        inventoryAPI.getReorderAlerts(),
        inventoryAPI.getForecasts()
      ]);
      
      setInventoryItems(itemsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setReorderAlerts(alertsRes.data || []);
      setForecasts(forecastsRes.data || []);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      await inventoryAPI.createItem(newItem);
      toast({
        title: 'Success',
        description: 'Inventory item created successfully'
      });
      setIsItemDialogOpen(false);
      setNewItem({
        material: '',
        partNumber: '',
        description: '',
        minStock: '',
        maxStock: '',
        reorderPoint: '',
        location: '',
        supplier: ''
      });
      loadInventoryData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create inventory item',
        variant: 'destructive'
      });
    }
  };

  const handleCreateSupplier = async () => {
    try {
      await inventoryAPI.createSupplier(newSupplier);
      toast({
        title: 'Success',
        description: 'Supplier created successfully'
      });
      setIsSupplierDialogOpen(false);
      setNewSupplier({
        name: '',
        contact: '',
        email: '',
        phone: '',
        leadTime: '',
        materials: []
      });
      loadInventoryData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create supplier',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in-stock': { label: 'In Stock', className: 'bg-green-100 text-green-800 border-green-200' },
      'low-stock': { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'out-of-stock': { label: 'Out of Stock', className: 'bg-red-100 text-red-800 border-red-200' },
      'overstock': { label: 'Overstock', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['in-stock'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { label: 'High', className: 'bg-red-100 text-red-800 border-red-200' },
      'medium': { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'low': { label: 'Low', className: 'bg-green-100 text-green-800 border-green-200' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['medium'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inventoryStats = {
    totalItems: inventoryItems.length,
    lowStockItems: inventoryItems.filter(item => item.status === 'low-stock').length,
    outOfStockItems: inventoryItems.filter(item => item.status === 'out-of-stock').length,
    totalValue: inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.averageCost), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Advanced inventory tracking, reorder management, and supplier coordination
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Alerts</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Low Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{inventoryStats.lowStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{inventoryStats.outOfStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${inventoryStats.totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                    Recent Reorder Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reorderAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{alert.partNumber}</p>
                          <p className="text-sm text-gray-600">Current: {alert.currentStock} | Reorder: {alert.reorderPoint}</p>
                        </div>
                        {getPriorityBadge(alert.priority)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Inventory Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {forecasts.slice(0, 5).map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{forecast.material}</p>
                          <p className="text-sm text-gray-600">Stock out: {forecast.predictedStockOut}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{forecast.confidence}% confidence</p>
                          <p className="text-xs text-gray-500">Recommend: {forecast.recommendedOrder}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by part number, description, or material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="overstock">Overstock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={newItem.material}
                        onChange={(e) => setNewItem({ ...newItem, material: e.target.value })}
                        placeholder="Enter material name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partNumber">Part Number</Label>
                      <Input
                        id="partNumber"
                        value={newItem.partNumber}
                        onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                        placeholder="Enter part number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minStock">Min Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={newItem.minStock}
                          onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxStock">Max Stock</Label>
                        <Input
                          id="maxStock"
                          type="number"
                          value={newItem.maxStock}
                          onChange={(e) => setNewItem({ ...newItem, maxStock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reorderPoint">Reorder Point</Label>
                      <Input
                        id="reorderPoint"
                        type="number"
                        value={newItem.reorderPoint}
                        onChange={(e) => setNewItem({ ...newItem, reorderPoint: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newItem.location}
                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                        placeholder="Storage location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select 
                        value={newItem.supplier} 
                        onValueChange={(value) => setNewItem({ ...newItem, supplier: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateItem} className="flex-1">
                        Create Item
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsItemDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.partNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.material}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.currentStock}</div>
                          <div className="text-sm text-gray-600">Reorder: {item.reorderPoint}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${(item.currentStock * item.averageCost).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            @${item.averageCost.toFixed(2)}/unit
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
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

          <TabsContent value="reorder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-600" />
                  Reorder Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reorderAlerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{alert.partNumber} - {alert.material}</p>
                                <p className="text-sm text-gray-600">
                                  Current Stock: {alert.currentStock} | Reorder Point: {alert.reorderPoint}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Supplier: {alert.supplier} | Est. Cost: ${alert.estimatedCost}
                                </p>
                              </div>
                              <div className="text-right">
                                {getPriorityBadge(alert.priority)}
                                <p className="text-sm text-gray-600 mt-1">
                                  Suggested: {alert.suggestedQuantity} units
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Truck className="h-3 w-3 mr-1" />
                              Order
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Clock className="h-3 w-3 mr-1" />
                              Snooze
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Supplier Management</h2>
                <p className="text-sm text-gray-600">Manage supplier relationships and performance</p>
              </div>
              
              <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="supplierName">Supplier Name</Label>
                      <Input
                        id="supplierName"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contact Person</Label>
                      <Input
                        id="contact"
                        value={newSupplier.contact}
                        onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                        placeholder="supplier@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leadTime">Lead Time (days)</Label>
                      <Input
                        id="leadTime"
                        type="number"
                        value={newSupplier.leadTime}
                        onChange={(e) => setNewSupplier({ ...newSupplier, leadTime: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateSupplier} className="flex-1">
                        Create Supplier
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSupplierDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{supplier.contact}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{supplier.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{supplier.leadTime} days lead time</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm">Rating: {supplier.rating}/5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Materials: {supplier.materials.length} items
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Inventory Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecasts.map((forecast, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{forecast.material}</h3>
                          <p className="text-sm text-gray-600">
                            Current Stock: {forecast.currentStock} | Avg Usage: {forecast.averageUsage}/month
                          </p>
                        </div>
                        <Badge className={`${forecast.confidence >= 80 ? 'bg-green-100 text-green-800' : 
                          forecast.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                          {forecast.confidence}% Confidence
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Predicted Stock Out</p>
                          <p className="font-medium">{forecast.predictedStockOut}</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600">Recommended Order</p>
                          <p className="font-medium">{forecast.recommendedOrder} units</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-sm text-gray-600">Coverage Period</p>
                          <p className="font-medium">
                            {Math.ceil(forecast.recommendedOrder / forecast.averageUsage)} months
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Inventory Turnover</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2x</div>
                  <p className="text-xs text-gray-600">Per year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Days Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87</div>
                  <p className="text-xs text-gray-600">Days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Stockout Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.1%</div>
                  <p className="text-xs text-gray-600">Of total items</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Carrying Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$24.5K</div>
                  <p className="text-xs text-gray-600">Monthly</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Supplier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-gray-600">On-time delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">ABC Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">A Items</span>
                      <span className="text-xs font-medium">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">B Items</span>
                      <span className="text-xs font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">C Items</span>
                      <span className="text-xs font-medium">50%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Movers - Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Movement</TableHead>
                      <TableHead>Velocity</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Steel Rod 10mm</TableCell>
                      <TableCell>-2,450 units</TableCell>
                      <TableCell>High</TableCell>
                      <TableCell>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Aluminum Sheet</TableCell>
                      <TableCell>-1,820 units</TableCell>
                      <TableCell>Medium</TableCell>
                      <TableCell>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Copper Wire</TableCell>
                      <TableCell>-1,200 units</TableCell>
                      <TableCell>High</TableCell>
                      <TableCell>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}