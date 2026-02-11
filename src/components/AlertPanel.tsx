
import { useState } from 'react';
import { Bell, X, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const AlertPanel = ({ alerts, onDismiss }: AlertPanelProps) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const otherAlerts = alerts.filter(a => a.type !== 'critical');

  if (alerts.length === 0) return null;

  return (
    <Card className="bg-white/90 backdrop-blur border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-800">
              Active Alerts ({alerts.length})
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-gray-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
              <Switch 
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Critical Alerts - Always Visible */}
        {criticalAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="destructive">Critical</Badge>
                <span className="text-sm text-gray-500">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-red-800">{alert.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Other Alerts - Collapsible */}
        {expanded && otherAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              alert.type === 'warning' 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Badge 
                  variant={alert.type === 'warning' ? 'secondary' : 'outline'}
                  className={alert.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
                >
                  {alert.type === 'warning' ? 'Warning' : 'Info'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className={`text-sm ${
                alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
              }`}>
                {alert.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
              className={`ml-2 ${
                alert.type === 'warning' 
                  ? 'text-yellow-600 hover:text-yellow-800' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {!expanded && otherAlerts.length > 0 && (
          <div className="text-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="text-gray-600"
            >
              Show {otherAlerts.length} more alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertPanel;
