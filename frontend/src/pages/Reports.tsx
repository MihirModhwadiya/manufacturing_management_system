import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, BarChart3, TrendingUp, Clock, Target, Award, 
  Download, Calendar, Filter, PieChart, Activity, DollarSign 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { manufacturingOrderAPI, workOrderAPI, workCenterAPI, profileReportAPI, userAPI } from '@/lib/api';

// Utility functions for status and priority styling
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'pending':
      return 'bg-gray-500';
    default:
      return 'bg-red-500';
  }
};

const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
};

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  
  // Data states
  const [overviewData, setOverviewData] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalWorkOrders: 0,
    activeWorkCenters: 0,
    totalReports: 0,
    totalUsers: 0
  });
  const [productionData, setProductionData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [costData, setCostData] = useState({
    totalLaborCost: 0,
    costPerUnit: 0,
    totalMaterialCost: 0
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Only admin and manager can access reports
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Access Restricted</h2>
          <p className="text-gray-600 mt-2">Only administrators and managers can access reports.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple APIs
      const [
        manufacturingOrders,
        workOrders,
        workCenters,
        profileReports,
        systemStats
      ] = await Promise.all([
        manufacturingOrderAPI.getAll(),
        workOrderAPI.getAll(),
        workCenterAPI.getAll(),
        profileReportAPI.getAll({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
        userAPI.getSystemStats()
      ]);

      // Process overview data
      const overview = {
        totalOrders: manufacturingOrders.orders?.length || 0,
        completedOrders: manufacturingOrders.orders?.filter(o => o.status === 'completed').length || 0,
        totalWorkOrders: workOrders.workOrders?.length || 0,
        activeWorkCenters: workCenters.workCenters?.filter(wc => wc.status === 'active').length || 0,
        totalReports: profileReports.reports?.length || 0,
        totalUsers: systemStats.stats?.totalUsers || 0
      };
      setOverviewData(overview);

      // Process production data
      const production = manufacturingOrders.orders?.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        product: order.product,
        quantity: order.quantity,
        status: order.status,
        priority: order.priority,
        dueDate: order.dueDate,
        completedAt: order.completedAt
      })) || [];
      setProductionData(production);

      // Process performance data from profile reports
      const performance = profileReports.reports?.map(report => ({
        id: report._id,
        reportType: report.reportType,
        operator: report.operatorId?.name || 'N/A',
        efficiency: report.metrics?.efficiency || 0,
        utilization: report.metrics?.utilization || 0,
        qualityScore: report.metrics?.qualityScore || 0,
        unitsProduced: report.metrics?.unitsProduced || 0,
        period: `${new Date(report.periodStart).toLocaleDateString()} - ${new Date(report.periodEnd).toLocaleDateString()}`
      })) || [];
      setPerformanceData(performance);

      // Process quality data
      const quality = performance.map(p => ({
        operator: p.operator,
        qualityScore: p.qualityScore,
        defectRate: 100 - p.qualityScore, // Assuming quality score is inverse of defect rate
        unitsProduced: p.unitsProduced
      }));
      setQualityData(quality);

      // Calculate cost data
      const costs = {
        totalLaborCost: profileReports.reports?.reduce((sum, r) => sum + (r.metrics?.laborCost || 0), 0) || 0,
        averageOrderValue: production.length > 0 ? (production.length * 1000) : 0, // Placeholder calculation
        costPerUnit: production.length > 0 ? 50 : 0, // Placeholder
        totalMaterialCost: production.reduce((sum, p) => sum + (p.quantity * 25), 0) // Placeholder
      };
      setCostData(costs);
      
    } catch (error) {
      console.error('Failed to load reports data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast({
        title: 'Error',
        description: 'No data to export',
        variant: 'destructive'
      });
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Success',
      description: 'Report exported successfully'
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business intelligence and performance metrics</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label>From:</Label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label>To:</Label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{overviewData.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{overviewData.completedOrders}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Work Orders</p>
              <p className="text-2xl font-bold text-gray-900">{overviewData.totalWorkOrders}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Work Centers</p>
              <p className="text-2xl font-bold text-gray-900">{overviewData.activeWorkCenters}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <BarChart3 className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-2xl font-bold text-gray-900">{overviewData.totalReports}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Labor Cost</p>
              <p className="text-2xl font-bold text-gray-900">${costData.totalLaborCost?.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Production Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold">
                      {overviewData.totalOrders > 0 
                        ? ((overviewData.completedOrders / overviewData.totalOrders) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Work Centers:</span>
                    <span className="font-semibold">{overviewData.activeWorkCenters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">System Users:</span>
                    <span className="font-semibold">{overviewData.totalUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Labor Cost:</span>
                    <span className="font-semibold">${costData.totalLaborCost?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Cost Per Unit:</span>
                    <span className="font-semibold">${costData.costPerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Material Cost:</span>
                    <span className="font-semibold">${costData.totalMaterialCost}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Production Orders</CardTitle>
                <Button 
                  onClick={() => exportToCSV(productionData, 'production_report')}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionData.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeClass(order.priority)}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Performance Metrics</CardTitle>
                <Button 
                  onClick={() => exportToCSV(performanceData, 'performance_report')}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operator</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Quality Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.slice(0, 10).map((perf, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{perf.operator}</TableCell>
                      <TableCell>{perf.period}</TableCell>
                      <TableCell>{perf.efficiency.toFixed(1)}%</TableCell>
                      <TableCell>{perf.utilization.toFixed(1)}%</TableCell>
                      <TableCell>{perf.unitsProduced}</TableCell>
                      <TableCell>{perf.qualityScore.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Quality Analysis</CardTitle>
                <Button 
                  onClick={() => exportToCSV(qualityData, 'quality_report')}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operator</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Defect Rate</TableHead>
                    <TableHead>Units Produced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityData.slice(0, 10).map((quality, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{quality.operator}</TableCell>
                      <TableCell>{quality.qualityScore.toFixed(1)}</TableCell>
                      <TableCell>{quality.defectRate.toFixed(1)}%</TableCell>
                      <TableCell>{quality.unitsProduced}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;