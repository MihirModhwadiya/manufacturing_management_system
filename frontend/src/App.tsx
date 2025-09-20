import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminRoute } from "@/components/AdminRoute";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import ManufacturingOrders from "@/pages/ManufacturingOrders";
import WorkOrders from "@/pages/WorkOrders";
import WorkCenters from "@/pages/WorkCenters";
import BOM from "@/pages/BOM";
import StockLedger from "@/pages/StockLedger";
import InventoryManagement from "@/pages/InventoryManagement";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import QualityControl from "@/pages/QualityControl";
import Maintenance from "@/pages/Maintenance";
import UserManagement from "@/pages/UserManagement";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="manufacturing-orders" element={<ManufacturingOrders />} />
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="work-centers" element={<WorkCenters />} />
              <Route path="profile-reports" element={
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Profile Reports</h2>
                  <p className="text-muted-foreground">This feature is being rebuilt and will be available soon.</p>
                </div>
              } />
              <Route path="bom" element={<BOM />} />
              <Route path="stock-ledger" element={<StockLedger />} />
              <Route path="inventory-management" element={<InventoryManagement />} />
              <Route path="quality-control" element={<QualityControl />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route 
                path="admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
