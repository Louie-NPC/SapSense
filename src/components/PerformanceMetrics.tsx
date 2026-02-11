
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceMetricsProps {
  avgQuality: number;
}

const PerformanceMetrics = ({ avgQuality }: PerformanceMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quality Rating</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${(avgQuality / 5) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{avgQuality.toFixed(1)}/5</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Efficiency</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full w-4/5"></div>
            </div>
            <span className="text-sm font-medium">82%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Productivity</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-orange-500 rounded-full w-3/4"></div>
            </div>
            <span className="text-sm font-medium">75%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
