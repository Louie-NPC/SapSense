import React, { useState, useEffect, useCallback } from 'react';
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
import { harvestApi, EmployeePerformance, RecentHarvest, HarvestMetrics } from '@/services/api';

const API_BASE_URL = 'http://localhost:3001/api';

interface Employee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  assigned_trees: string[];
  status: string;
  location: string;
  join_date: string;
  total_harvest: number;
  avg_quality: number;
}

interface TreeContainer {
  id: string;
  name: string;
  location: string;
  assigned_farmer_id: string;
  assigned_farmer_name: string;
  current_ph: number;
  current_volume: number;
  current_temperature: number;
  status: string;
}

interface PayrollRecord {
  id: string;
  farmer_id: string;
  farmer_name: string;
  net_pay: number;
  gross_pay: number;
  quality_bonus: number;
  deductions: number;
  status: string;
  pay_period_id?: string;
}

interface PayPeriod {
  id: string;
  name: string;
  status: string;
}

interface HarvestData {
  farmerId: string;
  farmerName: string;
  assignedTrees: string[];
  weeklyHarvest: number;
  monthlyHarvest: number;
  todayHarvest: number;
  totalHarvest: number;
  qualityRating: number;
  baseRate: number;
  bonusRate: number;
  harvestCount: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for real data from PostgreSQL
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trees, setTrees] = useState<TreeContainer[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [recentHarvests, setRecentHarvests] = useState<RecentHarvest[]>([]);
  const [harvestMetrics, setHarvestMetrics] = useState<HarvestMetrics | null>(null);
  const [harvestSummary, setHarvestSummary] = useState<{ month_volume: number; week_volume: number; today_volume: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from PostgreSQL API
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const [employeesRes, treesRes, payrollRes, periodsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/trees`),
        fetch(`${API_BASE_URL}/payroll`),
        fetch(`${API_BASE_URL}/pay-periods`)
      ]);

      if (!employeesRes.ok || !treesRes.ok || !payrollRes.ok || !periodsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [employeesData, treesData, payrollData, periodsData] = await Promise.all([
        employeesRes.json(),
        treesRes.json(),
        payrollRes.json(),
        periodsRes.json()
      ]);

      setEmployees(employeesData);
      setTrees(treesData);
      setPayrollRecords(payrollData);
      setPayPeriods(periodsData);

      // Fetch real harvest performance data
      try {
        const [performance, recent, metrics, summary] = await Promise.all([
          harvestApi.getEmployeesPerformance(),
          harvestApi.getRecent(10),
          harvestApi.getMetrics(),
          harvestApi.getSummary()
        ]);
        setEmployeePerformance(performance);
        setRecentHarvests(recent);
        setHarvestMetrics(metrics);
        setHarvestSummary(summary);
      } catch (harvestErr) {
        console.error('Error fetching harvest performance:', harvestErr);
        // Continue with basic data if harvest endpoints fail
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please ensure the server is running.');
      if (showLoading) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data from server.',
          variant: 'destructive'
        });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 10 seconds for real-time harvest updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false); // Don't show loading on auto-refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Transform employees data to HarvestData format for components
  // Now using real monthly/weekly data from harvest records
  const harvestData: HarvestData[] = employeePerformance.length > 0
    ? employeePerformance.map(emp => ({
        farmerId: emp.employeeId,
        farmerName: emp.employeeName,
        assignedTrees: emp.assignedTrees || [],
        weeklyHarvest: emp.weekHarvest,
        monthlyHarvest: emp.monthHarvest,
        todayHarvest: emp.todayHarvest,
        totalHarvest: emp.totalHarvest,
        qualityRating: emp.avgQuality * 5, // Convert from 0-1 to 0-5 scale
        baseRate: 25,
        bonusRate: Math.ceil(emp.avgQuality * 5),
        harvestCount: emp.harvestCount
      }))
    : employees
        .filter(emp => emp.status === 'active')
        .map(emp => ({
          farmerId: emp.id,
          farmerName: emp.name,
          assignedTrees: emp.assigned_trees || [],
          weeklyHarvest: Number(emp.total_harvest) / 4, // Fallback to approximate
          monthlyHarvest: Number(emp.total_harvest),
          todayHarvest: 0,
          totalHarvest: Number(emp.total_harvest),
          qualityRating: Number(emp.avg_quality),
          baseRate: 25,
          bonusRate: Math.ceil(Number(emp.avg_quality)),
          harvestCount: 0
        }));

  // Summary calculations from real database data
  const totalTrees = trees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  
  // Use real monthly harvest from harvest summary if available
  const totalHarvest = harvestSummary?.month_volume ?? 
    employees.reduce((sum, emp) => sum + Number(emp.total_harvest || 0), 0);
  
  // Calculate total payroll from database - based on registered farmers like in Payroll page
  // Get active pay period
  const activePeriod = payPeriods.find(p => p.status === 'active');
  
  // Calculate total payroll: sum of net_pay for all farmers with payroll records in active period
  // For farmers without payroll records, they show as pending with 0 pay
  const totalSalaries = employees
    .filter(emp => emp.status === 'active')
    .reduce((sum, emp) => {
      // Find existing payroll record for this employee
      const payroll = payrollRecords.find(
        p => p.farmer_id === emp.id && 
             (activePeriod ? p.pay_period_id === activePeriod.id : true)
      );
      return sum + Number(payroll?.net_pay || 0);
    }, 0);
  
  // Calculate average quality from employees or harvest metrics
  const avgQuality = harvestMetrics?.avgQuality 
    ? harvestMetrics.avgQuality * 5  // Convert from 0-1 to 0-5 scale
    : activeEmployees > 0 
      ? employees.filter(emp => emp.status === 'active').reduce((sum, emp) => sum + Number(emp.avg_quality || 0), 0) / activeEmployees 
      : 0;

  // Get efficiency and productivity from real metrics
  const efficiency = harvestMetrics?.efficiency ?? 82;
  const productivity = harvestMetrics?.productivity ?? 75;
  const volumeGrowth = harvestMetrics?.volumeGrowth ?? 0;

  const calculateSalary = (farmer: HarvestData) => {
    const basePay = farmer.monthlyHarvest * farmer.baseRate;
    const qualityBonus = farmer.monthlyHarvest * farmer.bonusRate * (farmer.qualityRating / 5);
    return basePay + qualityBonus;
  };

  const generateReport = () => {
    const reportData = {
      generatedOn: new Date().toLocaleDateString(),
      totalEmployees: activeEmployees,
      totalHarvest: totalHarvest,
      totalSalaries: totalSalaries,
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
    rows.push(['Total Employees', activeEmployees]);
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

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader userName={user?.name} onExport={() => {}} onNewReport={() => {}} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-96" />
                <div className="space-y-6">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-48" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={user?.name} onExport={handleExport} onNewReport={handleNewReport} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <StatsCards 
              totalTrees={totalTrees}
              activeEmployees={activeEmployees}
              totalHarvest={totalHarvest}
              totalSalaries={totalSalaries}
              volumeGrowth={volumeGrowth}
              weeklyHarvest={harvestSummary?.week_volume ?? harvestData.reduce((sum, h) => sum + h.weeklyHarvest, 0)}
              todayHarvest={harvestSummary?.today_volume ?? harvestData.reduce((sum, h) => sum + (h.todayHarvest || 0), 0)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HarvestChart harvestData={harvestData} />

              <div className="space-y-6">
                <PerformanceMetrics 
                  avgQuality={avgQuality} 
                  efficiency={efficiency}
                  productivity={productivity}
                  volumeGrowth={volumeGrowth}
                />
                <QuickActions 
                  onViewMonitoring={handleViewMonitoring}
                  onGenerateReport={generateReport}
                  onManageEmployees={handleManageEmployees}
                />
                <RecentActivity 
                  harvestData={harvestData}
                  recentHarvests={recentHarvests}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
