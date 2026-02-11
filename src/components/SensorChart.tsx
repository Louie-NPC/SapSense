import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useEffect, useState } from 'react';

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

interface SensorChartProps {
  container: SensorData;
}

const SensorChart = ({ container }: SensorChartProps) => {
  const [historicalData, setHistoricalData] = useState<Array<{
    time: string;
    ph: number;
    temperature: number;
    volume: number;
    humidity: number;
  }>>([]);

  useEffect(() => {
    // Generate some historical data for demonstration
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const baseVariation = Math.sin(i * 0.2) * 0.3;
        
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ph: Number((container.ph + baseVariation + (Math.random() - 0.5) * 0.2).toFixed(2)),
          temperature: Number((container.temperature + (Math.random() - 0.5) * 2).toFixed(1)),
          volume: Number((Math.max(0, container.volume + (Math.random() - 0.3) * 1)).toFixed(2)),
          humidity: Number((container.humidity + (Math.random() - 0.5) * 5).toFixed(1)),
        });
      }
      
      return data;
    };

    setHistoricalData(generateHistoricalData());
  }, [container]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${
                entry.name === 'pH' ? '' :
                entry.name === 'Temperature' ? '°C' :
                entry.name === 'Volume' ? 'L' :
                entry.name === 'Humidity' ? '%' : ''
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-green-800">
          {container.name} - 24h Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* pH Chart - Most Important */}
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-3">pH Level</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#666" fontSize={12} />
                <YAxis domain={[3, 8]} stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Optimal pH range */}
                <ReferenceLine y={5.0} stroke="#10b981" strokeDasharray="2 2" label="Optimal Min" />
                <ReferenceLine y={5.5} stroke="#10b981" strokeDasharray="2 2" label="Optimal Max" />
                
                {/* Critical levels */}
                <ReferenceLine y={4.8} stroke="#ef4444" strokeDasharray="2 2" label="Critical Low" />
                <ReferenceLine y={7.2} stroke="#ef4444" strokeDasharray="2 2" label="Critical High" />
                
                <Line 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="#059669" 
                  strokeWidth={3}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                  name="pH"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Other Sensor Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temperature */}
            <div>
              <h4 className="font-medium text-orange-700 mb-2">Temperature</h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={false}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Volume */}
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Volume</h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity */}
            <div>
              <h4 className="font-medium text-cyan-700 mb-2">Humidity</h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={false}
                    name="Humidity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Status Summary */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Current Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">pH:</span>
                <span className={`ml-2 font-medium ${
                  container.ph >= 5.0 && container.ph <= 5.5 ? 'text-emerald-600' :
                  container.ph <= 4.8 || container.ph >= 7.2 ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {container.ph}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Temp:</span>
                <span className="ml-2 font-medium text-orange-600">{container.temperature}°C</span>
              </div>
              <div>
                <span className="text-gray-600">Volume:</span>
                <span className="ml-2 font-medium text-blue-600">{container.volume}L</span>
              </div>
              <div>
                <span className="text-gray-600">Humidity:</span>
                <span className="ml-2 font-medium text-cyan-600">{container.humidity}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorChart;
