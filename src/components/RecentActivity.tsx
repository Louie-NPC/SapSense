
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HarvestData {
  farmerId: string;
  farmerName: string;
  assignedTrees: string[];
  weeklyHarvest: number;
  monthlyHarvest: number;
  qualityRating: number;
  baseRate: number;
  bonusRate: number;
}

interface RecentActivityProps {
  harvestData: HarvestData[];
}

const RecentActivity = ({ harvestData }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {harvestData.slice(0, 3).map((farmer) => (
          <div key={farmer.farmerId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-green-700">
                {farmer.farmerName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {farmer.farmerName}
              </p>
              <p className="text-xs text-gray-500">
                {farmer.weeklyHarvest}L harvested today
              </p>
            </div>
            <Badge variant={farmer.qualityRating >= 4.5 ? "default" : "secondary"} className="text-xs">
              {farmer.qualityRating}/5
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
