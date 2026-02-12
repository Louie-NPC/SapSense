import { useState, useEffect, useCallback } from 'react';
import { Bell, Thermometer, Droplets, MapPin, Menu, Filter, Settings, LogOut, RefreshCw, Loader2, Beaker } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ContainerMap from '@/components/ContainerMap';
import SensorChart from '@/components/SensorChart';
import PredictiveAnalytics from '@/components/PredictiveAnalytics';
import { exportSensorDataToCSV } from '@/lib/exportUtils';
import { treesApi, TreeData } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE_URL = 'http://localhost:3001/api';

interface SensorData {
  id: string;
  name: string;
  ph: number;
  temperature: number;
  volume: number;
  humidity: number;
  batteryLevel: number;
  lastUpdate: Date;
  location: { lat: number; lng: number };
  locationText: string;
  status: 'optimal' | 'warning' | 'critical' | 'harvest';
}

const Index = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [containers, setContainers] = useState<SensorData[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch active notification count from PostgreSQL database
  const fetchActiveNotificationCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/active`);
      if (response.ok) {
        const data = await response.json();
        setAlertCount(data.length);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, []);

  // Fetch notification count on mount and set up polling
  useEffect(() => {
    fetchActiveNotificationCount();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchActiveNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchActiveNotificationCount]);

  // Also refresh when location changes
  useEffect(() => {
    fetchActiveNotificationCount();
  }, [location.pathname, fetchActiveNotificationCount]);

  // Convert database tree to SensorData format
  const treeToSensorData = (tree: TreeData, index: number): SensorData => {
    // Parse values - database returns DECIMAL as strings
    const ph = parseFloat(String(tree.current_ph)) || 0;
    const temperature = parseFloat(String(tree.current_temperature)) || 0;
    const volume = parseFloat(String(tree.current_volume)) || 0;
    
    // Determine status based on pH levels
    let status: SensorData['status'] = 'optimal';
    if (ph === 0) {
      status = 'optimal'; // No data yet
    } else if (ph <= 4.8 || ph >= 7.2) {
      status = 'critical';
    } else if (ph >= 5.0 && ph <= 5.5) {
      status = 'harvest';
    } else if (ph < 5.0 || ph > 6.0) {
      status = 'warning';
    }

    return {
      id: tree.id,
      name: tree.name,
      ph: Number(ph.toFixed(2)),
      temperature: Number(temperature.toFixed(1)),
      volume: Number(volume.toFixed(2)),
      humidity: 75, // Default humidity if not available
      batteryLevel: 85, // Default battery level
      lastUpdate: tree.last_reading ? new Date(tree.last_reading) : new Date(),
      location: {
        lat: 14.5995 + (index * 0.001),
        lng: 120.9842 + (index * 0.001)
      },
      locationText: tree.location || 'Not specified',
      status
    };
  };

  // Fetch trees from database
  const fetchTrees = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      console.log('Fetching trees from API...');
      const trees = await treesApi.getAll();
      console.log('Trees fetched:', trees);
      
      if (!trees || trees.length === 0) {
        console.log('No trees found in database');
        setContainers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const sensorData = trees.map((tree, index) => treeToSensorData(tree, index));
      
      // Update containers with new data
      setContainers(sensorData);
      
    } catch (error) {
      console.error('Error fetching trees:', error);
      // Show error toast
      if (!showRefreshIndicator) {
        toast({
          title: 'Connection Error',
          description: 'Unable to fetch tree data. Make sure the backend server is running on port 3001.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Initialize containers from database
  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  // Poll for real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrees();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchTrees]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchTrees(true);
  };

  const getStatusColor = (status: SensorData['status']) => {
    switch (status) {
      case 'harvest': return 'bg-emerald-500';
      case 'optimal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: SensorData['status']) => {
    switch (status) {
      case 'harvest': return 'Ready to Harvest';
      case 'optimal': return 'Optimal';
      case 'warning': return 'Monitor Closely';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const filteredContainers = filterStatus === 'all' 
    ? containers 
    : containers.filter(c => c.status === filterStatus);

  const totalVolume = containers.reduce((sum, container) => sum + container.volume, 0);
  const harvestReady = containers.filter(c => c.status === 'harvest').length;
  const criticalContainers = containers.filter(c => c.status === 'critical').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  // Container action handlers
  const handleMarkHarvested = async (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Check if there's volume to harvest
    if (container.volume <= 0) {
      toast({
        title: 'No Volume',
        description: 'This container has no sap to harvest.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsHarvesting(containerId);
    try {
      // Call the harvest API - this will:
      // 1. Record the harvest in the database
      // 2. Add the volume to the employee's total_harvest
      // 3. Reset the tree's volume to 0
      // 4. Set the tree status to 'optimal'
      const result = await treesApi.harvestTree(containerId, {
        farmer_id: user?.id,
        farmer_name: user?.name,
      });
      
      // Update local state to reflect the change immediately
      setContainers(prev => prev.map(c => 
        c.id === containerId ? { ...c, status: 'optimal' as const, volume: 0 } : c
      ));
      
      toast({
        title: 'Harvest Recorded',
        description: `Harvested ${result.volume.toFixed(2)}L from ${container.name}. Quality: ${(result.quality * 100).toFixed(0)}%`,
      });
      
      // Refresh data to get updated totals
      fetchTrees();
    } catch (error: any) {
      console.error('Error recording harvest:', error);
      toast({
        title: 'Harvest Failed',
        description: error.message || 'Failed to record harvest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsHarvesting(null);
    }
  };

  const handleSendMaintenance = (containerId: string) => {
    toast({
      title: 'Maintenance Requested',
      description: `Maintenance request sent for container ${containerId}.`,
    });
  };

  const handleViewHistory = (containerId: string) => {
    toast({
      title: 'History View',
      description: `Viewing history for container ${containerId}. (Feature coming soon)`,
    });
  };

  const handleExportContainerData = (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (container) {
      exportSensorDataToCSV({
        ...container,
        lastUpdate: container.lastUpdate,
      });
      toast({
        title: 'Data Exported',
        description: `Container ${containerId} data has been exported to CSV.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header with Menu */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b dark:border-gray-700 px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-white">
                <SheetHeader>
                  <SheetTitle className="text-green-800">🥥 SapSense Monitor</SheetTitle>
                  <SheetDescription>Real-time Coconut Sap Harvesting System</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Quick Stats</h3>
                    <div className="grid gap-2">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-800">{totalVolume.toFixed(1)}L</div>
                        <div className="text-xs text-green-600">Total Volume</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <div className="text-lg font-bold text-emerald-800">{harvestReady}</div>
                        <div className="text-xs text-emerald-600">Ready to Harvest</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-800">{criticalContainers}</div>
                        <div className="text-xs text-red-600">Critical Alerts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-400">🥥 SapSense Monitor</h1>
              <p className="text-xs md:text-sm text-green-600 dark:text-green-500 hidden sm:block">Real-time Coconut Sap Harvesting System - Admin View</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notifications Bell with Counter */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleNotifications}
            >
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </Badge>
              )}
            </Button>

            {/* Back to Admin Dashboard */}
            <Button onClick={handleBackToAdmin} variant="outline" size="sm" className="hidden sm:flex">
              Back to Admin
            </Button>

            {/* Refresh Button */}
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="icon"
              disabled={isRefreshing}
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Containers
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus('harvest')}>
                  Ready to Harvest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('critical')}>
                  Critical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('warning')}>
                  Warning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('optimal')}>
                  Optimal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem>Notification Settings</DropdownMenuItem>
                <DropdownMenuItem>pH Thresholds</DropdownMenuItem>
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <Tabs defaultValue="realtime" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4">
            {/* Summary Cards - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-green-700 dark:text-green-400 mb-1">Total Volume</div>
                  <div className="text-lg md:text-2xl font-bold text-green-800 dark:text-green-300">{totalVolume.toFixed(1)}L</div>
                  <p className="text-xs text-green-600 dark:text-green-500">{containers.length} containers</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Ready to Harvest</div>
                  <div className="text-lg md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">{harvestReady}</div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Optimal pH</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-red-700 dark:text-red-400 mb-1">Critical</div>
                  <div className="text-lg md:text-2xl font-bold text-red-800 dark:text-red-300">{criticalContainers}</div>
                  <p className="text-xs text-red-600 dark:text-red-500">Need attention</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Active</div>
                  <div className="text-lg md:text-2xl font-bold text-blue-800 dark:text-blue-300">{containers.length}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-500">Online</p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Filter */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter: {filterStatus === 'all' ? 'All Containers' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Containers</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('harvest')}>Ready to Harvest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('critical')}>Critical</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('warning')}>Warning</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('optimal')}>Optimal</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Filter */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Containers</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('harvest')}>Ready to Harvest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('critical')}>Critical</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('warning')}>Warning</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('optimal')}>Optimal</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Container Grid - Mobile Optimized */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : containers.length === 0 ? (
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🌴</div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No Trees Registered
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Register trees/prototypes in the Employee Management page to start monitoring.
                  </p>
                  <Button onClick={() => navigate('/admin/employees')} className="bg-green-600 hover:bg-green-700">
                    Go to Employee Management
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredContainers.map((container) => (
                <Card 
                  key={container.id} 
                  className={`cursor-pointer transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg border-l-4 ${
                    selectedContainer === container.id ? 'ring-2 ring-green-400' : ''
                  }`}
                  style={{ borderLeftColor: getStatusColor(container.status).replace('bg-', '#') }}
                  onClick={() => setSelectedContainer(container.id)}
                >
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base md:text-lg font-semibold">{container.name}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(container.status)} text-white text-xs`}
                      >
                        {getStatusText(container.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3">
                    <div className="p-2 md:p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs md:text-sm font-medium text-green-700">pH Level</span>
                        <span className={`text-base md:text-lg font-bold ${
                          container.ph >= 5.0 && container.ph <= 5.5 ? 'text-emerald-600' :
                          container.ph <= 4.8 || container.ph >= 7.2 ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {container.ph}
                        </span>
                      </div>
                      <Progress 
                        value={(container.ph / 14) * 100} 
                        className="h-1.5 md:h-2" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm">
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <Thermometer className="h-3 w-3 md:h-4 md:w-4 text-orange-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{container.temperature}°C</div>
                          <div className="text-xs text-gray-500">Temp</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <Droplets className="h-3 w-3 md:h-4 md:w-4 text-cyan-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{container.humidity}%</div>
                          <div className="text-xs text-gray-500">Humidity</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          container.batteryLevel > 50 ? 'bg-green-500' : 
                          container.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{Math.round(container.batteryLevel)}%</div>
                          <div className="text-xs text-gray-500">Battery</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <Beaker className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{container.volume}L</div>
                          <div className="text-xs text-gray-500">Volume</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1 md:pt-2 border-t dark:border-gray-600 space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{container.locationText}</span>
                      </div>
                      <div>{container.lastUpdate.toLocaleTimeString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {/* Detailed View - Mobile Responsive */}
            {selectedContainer && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <SensorChart 
                  container={containers.find(c => c.id === selectedContainer)!} 
                />
                <ContainerMap 
                  containers={containers}
                  selectedContainer={selectedContainer}
                  onMarkHarvested={handleMarkHarvested}
                  onSendMaintenance={handleSendMaintenance}
                  onViewHistory={handleViewHistory}
                  onExportData={handleExportContainerData}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <PredictiveAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
