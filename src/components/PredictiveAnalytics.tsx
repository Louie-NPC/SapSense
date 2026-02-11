
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Droplets, Thermometer } from 'lucide-react';

interface PredictionData {
  time: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

interface ContainerPrediction {
  id: string;
  name: string;
  currentVolume: number;
  predictedVolume24h: number;
  predictedVolume48h: number;
  predictedVolume72h: number;
  optimalHarvestTime: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  performanceScore: number;
}

const PredictiveAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [containers, setContainers] = useState<ContainerPrediction[]>([]);
  const [forecastData, setForecastData] = useState<PredictionData[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  // Mock data generation
  useEffect(() => {
    const generateMockContainers = (): ContainerPrediction[] => {
      return Array.from({ length: 12 }, (_, i) => {
        const baseVolume = 2 + Math.random() * 8;
        const trend = Math.random() > 0.5 ? 1.1 : 0.9;
        
        return {
          id: `container-${i + 1}`,
          name: `Tree ${String.fromCharCode(65 + i)}${(i + 1).toString().padStart(2, '0')}`,
          currentVolume: Number(baseVolume.toFixed(2)),
          predictedVolume24h: Number((baseVolume * trend).toFixed(2)),
          predictedVolume48h: Number((baseVolume * trend * 1.05).toFixed(2)),
          predictedVolume72h: Number((baseVolume * trend * 1.1).toFixed(2)),
          optimalHarvestTime: new Date(Date.now() + Math.random() * 72 * 60 * 60 * 1000).toLocaleString(),
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          recommendations: [
            'Monitor pH levels closely',
            'Check temperature stability',
            'Ensure proper humidity'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          performanceScore: Number((70 + Math.random() * 30).toFixed(1))
        };
      });
    };

    const generateForecastData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 0; i < 72; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        const baseValue = 5 + Math.sin(i * 0.1) * 2;
        
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          predicted: Number((baseValue + Math.random() * 1).toFixed(2)),
          actual: i < 24 ? Number((baseValue + (Math.random() - 0.5) * 0.5).toFixed(2)) : undefined,
          confidence: Number((85 + Math.random() * 10).toFixed(1))
        });
      }
      
      return data;
    };

    const generateAnomalies = () => {
      return [
        {
          id: 1,
          container: 'Tree A05',
          type: 'Volume Drop',
          severity: 'high',
          prediction: 'Expected 30% decrease in next 12 hours',
          cause: 'Temperature spike detected',
          timestamp: new Date()
        },
        {
          id: 2,
          container: 'Tree B03',
          type: 'pH Imbalance',
          severity: 'medium',
          prediction: 'Quality may be affected',
          cause: 'pH levels trending acidic',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ];
    };

    setContainers(generateMockContainers());
    setForecastData(generateForecastData());
    setAnomalies(generateAnomalies());
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredForecastData = forecastData.slice(0, selectedTimeframe === '24h' ? 24 : selectedTimeframe === '48h' ? 48 : 72);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Predictive Analytics</h2>
          <p className="text-green-600">AI-powered insights for optimal sap harvesting</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedTimeframe === '24h' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('24h')}
            size="sm"
          >
            24h
          </Button>
          <Button
            variant={selectedTimeframe === '48h' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('48h')}
            size="sm"
          >
            48h
          </Button>
          <Button
            variant={selectedTimeframe === '72h' ? 'default' : 'outline'}
            onClick={() => setSelectedTimeframe('72h')}
            size="sm"
          >
            72h
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predicted Yield</p>
                <p className="text-2xl font-bold text-green-600">
                  {containers.reduce((sum, c) => sum + c.predictedVolume24h, 0).toFixed(1)}L
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk Trees</p>
                <p className="text-2xl font-bold text-red-600">
                  {containers.filter(c => c.riskLevel === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(containers.reduce((sum, c) => sum + c.performanceScore, 0) / containers.length).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Anomalies</p>
                <p className="text-2xl font-bold text-orange-600">{anomalies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Forecast Visualization</TabsTrigger>
          <TabsTrigger value="containers">Container Analytics</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sap Volume Forecast - Next {selectedTimeframe}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={filteredForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}L`,
                      name === 'predicted' ? 'Predicted' : 'Actual'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    name="actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prediction Confidence Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={filteredForecastData.slice(0, 24)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Confidence']} />
                  <Bar dataKey="confidence" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="containers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((container) => (
              <Card key={container.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{container.name}</CardTitle>
                    <Badge className={`${getRiskColor(container.riskLevel)} text-white`}>
                      {container.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {container.currentVolume}L</span>
                      <span>24h: {container.predictedVolume24h}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>48h: {container.predictedVolume48h}L</span>
                      <span>72h: {container.predictedVolume72h}L</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance Score</span>
                      <span>{container.performanceScore}%</span>
                    </div>
                    <Progress value={container.performanceScore} className="h-2" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Optimal Harvest</p>
                    <p className="text-xs text-gray-600">{container.optimalHarvestTime}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Recommendations</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {container.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Anomalies & Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.map((anomaly) => (
                  <Alert key={anomaly.id} className="border-l-4 border-l-red-500">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(anomaly.severity)}
                      <div className="flex-1">
                        <AlertTitle className="flex items-center justify-between">
                          <span>{anomaly.container} - {anomaly.type}</span>
                          <Badge variant="destructive">{anomaly.severity.toUpperCase()}</Badge>
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-1">
                          <p><strong>Prediction:</strong> {anomaly.prediction}</p>
                          <p><strong>Likely Cause:</strong> {anomaly.cause}</p>
                          <p className="text-xs text-gray-500">
                            Detected: {anomaly.timestamp.toLocaleString()}
                          </p>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span>Harvesting Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Immediate Actions</h4>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• Harvest Trees A01, B05, C03 within next 6 hours</li>
                      <li>• Check pH levels for Trees D02, E01</li>
                      <li>• Monitor temperature for high-risk containers</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Tomorrow's Focus</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Expected peak production: Trees F04, G02</li>
                      <li>• Weather impact: Reduce collection by 15%</li>
                      <li>• Maintenance required: Containers 8, 11</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <span>Environmental Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Temperature Management</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Install shade covers for Trees A05, B03</li>
                      <li>• Increase collection frequency during hot hours</li>
                      <li>• Monitor 28-32°C optimal range</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">pH Optimization</h4>
                    <ul className="text-sm text-purple-700 mt-1 space-y-1">
                      <li>• Maintain 5.0-5.5 pH range for quality</li>
                      <li>• Clean containers showing pH drift</li>
                      <li>• Schedule quality testing for high-yield trees</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">92.3%</p>
                  <p className="text-sm text-gray-600">Prediction Accuracy</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">0.87</p>
                  <p className="text-sm text-gray-600">RMSE Score</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">0.23</p>
                  <p className="text-sm text-gray-600">MAE (Liters)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
