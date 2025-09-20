import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/layout/Header';
import { maintenanceAPI, workOrderAPI } from '@/lib/api';
import { 
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash,
  Settings,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Equipment {
  _id: string;
  equipmentId: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'maintenance' | 'breakdown' | 'retired';
  installationDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceInterval: number; // days
  downtimeHours: number;
  efficiency: number;
}

interface MaintenanceSchedule {
  _id: string;
  equipmentId: {
    _id: string;
    name: string;
    equipmentId: string;
  };
  maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTechnician: {
    _id: string;
    name: string;
  };
  description: string;
  estimatedDuration: number; // hours
  actualDuration?: number; // hours
  parts: Array<{
    partName: string;
    quantity: number;
    cost: number;
  }>;
  notes: string;
}

interface MaintenanceMetrics {
  totalEquipment: number;
  operationalEquipment: number;
  equipmentInMaintenance: number;
  equipmentBreakdown: number;
  avgDowntime: number;
  maintenanceCompliance: number;
  totalMaintenanceCost: number;
  scheduledMaintenanceCount: number;
  overdueMaintenance: number;
}

const Maintenance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [metrics, setMetrics] = useState<MaintenanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);

  // Form states
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    installationDate: '',
    maintenanceInterval: 30
  });

  const [scheduleForm, setScheduleForm] = useState({
    equipmentId: '',
    maintenanceType: 'preventive',
    scheduledDate: '',
    priority: 'medium',
    assignedTechnician: '',
    description: '',
    estimatedDuration: 2,
    parts: []
  });

  useEffect(() => {
    fetchEquipment();
    fetchSchedules();
    fetchMetrics();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const data = await maintenanceAPI.getEquipment();
      setEquipment(data.equipment || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const data = await maintenanceAPI.getSchedules();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await maintenanceAPI.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching maintenance metrics:', error);
    }
  };

  const handleCreateEquipment = async () => {
    try {
      await maintenanceAPI.createEquipment(equipmentForm);
      toast({
        title: "Success",
        description: "Equipment created successfully",
      });
      setIsEquipmentDialogOpen(false);
      setEquipmentForm({
        name: '',
        type: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        location: '',
        installationDate: '',
        maintenanceInterval: 30
      });
      fetchEquipment();
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to create equipment",
        variant: "destructive",
      });
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await maintenanceAPI.createSchedule(scheduleForm);
      toast({
        title: "Success",
        description: "Maintenance scheduled successfully",
      });
      setIsScheduleDialogOpen(false);
      setScheduleForm({
        equipmentId: '',
        maintenanceType: 'preventive',
        scheduledDate: '',
        priority: 'medium',
        assignedTechnician: '',
        description: '',
        estimatedDuration: 2,
        parts: []
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'breakdown':
        return 'bg-red-500';
      case 'retired':
        return 'bg-gray-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(item => 
    statusFilter === '' || item.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Maintenance Management"
        subtitle="Equipment tracking, preventive maintenance, and work order integration"
      />

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-blue-600">{metrics?.totalEquipment || 0}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Operational</p>
              <p className="text-2xl font-bold text-green-600">{metrics?.operationalEquipment || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">In Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{metrics?.equipmentInMaintenance || 0}</p>
            </div>
            <Wrench className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-600">Overdue Maintenance</p>
              <p className="text-2xl font-bold text-red-600">{metrics?.overdueMaintenance || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="schedules">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Equipment Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Operational:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={metrics ? (metrics.operationalEquipment / metrics.totalEquipment) * 100 : 0} className="w-20" />
                      <span className="text-sm font-semibold text-green-600">
                        {metrics ? Math.round((metrics.operationalEquipment / metrics.totalEquipment) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Maintenance:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={metrics ? (metrics.equipmentInMaintenance / metrics.totalEquipment) * 100 : 0} className="w-20" />
                      <span className="text-sm font-semibold text-orange-600">
                        {metrics ? Math.round((metrics.equipmentInMaintenance / metrics.totalEquipment) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Breakdown:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={metrics ? (metrics.equipmentBreakdown / metrics.totalEquipment) * 100 : 0} className="w-20" />
                      <span className="text-sm font-semibold text-red-600">
                        {metrics ? Math.round((metrics.equipmentBreakdown / metrics.totalEquipment) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Maintenance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Downtime:</span>
                    <span className="font-semibold">{metrics?.avgDowntime || 0}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliance Rate:</span>
                    <span className="font-semibold text-green-600">{metrics?.maintenanceCompliance || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-semibold">${(metrics?.totalMaintenanceCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled Tasks:</span>
                    <span className="font-semibold">{metrics?.scheduledMaintenanceCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Maintenance Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Maintenance Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules.slice(0, 5).map((schedule) => (
                  <div key={schedule._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {schedule.maintenanceType === 'preventive' ? (
                          <Calendar className="h-5 w-5 text-blue-600" />
                        ) : schedule.maintenanceType === 'emergency' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Wrench className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{schedule.equipmentId.name}</p>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getPriorityBadgeClass(schedule.priority)} text-white`}>
                        {schedule.priority}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(schedule.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                  <DialogDescription>
                    Enter equipment details to add to inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input
                      id="name"
                      value={equipmentForm.name}
                      onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter equipment name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={equipmentForm.type} onValueChange={(value) => setEquipmentForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production Equipment</SelectItem>
                        <SelectItem value="assembly">Assembly Line</SelectItem>
                        <SelectItem value="testing">Testing Equipment</SelectItem>
                        <SelectItem value="packaging">Packaging Machine</SelectItem>
                        <SelectItem value="hvac">HVAC System</SelectItem>
                        <SelectItem value="electrical">Electrical Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={equipmentForm.manufacturer}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                        placeholder="Manufacturer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={equipmentForm.model}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Model"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={equipmentForm.serialNumber}
                      onChange={(e) => setEquipmentForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="Serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={equipmentForm.location}
                      onChange={(e) => setEquipmentForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Equipment location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installationDate">Installation Date</Label>
                    <Input
                      id="installationDate"
                      type="date"
                      value={equipmentForm.installationDate}
                      onChange={(e) => setEquipmentForm(prev => ({ ...prev, installationDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenanceInterval">Maintenance Interval (Days)</Label>
                    <Input
                      id="maintenanceInterval"
                      type="number"
                      value={equipmentForm.maintenanceInterval}
                      onChange={(e) => setEquipmentForm(prev => ({ ...prev, maintenanceInterval: parseInt(e.target.value) || 30 }))}
                      placeholder="30"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEquipment}>Create Equipment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.equipmentId}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeClass(item.status)} text-white`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.nextMaintenanceDate 
                        ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.efficiency} className="w-16" />
                        <span className="text-xs">{item.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Maintenance Schedule Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                  <DialogDescription>
                    Schedule a maintenance task for equipment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equipmentId">Equipment</Label>
                    <Select value={scheduleForm.equipmentId} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, equipmentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((item) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maintenanceType">Maintenance Type</Label>
                    <Select value={scheduleForm.maintenanceType} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, maintenanceType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="predictive">Predictive</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={scheduleForm.priority} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the maintenance task..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDuration">Estimated Duration (Hours)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={scheduleForm.estimatedDuration}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 2 }))}
                      placeholder="2"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSchedule}>Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule._id}>
                    <TableCell className="font-medium">{schedule.equipmentId.name}</TableCell>
                    <TableCell className="capitalize">{schedule.maintenanceType}</TableCell>
                    <TableCell>{new Date(schedule.scheduledDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeClass(schedule.status)} text-white`}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityBadgeClass(schedule.priority)} text-white`}>
                        {schedule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{schedule.assignedTechnician?.name || 'Unassigned'}</TableCell>
                    <TableCell>{schedule.estimatedDuration}h</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Downtime Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Downtime analytics chart would be here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>Cost trend analysis would be here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Maintenance;