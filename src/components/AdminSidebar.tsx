
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Users, 
  TreePine, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick?: () => void;
}

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  // Fetch active notification count from PostgreSQL database
  const fetchActiveNotificationCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/active`);
      if (response.ok) {
        const data = await response.json();
        setAlertCount(data.length);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  // Fetch on mount and set up polling interval for real-time updates
  useEffect(() => {
    fetchActiveNotificationCount();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchActiveNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Also refresh when location changes (user navigates)
  useEffect(() => {
    fetchActiveNotificationCount();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotifications = () => {
    navigate('/notifications');
    setIsMobileMenuOpen(false);
  };

  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: TreePine, label: 'Monitoring', path: '/admin/monitoring' },
    { icon: Users, label: 'Employees', path: '/admin/employees' },
    { icon: DollarSign, label: 'Payroll', path: '/admin/payroll' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-white dark:bg-gray-800"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative
        w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-green-700 dark:text-green-400">🥥 SapSense Express</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start px-4 py-3 text-left ${
                isActive(item.path)
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-r-2 border-green-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
          
          {/* Notifications Button */}
          <Button
            variant="ghost"
            className={`w-full justify-start px-4 py-3 text-left relative ${
              location.pathname === '/notifications'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-r-2 border-green-600'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={handleNotifications}
          >
            <Bell className="h-5 w-5 mr-3" />
            Notifications
            {alertCount > 0 && (
              <Badge 
                className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
              >
                {alertCount > 9 ? '9+' : alertCount}
              </Badge>
            )}
          </Button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
