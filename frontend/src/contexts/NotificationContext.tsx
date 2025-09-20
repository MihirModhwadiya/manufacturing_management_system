import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'work-order' | 'stock-alert' | 'manufacturing-order' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  userId: string;
  relatedId?: string; // ID of related work order, stock item, etc.
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Mock function to simulate fetching notifications
  // In a real implementation, this would call your backend API
  const fetchNotifications = async (): Promise<Notification[]> => {
    if (!user) return [];
    
    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'work-order',
            title: 'Work Order Completed',
            message: 'Work order WO-001 has been completed by John Doe',
            priority: 'medium',
            read: false,
            createdAt: new Date().toISOString(),
            userId: user.id,
            relatedId: 'WO-001'
          },
          {
            id: '2',
            type: 'stock-alert',
            title: 'Low Stock Alert',
            message: 'Steel Rod inventory is running low (5 units remaining)',
            priority: 'high',
            read: false,
            createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            userId: user.id,
            relatedId: 'MAT-001'
          },
          {
            id: '3',
            type: 'manufacturing-order',
            title: 'Manufacturing Order Started',
            message: 'Production has begun for order MO-123',
            priority: 'low',
            read: true,
            createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            userId: user.id,
            relatedId: 'MO-123'
          }
        ];
        
        resolve(mockNotifications);
      }, 500);
    });
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      
      // Check for new notifications since last check
      const newNotifications = data.filter(notification => 
        new Date(notification.createdAt) > lastCheck && !notification.read
      );
      
      // Show toast notifications for new items (if user has notifications enabled)
      if (newNotifications.length > 0 && user?.notifications) {
        newNotifications.forEach(notification => {
          if (user.notifications?.workOrders && notification.type === 'work-order') {
            toast.info(notification.title, { description: notification.message });
          }
          if (user.notifications?.stockAlerts && notification.type === 'stock-alert') {
            toast.warning(notification.title, { description: notification.message });
          }
          if (user.notifications?.email && notification.type === 'system') {
            toast(notification.title, { description: notification.message });
          }
        });
      }
      
      setNotifications(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear/delete notification
  const clearNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Refresh notifications manually
  const refreshNotifications = () => {
    loadNotifications();
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    // Load notifications immediately
    loadNotifications();

    // Set up polling interval
    const interval = setInterval(loadNotifications, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}