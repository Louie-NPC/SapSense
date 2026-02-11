
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import { useNavigationShortcuts } from "@/hooks/use-keyboard-shortcuts";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminPayroll from "./pages/AdminPayroll";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import FarmerDashboard from "./pages/FarmerDashboard";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import DatabaseInit from "./pages/DatabaseInit";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'farmer' }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/farmer'} replace />;
  }
  
  return <>{children}</>;
};

// Route handler for authenticated users
const AuthenticatedRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/farmer" replace />;
  }
};

// Component to enable navigation shortcuts
const NavigationShortcutsProvider = ({ children }: { children: React.ReactNode }) => {
  useNavigationShortcuts();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <NavigationShortcutsProvider>
                <KeyboardShortcutsHelp />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<AuthenticatedRoute />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/monitoring" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/employees" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminEmployees />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/payroll" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminPayroll />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/reports" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminReports />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/farmer" 
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <FarmerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/admin/database" element={<DatabaseInit />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NavigationShortcutsProvider>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
