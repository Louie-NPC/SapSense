
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceMetricsProps {
  avgQuality: number;
  efficiency?: number;
  productivity?: number;
  volumeGrowth?: number;
}

const PerformanceMetrics = ({ 
  avgQuality, 
  efficiency = 82, 
  productivity = 75,
  volumeGrowth = 0 
}: PerformanceMetricsProps) => {
  // Get growth indicator
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Performance</CardTitle>
          <div className="flex items-center space-x-1">
            {getGrowthIcon(volumeGrowth)}
            <span className={`text-sm font-medium ${getGrowthColor(volumeGrowth)}`}>
              {volumeGrowth > 0 ? '+' : ''}{volumeGrowth}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">Month-over-month change</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quality Rating</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((avgQuality / 5) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{avgQuality.toFixed(1)}/5</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Efficiency</span>
            <span className="text-xs text-gray-400" title="Harvest count relative to total trees">(Harvests/Trees)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${efficiency >= 70 ? 'bg-blue-500' : efficiency >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(efficiency, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{efficiency}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">Productivity</span>
            <span className="text-xs text-gray-400" title="Current vs target volume">(vs Target)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${productivity >= 80 ? 'bg-orange-500' : productivity >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(productivity, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{productivity}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
