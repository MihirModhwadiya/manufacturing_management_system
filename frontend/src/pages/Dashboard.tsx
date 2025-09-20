import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { manufacturingOrderAPI, workOrderAPI, dashboardAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { NotificationTest } from '@/components/notifications/NotificationTest';
import { AlertTriangle, TrendingUp, Activity, Clock, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch data but continue if some fail (for role-based access)
      const [ordersResponse, workOrdersResponse, analyticsResponse, activityResponse] = await Promise.allSettled([
        manufacturingOrderAPI.getAll().catch(() => ({ orders: [] })),
        workOrderAPI.getAll().catch(() => ({ workOrders: [] })),
        dashboardAPI.getAnalytics('30').catch(() => ({ analytics: { kpis: [] } })), // 30 days
        dashboardAPI.getActivity(5).catch(() => ({ activities: [] })) // 5 recent activities
      ]);
      
      // Extract data from settled promises
      setManufacturingOrders(
        ordersResponse.status === 'fulfilled' ? (ordersResponse.value.orders || []) : []
      );
      setWorkOrders(
        workOrdersResponse.status === 'fulfilled' ? (workOrdersResponse.value.workOrders || []) : []
      );
      setKpis(
        analyticsResponse.status === 'fulfilled' ? (analyticsResponse.value.analytics?.kpis || []) : []
      );
      setRecentActivity(
        activityResponse.status === 'fulfilled' ? (activityResponse.value.activities || []) : []
      );
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Don't show error toast for partial failures, just log
    } finally {
      setLoading(false);
    }
  };
  
  const urgentOrders = manufacturingOrders.filter(order => 
    order.priority === 'urgent' || order.status === 'delayed'
  );
  
  const activeWorkOrders = workOrders.filter(wo => wo.status === 'in-progress');
  const completedToday = manufacturingOrders.filter(o => {
    const completedDate = new Date(o.completedAt);
    const today = new Date();
    return o.status === 'completed' && 
           completedDate.toDateString() === today.toDateString();
  });
  
  // Calculate on-time delivery rate from real data
  const completedOrders = manufacturingOrders.filter(o => o.status === 'completed');
  const onTimeOrders = completedOrders.filter(o => {
    const completedDate = new Date(o.completedAt);
    const dueDate = new Date(o.dueDate);
    return completedDate <= dueDate;
  });
  const onTimeDeliveryRate = completedOrders.length > 0 
    ? Math.round((onTimeOrders.length / completedOrders.length) * 100) 
    : 0;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        subtitle="Here's what's happening in your manufacturing operations"
      />

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
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

        {/* Production Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <CardTitle>Production Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Orders Completed</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {manufacturingOrders.filter(o => o.status === 'completed').length} / {manufacturingOrders.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On-Time Delivery</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{onTimeDeliveryRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Work Orders</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{activeWorkOrders.length}</span>
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
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => {
                  const timeAgo = new Date().getTime() - new Date(activity.timestamp).getTime();
                  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
                  const timeText = hoursAgo < 1 ? 'Just now' : `${hoursAgo}h ago`;
                  
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'completed': return 'bg-success';
                      case 'in-progress': return 'bg-info';
                      case 'pending': return 'bg-warning';
                      default: return 'bg-muted-foreground';
                    }
                  };
                  
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`} />
                      <div className="space-y-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{timeText}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Test */}
        <Card>
          <NotificationTest />
        </Card>
      </div>
    </div>
  );
}