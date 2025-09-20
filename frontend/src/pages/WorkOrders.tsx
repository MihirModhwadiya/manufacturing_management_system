import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockWorkOrders } from '@/data/mockData';
import { OrderStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Pause, Square, Plus, Search, Filter, Clock, CheckCircle } from 'lucide-react';

export default function WorkOrders() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = mockWorkOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.operation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const myWorkOrders = user?.role === 'operator' 
    ? filteredOrders.filter(wo => wo.assignedTo === user.name)
    : filteredOrders;

  const getActionButton = (workOrder: any) => {
    if (user?.role !== 'operator' && user?.role !== 'manager') return null;

    switch (workOrder.status) {
      case 'planned':
        return (
          <Button size="sm" className="mr-2">
            <Play className="mr-1 h-3 w-3" />
            Start
          </Button>
        );
      case 'in-progress':
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="outline">
              <Pause className="mr-1 h-3 w-3" />
              Pause
            </Button>
            <Button size="sm" variant="default">
              <CheckCircle className="mr-1 h-3 w-3" />
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
              <Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead>Actual Hours</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">{workOrder.orderNumber}</TableCell>
                    <TableCell>{workOrder.operation}</TableCell>
                    <TableCell>
                      <StatusBadge variant={workOrder.status}>{workOrder.status}</StatusBadge>
                    </TableCell>
                    <TableCell>{workOrder.assignedTo}</TableCell>
                    <TableCell>{workOrder.estimatedHours}h</TableCell>
                    <TableCell>{workOrder.actualHours || '-'}h</TableCell>
                    <TableCell>
                      {workOrder.startTime 
                        ? new Date(workOrder.startTime).toLocaleString()
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}