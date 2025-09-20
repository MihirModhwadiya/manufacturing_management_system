import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Warehouse, 
  FileText, 
  Settings,
  LogOut,
  Factory
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'operator', 'inventory']
  },
  {
    title: 'Manufacturing Orders',
    href: '/manufacturing-orders',
    icon: Factory,
    roles: ['admin', 'manager', 'operator']
  },
  {
    title: 'Work Orders',
    href: '/work-orders',
    icon: ClipboardList,
    roles: ['admin', 'manager', 'operator']
  },
  {
    title: 'Bill of Materials',
    href: '/bom',
    icon: Package,
    roles: ['admin', 'manager', 'inventory']
  },
  {
    title: 'Stock Ledger',
    href: '/stock-ledger',
    icon: Warehouse,
    roles: ['admin', 'manager', 'inventory']
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'manager']
  }
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <Factory className="h-8 w-8 text-primary" />
          <span className="text-lg font-bold text-foreground">ManufactureERP</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm font-medium">
              {user?.avatar || user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Settings className="h-4 w-4" />
            Profile & Settings
          </NavLink>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}