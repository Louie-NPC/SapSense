
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Clock } from 'lucide-react';
import { RecentHarvest } from '@/services/api';

interface HarvestData {
  farmerId: string;
  farmerName: string;
  assignedTrees: string[];
  weeklyHarvest: number;
  monthlyHarvest: number;
  todayHarvest?: number;
  qualityRating: number;
  baseRate: number;
  bonusRate: number;
}

interface RecentActivityProps {
  harvestData: HarvestData[];
  recentHarvests?: RecentHarvest[];
}

const RecentActivity = ({ harvestData, recentHarvests = [] }: RecentActivityProps) => {
  // Format time ago
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  // Get quality badge variant
  const getQualityBadge = (quality: number) => {
    if (quality >= 0.9) return { variant: 'default' as const, text: 'Excellent' };
    if (quality >= 0.7) return { variant: 'secondary' as const, text: 'Good' };
    return { variant: 'outline' as const, text: 'Fair' };
  };

  // Show recent harvests if available, otherwise fall back to harvest data
  if (recentHarvests && recentHarvests.length > 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Harvests</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentHarvests.slice(0, 5).map((harvest) => {
            const qualityBadge = getQualityBadge(harvest.quality);
            return (
              <div key={harvest.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Droplets className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {harvest.farmerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {harvest.treeName || harvest.treeId} • {harvest.volume.toFixed(1)}L
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={qualityBadge.variant} className="text-xs">
                    {qualityBadge.text}
                  </Badge>
                  <span className="text-xs text-gray-400">{getTimeAgo(harvest.timestamp)}</span>
                </div>
              </div>
            );
          })}
          {recentHarvests.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Droplets className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent harvests</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback to showing farmer activity from harvestData
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
                {farmer.todayHarvest && farmer.todayHarvest > 0 
                  ? `${farmer.todayHarvest.toFixed(1)}L harvested today`
                  : `${farmer.weeklyHarvest.toFixed(1)}L this week`
                }
              </p>
            </div>
            <Badge variant={farmer.qualityRating >= 4.5 ? "default" : "secondary"} className="text-xs">
              {farmer.qualityRating.toFixed(1)}/5
            </Badge>
          </div>
        ))}
        {harvestData.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No activity data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
