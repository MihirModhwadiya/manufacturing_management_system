import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React from 'react';import React from 'react';import React, { useState } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { Header } from '@/components/layout/Header';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Header } from '@/components/layout/Header';

import { Button } from '@/components/ui/button';

import { profileReportAPI } from '@/lib/api';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Header } from '@/components/layout/Header';

import { toast } from 'sonner';

import { AlertCircle, Loader2 } from 'lucide-react';import { Button } from '@/components/ui/button';



export default function ProfileReports() {import { Input } from '@/components/ui/input';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);import { Label } from '@/components/ui/label';



  const loadReports = async () => {import { Badge } from '@/components/ui/badge';import { Button } from '@/components/ui/button';

    try {

      setLoading(true);import { profileReportAPI } from '@/lib/api';

      const response = await profileReportAPI.getAll({ limit: 10 });

      setReports(response.reports || []);import { toast } from 'sonner';import { Input } from '@/components/ui/input';const ProfileReports = () => {

    } catch (error) {

      console.error('Failed to load profile reports:', error);import { 

      toast.error('Failed to load profile reports');

      setReports([]);  User, import { Label } from '@/components/ui/label';

    } finally {

      setLoading(false);  TrendingUp, 

    }

  };  Clock, import { Badge } from '@/components/ui/badge';  return (



  useEffect(() => {  Award, 

    loadReports();

  }, []);  AlertCircle,import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



  if (loading) {  Search,

    return (

      <div className="space-y-6">  Calendar,import { profileReportAPI } from '@/lib/api';    <div className="p-6">const ProfileReports = () => {import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

        <Header 

          title="Profile Reports"  Download,

          subtitle="Employee performance and analytics reports"

        />  Eye,import { toast } from 'sonner';

        <div className="flex items-center justify-center h-64">

          <Loader2 className="h-8 w-8 animate-spin" />  Loader2

        </div>

      </div>} from 'lucide-react';import {       <h1 className="text-2xl font-bold mb-4">Profile Reports</h1>

    );

  }



  return (interface ProfileReport {  User, 

    <div className="space-y-6">

      <Header   _id: string;

        title="Profile Reports"

        subtitle="Employee performance and analytics reports"  employeeId: string;  TrendingUp,       <p className="text-gray-600">This page is under maintenance and will be restored soon.</p>  return (

      />

  employeeName: string;

      <Card>

        <CardContent className="flex flex-col items-center justify-center h-64">  reportPeriod: {  Clock, 

          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />

          <h3 className="text-lg font-medium mb-2">Profile Reports Module</h3>    startDate: string;

          <p className="text-muted-foreground text-center mb-4">

            This module is being rebuilt with enhanced functionality. It will display employee performance analytics and reports.    endDate: string;  Award,     </div>

          </p>

          <Button onClick={loadReports} variant="outline">  };

            Refresh Data

          </Button>  metrics: {  AlertCircle,

        </CardContent>

      </Card>    tasksCompleted: number;

    </div>

  );    averageCompletionTime: number;  Search,  );    <div className="p-6">import { Button } from '@/components/ui/button';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

}
    qualityScore: number;

    efficiency: number;  Calendar,

    laborCost: number;

  };  Download,};

  workOrders: string[];

  status: 'draft' | 'completed' | 'approved';  Eye,

  createdAt: string;

  updatedAt: string;  Loader2      <h1 className="text-2xl font-bold mb-4">Profile Reports</h1>

}

} from 'lucide-react';

export default function ProfileReports() {

  const [reports, setReports] = useState<ProfileReport[]>([]);export default ProfileReports;

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');interface ProfileReport {      <p className="text-gray-600">This page is under maintenance and will be restored soon.</p>import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



  const loadReports = async () => {  _id: string;

    try {

      setLoading(true);  employeeId: string;    </div>

      const response = await profileReportAPI.getAll({ limit: 10 });

      setReports(response.reports || []);  employeeName: string;

    } catch (error: any) {

      console.error('Failed to load profile reports:', error);  reportPeriod: {  );import { Badge } from '@/components/ui/badge';import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

      toast.error('Failed to load profile reports');

      setReports([]);    startDate: string;

    } finally {

      setLoading(false);    endDate: string;};

    }

  };  };



  useEffect(() => {  metrics: {import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

    loadReports();

  }, []);    tasksCompleted: number;



  const getStatusColor = (status: string) => {    averageCompletionTime: number;export default ProfileReports;

    switch (status) {

      case 'completed': return 'bg-green-100 text-green-800';    qualityScore: number;import { Plus, FileText, BarChart3, Users, Eye } from 'lucide-react';import { Input } from '@/components/ui/input';import { Input } from '@/components/ui/input';

      case 'approved': return 'bg-blue-100 text-blue-800';

      case 'draft': return 'bg-yellow-100 text-yellow-800';    efficiency: number;

      default: return 'bg-gray-100 text-gray-800';

    }    laborCost: number;import { useAuth } from '@/contexts/AuthContext';

  };

  };

  const formatDate = (dateString: string) => {

    return new Date(dateString).toLocaleDateString();  workOrders: string[];import { Label } from '@/components/ui/label';import { Label } from '@/components/ui/label';

  };

  status: 'draft' | 'completed' | 'approved';

  const formatCurrency = (amount: number) => {

    return new Intl.NumberFormat('en-US', {  comments: Array<{const ProfileReports = () => {

      style: 'currency',

      currency: 'USD'    user: string;

    }).format(amount);

  };    message: string;  const { user } = useAuth();import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



  if (loading) {    createdAt: string;

    return (

      <div className="space-y-6">  }>;  const [reports] = useState([]);

        <Header 

          title="Profile Reports"  createdAt: string;

          subtitle="Employee performance and analytics reports"

        />  updatedAt: string;import { Badge } from '@/components/ui/badge';import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

        <div className="flex items-center justify-center h-64">

          <Loader2 className="h-8 w-8 animate-spin" />}

        </div>

      </div>  if (!user) {

    );

  }export default function ProfileReports() {



  return (  const [reports, setReports] = useState<ProfileReport[]>([]);    return (import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';import { Badge } from '@/components/ui/badge';

    <div className="space-y-6">

      <Header   const [loading, setLoading] = useState(true);

        title="Profile Reports"

        subtitle="Employee performance and analytics reports"  const [searchTerm, setSearchTerm] = useState('');      <div className="p-6">

      />

  const [statusFilter, setStatusFilter] = useState<string>('all');

      {/* Search */}

      <Card>  const [currentPage, setCurrentPage] = useState(1);        <div className="text-center">import { useToast } from '@/components/ui/use-toast';import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

        <CardHeader>

          <CardTitle className="flex items-center gap-2">  const [totalPages, setTotalPages] = useState(1);

            <Search className="h-5 w-5" />

            Search Reports          <h1 className="text-2xl font-bold">Profile Reports</h1>

          </CardTitle>

        </CardHeader>  const loadReports = async () => {

        <CardContent>

          <div className="flex gap-4">    try {          <p className="text-gray-600">Please log in to view profile reports</p>import { import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

            <Input

              placeholder="Search by employee name or ID..."      setLoading(true);

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}      const params: any = {        </div>

              className="flex-1"

            />        page: currentPage,

            <Button onClick={loadReports}>

              <Search className="h-4 w-4 mr-2" />        limit: 10      </div>  Plus, FileText, BarChart3, Users, Eyeimport { useToast } from '@/components/ui/use-toast';

              Search

            </Button>      };

          </div>

        </CardContent>          );

      </Card>

      if (searchTerm) params.search = searchTerm;

      {/* Reports */}

      <div className="grid gap-4">      if (statusFilter !== 'all') params.status = statusFilter;  }} from 'lucide-react';import { 

        {reports.length === 0 ? (

          <Card>

            <CardContent className="flex flex-col items-center justify-center h-64">

              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />      const response = await profileReportAPI.getAll(params);

              <h3 className="text-lg font-medium mb-2">No Reports Found</h3>

              <p className="text-muted-foreground text-center">      setReports(response.reports || []);

                No profile reports are available at this time. Check back later or contact your administrator.

              </p>      setTotalPages(Math.ceil(response.total / 10));  return (import { useAuth } from '@/contexts/AuthContext';  Plus, FileText, TrendingUp, Clock, Target, Award, 

            </CardContent>

          </Card>    } catch (error: any) {

        ) : (

          reports.map((report) => (      console.error('Failed to load profile reports:', error);    <div className="p-6 space-y-6">

            <Card key={report._id} className="hover:shadow-md transition-shadow">

              <CardHeader>      toast.error('Failed to load profile reports');

                <div className="flex items-start justify-between">

                  <div className="space-y-1">      setReports([]);      <div className="flex justify-between items-center">  BarChart3, Users, Factory, Calendar, Filter, Eye 

                    <CardTitle className="flex items-center gap-2">

                      <User className="h-5 w-5" />    } finally {

                      {report.employeeName}

                    </CardTitle>      setLoading(false);        <div>

                    <p className="text-sm text-muted-foreground">

                      Employee ID: {report.employeeId}    }

                    </p>

                  </div>  };          <h1 className="text-3xl font-bold text-gray-900">Profile Reports</h1>const ProfileReports = () => {} from 'lucide-react';

                  <Badge className={getStatusColor(report.status)}>

                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}

                  </Badge>

                </div>  useEffect(() => {          <p className="text-gray-600">Track work duration, performance, and manufacturing analytics</p>

              </CardHeader>

              <CardContent>    loadReports();

                <div className="grid gap-4 md:grid-cols-4 mb-4">

                  <div className="text-center">  }, [currentPage, statusFilter]);        </div>  const { user } = useAuth();import { useAuth } from '@/contexts/AuthContext';

                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">

                      <Award className="h-5 w-5" />

                      {report.metrics.tasksCompleted}

                    </div>  const handleSearch = () => {        <Button>

                    <p className="text-sm text-muted-foreground">Tasks Completed</p>

                  </div>    setCurrentPage(1);

                  <div className="text-center">

                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">    loadReports();          <Plus className="h-4 w-4 mr-2" />  const { toast } = useToast();

                      <Clock className="h-5 w-5" />

                      {report.metrics.averageCompletionTime.toFixed(1)}h  };

                    </div>

                    <p className="text-sm text-muted-foreground">Avg. Time</p>          Create Report

                  </div>

                  <div className="text-center">  const getStatusColor = (status: string) => {

                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">

                      <TrendingUp className="h-5 w-5" />    switch (status) {        </Button>  const [reports, setReports] = useState([]);const ProfileReports = () => {

                      {report.metrics.efficiency}%

                    </div>      case 'completed': return 'bg-green-100 text-green-800';

                    <p className="text-sm text-muted-foreground">Efficiency</p>

                  </div>      case 'approved': return 'bg-blue-100 text-blue-800';      </div>

                  <div className="text-center">

                    <div className="text-2xl font-bold text-orange-600">      case 'draft': return 'bg-yellow-100 text-yellow-800';

                      {formatCurrency(report.metrics.laborCost)}

                    </div>      default: return 'bg-gray-100 text-gray-800';  const [loading, setLoading] = useState(false);  const { user } = useAuth();

                    <p className="text-sm text-muted-foreground">Labor Cost</p>

                  </div>    }

                </div>

  };      <Card>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">

                    <span className="flex items-center gap-1">

                      <Calendar className="h-4 w-4" />  const formatDate = (dateString: string) => {        <CardHeader>  const { toast } = useToast();

                      Created: {formatDate(report.createdAt)}

                    </span>    return new Date(dateString).toLocaleDateString();

                    <span>Quality: {report.metrics.qualityScore}%</span>

                  </div>  };          <CardTitle>Profile Reports Dashboard</CardTitle>

                  <div className="flex gap-2">

                    <Button variant="outline" size="sm">

                      <Eye className="h-4 w-4 mr-1" />

                      View  const formatCurrency = (amount: number) => {        </CardHeader>  useEffect(() => {  

                    </Button>

                    <Button variant="outline" size="sm">    return new Intl.NumberFormat('en-US', {

                      <Download className="h-4 w-4 mr-1" />

                      Export      style: 'currency',        <CardContent>

                    </Button>

                  </div>      currency: 'USD'

                </div>

              </CardContent>    }).format(amount);          <p>✅ Profile Reports page is now loading successfully!</p>    // Load reports data here if needed  // For testing - let's start with a simple component that definitely renders

            </Card>

          ))  };

        )}

      </div>          <p>👤 Logged in as: {user.name} ({user.role})</p>

    </div>

  );  if (loading && reports.length === 0) {

}
    return (          <p>🔧 The page functionality is being restored step by step.</p>    setLoading(false);  if (!user) {

      <div className="space-y-6">

        <Header         </CardContent>

          title="Profile Reports"

          subtitle="Employee performance and analytics reports"      </Card>  }, []);    return (

        />

        <div className="flex items-center justify-center h-64">

          <Loader2 className="h-8 w-8 animate-spin" />

        </div>      <Tabs defaultValue="reports" className="w-full">      <div className="p-6">

      </div>

    );        <TabsList className="grid w-full grid-cols-3">

  }

          <TabsTrigger value="reports" className="flex items-center">  if (!user) {        <div className="text-center">

  return (

    <div className="space-y-6">            <FileText className="h-4 w-4 mr-2" />

      <Header 

        title="Profile Reports"            Reports    return (          <h1 className="text-2xl font-bold">Profile Reports</h1>

        subtitle="Employee performance and analytics reports"

      />          </TabsTrigger>



      {/* Filters */}          <TabsTrigger value="analytics" className="flex items-center">      <div className="p-6">          <p className="text-gray-600">Please log in to view profile reports</p>

      <Card>

        <CardHeader>            <BarChart3 className="h-4 w-4 mr-2" />

          <CardTitle className="flex items-center gap-2">

            <Search className="h-5 w-5" />            Analytics        <div className="text-center">        </div>

            Search & Filter Reports

          </CardTitle>          </TabsTrigger>

        </CardHeader>

        <CardContent>          <TabsTrigger value="operators" className="flex items-center">          <h1 className="text-2xl font-bold">Profile Reports</h1>      </div>

          <div className="grid gap-4 md:grid-cols-4">

            <div className="space-y-2">            <Users className="h-4 w-4 mr-2" />

              <Label htmlFor="search">Search</Label>

              <Input            Operators          <p className="text-gray-600">Please log in to view profile reports</p>    );

                id="search"

                placeholder="Employee name or ID..."          </TabsTrigger>

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}        </TabsList>        </div>  }

                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}

              />        

            </div>

            <div className="space-y-2">        <TabsContent value="reports" className="space-y-4">      </div>

              <Label htmlFor="status">Status</Label>

              <Select value={statusFilter} onValueChange={setStatusFilter}>          <Card>

                <SelectTrigger>

                  <SelectValue />            <CardHeader>    );  return (

                </SelectTrigger>

                <SelectContent>              <CardTitle>Profile Reports List</CardTitle>

                  <SelectItem value="all">All Status</SelectItem>

                  <SelectItem value="draft">Draft</SelectItem>            </CardHeader>  }    <div className="p-6 space-y-6">

                  <SelectItem value="completed">Completed</SelectItem>

                  <SelectItem value="approved">Approved</SelectItem>            <CardContent>

                </SelectContent>

              </Select>              {reports.length > 0 ? (      {/* Basic Header */}

            </div>

            <div className="space-y-2">                <Table>

              <Label>Actions</Label>

              <div className="flex gap-2">                  <TableHeader>  return (      <div className="flex justify-between items-center">

                <Button onClick={handleSearch} size="sm">

                  <Search className="h-4 w-4 mr-1" />                    <TableRow>

                  Search

                </Button>                      <TableHead>Report Type</TableHead>    <div className="p-6 space-y-6">        <div>

              </div>

            </div>                      <TableHead>Period</TableHead>

          </div>

        </CardContent>                      <TableHead>Status</TableHead>      {/* Header */}          <h1 className="text-3xl font-bold text-gray-900">Profile Reports</h1>

      </Card>

                      <TableHead>Generated</TableHead>

      {/* Reports List */}

      <div className="grid gap-4">                      <TableHead className="text-right">Actions</TableHead>      <div className="flex justify-between items-center">          <p className="text-gray-600">Track work duration, performance, and manufacturing analytics</p>

        {reports.length === 0 ? (

          <Card>                    </TableRow>

            <CardContent className="flex flex-col items-center justify-center h-64">

              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />                  </TableHeader>        <div>        </div>

              <h3 className="text-lg font-medium mb-2">No Reports Found</h3>

              <p className="text-muted-foreground text-center">                  <TableBody>

                No profile reports match your current filters. Try adjusting your search criteria.

              </p>                    {reports.map((report, index) => (          <h1 className="text-3xl font-bold text-gray-900">Profile Reports</h1>        

            </CardContent>

          </Card>                      <TableRow key={index}>

        ) : (

          reports.map((report) => (                        <TableCell>          <p className="text-gray-600">Track work duration, performance, and manufacturing analytics</p>        <Button>

            <Card key={report._id} className="hover:shadow-md transition-shadow">

              <CardHeader>                          <Badge variant="secondary">{report.type || 'N/A'}</Badge>

                <div className="flex items-start justify-between">

                  <div className="space-y-1">                        </TableCell>        </div>          <Plus className="h-4 w-4 mr-2" />

                    <CardTitle className="flex items-center gap-2">

                      <User className="h-5 w-5" />                        <TableCell>{report.period || 'N/A'}</TableCell>

                      {report.employeeName}

                    </CardTitle>                        <TableCell>                  Create Report

                    <p className="text-sm text-muted-foreground">

                      ID: {report.employeeId} • Period: {formatDate(report.reportPeriod.startDate)} - {formatDate(report.reportPeriod.endDate)}                          <Badge variant="default">{report.status || 'active'}</Badge>

                    </p>

                  </div>                        </TableCell>        <Button>        </Button>

                  <Badge className={getStatusColor(report.status)}>

                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}                        <TableCell>{report.generated || new Date().toLocaleDateString()}</TableCell>

                  </Badge>

                </div>                        <TableCell className="text-right">          <Plus className="h-4 w-4 mr-2" />      </div>

              </CardHeader>

              <CardContent>                          <Button variant="ghost" size="sm">

                <div className="grid gap-4 md:grid-cols-4 mb-4">

                  <div className="text-center">                            <Eye className="h-4 w-4" />          Create Report

                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">

                      <Award className="h-5 w-5" />                          </Button>

                      {report.metrics.tasksCompleted}

                    </div>                        </TableCell>        </Button>      {/* Simple Card to test rendering */}

                    <p className="text-sm text-muted-foreground">Tasks Completed</p>

                  </div>                      </TableRow>

                  <div className="text-center">

                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">                    ))}      </div>      <Card>

                      <Clock className="h-5 w-5" />

                      {report.metrics.averageCompletionTime.toFixed(1)}h                  </TableBody>

                    </div>

                    <p className="text-sm text-muted-foreground">Avg. Completion Time</p>                </Table>        <CardHeader>

                  </div>

                  <div className="text-center">              ) : (

                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">

                      <TrendingUp className="h-5 w-5" />                <div className="text-center py-8">      {/* Status Card */}          <CardTitle>Profile Reports Dashboard</CardTitle>

                      {report.metrics.efficiency}%

                    </div>                  <p className="text-gray-500">No profile reports available yet.</p>

                    <p className="text-sm text-muted-foreground">Efficiency</p>

                  </div>                  <p className="text-sm text-gray-400">Create your first report to get started!</p>      <Card>        </CardHeader>

                  <div className="text-center">

                    <div className="text-2xl font-bold text-orange-600">                </div>

                      {formatCurrency(report.metrics.laborCost)}

                    </div>              )}        <CardHeader>        <CardContent>

                    <p className="text-sm text-muted-foreground">Labor Cost</p>

                  </div>            </CardContent>

                </div>

          </Card>          <CardTitle>Profile Reports Dashboard</CardTitle>          <p>This is a simplified version of the Profile Reports page for testing.</p>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">        </TabsContent>

                    <span className="flex items-center gap-1">

                      <Calendar className="h-4 w-4" />                </CardHeader>          <p>User: {user.name} ({user.role})</p>

                      Created: {formatDate(report.createdAt)}

                    </span>        <TabsContent value="analytics" className="space-y-4">

                    <span>Quality Score: {report.metrics.qualityScore}%</span>

                  </div>          <Card>        <CardContent>          <p>If you can see this, the component is loading properly.</p>

                  <div className="flex gap-2">

                    <Button variant="outline" size="sm">            <CardHeader>

                      <Eye className="h-4 w-4 mr-1" />

                      View Details              <CardTitle>Performance Analytics</CardTitle>          <p>✅ Profile Reports page is now loading successfully!</p>        </CardContent>

                    </Button>

                    <Button variant="outline" size="sm">            </CardHeader>

                      <Download className="h-4 w-4 mr-1" />

                      Export            <CardContent>          <p>👤 Logged in as: {user.name} ({user.role})</p>      </Card>

                    </Button>

                  </div>              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                </div>

              </CardContent>                <div className="text-center">          <p>🔧 The page functionality is being restored step by step.</p>

            </Card>

          ))                  <p className="text-2xl font-bold text-blue-600">0</p>

        )}

      </div>                  <p className="text-gray-600">Total Reports</p>        </CardContent>      {/* Basic Tabs */}



      {/* Pagination */}                </div>

      {totalPages > 1 && (

        <Card>                <div className="text-center">      </Card>      <Tabs defaultValue="reports" className="w-full">

          <CardContent className="flex items-center justify-between py-4">

            <p className="text-sm text-muted-foreground">                  <p className="text-2xl font-bold text-green-600">0h 0m</p>

              Page {currentPage} of {totalPages}

            </p>                  <p className="text-gray-600">Total Work Time</p>        <TabsList className="grid w-full grid-cols-3">

            <div className="flex gap-2">

              <Button                 </div>

                variant="outline" 

                size="sm"                 <div className="text-center">      {/* Tabs */}          <TabsTrigger value="reports">Reports</TabsTrigger>

                disabled={currentPage <= 1}

                onClick={() => setCurrentPage(currentPage - 1)}                  <p className="text-2xl font-bold text-purple-600">N/A</p>

              >

                Previous                  <p className="text-gray-600">Avg Productivity</p>      <Tabs defaultValue="reports" className="w-full">          <TabsTrigger value="analytics">Analytics</TabsTrigger>

              </Button>

              <Button                 </div>

                variant="outline" 

                size="sm"               </div>        <TabsList className="grid w-full grid-cols-3">          <TabsTrigger value="operators">Operators</TabsTrigger>

                disabled={currentPage >= totalPages}

                onClick={() => setCurrentPage(currentPage + 1)}              <p className="text-center text-gray-500 mt-4">Analytics will be available once reports are generated.</p>

              >

                Next            </CardContent>          <TabsTrigger value="reports" className="flex items-center">        </TabsList>

              </Button>

            </div>          </Card>

          </CardContent>

        </Card>        </TabsContent>            <FileText className="h-4 w-4 mr-2" />        

      )}

    </div>        

  );

}        <TabsContent value="operators" className="space-y-4">            Reports        <TabsContent value="reports" className="space-y-4">

          <Card>

            <CardHeader>          </TabsTrigger>          <Card>

              <CardTitle>Operator Performance</CardTitle>

            </CardHeader>          <TabsTrigger value="analytics" className="flex items-center">            <CardHeader>

            <CardContent>

              <Table>            <BarChart3 className="h-4 w-4 mr-2" />              <CardTitle>Profile Reports List</CardTitle>

                <TableHeader>

                  <TableRow>            Analytics            </CardHeader>

                    <TableHead>Operator</TableHead>

                    <TableHead>Employee ID</TableHead>          </TabsTrigger>            <CardContent>

                    <TableHead>Reports</TableHead>

                    <TableHead>Efficiency</TableHead>          <TabsTrigger value="operators" className="flex items-center">              <p>Profile reports functionality is being restored...</p>

                  </TableRow>

                </TableHeader>            <Users className="h-4 w-4 mr-2" />            </CardContent>

                <TableBody>

                  <TableRow>            Operators          </Card>

                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">

                      No operator data available yet.          </TabsTrigger>        </TabsContent>

                    </TableCell>

                  </TableRow>        </TabsList>        

                </TableBody>

              </Table>                <TabsContent value="analytics" className="space-y-4">

            </CardContent>

          </Card>        <TabsContent value="reports" className="space-y-4">          <Card>

        </TabsContent>

      </Tabs>          <Card>            <CardHeader>

    </div>

  );            <CardHeader>              <CardTitle>Performance Analytics</CardTitle>

};

              <CardTitle>Profile Reports List</CardTitle>            </CardHeader>

