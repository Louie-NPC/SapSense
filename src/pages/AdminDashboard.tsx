import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatsCards from '@/components/StatsCards';
import HarvestChart from '@/components/HarvestChart';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';
import { Skeleton } from '@/components/ui/skeleton';

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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Enhanced employee data with harvest performance
  const [harvestData] = useState<HarvestData[]>([
    {
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      assignedTrees: ['container-1', 'container-2', 'container-3'],
      weeklyHarvest: 45.5,
      monthlyHarvest: 182,
      qualityRating: 4.8,
      baseRate: 25,
      bonusRate: 5
    },
    {
      farmerId: 'farmer-2',
      farmerName: 'Maria Santos',
      assignedTrees: ['container-4', 'container-5', 'container-6'],
      weeklyHarvest: 38.2,
      monthlyHarvest: 152.8,
      qualityRating: 4.5,
      baseRate: 25,
      bonusRate: 3
    },
    {
      farmerId: 'farmer-3',
      farmerName: 'Pedro Garcia',
      assignedTrees: ['container-7', 'container-8', 'container-9'],
      weeklyHarvest: 42.1,
      monthlyHarvest: 168.4,
      qualityRating: 4.2,
      baseRate: 25,
      bonusRate: 2
    }
  ]);

  const calculateSalary = (farmer: HarvestData) => {
    const basePay = farmer.monthlyHarvest * farmer.baseRate;
    const qualityBonus = farmer.monthlyHarvest * farmer.bonusRate * (farmer.qualityRating / 5);
    return basePay + qualityBonus;
  };

  const generateReport = () => {
    const reportData = {
      generatedOn: new Date().toLocaleDateString(),
      totalEmployees: harvestData.length,
      totalHarvest: harvestData.reduce((sum, f) => sum + f.monthlyHarvest, 0),
      totalSalaries: harvestData.reduce((sum, f) => sum + calculateSalary(f), 0),
      employees: harvestData.map(farmer => ({
        name: farmer.farmerName,
        harvest: farmer.monthlyHarvest,
        quality: farmer.qualityRating,
        salary: calculateSalary(farmer)
      }))
    };
    
    console.log('Generated Report:', reportData);
    toast({
      title: 'Report Generated',
      description: 'Monthly report has been generated successfully.',
    });
  };

  const handleViewMonitoring = () => {
    navigate('/admin/monitoring');
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Farmer Name', 'Assigned Trees', 'Weekly Harvest (L)', 'Monthly Harvest (L)', 'Quality Rating', 'Base Rate (₱)', 'Bonus Rate (₱)', 'Total Salary (₱)'];
    const rows = harvestData.map(farmer => [
      farmer.farmerName,
      farmer.assignedTrees.length,
      farmer.weeklyHarvest.toFixed(1),
      farmer.monthlyHarvest.toFixed(1),
      farmer.qualityRating.toFixed(1),
      farmer.baseRate,
      farmer.bonusRate,
      calculateSalary(farmer).toFixed(2)
    ]);

    // Add summary row
    rows.push([]);
    rows.push(['Summary']);
    rows.push(['Total Trees', totalTrees]);
    rows.push(['Total Employees', harvestData.length]);
    rows.push(['Total Monthly Harvest (L)', totalHarvest.toFixed(1)]);
    rows.push(['Total Salaries (₱)', totalSalaries.toFixed(2)]);
    rows.push(['Average Quality Rating', avgQuality.toFixed(1)]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: 'Dashboard data has been exported to CSV.',
    });
  };

  const handleNewReport = () => {
    navigate('/admin/reports');
  };

  const handleManageEmployees = () => {
    navigate('/admin/employees');
  };

  // Summary calculations
  const totalTrees = 12;
  const totalHarvest = harvestData.reduce((sum, f) => sum + f.monthlyHarvest, 0);
  const totalSalaries = harvestData.reduce((sum, f) => sum + calculateSalary(f), 0);
  const avgQuality = harvestData.reduce((sum, f) => sum + f.qualityRating, 0) / harvestData.length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={user?.name} onExport={handleExport} onNewReport={handleNewReport} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <StatsCards 
              totalTrees={totalTrees}
              activeEmployees={harvestData.length}
              totalHarvest={totalHarvest}
              totalSalaries={totalSalaries}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HarvestChart />

              <div className="space-y-6">
                <PerformanceMetrics avgQuality={avgQuality} />
                <QuickActions 
                  onViewMonitoring={handleViewMonitoring}
                  onGenerateReport={generateReport}
                  onManageEmployees={handleManageEmployees}
                />
                <RecentActivity harvestData={harvestData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
