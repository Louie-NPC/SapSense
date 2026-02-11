
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const HarvestChart = () => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Harvest Performance</CardTitle>
        <p className="text-sm text-gray-500">Weekly harvest data across all farmers</p>
      </CardHeader>
      <CardContent>
        <div className="h-80 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600">Chart visualization would go here</p>
            <p className="text-sm text-gray-500">Showing weekly harvest trends</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HarvestChart;
