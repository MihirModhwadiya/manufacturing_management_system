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
  Factory,
  Shield,
  CheckCircle,
  Users
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
    roles: ['admin', 'manager'] // Only admin and manager can create/manage manufacturing orders
  },
  {
    title: 'Work Orders',
    href: '/work-orders',
    icon: ClipboardList,
    roles: ['admin', 'manager', 'operator'] // Operators need to see their assigned work orders
  },
  {
    title: 'Work Centers',
    href: '/work-centers',
    icon: Settings,
    roles: ['admin'] // Only admin can manage work centers (equipment setup)
  },
  {
    title: 'Bill of Materials',
    href: '/bom',
    icon: Package,
    roles: ['admin', 'inventory'] // Only admin and inventory can manage BOMs
  },
  {
    title: 'Stock Ledger',
    href: '/stock-ledger',
    icon: Warehouse,
    roles: ['admin', 'inventory', 'operator'] // Operators record movements, inventory manages stock
  },
  {
    title: 'Inventory Management',
    href: '/inventory-management',
    icon: Package,
    roles: ['admin', 'manager', 'inventory'] // Advanced inventory features for management roles
  },
  {
    title: 'Quality Control',
    href: '/quality-control',
    icon: CheckCircle,
    roles: ['admin', 'manager', 'operator'] // Quality inspections accessible to production roles
  },
  {
    title: 'Maintenance',
    href: '/maintenance',
    icon: Settings,
    roles: ['admin', 'manager'] // Maintenance management for admin and managers
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'manager'] // Only admin and manager see overall reports
  },
  {
    title: 'User Management',
    href: '/user-management',
    icon: Users,
    roles: ['admin'] // Only admin can manage users
  },
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    roles: ['admin'] // Only admin has system administration access
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
      <div className="flex h-16 items-center justify-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <Factory className="h-8 w-8 text-primary" />
          <span className="text-lg font-bold text-foreground">ManufactureERP</span>
        </div>
      </div>

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

      {/* User profile section at bottom of sidebar */}
      <div className="border-t border-border p-4">
        {/* User information display with avatar and details */}
        <div className="flex items-center gap-3 mb-3">
          {/* User avatar component with fallback to initials */}
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm font-medium">
              {/* Displays user avatar or first two letters of name in uppercase */}
              {user?.avatar || user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* User details container with name and role */}
          <div className="flex-1 min-w-0">
            {/* User full name with text truncation for long names */}
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            {/* User role with capitalize styling for consistent formatting */}
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        
        {/* User action buttons section */}
        <div className="space-y-1">
          {/* Profile settings navigation link */}
          <NavLink
            to="/profile"                                 // Route to user profile page
            className={({ isActive }) =>
              cn(                                         // Conditional styling for active state
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full",
                isActive                                  // Different styling when on profile page
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            {/* Settings gear icon for profile access */}
            <Settings className="h-4 w-4" />
            Profile & Settings
          </NavLink>
          
          {/* Logout button with click handler */}
          <Button
            variant="ghost"                              // Ghost button styling for subtle appearance
            size="sm"                                    // Small size for compact layout
            onClick={logout}                             // Calls logout function from auth context
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full justify-start"
          >
            {/* Logout icon indicating sign out action */}
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}