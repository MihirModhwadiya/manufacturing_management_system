import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Wrench, Play, Pause, Settings, MapPin, DollarSign, User, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { workCenterAPI, departmentAPI } from '@/lib/api';

const WorkCenters = () => {
  // State management for work centers data and UI
  const [workCenters, setWorkCenters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [capacitySummary, setCapacitySummary] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state for new work center
  const [newWorkCenter, setNewWorkCenter] = useState({
    code: '',
    name: '',
    description: '',
    type: '',
    location: '',
    capacity: 1,
    hourlyRate: 0,
    departmentId: '',
    managerId: ''
  });

  // Work center types available for selection
  const workCenterTypes = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'assembly', label: 'Assembly' },
    { value: 'quality', label: 'Quality Control' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  // Load work centers and capacity summary on component mount
  useEffect(() => {
    loadWorkCenters();
    loadCapacitySummary();
    loadDepartments();
  }, []);

  // Only admin can access work centers
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Access Restricted</h2>
          <p className="text-gray-600 mt-2">Only administrators can access work center management.</p>
        </div>
      </div>
    );
  }

  // Fetch all work centers from API
  const loadWorkCenters = async () => {
    try {
      setLoading(true);
      const data = await workCenterAPI.getAll();
      setWorkCenters(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load work centers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch capacity summary for dashboard cards
  const loadCapacitySummary = async () => {
    try {
      const data = await workCenterAPI.getCapacitySummary();
      setCapacitySummary(data);
    } catch (error) {
      console.error('Failed to load capacity summary:', error);
    }
  };

  // Fetch all departments for dropdown selection
  const loadDepartments = async () => {
    try {
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  // Handle creating new work center
  const handleCreateWorkCenter = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newWorkCenter.code || !newWorkCenter.name || !newWorkCenter.type || !newWorkCenter.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const createdWorkCenter = await workCenterAPI.create(newWorkCenter);
      setWorkCenters(prev => [...prev, createdWorkCenter]);
      setIsAddDialogOpen(false);
      
      // Reset form
      setNewWorkCenter({
        code: '',
        name: '',
        description: '',
        type: '',
        location: '',
        capacity: 1,
        hourlyRate: 0,
        departmentId: '',
        managerId: ''
      });
      
      toast({
        title: 'Success',
        description: 'Work center created successfully'
      });
      
      // Reload summary after creation
      loadCapacitySummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create work center',
        variant: 'destructive'
      });
    }
  };

  // Handle work center status update
  const handleStatusUpdate = async (workCenterId, newStatus) => {
    try {
      const updatedWorkCenter = await workCenterAPI.update(workCenterId, { status: newStatus });
      setWorkCenters(prev => 
        prev.map(wc => wc._id === workCenterId ? updatedWorkCenter : wc)
      );
      
      toast({
        title: 'Success',
        description: `Work center status updated to ${newStatus}`
      });
      
      // Reload summary after status change
      loadCapacitySummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update work center status',
        variant: 'destructive'
      });
    }
  };

  // Get badge color based on work center status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get user-friendly status display text
  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'In Use';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  // Filter work centers based on selected tab
  const filteredWorkCenters = workCenters.filter(wc => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'available') return wc.status === 'available';
    if (selectedTab === 'inuse') return wc.status === 'busy';
    if (selectedTab === 'maintenance') return wc.status === 'maintenance';
    return false;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Centers</h1>
          <p className="text-gray-600">Manage manufacturing work centers and capacity</p>
        </div>
        
        {/* Add Work Center Button (Admin only) */}
        {user?.role === 'admin' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Work Center
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Work Center</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateWorkCenter} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={newWorkCenter.code}
                      onChange={(e) => setNewWorkCenter(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="WC001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newWorkCenter.name}
                      onChange={(e) => setNewWorkCenter(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Assembly Line 1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newWorkCenter.description}
                    onChange={(e) => setNewWorkCenter(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Work center description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={newWorkCenter.type} 
                      onValueChange={(value) => setNewWorkCenter(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workCenterTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newWorkCenter.location}
                      onChange={(e) => setNewWorkCenter(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Building A, Floor 1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={newWorkCenter.capacity}
                      onChange={(e) => setNewWorkCenter(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newWorkCenter.hourlyRate}
                      onChange={(e) => setNewWorkCenter(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Work Center</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Capacity Summary Cards */}
      {capacitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Work Centers</p>
                <p className="text-2xl font-bold text-gray-900">{capacitySummary.totalWorkCenters}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Play className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {capacitySummary.capacitySummary?.find(s => s._id === 'Available')?.count || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Wrench className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {capacitySummary.capacitySummary?.find(s => s._id === 'Maintenance')?.count || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Hourly Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(capacitySummary.capacitySummary?.reduce((sum, s) => sum + (s.avgHourlyRate || 0), 0) / capacitySummary.capacitySummary?.length || 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Work Centers Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Work Centers</CardTitle>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All Centers</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="inuse">In Use</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkCenters.map((workCenter) => (
                <TableRow key={workCenter._id}>
                  <TableCell className="font-medium">{workCenter.code}</TableCell>
                  <TableCell>{workCenter.name}</TableCell>
                  <TableCell>{workCenter.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {workCenter.location}
                    </div>
                  </TableCell>
                  <TableCell>{workCenter.capacity}</TableCell>
                  <TableCell>${workCenter.hourlyRate}/hr</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeColor(workCenter.status)} text-white`}>
                      {getStatusDisplayText(workCenter.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {workCenter.status === 'available' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(workCenter._id, 'busy')}
                        >
                          Start
                        </Button>
                      )}
                      {workCenter.status === 'busy' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(workCenter._id, 'available')}
                        >
                          Stop
                        </Button>
                      )}
                      {user?.role === 'admin' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusUpdate(workCenter._id, 'maintenance')}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredWorkCenters.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No work centers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkCenters;