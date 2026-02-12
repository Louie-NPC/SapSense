
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, User, Calendar, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HarvestData {
  farmerId: string;
  farmerName: string;
  assignedTrees: string[];
  weeklyHarvest: number;
  monthlyHarvest: number;
  todayHarvest?: number;
  totalHarvest?: number;
  qualityRating: number;
  baseRate: number;
  bonusRate: number;
  harvestCount?: number;
}

interface HarvestChartProps {
  harvestData?: HarvestData[];
}

const HarvestChart = ({ harvestData = [] }: HarvestChartProps) => {
  // Calculate max harvest for progress bar percentage
  const maxHarvest = harvestData.length > 0 
    ? Math.max(...harvestData.map(h => h.monthlyHarvest))
    : 100;

  const totalMonthlyHarvest = harvestData.reduce((sum, h) => sum + h.monthlyHarvest, 0);
  const totalWeeklyHarvest = harvestData.reduce((sum, h) => sum + h.weeklyHarvest, 0);
  const totalTodayHarvest = harvestData.reduce((sum, h) => sum + (h.todayHarvest || 0), 0);

  if (harvestData.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Harvest Performance</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Weekly harvest data across all farmers</p>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">No harvest data available</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Data will appear once farmers start harvesting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Harvest Performance</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Employee harvest data from assigned trees</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{totalMonthlyHarvest.toFixed(1)}L</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Total</p>
          </div>
        </div>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{totalWeeklyHarvest.toFixed(1)}L</p>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{totalTodayHarvest.toFixed(1)}L</p>
            <p className="text-xs text-gray-500">Today</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{harvestData.length}</p>
            <p className="text-xs text-gray-500">Active Farmers</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {harvestData.map((farmer) => (
            <div key={farmer.farmerId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{farmer.farmerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {farmer.assignedTrees.length} trees assigned
                      {farmer.harvestCount ? ` • ${farmer.harvestCount} harvests` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{farmer.monthlyHarvest.toFixed(1)}L</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-blue-500">Week: {farmer.weeklyHarvest.toFixed(1)}L</span>
                    {farmer.todayHarvest !== undefined && farmer.todayHarvest > 0 && (
                      <span className="text-orange-500">Today: {farmer.todayHarvest.toFixed(1)}L</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Progress 
                  value={(farmer.monthlyHarvest / maxHarvest) * 100} 
                  className="flex-1 h-2"
                />
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    {farmer.qualityRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">/ 5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HarvestChart;
