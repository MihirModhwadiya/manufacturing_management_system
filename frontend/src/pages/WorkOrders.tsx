import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { workOrderAPI } from '@/lib/api';
import { OrderStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Pause, Square, Plus, Search, Filter, Clock, CheckCircle, Loader2 } from 'lucide-react';

export default function WorkOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkOrder, setNewWorkOrder] = useState({
    operation: '',
    assignedTo: '',
    priority: 'medium',
    estimatedHours: '',
    instructions: ''
  });

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await workOrderAPI.getAll();
      setWorkOrders(response.workOrders || []);
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
      toast({
        title: "Error",
        description: "Failed to load work orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.workOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.operation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.instructions?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const myWorkOrders = user?.role === 'operator' 
    ? filteredOrders.filter(wo => wo.assignedTo === user.name || wo.assignedTo === user.email)
    : filteredOrders;

  const handleStatusUpdate = async (workOrderId: string, newStatus: string) => {
    try {
      setActionLoading(workOrderId);
      await workOrderAPI.update(workOrderId, { status: newStatus });
      
      // Update local state
      setWorkOrders(prev => prev.map(wo => 
        wo._id === workOrderId ? { ...wo, status: newStatus } : wo
      ));
      
      const getStatusMessage = (status: string): string => {
        switch (status) {
          case 'in-progress':
            return 'started';
          default:
            return status;
        }
      };

      toast({
        title: "Success",
        description: `Work order ${getStatusMessage(newStatus)} successfully.`,
      });
    } catch (error) {
      console.error('Failed to update work order:', error);
      toast({
        title: "Error",
        description: "Failed to update work order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getActionButton = (workOrder: any) => {
    if (user?.role !== 'operator' && user?.role !== 'manager') return null;
    
    const isLoading = actionLoading === workOrder._id;

    switch (workOrder.status) {
      case 'pending':
      case 'planned':
        return (
          <Button 
            size="sm" 
            className="mr-2"
            onClick={() => handleStatusUpdate(workOrder._id, 'in-progress')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Play className="mr-1 h-3 w-3" />
            )}
            Start
          </Button>
        );
      case 'in-progress':
        return (
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusUpdate(workOrder._id, 'pending')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Pause className="mr-1 h-3 w-3" />
              )}
              Pause
            </Button>
            <Button 
              size="sm" 
              variant="default"
              onClick={() => handleStatusUpdate(workOrder._id, 'completed')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="mr-1 h-3 w-3" />
              )}
              Complete
            </Button>
          </div>
        );
      case 'completed':
        return (
          <Button size="sm" variant="ghost" disabled>
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Button>
        );
      default:
        return null;
    }
  };

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
      setShowCreateDialog(false);

      // Refresh the work orders list
      await fetchWorkOrders();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create work order",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: myWorkOrders.length,
    inProgress: myWorkOrders.filter(o => o.status === 'in-progress').length,
    planned: myWorkOrders.filter(o => o.status === 'planned').length,
    completed: myWorkOrders.filter(o => o.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <Header 
        title={user?.role === 'operator' ? 'My Work Orders' : 'Work Orders'}
        subtitle={user?.role === 'operator' ? 'Track and update your assigned work orders' : 'Manage and assign work orders'}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'operator' ? 'My Orders' : 'Total Orders'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-planned">{stats.planned}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-in-progress">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-completed">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Work Orders</CardTitle>
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Work Order
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Orders Table */}
          <div className="rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading work orders...</span>
                </div>
              </div>
            ) : myWorkOrders.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">No work orders found</p>
                  {user?.role === 'manager' || user?.role === 'admin' ? (
                    <p className="text-sm text-muted-foreground mt-1">Create your first work order to get started</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order Number</TableHead>
                    <TableHead>Manufacturing Order</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Est. Hours</TableHead>
                    <TableHead>Actual Hours</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myWorkOrders.map((workOrder) => (
                    <TableRow key={workOrder._id}>
                      <TableCell className="font-medium">{workOrder.workOrderNumber}</TableCell>
                      <TableCell>{workOrder.manufacturingOrder || '-'}</TableCell>
                      <TableCell>{workOrder.operation || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge variant={workOrder.status}>{workOrder.status}</StatusBadge>
                      </TableCell>
                      <TableCell>{workOrder.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>{workOrder.estimatedHours || 0}h</TableCell>
                      <TableCell>{workOrder.actualHours || '-'}h</TableCell>
                      <TableCell>
                        {workOrder.startDate 
                          ? new Date(workOrder.startDate).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {getActionButton(workOrder)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Work Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkOrder}>Create Work Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}