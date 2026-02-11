
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TreePine, DollarSign, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalTrees: number;
  activeEmployees: number;
  totalHarvest: number;
  totalSalaries: number;
}

const StatsCards = ({ totalTrees, activeEmployees, totalHarvest, totalSalaries }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trees</p>
              <p className="text-3xl font-bold text-gray-900">{totalTrees}</p>
              <p className="text-sm text-green-600">+2 from last month</p>
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
              <p className="text-sm text-blue-600">All active</p>
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
              <p className="text-sm text-orange-600">+15% from last month</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900">₱{totalSalaries.toLocaleString()}</p>
              <p className="text-sm text-purple-600">This month</p>
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
