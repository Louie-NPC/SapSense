import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, Loader2, Beaker, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { exportSensorDataToCSV } from '@/lib/exportUtils';
import { treesApi, TreeData, harvestApi } from '@/services/api';

// Import the same components and interfaces from Index
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Bell, Thermometer, Droplets, MapPin, Filter, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ContainerMap from '@/components/ContainerMap';
import SensorChart from '@/components/SensorChart';
import AlertPanel from '@/components/AlertPanel';

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

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [containers, setContainers] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Array<{id: string, message: string, type: 'info' | 'warning' | 'critical', timestamp: Date}>>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [farmerStats, setFarmerStats] = useState<{
    total_volume: number;
    month_volume: number;
    week_volume: number;
    today_volume: number;
    avg_quality: number;
    total_records: number;
  } | null>(null);

  const [isHarvesting, setIsHarvesting] = useState<string | null>(null);

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

  // Fetch trees assigned to this farmer from database
  const fetchTrees = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      console.log('Fetching farmer trees from API...');
      
      // Fetch trees assigned to this farmer
      let trees: TreeData[] = [];
      
      if (user?.id) {
        // Try to get trees by farmer ID first
        trees = await treesApi.getByFarmer(user.id);
        
        // Also fetch farmer's harvest stats
        try {
          const stats = await harvestApi.getFarmerStats(user.id);
          setFarmerStats(stats);
        } catch (statsErr) {
          console.error('Error fetching farmer stats:', statsErr);
        }
      }
      
      // If no trees assigned, fallback to checking assignedTrees from user object
      if (trees.length === 0 && user?.assignedTrees && user.assignedTrees.length > 0) {
        // Fetch all trees and filter by assigned IDs
        const allTrees = await treesApi.getAll();
        trees = allTrees.filter(tree => user.assignedTrees?.includes(tree.id));
      }
      
      console.log('Farmer trees fetched:', trees);
      
      if (!trees || trees.length === 0) {
        console.log('No trees assigned to this farmer');
        setContainers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const sensorData = trees.map((tree, index) => treeToSensorData(tree, index));
      
      // Update containers with new data
      setContainers(sensorData);
      
    } catch (error) {
      console.error('Error fetching farmer trees:', error);
      if (!showRefreshIndicator) {
        toast({
          title: 'Connection Error',
          description: 'Unable to fetch tree data. Make sure the backend server is running.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, toast]);

  // Initialize containers from database
  useEffect(() => {
    if (user) {
      fetchTrees();
    }
  }, [user, fetchTrees]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b dark:border-gray-700 px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-400">🥥 My Trees</h1>
            <p className="text-xs md:text-sm text-green-600 dark:text-green-500">Welcome, {user?.name}</p>
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Trees
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

            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm font-medium text-green-700 dark:text-green-400 mb-1">My Trees</div>
              <div className="text-lg md:text-2xl font-bold text-green-800 dark:text-green-300">{containers.length}</div>
              <p className="text-xs text-green-600 dark:text-green-500">Assigned to me</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Current Volume</div>
              <div className="text-lg md:text-2xl font-bold text-blue-800 dark:text-blue-300">{totalVolume.toFixed(1)}L</div>
              <p className="text-xs text-blue-600 dark:text-blue-500">Pending harvest</p>
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
        </div>

        {/* My Harvest Performance */}
        {farmerStats && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Harvest Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                    {farmerStats.month_volume.toFixed(1)}L
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {farmerStats.week_volume.toFixed(1)}L
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {farmerStats.today_volume.toFixed(1)}L
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(farmerStats.avg_quality * 5).toFixed(1)}/5
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Quality Rating</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Total All Time: <strong className="text-green-600 dark:text-green-400">{farmerStats.total_volume.toFixed(1)}L</strong></span>
                <span>Total Harvests: <strong className="text-green-600 dark:text-green-400">{farmerStats.total_records}</strong></span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert Panel */}
        <AlertPanel alerts={alerts} onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} />

        {/* Mobile Filter */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {filterStatus === 'all' ? 'All Trees' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full bg-white">
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Trees</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus('harvest')}>Ready to Harvest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('critical')}>Critical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('warning')}>Warning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('optimal')}>Optimal</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Container Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading your trees...</span>
          </div>
        ) : containers.length === 0 ? (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🌴</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Trees Assigned
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You don't have any trees assigned to you yet. Contact your administrator to get trees assigned.
              </p>
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
                {/* pH Level */}
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

                {/* Other Sensors */}
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

        {/* Detailed View */}
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
      </div>
    </div>
  );
};

export default FarmerDashboard;
