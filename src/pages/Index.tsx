import { useState, useEffect } from 'react';
import { Bell, Thermometer, Droplets, MapPin, Menu, Filter, Settings, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  status: 'optimal' | 'warning' | 'critical' | 'harvest';
}

const Index = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [containers, setContainers] = useState<SensorData[]>([]);
  const [alertCount, setAlertCount] = useState(3); // Track number of active alerts
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  // Generate mock sensor data
  const generateSensorData = (id: string, index: number): SensorData => {
    const baseTemp = 28 + Math.random() * 8; // 28-36°C
    const basePh = 5.0 + (Math.random() - 0.5) * 3; // 3.5-6.5 pH range
    const baseHumidity = 70 + Math.random() * 25; // 70-95%
    const baseVolume = Math.random() * 10; // 0-10 liters
    
    let status: SensorData['status'] = 'optimal';
    if (basePh <= 4.8 || basePh >= 7.2) status = 'critical';
    else if (basePh >= 5.0 && basePh <= 5.5) status = 'harvest';
    else if (basePh < 5.0 || basePh > 6.0) status = 'warning';

    return {
      id,
      name: `Tree ${String.fromCharCode(65 + index)}${(index + 1).toString().padStart(2, '0')}`,
      ph: Number(basePh.toFixed(2)),
      temperature: Number(baseTemp.toFixed(1)),
      volume: Number(baseVolume.toFixed(2)),
      humidity: Number(baseHumidity.toFixed(1)),
      batteryLevel: 60 + Math.random() * 40,
      lastUpdate: new Date(),
      location: {
        lat: 14.5995 + (Math.random() - 0.5) * 0.01,
        lng: 120.9842 + (Math.random() - 0.5) * 0.01
      },
      status
    };
  };

  // Initialize containers
  useEffect(() => {
    const initialContainers = Array.from({ length: 12 }, (_, i) => 
      generateSensorData(`container-${i + 1}`, i)
    );
    setContainers(initialContainers);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prev => prev.map(container => {
        const updated = generateSensorData(container.id, parseInt(container.id.split('-')[1]) - 1);
        
        // Check for new harvest opportunities
        if (updated.status === 'harvest' && container.status !== 'harvest') {
          toast({
            title: "Harvest Alert! 🌴",
            description: `${updated.name} is ready for harvest (pH: ${updated.ph})`,
            duration: 8000,
          });
        }
        
        // Check for critical pH levels
        if (updated.status === 'critical' && container.status !== 'critical') {
          setAlertCount(prev => prev + 1);
          toast({
            title: "Critical Alert! ⚠️",
            description: `${updated.name} has critical pH levels (${updated.ph})`,
            variant: "destructive",
            duration: 10000,
          });
        }
        
        return { ...updated, name: container.name };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [toast]);

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
  const handleMarkHarvested = (containerId: string) => {
    setContainers(prev => prev.map(c => 
      c.id === containerId ? { ...c, status: 'optimal' as const, volume: 0 } : c
    ));
    toast({
      title: 'Harvest Recorded',
      description: `Container ${containerId} has been marked as harvested.`,
    });
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
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{container.volume}L</div>
                          <div className="text-xs text-gray-500">Volume</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1 md:pt-2 border-t dark:border-gray-600">
                      {container.lastUpdate.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
