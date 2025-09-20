import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function NotificationTest() {
  const testNotifications = [
    {
      title: 'Work Order Completed',
      message: 'Work order WO-001 has been completed successfully',
      type: 'info' as const
    },
    {
      title: 'Stock Alert',
      message: 'Steel Rod inventory is running low',
      type: 'warning' as const
    },
    {
      title: 'Manufacturing Started',
      message: 'Production has begun for order MO-123',
      type: 'success' as const
    },
    {
      title: 'System Update',
      message: 'System maintenance scheduled for tonight',
      type: 'default' as const
    }
  ];

  const triggerNotification = (notification: typeof testNotifications[0]) => {
    switch (notification.type) {
      case 'info':
        toast.info(notification.title, { description: notification.message });
        break;
      case 'warning':
        toast.warning(notification.title, { description: notification.message });
        break;
      case 'success':
        toast.success(notification.title, { description: notification.message });
        break;
      default:
        toast(notification.title, { description: notification.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {testNotifications.map((notification, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start"
              onClick={() => triggerNotification(notification)}
            >
              {notification.type === 'info' && <CheckCircle className="h-4 w-4 mr-2" />}
              {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 mr-2" />}
              {notification.type === 'success' && <Clock className="h-4 w-4 mr-2" />}
              {notification.type === 'default' && <Bell className="h-4 w-4 mr-2" />}
              {notification.title}
            </Button>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Click buttons above to test different notification types. The notification bell in the header will show mock notifications automatically.
        </div>
      </CardContent>
    </Card>
  );
}