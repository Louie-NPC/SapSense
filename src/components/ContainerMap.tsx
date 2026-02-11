
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface ContainerMapProps {
  containers: SensorData[];
  selectedContainer: string;
  onMarkHarvested?: (containerId: string) => void;
  onSendMaintenance?: (containerId: string) => void;
  onViewHistory?: (containerId: string) => void;
  onExportData?: (containerId: string) => void;
}

const ContainerMap = ({ 
  containers, 
  selectedContainer,
  onMarkHarvested,
  onSendMaintenance,
  onViewHistory,
  onExportData
}: ContainerMapProps) => {
  const selectedContainerData = containers.find(c => c.id === selectedContainer);
  
  const getStatusColor = (status: SensorData['status']) => {
    switch (status) {
      case 'harvest': return '#10b981';
      case 'optimal': return '#22c55e';
      case 'warning': return '#eab308';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
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

  return (
    <Card className="bg-white/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-green-800 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Container Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Map Placeholder */}
        <div className="relative bg-green-100 rounded-lg h-64 mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-300 opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-700 font-medium">Interactive Map View</p>
              <p className="text-green-600 text-sm">Coconut plantation overview</p>
            </div>
          </div>
          
          {/* Container Dots */}
          <div className="absolute inset-0">
            {containers.map((container, index) => (
              <div
                key={container.id}
                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-2 ${
                  container.id === selectedContainer ? 'ring-2 ring-blue-400 scale-125' : ''
                }`}
                style={{
                  backgroundColor: getStatusColor(container.status),
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${20 + Math.floor(index / 4) * 15}%`,
                }}
                title={`${container.name} - ${getStatusText(container.status)}`}
              />
            ))}
          </div>
        </div>

        {/* Selected Container Details */}
        {selectedContainerData && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold text-green-800 mb-3">
                {selectedContainerData.name} Details
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Status</span>
                  <Badge 
                    style={{ backgroundColor: getStatusColor(selectedContainerData.status) }}
                    className="text-white"
                  >
                    {getStatusText(selectedContainerData.status)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Location</span>
                  <span className="text-sm text-gray-600">
                    {selectedContainerData.location.lat.toFixed(4)}, {selectedContainerData.location.lng.toFixed(4)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Battery Level</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${
                          selectedContainerData.batteryLevel > 50 ? 'bg-green-500' :
                          selectedContainerData.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedContainerData.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(selectedContainerData.batteryLevel)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Last Update</span>
                  <span className="text-sm text-gray-600">
                    {selectedContainerData.lastUpdate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-green-700 mb-2">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedContainerData.status === 'harvest' && (
                  <button 
                    className="p-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                    onClick={() => onMarkHarvested?.(selectedContainerData.id)}
                  >
                    Mark as Harvested
                  </button>
                )}
                {selectedContainerData.status === 'critical' && (
                  <button 
                    className="p-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    onClick={() => onSendMaintenance?.(selectedContainerData.id)}
                  >
                    Send Maintenance
                  </button>
                )}
                <button 
                  className="p-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  onClick={() => onViewHistory?.(selectedContainerData.id)}
                >
                  View Full History
                </button>
                <button 
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => onExportData?.(selectedContainerData.id)}
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-green-700 mb-2">Status Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Ready to Harvest</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Optimal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Monitor Closely</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContainerMap;
