
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TreePine, DollarSign, TrendingUp, TrendingDown, Minus, Droplets } from 'lucide-react';

interface StatsCardsProps {
  totalTrees: number;
  activeEmployees: number;
  totalHarvest: number;
  totalSalaries: number;
  volumeGrowth?: number;
  weeklyHarvest?: number;
  todayHarvest?: number;
}

const StatsCards = ({ 
  totalTrees, 
  activeEmployees, 
  totalHarvest, 
  totalSalaries,
  volumeGrowth = 0,
  weeklyHarvest = 0,
  todayHarvest = 0
}: StatsCardsProps) => {
  // Get growth indicator
  const getGrowthDisplay = (growth: number) => {
    if (growth > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: `+${growth}%`,
        color: 'text-green-600'
      };
    } else if (growth < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-500" />,
        text: `${growth}%`,
        color: 'text-red-600'
      };
    }
    return {
      icon: <Minus className="h-4 w-4 text-gray-400" />,
      text: 'No change',
      color: 'text-gray-500'
    };
  };

  const growthDisplay = getGrowthDisplay(volumeGrowth);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trees</p>
              <p className="text-3xl font-bold text-gray-900">{totalTrees}</p>
              <p className="text-sm text-green-600">Monitored containers</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TreePine className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Farmers</p>
              <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
              <p className="text-sm text-blue-600">Currently working</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Harvest</p>
              <p className="text-3xl font-bold text-gray-900">{totalHarvest.toFixed(1)}L</p>
              <div className="flex items-center space-x-1">
                {growthDisplay.icon}
                <span className={`text-sm ${growthDisplay.color}`}>
                  {growthDisplay.text} from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Droplets className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          {/* Additional harvest stats */}
          {(weeklyHarvest > 0 || todayHarvest > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>Week: {weeklyHarvest.toFixed(1)}L</span>
              <span>Today: {todayHarvest.toFixed(1)}L</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900">₱{totalSalaries.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Current period</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