export default ProfileReports;
            </CardHeader>            <CardContent>

            <CardContent>              <p>Analytics functionality is being restored...</p>

              {reports.length > 0 ? (            </CardContent>

                <Table>          </Card>

                  <TableHeader>        </TabsContent>

                    <TableRow>        

                      <TableHead>Report Type</TableHead>        <TabsContent value="operators" className="space-y-4">

                      <TableHead>Period</TableHead>          <Card>

                      <TableHead>Status</TableHead>            <CardHeader>

                      <TableHead>Generated</TableHead>              <CardTitle>Operator Performance</CardTitle>

                      <TableHead className="text-right">Actions</TableHead>            </CardHeader>

                    </TableRow>            <CardContent>

                  </TableHeader>              <p>Operator analytics functionality is being restored...</p>

                  <TableBody>            </CardContent>

                    {reports.map((report, index) => (          </Card>

                      <TableRow key={index}>        </TabsContent>

                        <TableCell>      </Tabs>

                          <Badge variant="secondary">{report.type || 'N/A'}</Badge>    </div>

                        </TableCell>  );

                        <TableCell>{report.period || 'N/A'}</TableCell>};

                        <TableCell>

                          <Badge variant="default">{report.status || 'active'}</Badge>export default ProfileReports;

                        </TableCell>

                        <TableCell>{report.generated || new Date().toLocaleDateString()}</TableCell>  const [newReport, setNewReport] = useState({

                        <TableCell className="text-right">    reportType: 'operator',

                          <Button variant="ghost" size="sm">    periodStart: '',

                            <Eye className="h-4 w-4" />    periodEnd: '',

                          </Button>    operatorId: '',

                        </TableCell>    workCenterId: '',

                      </TableRow>    manufacturingOrderId: '',

                    ))}    metrics: {

                  </TableBody>      totalWorkTime: 0,

                </Table>      plannedTime: 0,

              ) : (      actualTime: 0,

                <div className="text-center py-8">      setupTime: 0,

                  <p className="text-gray-500">No profile reports available yet.</p>      runTime: 0,

                  <p className="text-sm text-gray-400">Create your first report to get started!</p>      unitsProduced: 0,

                </div>      unitsPlanned: 0,

              )}      defectRate: 0,

            </CardContent>      laborCost: 0

          </Card>    }

        </TabsContent>  });

        

        <TabsContent value="analytics" className="space-y-4">  const reportTypes = [

          <Card>    { value: 'operator', label: 'Operator Report' },

            <CardHeader>    { value: 'workCenter', label: 'Work Center Report' },

              <CardTitle>Performance Analytics</CardTitle>    { value: 'order', label: 'Order Report' },

            </CardHeader>    { value: 'daily', label: 'Daily Report' },

            <CardContent>    { value: 'weekly', label: 'Weekly Report' },

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">    { value: 'monthly', label: 'Monthly Report' }

                <div className="text-center">  ];

                  <p className="text-2xl font-bold text-blue-600">0</p>

                  <p className="text-gray-600">Total Reports</p>  useEffect(() => {

                </div>    loadInitialData();

                <div className="text-center">  }, []);

                  <p className="text-2xl font-bold text-green-600">0h 0m</p>

                  <p className="text-gray-600">Total Work Time</p>  useEffect(() => {

                </div>    loadReports();

                <div className="text-center">  }, [filters, pagination.currentPage]);

                  <p className="text-2xl font-bold text-purple-600">N/A</p>

                  <p className="text-gray-600">Avg Productivity</p>  const loadInitialData = async () => {

                </div>    try {

              </div>      setLoading(true);

              <p className="text-center text-gray-500 mt-4">Analytics will be available once reports are generated.</p>      

            </CardContent>      // Load work centers and operators with fallback

          </Card>      try {

        </TabsContent>        const workCentersData = await workCenterAPI.getAll();

                setWorkCenters(Array.isArray(workCentersData) ? workCentersData : []);

        <TabsContent value="operators" className="space-y-4">      } catch (error) {

          <Card>        console.warn('Failed to load work centers:', error);

            <CardHeader>        setWorkCenters([]);

              <CardTitle>Operator Performance</CardTitle>      }

            </CardHeader>

            <CardContent>      try {

              <Table>        const usersData = await userAPI.getAllUsers();

                <TableHeader>        setOperators((usersData?.users || []).filter(u => u.role === 'operator'));

                  <TableRow>      } catch (error) {

                    <TableHead>Operator</TableHead>        console.warn('Failed to load users:', error);

                    <TableHead>Employee ID</TableHead>        setOperators([]);

                    <TableHead>Reports</TableHead>      }

                    <TableHead>Efficiency</TableHead>      

                  </TableRow>      // Load reports, analytics, and operator data with fallbacks

                </TableHeader>      await Promise.allSettled([

                <TableBody>        loadReports(),

                  <TableRow>        loadAnalytics(),

                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">        loadOperatorAnalytics()

                      No operator data available yet.      ]);

                    </TableCell>

                  </TableRow>    } catch (error) {

                </TableBody>      console.error('Failed to load initial data:', error);

              </Table>      toast({

            </CardContent>        title: 'Warning',

          </Card>        description: 'Some data could not be loaded. The page may not function completely.',

        </TabsContent>        variant: 'destructive'

      </Tabs>      });

    </div>    } finally {

  );      setLoading(false);

};    }

  };

