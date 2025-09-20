import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/layout/Header';
import { qualityControlAPI, workOrderAPI } from '@/lib/api';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Plus, 
  Search, 
  Filter,
  ClipboardCheck,
  BarChart3,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface QualityInspection {
  _id: string;
  inspectionNumber: string;
  productName: string;
  batchNumber: string;
  inspector: string;
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdDate: string;
  completedDate?: string;
  defectsFound: number;
  qualityScore: number;
  notes?: string;
}

interface QualityDefect {
  _id: string;
  defectId: string;
  inspectionId: string;
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  location: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  reportedDate: string;
  resolvedDate?: string;
}

const QualityControl: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inspections');
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [defects, setDefects] = useState<QualityDefect[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data for development
  const mockInspections: QualityInspection[] = [
    {
      _id: '1',
      inspectionNumber: 'QI-2024-001',
      productName: 'Steel Widget A1',
      batchNumber: 'SW-A1-240115',
      inspector: 'John Smith',
      status: 'passed',
      priority: 'medium',
      createdDate: '2024-01-15T08:00:00Z',
      completedDate: '2024-01-15T12:30:00Z',
      defectsFound: 0,
      qualityScore: 98.5,
      notes: 'All quality checks passed within specifications'
    },
    {
      _id: '2',
      inspectionNumber: 'QI-2024-002',
      productName: 'Aluminum Component B2',
      batchNumber: 'AC-B2-240116',
      inspector: 'Sarah Johnson',
      status: 'failed',
      priority: 'high',
      createdDate: '2024-01-16T09:15:00Z',
      completedDate: '2024-01-16T14:45:00Z',
      defectsFound: 3,
      qualityScore: 72.8,
      notes: 'Multiple surface defects detected, batch rejected'
    },
    {
      _id: '3',
      inspectionNumber: 'QI-2024-003',
      productName: 'Precision Gear C3',
      batchNumber: 'PG-C3-240117',
      inspector: 'Mike Wilson',
      status: 'in-progress',
      priority: 'medium',
      createdDate: '2024-01-17T07:30:00Z',
      defectsFound: 1,
      qualityScore: 0,
      notes: 'Inspection in progress, minor dimensional issue found'
    }
  ];

  const mockDefects: QualityDefect[] = [
    {
      _id: '1',
      defectId: 'DEF-001',
      inspectionId: '2',
      defectType: 'Surface Defect',
      severity: 'major',
      description: 'Scratches on product surface exceeding tolerance',
      location: 'Top surface, quadrant 2',
      status: 'open',
      reportedBy: 'Sarah Johnson',
      assignedTo: 'Quality Team',
      reportedDate: '2024-01-16T14:20:00Z'
    },
    {
      _id: '2',
      defectId: 'DEF-002',
      inspectionId: '2',
      defectType: 'Dimensional',
      severity: 'critical',
      description: 'Length measurement 0.5mm outside specification',
      location: 'Length dimension',
      status: 'in-progress',
      reportedBy: 'Sarah Johnson',
      assignedTo: 'Engineering Team',
      reportedDate: '2024-01-16T14:25:00Z'
    },
    {
      _id: '3',
      defectId: 'DEF-003',
      inspectionId: '3',
      defectType: 'Material',
      severity: 'minor',
      description: 'Minor color variation from standard',
      location: 'Surface coating',
      status: 'resolved',
      reportedBy: 'Mike Wilson',
      assignedTo: 'Production Team',
      reportedDate: '2024-01-17T10:15:00Z',
      resolvedDate: '2024-01-17T15:30:00Z'
    }
  ];

  useEffect(() => {
    fetchInspections();
    fetchMetrics();
    fetchWorkOrders();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const data = await qualityControlAPI.getInspections();
      setInspections(data.inspections || []);
      toast({
        title: "Inspections loaded",
        description: `Loaded ${data.inspections?.length || 0} quality inspections`,
      });
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast({
        title: "Error",
        description: "Failed to load quality inspections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const data = await qualityControlAPI.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const data = await workOrderAPI.getAll();
      setWorkOrders(data.workOrders || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'review':
        return 'bg-orange-500';
      case 'open':
        return 'bg-red-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-red-400';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      case 'major':
        return 'bg-red-500';
      case 'minor':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'major':
        return <AlertTriangle className="h-4 w-4" />;
      case 'minor':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || inspection.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredDefects = defects.filter(defect => {
    const matchesSearch = defect.defectType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.defectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const qualityMetrics = {
    totalInspections: inspections.length,
    passedInspections: inspections.filter(i => i.status === 'passed').length,
    failedInspections: inspections.filter(i => i.status === 'failed').length,
    averageQualityScore: inspections.length > 0 
      ? inspections.reduce((sum, i) => sum + i.qualityScore, 0) / inspections.length
      : 0,
    totalDefects: defects.length,
    openDefects: defects.filter(d => d.status === 'open').length,
    resolvedDefects: defects.filter(d => d.status === 'resolved').length,
    criticalDefects: defects.filter(d => d.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Header 
        title="Quality Control" 
        subtitle="Manage quality inspections, defect tracking, and quality metrics"
      />

      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-900">{qualityMetrics.totalInspections}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {qualityMetrics.totalInspections > 0 
                  ? ((qualityMetrics.passedInspections / qualityMetrics.totalInspections) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Quality Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {qualityMetrics.averageQualityScore.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Defects</p>
              <p className="text-2xl font-bold text-gray-900">{qualityMetrics.openDefects}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search inspections, defects, or batch numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inspections">Quality Inspections</TabsTrigger>
          <TabsTrigger value="defects">Defect Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Quality Analytics</TabsTrigger>
        </TabsList>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inspection #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.map((inspection) => (
                    <TableRow key={inspection._id}>
                      <TableCell className="font-medium">{inspection.inspectionNumber}</TableCell>
                      <TableCell>{inspection.productName}</TableCell>
                      <TableCell>{inspection.batchNumber}</TableCell>
                      <TableCell>{inspection.inspector}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStatusBadgeClass(inspection.status)}`}>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getPriorityBadgeClass(inspection.priority)}`}>
                          {inspection.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{inspection.qualityScore.toFixed(1)}%</span>
                          {inspection.qualityScore >= 95 && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {inspection.qualityScore >= 80 && inspection.qualityScore < 95 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {inspection.qualityScore < 80 && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(inspection.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Defects Tab */}
        <TabsContent value="defects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Defect Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Defect ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDefects.map((defect) => (
                    <TableRow key={defect._id}>
                      <TableCell className="font-medium">{defect.defectId}</TableCell>
                      <TableCell>{defect.defectType}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(defect.severity)}
                          <Badge className={`text-white ${getPriorityBadgeClass(defect.severity)}`}>
                            {defect.severity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{defect.description}</TableCell>
                      <TableCell>{defect.location}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStatusBadgeClass(defect.status)}`}>
                          {defect.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{defect.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>
                        {new Date(defect.reportedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Quality Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month Pass Rate:</span>
                    <span className="text-2xl font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Month Pass Rate:</span>
                    <span className="text-lg font-semibold text-gray-900">91.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trend:</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="font-semibold">+2.4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Defect Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Most Common Defect:</span>
                    <span className="font-semibold">Surface Defects</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Critical Defects:</span>
                    <span className="text-red-600 font-semibold">{qualityMetrics.criticalDefects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resolution Time (Avg):</span>
                    <span className="font-semibold">2.5 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quality Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {inspections.filter(i => i.qualityScore >= 95).length}
                  </div>
                  <div className="text-sm text-gray-600">Excellent (95%+)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {inspections.filter(i => i.qualityScore >= 85 && i.qualityScore < 95).length}
                  </div>
                  <div className="text-sm text-gray-600">Good (85-94%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {inspections.filter(i => i.qualityScore >= 70 && i.qualityScore < 85).length}
                  </div>
                  <div className="text-sm text-gray-600">Fair (70-84%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {inspections.filter(i => i.qualityScore < 70).length}
                  </div>
                  <div className="text-sm text-gray-600">Poor (&lt;70%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityControl;