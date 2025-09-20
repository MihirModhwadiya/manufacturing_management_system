import React from 'react';
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockKPIs, mockManufacturingOrders, mockWorkOrders } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, TrendingUp, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const urgentOrders = mockManufacturingOrders.filter(order => 
    order.priority === 'urgent' || order.status === 'delayed'
  );
  
  const activeWorkOrders = mockWorkOrders.filter(wo => wo.status === 'in-progress');

  return (
    <div className="space-y-6">
      <Header 
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        subtitle="Here's what's happening in your manufacturing operations"
      />

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockKPIs.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Urgent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>Priority Orders</CardTitle>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.orderNumber}</span>
                      <StatusBadge variant={order.status}>{order.status}</StatusBadge>
                      <StatusBadge variant={order.priority}>{order.priority}</StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.productName}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Qty: {order.quantity}</span>
                      <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">{order.progress}%</div>
                    <Progress value={order.progress} className="w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Work Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-info" />
              <CardTitle>Active Work</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeWorkOrders.map((wo) => (
                <div key={wo.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{wo.orderNumber}</span>
                    <StatusBadge variant="in-progress" className="text-xs">Active</StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{wo.operation}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Assigned: {wo.assignedTo}</span>
                    <span>{wo.actualHours || 0}h / {wo.estimatedHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <CardTitle>Production Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Orders Completed</span>
                <div className="flex items-center gap-2">
                  <Progress value={75} className="w-16" />
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On-Time Delivery</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-16" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quality Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-16" />
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Create Manufacturing Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Assign Work Order
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Stock Alert Review
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2" />
                <div className="space-y-1">
                  <p className="text-sm">MO-2024-003 completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                <div className="space-y-1">
                  <p className="text-sm">Low stock alert: Steel Plate</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-info rounded-full mt-2" />
                <div className="space-y-1">
                  <p className="text-sm">New work order assigned</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}