export default ProfileReports;
  const loadReports = async () => {
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: 10
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const data = await profileReportAPI.getAll(params).catch(() => ({ reports: [], pagination: pagination }));
      setReports(data.reports || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load profile reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile reports',
        variant: 'destructive'
      });
      setReports([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await profileReportAPI.getPerformanceAnalytics(filters);
      setAnalytics(analyticsData || null);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics(null);
    }
  };

  const loadOperatorAnalytics = async () => {
    try {
      const operatorData = await profileReportAPI.getOperatorAnalytics({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setOperatorAnalytics(Array.isArray(operatorData) ? operatorData : []);
    } catch (error) {
      console.error('Failed to load operator analytics:', error);
      setOperatorAnalytics([]);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    
    if (!newReport.reportType || !newReport.periodStart || !newReport.periodEnd) {
      toast({
        title: 'Error',
        description: 'Report type, start date, and end date are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const createdReport = await profileReportAPI.create(newReport);
      setReports(prev => [createdReport, ...prev]);
      setIsCreateDialogOpen(false);
      
      setNewReport({
        reportType: 'operator',
        periodStart: '',
        periodEnd: '',
        operatorId: '',
        workCenterId: '',
        manufacturingOrderId: '',
        metrics: {
          totalWorkTime: 0,
          plannedTime: 0,
          actualTime: 0,
          setupTime: 0,
          runTime: 0,
          unitsProduced: 0,
          unitsPlanned: 0,
          defectRate: 0,
          laborCost: 0
        }
      });
      
      toast({
        title: 'Success',
        description: 'Profile report created successfully'
      });

      // Reload analytics
      loadAnalytics();
      loadOperatorAnalytics();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create profile report',
        variant: 'destructive'
      });
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await profileReportAPI.approve(reportId);
      setReports(prev => 
        prev.map(report => 
          report._id === reportId 
            ? { ...report, status: 'approved', approvedBy: user, approvedAt: new Date() }
            : report
        )
      );
      
      toast({
        title: 'Success',
        description: 'Report approved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve report',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'published': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading && reports.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Reports</h1>
          <p className="text-gray-600">Track work duration, performance, and manufacturing analytics</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Profile Report</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportType">Report Type *</Label>
                    <Select 
                      value={newReport.reportType} 
                      onValueChange={(value) => setNewReport(prev => ({ ...prev, reportType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="operator">Operator</Label>
                    <Select 
                      value={newReport.operatorId} 
                      onValueChange={(value) => setNewReport(prev => ({ ...prev, operatorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op._id} value={op._id}>
                            {op.name} ({op.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodStart">Period Start *</Label>
                    <Input
                      id="periodStart"
                      type="datetime-local"
                      value={newReport.periodStart}
                      onChange={(e) => setNewReport(prev => ({ ...prev, periodStart: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodEnd">Period End *</Label>
                    <Input
                      id="periodEnd"
                      type="datetime-local"
                      value={newReport.periodEnd}
                      onChange={(e) => setNewReport(prev => ({ ...prev, periodEnd: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalWorkTime">Work Time (min)</Label>
                    <Input
                      id="totalWorkTime"
                      type="number"
                      value={newReport.metrics.totalWorkTime}
                      onChange={(e) => setNewReport(prev => ({ 
                        ...prev, 
                        metrics: { ...prev.metrics, totalWorkTime: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitsProduced">Units Produced</Label>
                    <Input
                      id="unitsProduced"
                      type="number"
                      value={newReport.metrics.unitsProduced}
                      onChange={(e) => setNewReport(prev => ({ 
                        ...prev, 
                        metrics: { ...prev.metrics, unitsProduced: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defectRate">Defect Rate (%)</Label>
                    <Input
                      id="defectRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newReport.metrics.defectRate}
                      onChange={(e) => setNewReport(prev => ({ 
                        ...prev, 
                        metrics: { ...prev.metrics, defectRate: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Report</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.avgEfficiency ? `${analytics.summary.avgEfficiency.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.avgQualityScore ? analytics.summary.avgQualityScore.toFixed(1) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Work Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.totalWorkTime ? formatTime(analytics.summary.totalWorkTime) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Units Produced</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.totalUnitsProduced || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                <Select 
                  value={filters.reportType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />

                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />

                <Button onClick={loadReports} className="col-span-2">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell className="font-medium">{report.reportId}</TableCell>
                      <TableCell className="capitalize">{report.reportType}</TableCell>
                      <TableCell>
                        {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                      </TableCell>
                      <TableCell>{report.operatorId?.name || 'N/A'}</TableCell>
                      <TableCell>{report.metrics?.efficiency ? `${report.metrics.efficiency.toFixed(1)}%` : 'N/A'}</TableCell>
                      <TableCell>{report.metrics?.unitsProduced || 0}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(report.status)} text-white`}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'manager') && report.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveReport(report._id)}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {reports.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No profile reports found</p>
                </div>
              )}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalReports} total reports)
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.summary.totalReports || 0}</p>
                    <p className="text-gray-600">Total Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {analytics.summary.avgUtilization ? `${analytics.summary.avgUtilization.toFixed(1)}%` : 'N/A'}
                    </p>
                    <p className="text-gray-600">Avg Utilization</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.summary.avgProductivity ? analytics.summary.avgProductivity.toFixed(2) : 'N/A'}
                    </p>
                    <p className="text-gray-600">Avg Productivity</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">No analytics data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Operator Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {operatorAnalytics.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operator</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Avg Efficiency</TableHead>
                      <TableHead>Total Units</TableHead>
                      <TableHead>Work Time</TableHead>
                      <TableHead>Quality Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operatorAnalytics.map((op, index) => (
                      <TableRow key={op._id}>
                        <TableCell className="font-medium">{op.operatorName}</TableCell>
                        <TableCell>{op.operatorId}</TableCell>
                        <TableCell>{op.totalReports}</TableCell>
                        <TableCell>{op.avgEfficiency}%</TableCell>
                        <TableCell>{op.totalUnitsProduced}</TableCell>
                        <TableCell>{formatTime(op.totalWorkTime)}</TableCell>
                        <TableCell>{op.avgQualityScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500">No operator data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileReports;