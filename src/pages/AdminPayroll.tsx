import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Banknote, 
  Download, 
  Calendar, 
  Search, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users,
  FileText,
  Send,
  Edit,
  Eye,
  Plus,
  Minus,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportToPDF, generatePayslipPDF, generateAllPayslipsPDF, PayslipData } from '@/lib/exportUtils';

interface PayrollRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  email: string;
  payPeriod: string;
  baseHarvest: number;
  qualityBonus: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: 'pending' | 'processing' | 'paid' | 'on-hold';
  paymentDate: string;
  paymentMethod: string;
}

interface PayPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'processing';
  totalPayroll: number;
  employeeCount: number;
}

interface BonusDeduction {
  id: string;
  farmerId: string;
  farmerName: string;
  type: 'bonus' | 'deduction';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminPayroll = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [newBonusType, setNewBonusType] = useState<'bonus' | 'deduction'>('bonus');
  const [newBonusAmount, setNewBonusAmount] = useState('');
  const [newBonusCategory, setNewBonusCategory] = useState('');
  const [newBonusDescription, setNewBonusDescription] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Dialog states
  const [periodDetailDialog, setPeriodDetailDialog] = useState<PayPeriod | null>(null);
  const [schedulePaymentsDialog, setSchedulePaymentsDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([
    {
      id: 'period-1',
      name: 'January 2024 - Week 4',
      startDate: '2024-01-22',
      endDate: '2024-01-28',
      status: 'active',
      totalPayroll: 45250.00,
      employeeCount: 4
    },
    {
      id: 'period-2',
      name: 'January 2024 - Week 3',
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      status: 'closed',
      totalPayroll: 42180.50,
      employeeCount: 4
    },
    {
      id: 'period-3',
      name: 'January 2024 - Week 2',
      startDate: '2024-01-08',
      endDate: '2024-01-14',
      status: 'closed',
      totalPayroll: 38920.00,
      employeeCount: 3
    }
  ]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: 'payroll-1',
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      email: 'juan@example.com',
      payPeriod: 'January 2024 - Week 4',
      baseHarvest: 182,
      qualityBonus: 850.00,
      deductions: 150.00,
      grossPay: 5400.00,
      netPay: 6100.00,
      status: 'pending',
      paymentDate: '2024-01-29',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'payroll-2',
      farmerId: 'farmer-2',
      farmerName: 'Maria Santos',
      email: 'maria@example.com',
      payPeriod: 'January 2024 - Week 4',
      baseHarvest: 152.8,
      qualityBonus: 620.00,
      deductions: 0,
      grossPay: 4584.00,
      netPay: 5204.00,
      status: 'processing',
      paymentDate: '2024-01-29',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'payroll-3',
      farmerId: 'farmer-3',
      farmerName: 'Pedro Garcia',
      email: 'pedro@example.com',
      payPeriod: 'January 2024 - Week 4',
      baseHarvest: 168.4,
      qualityBonus: 480.00,
      deductions: 200.00,
      grossPay: 5052.00,
      netPay: 5332.00,
      status: 'paid',
      paymentDate: '2024-01-28',
      paymentMethod: 'Cash'
    },
    {
      id: 'payroll-4',
      farmerId: 'farmer-4',
      farmerName: 'Ana Reyes',
      email: 'ana@example.com',
      payPeriod: 'January 2024 - Week 4',
      baseHarvest: 95,
      qualityBonus: 180.00,
      deductions: 350.00,
      grossPay: 2850.00,
      netPay: 2680.00,
      status: 'on-hold',
      paymentDate: '2024-01-29',
      paymentMethod: 'Bank Transfer'
    }
  ]);

  const [bonusDeductions, setBonusDeductions] = useState<BonusDeduction[]>([
    {
      id: 'bd-1',
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      type: 'bonus',
      category: 'Performance',
      amount: 500.00,
      description: 'Exceeded monthly harvest target by 20%',
      date: '2024-01-25',
      status: 'approved'
    },
    {
      id: 'bd-2',
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      type: 'bonus',
      category: 'Quality',
      amount: 350.00,
      description: 'Highest quality rating for the month',
      date: '2024-01-25',
      status: 'approved'
    },
    {
      id: 'bd-3',
      farmerId: 'farmer-3',
      farmerName: 'Pedro Garcia',
      type: 'deduction',
      category: 'Equipment',
      amount: 200.00,
      description: 'Equipment damage - collection container',
      date: '2024-01-20',
      status: 'approved'
    },
    {
      id: 'bd-4',
      farmerId: 'farmer-4',
      farmerName: 'Ana Reyes',
      type: 'deduction',
      category: 'Absence',
      amount: 350.00,
      description: 'Unexcused absence - 2 days',
      date: '2024-01-18',
      status: 'pending'
    },
    {
      id: 'bd-5',
      farmerId: 'farmer-2',
      farmerName: 'Maria Santos',
      type: 'bonus',
      category: 'Attendance',
      amount: 200.00,
      description: 'Perfect attendance for the month',
      date: '2024-01-26',
      status: 'pending'
    }
  ]);

  const filteredRecords = payrollRecords.filter(record =>
    record.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.farmerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayroll = payrollRecords.reduce((sum, r) => sum + r.netPay, 0);
  const pendingPayments = payrollRecords.filter(r => r.status === 'pending').length;
  const processingPayments = payrollRecords.filter(r => r.status === 'processing').length;
  const completedPayments = payrollRecords.filter(r => r.status === 'paid').length;
  const onHoldPayments = payrollRecords.filter(r => r.status === 'on-hold').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'paid': return 'bg-green-500';
      case 'on-hold': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'paid': return 'Paid';
      case 'on-hold': return 'On Hold';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleProcessPayroll = (recordId: string) => {
    setPayrollRecords(prev => prev.map(record => 
      record.id === recordId ? { ...record, status: 'processing' as const } : record
    ));
  };

  const handleMarkPaid = (recordId: string) => {
    setPayrollRecords(prev => prev.map(record => 
      record.id === recordId ? { ...record, status: 'paid' as const, paymentDate: new Date().toISOString().split('T')[0] } : record
    ));
  };

  const handleReleaseHold = (recordId: string) => {
    setPayrollRecords(prev => prev.map(record => 
      record.id === recordId ? { ...record, status: 'pending' as const } : record
    ));
  };

  const handleApproveBonusDeduction = (bdId: string) => {
    setBonusDeductions(prev => prev.map(bd => 
      bd.id === bdId ? { ...bd, status: 'approved' as const } : bd
    ));
  };

  const handleRejectBonusDeduction = (bdId: string) => {
    setBonusDeductions(prev => prev.map(bd => 
      bd.id === bdId ? { ...bd, status: 'rejected' as const } : bd
    ));
  };

  const handleAddBonusDeduction = () => {
    if (!selectedEmployee || !newBonusAmount || !newBonusCategory) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const employee = payrollRecords.find(r => r.farmerId === selectedEmployee);
    if (!employee) return;

    const newBD: BonusDeduction = {
      id: `bd-${Date.now()}`,
      farmerId: selectedEmployee,
      farmerName: employee.farmerName,
      type: newBonusType,
      category: newBonusCategory,
      amount: parseFloat(newBonusAmount),
      description: newBonusDescription,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setBonusDeductions(prev => [...prev, newBD]);
    setShowAddBonus(false);
    setNewBonusAmount('');
    setNewBonusCategory('');
    setNewBonusDescription('');
    setSelectedEmployee('');
  };

  const processAllPending = () => {
    setPayrollRecords(prev => prev.map(record => 
      record.status === 'pending' ? { ...record, status: 'processing' as const } : record
    ));
  };

  const totalBonuses = bonusDeductions.filter(bd => bd.type === 'bonus' && bd.status === 'approved').reduce((sum, bd) => sum + bd.amount, 0);
  const totalDeductions = bonusDeductions.filter(bd => bd.type === 'deduction' && bd.status === 'approved').reduce((sum, bd) => sum + bd.amount, 0);
  const pendingApprovals = bonusDeductions.filter(bd => bd.status === 'pending').length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Pay Period', 'Base Harvest (L)', 'Quality Bonus', 'Deductions', 'Gross Pay', 'Net Pay', 'Status', 'Payment Date', 'Payment Method'];
    const rows = payrollRecords.map(record => [
      record.farmerId,
      record.farmerName,
      record.email,
      record.payPeriod,
      record.baseHarvest,
      record.qualityBonus,
      record.deductions,
      record.grossPay,
      record.netPay,
      record.status,
      record.paymentDate,
      record.paymentMethod
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: 'Export Successful',
      description: 'Payroll data has been exported to CSV.',
    });
  };

  // Export PDF function
  const handleExportPDF = () => {
    const headers = [
      { key: 'farmerName', label: 'Employee' },
      { key: 'payPeriod', label: 'Period' },
      { key: 'baseHarvest', label: 'Harvest (L)' },
      { key: 'grossPay', label: 'Gross (₱)' },
      { key: 'qualityBonus', label: 'Bonus (₱)' },
      { key: 'deductions', label: 'Deductions (₱)' },
      { key: 'netPay', label: 'Net Pay (₱)' },
      { key: 'status', label: 'Status' },
    ];

    exportToPDF(payrollRecords, headers, 'Payroll Report', 'payroll_report', {
      orientation: 'landscape',
      subtitle: `Total Payroll: ₱${totalPayroll.toLocaleString()} | Employees: ${payrollRecords.length}`,
    });

    toast({
      title: 'PDF Generated',
      description: 'Payroll report has been exported to PDF.',
    });
  };

  // Generate payslips for all employees
  const handleGeneratePayslips = () => {
    const payslips: PayslipData[] = payrollRecords.map(record => ({
      employeeId: record.farmerId,
      employeeName: record.farmerName,
      email: record.email,
      payPeriod: record.payPeriod,
      paymentDate: record.paymentDate,
      paymentMethod: record.paymentMethod,
      baseHarvest: record.baseHarvest,
      baseRate: 30, // Default rate
      grossPay: record.grossPay,
      qualityBonus: record.qualityBonus,
      deductions: record.deductions,
      netPay: record.netPay,
    }));

    generateAllPayslipsPDF(payslips);

    toast({
      title: 'Payslips Generated',
      description: `${payslips.length} payslips are being downloaded.`,
    });
  };

  // Send payment notifications
  const handleSendNotifications = () => {
    const pendingRecords = payrollRecords.filter(r => r.status === 'pending' || r.status === 'processing');
    
    toast({
      title: 'Notifications Sent',
      description: `Payment notifications sent to ${pendingRecords.length} employees via email.`,
    });
  };

  // Schedule auto-payments
  const handleSchedulePayments = () => {
    if (!scheduledDate) {
      toast({
        title: 'Error',
        description: 'Please select a date for scheduled payments.',
        variant: 'destructive',
      });
      return;
    }

    const pendingCount = payrollRecords.filter(r => r.status === 'pending').length;
    
    toast({
      title: 'Payments Scheduled',
      description: `${pendingCount} payments scheduled for ${scheduledDate}.`,
    });
    
    setSchedulePaymentsDialog(false);
    setScheduledDate('');
  };

  // View period details
  const handleViewPeriodDetails = (period: PayPeriod) => {
    setPeriodDetailDialog(period);
  };

  // Export single period
  const handleExportPeriod = (period: PayPeriod) => {
    const periodRecords = payrollRecords.filter(r => r.payPeriod === period.name);
    
    const headers = [
      { key: 'farmerName', label: 'Employee' },
      { key: 'baseHarvest', label: 'Harvest (L)' },
      { key: 'grossPay', label: 'Gross (₱)' },
      { key: 'netPay', label: 'Net Pay (₱)' },
      { key: 'status', label: 'Status' },
    ];

    exportToPDF(periodRecords, headers, `Payroll - ${period.name}`, `payroll_${period.id}`, {
      subtitle: `Period: ${period.startDate} to ${period.endDate}`,
    });

    toast({
      title: 'Period Exported',
      description: `${period.name} has been exported to PDF.`,
    });
  };

  // Close payroll period
  const handleClosePeriod = (periodId: string) => {
    setPayPeriods(prev => prev.map(p => 
      p.id === periodId ? { ...p, status: 'closed' as const } : p
    ));

    toast({
      title: 'Period Closed',
      description: 'Payroll period has been closed successfully.',
    });
  };

  // Create new period
  const handleCreateNewPeriod = () => {
    const newPeriod: PayPeriod = {
      id: `period-${Date.now()}`,
      name: `${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week ${Math.ceil(new Date().getDate() / 7)}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      totalPayroll: 0,
      employeeCount: payrollRecords.length,
    };

    setPayPeriods(prev => [newPeriod, ...prev]);

    toast({
      title: 'Period Created',
      description: `New payroll period "${newPeriod.name}" has been created.`,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={user?.name} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Payroll Management</h1>
              <div className="flex gap-2">
                <Button 
                  onClick={processAllPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={pendingPayments === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Process All Pending
                </Button>
                <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Payroll
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payroll</div>
                  </div>
                  <div className="text-2xl font-bold text-green-800">₱{totalPayroll.toLocaleString()}</div>
                  <p className="text-xs text-green-600">This pay period</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-800">{pendingPayments}</div>
                  <p className="text-xs text-yellow-600">Awaiting processing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">{processingPayments}</div>
                  <p className="text-xs text-blue-600">In progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">{completedPayments}</div>
                  <p className="text-xs text-emerald-600">Paid out</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">On Hold</div>
                  </div>
                  <div className="text-2xl font-bold text-red-800">{onHoldPayments}</div>
                  <p className="text-xs text-red-600">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="payroll" className="space-y-6">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4">
                  <TabsTrigger value="payroll" className="whitespace-nowrap">Employee Payroll</TabsTrigger>
                  <TabsTrigger value="bonuses" className="whitespace-nowrap">Bonuses & Deductions</TabsTrigger>
                  <TabsTrigger value="periods" className="whitespace-nowrap">Pay Periods</TabsTrigger>
                  <TabsTrigger value="summary" className="whitespace-nowrap">Summary & Reports</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="payroll" className="space-y-4">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search by name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Select Period
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payroll Records */}
                <div className="space-y-4">
                  {paginatedRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-800 font-semibold text-lg">
                                {record.farmerName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg dark:text-white">{record.farmerName}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{record.email}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">{record.payPeriod}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 lg:max-w-2xl">
                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                              <div className="text-xs text-gray-600">Base Harvest</div>
                              <div className="font-semibold text-blue-700">{record.baseHarvest}L</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                              <div className="text-xs text-gray-600">Quality Bonus</div>
                              <div className="font-semibold text-green-700">+₱{record.qualityBonus.toLocaleString()}</div>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded-lg">
                              <div className="text-xs text-gray-600">Deductions</div>
                              <div className="font-semibold text-red-700">-₱{record.deductions.toLocaleString()}</div>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="text-xs text-gray-600">Net Pay</div>
                              <div className="font-bold text-emerald-700">₱{record.netPay.toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge className={`${getStatusColor(record.status)} text-white`}>
                              {getStatusText(record.status)}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {record.paymentMethod}
                            </div>
                            <div className="flex gap-2">
                              {record.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleProcessPayroll(record.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Process
                                </Button>
                              )}
                              {record.status === 'processing' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMarkPaid(record.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                              {record.status === 'on-hold' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleReleaseHold(record.id)}
                                  variant="outline"
                                  className="text-green-600"
                                >
                                  Release Hold
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Payroll Breakdown */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-600 dark:text-gray-400">Gross Pay: <span className="font-medium">₱{record.grossPay.toLocaleString()}</span></span>
                              <span className="text-gray-600 dark:text-gray-400">Payment Date: <span className="font-medium">{record.paymentDate}</span></span>
                            </div>
                            <div className="w-48">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{record.status === 'paid' ? '100%' : record.status === 'processing' ? '50%' : '0%'}</span>
                              </div>
                              <Progress 
                                value={record.status === 'paid' ? 100 : record.status === 'processing' ? 50 : 0} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredRecords.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">No payroll records found matching your search.</p>
                    </CardContent>
                  </Card>
                )}

                {/* Pagination Controls */}
                {filteredRecords.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Show</span>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>per page | Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bonuses" className="space-y-4">
                {/* Bonuses Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bonuses</div>
                      <div className="text-2xl font-bold text-green-800">₱{totalBonuses.toLocaleString()}</div>
                      <p className="text-xs text-green-600">Approved this period</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deductions</div>
                      <div className="text-2xl font-bold text-red-800">₱{totalDeductions.toLocaleString()}</div>
                      <p className="text-xs text-red-600">Applied this period</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Adjustment</div>
                      <div className={`text-2xl font-bold ${totalBonuses - totalDeductions >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        {totalBonuses - totalDeductions >= 0 ? '+' : ''}₱{(totalBonuses - totalDeductions).toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Overall impact</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</div>
                      <div className="text-2xl font-bold text-yellow-800">{pendingApprovals}</div>
                      <p className="text-xs text-yellow-600">Awaiting review</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Add New Bonus/Deduction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Add Bonus or Deduction</span>
                      <Button 
                        onClick={() => setShowAddBonus(!showAddBonus)}
                        variant="outline"
                        size="sm"
                      >
                        {showAddBonus ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                        {showAddBonus ? 'Cancel' : 'Add New'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {showAddBonus && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label>Type</Label>
                          <div className="flex gap-2 mt-1">
                            <Button 
                              variant={newBonusType === 'bonus' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setNewBonusType('bonus')}
                              className={newBonusType === 'bonus' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Bonus
                            </Button>
                            <Button 
                              variant={newBonusType === 'deduction' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setNewBonusType('deduction')}
                              className={newBonusType === 'deduction' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Deduction
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Employee</Label>
                          <select 
                            className="w-full mt-1 p-2 border rounded-md"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                          >
                            <option value="">Select employee...</option>
                            {payrollRecords.map(record => (
                              <option key={record.farmerId} value={record.farmerId}>
                                {record.farmerName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input 
                            placeholder="e.g., Performance, Equipment"
                            value={newBonusCategory}
                            onChange={(e) => setNewBonusCategory(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Amount (₱)</Label>
                          <Input 
                            type="number"
                            placeholder="0.00"
                            value={newBonusAmount}
                            onChange={(e) => setNewBonusAmount(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input 
                          placeholder="Reason for bonus/deduction..."
                          value={newBonusDescription}
                          onChange={(e) => setNewBonusDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={handleAddBonusDeduction} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add {newBonusType === 'bonus' ? 'Bonus' : 'Deduction'}
                      </Button>
                    </CardContent>
                  )}
                </Card>

                {/* Bonuses & Deductions List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bonuses & Deductions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bonusDeductions.map((bd) => (
                        <div key={bd.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${bd.type === 'bonus' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {bd.type === 'bonus' ? (
                                <Plus className="h-5 w-5 text-green-600" />
                              ) : (
                                <Minus className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{bd.farmerName}</h4>
                                <Badge variant="outline" className="text-xs">{bd.category}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{bd.description}</p>
                              <p className="text-xs text-gray-500">{bd.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`text-lg font-bold ${bd.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                              {bd.type === 'bonus' ? '+' : '-'}₱{bd.amount.toLocaleString()}
                            </div>
                            <Badge className={`${getStatusColor(bd.status)} text-white`}>
                              {bd.status.charAt(0).toUpperCase() + bd.status.slice(1)}
                            </Badge>
                            {bd.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproveBonusDeduction(bd.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRejectBonusDeduction(bd.id)}
                                  className="text-red-600"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="periods" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Pay Periods
                      </span>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateNewPeriod}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Period
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {payPeriods.map((period) => (
                        <div key={period.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${period.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Calendar className={`h-5 w-5 ${period.status === 'active' ? 'text-green-600' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{period.name}</h3>
                                <p className="text-sm text-gray-600">{period.startDate} to {period.endDate}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(period.status)} text-white`}>
                              {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-600">Total Payroll</div>
                              <div className="font-bold text-green-700">₱{period.totalPayroll.toLocaleString()}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-600">Employees</div>
                              <div className="font-bold text-blue-700">{period.employeeCount}</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-600">Avg Per Employee</div>
                              <div className="font-bold text-purple-700">
                                ₱{(period.totalPayroll / period.employeeCount).toLocaleString(undefined, {maximumFractionDigits: 2})}
                              </div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-600">Days</div>
                              <div className="font-bold text-gray-700">7</div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleViewPeriodDetails(period)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExportPeriod(period)}>
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            {period.status === 'active' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleClosePeriod(period.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Close Period
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payroll Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Payroll Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Total Gross Pay</span>
                          <span className="text-xl font-bold text-green-700">
                            ₱{payrollRecords.reduce((sum, r) => sum + r.grossPay, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Total Bonuses</span>
                          <span className="text-xl font-bold text-blue-700">
                            +₱{payrollRecords.reduce((sum, r) => sum + r.qualityBonus, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="font-medium">Total Deductions</span>
                          <span className="text-xl font-bold text-red-700">
                            -₱{payrollRecords.reduce((sum, r) => sum + r.deductions, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                          <span className="font-bold">Net Payroll</span>
                          <span className="text-2xl font-bold text-emerald-700">
                            ₱{totalPayroll.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              Paid
                            </span>
                            <span className="font-medium">{completedPayments} / {payrollRecords.length}</span>
                          </div>
                          <Progress value={(completedPayments / payrollRecords.length) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              Processing
                            </span>
                            <span className="font-medium">{processingPayments} / {payrollRecords.length}</span>
                          </div>
                          <Progress value={(processingPayments / payrollRecords.length) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              Pending
                            </span>
                            <span className="font-medium">{pendingPayments} / {payrollRecords.length}</span>
                          </div>
                          <Progress value={(pendingPayments / payrollRecords.length) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              On Hold
                            </span>
                            <span className="font-medium">{onHoldPayments} / {payrollRecords.length}</span>
                          </div>
                          <Progress value={(onHoldPayments / payrollRecords.length) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Earners */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Top Earners This Period
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...payrollRecords]
                          .sort((a, b) => b.netPay - a.netPay)
                          .slice(0, 4)
                          .map((record, index) => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{record.farmerName}</h4>
                                  <p className="text-xs text-gray-600">{record.baseHarvest}L harvested</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-700">₱{record.netPay.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">+₱{record.qualityBonus.toLocaleString()} bonus</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start bg-green-600 hover:bg-green-700" onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Payroll Report (PDF)
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export to Excel (CSV)
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={handleGeneratePayslips}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Payslips
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={handleSendNotifications}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Payment Notifications
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setSchedulePaymentsDialog(true)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Auto-Payments
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Period Detail Dialog */}
      <Dialog open={!!periodDetailDialog} onOpenChange={() => setPeriodDetailDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Period Details</DialogTitle>
            <DialogDescription>
              {periodDetailDialog?.name}
            </DialogDescription>
          </DialogHeader>
          {periodDetailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Start Date</div>
                  <div className="font-semibold">{periodDetailDialog.startDate}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">End Date</div>
                  <div className="font-semibold">{periodDetailDialog.endDate}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Payroll</div>
                  <div className="font-bold text-green-700">₱{periodDetailDialog.totalPayroll.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Employees</div>
                  <div className="font-bold text-blue-700">{periodDetailDialog.employeeCount}</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Status</div>
                <Badge className={`${getStatusColor(periodDetailDialog.status)} text-white`}>
                  {periodDetailDialog.status.charAt(0).toUpperCase() + periodDetailDialog.status.slice(1)}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Employees in this period:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {payrollRecords.filter(r => r.payPeriod === periodDetailDialog.name).map(record => (
                    <div key={record.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{record.farmerName}</span>
                      <span className="font-medium text-green-700">₱{record.netPay.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDetailDialog(null)}>Close</Button>
            {periodDetailDialog && (
              <Button onClick={() => handleExportPeriod(periodDetailDialog)} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export Period
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Payments Dialog */}
      <Dialog open={schedulePaymentsDialog} onOpenChange={setSchedulePaymentsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Auto-Payments</DialogTitle>
            <DialogDescription>
              Schedule automatic payment processing for all pending payroll items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Scheduled Date</Label>
              <Input 
                type="date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Pending Payments</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {payrollRecords.filter(r => r.status === 'pending').length} payments will be processed on the selected date.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedulePaymentsDialog(false)}>Cancel</Button>
            <Button onClick={handleSchedulePayments} className="bg-green-600 hover:bg-green-700">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayroll;
