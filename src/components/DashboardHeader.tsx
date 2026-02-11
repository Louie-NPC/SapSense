
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Bell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  userName?: string;
  alertCount?: number;
  onExport?: () => void;
  onNewReport?: () => void;
}

const DashboardHeader = ({ userName, alertCount = 0, onExport, onNewReport }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const handleNewReport = () => {
    if (onNewReport) {
      onNewReport();
    } else {
      navigate('/admin/reports');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 ml-12 md:ml-0">Dashboard</h1>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-60 lg:w-80 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleNewReport}>
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">New Report</span>
          </Button>
          <Button variant="ghost" size="sm" className="relative" onClick={handleNotifications}>
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
              >
                {alertCount > 9 ? '9+' : alertCount}
              </Badge>
            )}
          </Button>
          <ThemeToggle />
          <div className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
            Welcome, {userName}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
