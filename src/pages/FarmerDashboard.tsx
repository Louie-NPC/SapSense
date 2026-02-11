import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { exportSensorDataToCSV } from '@/lib/exportUtils';

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

  // Generate mock sensor data (same function as in Index)
  const generateSensorData = (id: string, index: number): SensorData => {
    const baseTemp = 28 + Math.random() * 8;
    const basePh = 5.0 + (Math.random() - 0.5) * 3;
    const baseHumidity = 70 + Math.random() * 25;
    const baseVolume = Math.random() * 10;
    
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

  // Initialize containers - only assigned trees
  useEffect(() => {
    if (user?.assignedTrees) {
      const farmerContainers = user.assignedTrees.map((treeId, index) => 
        generateSensorData(treeId, parseInt(treeId.split('-')[1]) - 1)
      );
      setContainers(farmerContainers);
    }
  }, [user]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prev => prev.map(container => {
        const updated = generateSensorData(container.id, parseInt(container.id.split('-')[1]) - 1);
        
        // Check for new harvest opportunities
        if (updated.status === 'harvest' && container.status !== 'harvest') {
          const alertMessage = `🥥 Harvest ready! ${updated.name} - pH at ${updated.ph} (Optimal range)`;
          setAlerts(prev => [...prev, {
            id: `alert-${Date.now()}`,
            message: alertMessage,
            type: 'info',
            timestamp: new Date()
          }]);
          
          toast({
            title: "Harvest Alert! 🌴",
            description: `${updated.name} is ready for harvest (pH: ${updated.ph})`,
            duration: 8000,
          });
        }
        
        // Check for critical pH levels
        if (updated.status === 'critical' && container.status !== 'critical') {
          const alertMessage = `⚠️ Critical pH alert! ${updated.name} - pH at ${updated.ph}`;
          setAlerts(prev => [...prev, {
            id: `alert-${Date.now()}`,
            message: alertMessage,
            type: 'critical',
            timestamp: new Date()
          }]);
          
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              <div className="text-xs md:text-sm font-medium text-green-700 dark:text-green-400 mb-1">Total Volume</div>
              <div className="text-lg md:text-2xl font-bold text-green-800 dark:text-green-300">{totalVolume.toFixed(1)}L</div>
              <p className="text-xs text-green-600 dark:text-green-500">Current sap</p>
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
