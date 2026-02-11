
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TreePine, Download, Users } from 'lucide-react';

interface QuickActionsProps {
  onViewMonitoring: () => void;
  onGenerateReport: () => void;
  onManageEmployees: () => void;
}

const QuickActions = ({ onViewMonitoring, onGenerateReport, onManageEmployees }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left"
          onClick={onViewMonitoring}
        >
          <TreePine className="h-4 w-4 mr-2" />
          View Tree Monitoring
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left"
          onClick={onGenerateReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left"
          onClick={onManageEmployees}
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Employees
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
