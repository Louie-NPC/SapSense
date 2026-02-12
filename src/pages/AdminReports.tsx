import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdvancedAnalyticsCharts, { 
  HarvestTrendChart, 
  QualityDistributionChart, 
  FarmerPerformanceRadarChart 
} from '@/components/AdvancedAnalyticsCharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Bell,
  Clock,
  XCircle,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportDisputesToPDF, exportQualityReportsToPDF } from '@/lib/exportUtils';

const API_BASE_URL = 'http://localhost:3001/api';

interface DisputeRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  treeId: string;
  farmPH: number;
  plantPH: number;
  farmVolume: number;
  plantVolume: number;
  farmTimestamp: Date;
  plantTimestamp: Date;
  status: 'pending' | 'resolved' | 'rejected';
  discrepancy: number;
}

interface QualityReport {
  period: string;
  totalHarvest: number;
  acceptedSap: number;
  rejectedSap: number;
  avgPH: number;
  avgQuality: number;
  disputes: number;
}

interface NotificationAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  farmerId?: string;
  farmerName?: string;
  treeId?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'high' | 'medium' | 'low';
}

interface NotificationFromDB {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  farmer_id: string | null;
  farmer_name: string | null;
  tree_id: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

const AdminReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Dialog state
  const [alertDetailDialog, setAlertDetailDialog] = useState<NotificationAlert | null>(null);
  
  // Loading and error states
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [disputes, setDisputes] = useState<DisputeRecord[]>([
    {
      id: 'dispute-1',
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      treeId: 'container-1',
      farmPH: 5.4,
      plantPH: 6.8,
      farmVolume: 8.5,
      plantVolume: 8.2,
      farmTimestamp: new Date('2024-01-15T08:30:00'),
      plantTimestamp: new Date('2024-01-15T14:20:00'),
      status: 'pending',
      discrepancy: 1.4
    },
    {
      id: 'dispute-2',
      farmerId: 'farmer-2',
      farmerName: 'Maria Santos',
      treeId: 'container-4',
      farmPH: 5.6,
      plantPH: 5.8,
      farmVolume: 9.1,
      plantVolume: 9.0,
      farmTimestamp: new Date('2024-01-14T09:15:00'),
      plantTimestamp: new Date('2024-01-14T15:45:00'),
      status: 'resolved',
      discrepancy: 0.2
    },
    {
      id: 'dispute-3',
      farmerId: 'farmer-3',
      farmerName: 'Pedro Garcia',
      treeId: 'container-7',
      farmPH: 5.2,
      plantPH: 7.1,
      farmVolume: 7.8,
      plantVolume: 7.5,
      farmTimestamp: new Date('2024-01-13T07:45:00'),
      plantTimestamp: new Date('2024-01-13T13:30:00'),
      status: 'rejected',
      discrepancy: 1.9
    }
  ]);

  const [qualityReports, setQualityReports] = useState<QualityReport[]>([
    {
      period: 'Week 1 - Jan 2024',
      totalHarvest: 485.2,
      acceptedSap: 426.8,
      rejectedSap: 58.4,
      avgPH: 5.7,
      avgQuality: 4.2,
      disputes: 3
    },
    {
      period: 'Week 2 - Jan 2024',
      totalHarvest: 512.8,
      acceptedSap: 478.1,
      rejectedSap: 34.7,
      avgPH: 5.5,
      avgQuality: 4.5,
      disputes: 1
    },
    {
      period: 'Week 3 - Jan 2024',
      totalHarvest: 498.6,
      acceptedSap: 461.2,
      rejectedSap: 37.4,
      avgPH: 5.6,
      avgQuality: 4.4,
      disputes: 2
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);

  // Transform database notification to frontend format
  const transformNotification = (dbNotif: NotificationFromDB): NotificationAlert => ({
    id: dbNotif.id,
    type: dbNotif.type,
    title: dbNotif.title,
    message: dbNotif.message || '',
    timestamp: new Date(dbNotif.timestamp),
    farmerId: dbNotif.farmer_id || undefined,
    farmerName: dbNotif.farmer_name || undefined,
    treeId: dbNotif.tree_id || undefined,
    status: dbNotif.status,
    priority: dbNotif.priority
  });

  // Fetch notifications from PostgreSQL database
  const fetchNotifications = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setNotificationsLoading(true);
    }
    setNotificationsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationFromDB[] = await response.json();
      const transformedNotifications = data.map(transformNotification);
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotificationsError('Failed to load notifications. Please ensure the server is running.');
      toast({
        title: 'Error',
        description: 'Failed to load notifications from server.',
        variant: 'destructive'
      });
    } finally {
      setNotificationsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Refresh notifications
  const handleRefreshNotifications = () => {
    fetchNotifications(true);
  };

  const pendingDisputes = disputes.filter(d => d.status === 'pending').length;
  const totalDisputes = disputes.length;
  const disputeRate = (totalDisputes / (qualityReports.reduce((sum, r) => sum + r.totalHarvest, 0) / 100)).toFixed(1);

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDisputeStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-500 text-white">Active</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-500 text-white">Acknowledged</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const activeNotifications = notifications.filter(n => n.status === 'active');
  const acknowledgedNotifications = notifications.filter(n => n.status === 'acknowledged');
  const resolvedNotifications = notifications.filter(n => n.status === 'resolved');

  // Export all data handler
  const handleExportAllData = () => {
    // Export disputes
    exportDisputesToPDF(disputes.map(d => ({
      ...d,
      farmTimestamp: d.farmTimestamp.toLocaleString(),
      plantTimestamp: d.plantTimestamp.toLocaleString(),
    })));

    // Export quality reports
    setTimeout(() => {
      exportQualityReportsToPDF(qualityReports);
    }, 500);

    toast({
      title: 'Export Started',
      description: 'Reports are being exported to PDF files.',
    });
  };

  // Acknowledge alert handler
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'acknowledged' })
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge notification');
      }

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'acknowledged' as const } : n)
      );
      toast({
        title: 'Alert Acknowledged',
        description: 'The alert has been marked as acknowledged.',
      });
    } catch (err) {
      console.error('Error acknowledging notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to acknowledge notification.',
        variant: 'destructive'
      });
    }
  };

  // View alert details handler
  const handleViewAlertDetails = (notification: NotificationAlert) => {
    setAlertDetailDialog(notification);
  };

  // Mark resolved handler
  const handleMarkResolved = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve notification');
      }

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'resolved' as const } : n)
      );
      toast({
        title: 'Alert Resolved',
        description: 'The alert has been marked as resolved.',
      });
    } catch (err) {
      console.error('Error resolving notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to resolve notification.',
        variant: 'destructive'
      });
    }
  };

  // Accept farm reading handler
  const handleAcceptFarmReading = (disputeId: string) => {
    setDisputes(prev => 
      prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' as const } : d)
    );
    toast({
      title: 'Farm Reading Accepted',
      description: 'The dispute has been resolved using farm pH reading.',
    });
  };

  // Accept plant reading handler
  const handleAcceptPlantReading = (disputeId: string) => {
    setDisputes(prev => 
      prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' as const } : d)
    );
    toast({
      title: 'Plant Reading Accepted',
      description: 'The dispute has been resolved using plant pH reading.',
    });
  };

  // Request re-test handler
  const handleRequestRetest = (disputeId: string) => {
    setDisputes(prev => 
      prev.map(d => d.id === disputeId ? { ...d, status: 'pending' as const } : d)
    );
    toast({
      title: 'Re-test Requested',
      description: 'A re-test has been scheduled for this container.',
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
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleExportAllData}>
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Disputes</div>
                  <div className="text-2xl font-bold text-orange-800">{totalDisputes}</div>
                  <p className="text-xs text-orange-600">{disputeRate}% of total harvest</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</div>
                  <div className="text-2xl font-bold text-red-800">{pendingDisputes}</div>
                  <p className="text-xs text-red-600">Require immediate attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolution Rate</div>
                  <div className="text-2xl font-bold text-green-800">
                    {((disputes.filter(d => d.status === 'resolved').length / totalDisputes) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-green-600">Successfully resolved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Discrepancy</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {(disputes.reduce((sum, d) => sum + d.discrepancy, 0) / disputes.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-purple-600">pH difference</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="notifications" className="space-y-6">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4">
                  <TabsTrigger value="notifications" className="whitespace-nowrap">Notifications & Alerts</TabsTrigger>
                  <TabsTrigger value="disputes" className="whitespace-nowrap">Dispute Resolution</TabsTrigger>
                  <TabsTrigger value="quality" className="whitespace-nowrap">Quality Reports</TabsTrigger>
                  <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="notifications" className="space-y-6">
                {/* Error State */}
                {notificationsError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{notificationsError}</AlertDescription>
                  </Alert>
                )}

                {/* Refresh Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshNotifications}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Notifications
                  </Button>
                </div>

                {/* Loading State */}
                {notificationsLoading ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-12 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-40" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-32 w-full" />
                        ))}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                {/* Notifications Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</div>
                      <div className="text-2xl font-bold text-red-600">{activeNotifications.length}</div>
                      <p className="text-xs text-red-500">Require attention</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Acknowledged</div>
                      <div className="text-2xl font-bold text-yellow-600">{acknowledgedNotifications.length}</div>
                      <p className="text-xs text-yellow-500">Being addressed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved Today</div>
                      <div className="text-2xl font-bold text-green-600">{resolvedNotifications.length}</div>
                      <p className="text-xs text-green-500">Successfully handled</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</div>
                      <div className="text-2xl font-bold text-blue-600">12m</div>
                      <p className="text-xs text-blue-500">Average response</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Alerts Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <Bell className="h-5 w-5 mr-2" />
                      Active Alerts ({activeNotifications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeNotifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>No active alerts at the moment</p>
                      </div>
                    ) : (
                      activeNotifications.map((notification) => {
                        const IconComponent = getNotificationIcon(notification.type);
                        return (
                          <Alert key={notification.id} className={getNotificationColor(notification.type)}>
                            <IconComponent className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <AlertTitle className="flex items-center gap-2">
                                  {notification.title}
                                  {getPriorityBadge(notification.priority)}
                                </AlertTitle>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <AlertDescription className="mb-3">
                                {notification.message}
                              </AlertDescription>
                              {notification.farmerName && (
                                <div className="text-sm text-gray-600 mb-3">
                                  <strong>Farmer:</strong> {notification.farmerName}
                                  {notification.treeId && (
                                    <span className="ml-4">
                                      <strong>Tree:</strong> {notification.treeId.replace('container-', 'Tree ')}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAcknowledgeAlert(notification.id)}>
                                  Acknowledge
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleViewAlertDetails(notification)}>
                                  View Details
                                </Button>
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleMarkResolved(notification.id)}>
                                  Mark Resolved
                                </Button>
                              </div>
                            </div>
                          </Alert>
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                {/* All Notifications History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-600" />
                      Notification History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {notifications
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map((notification) => {
                          const IconComponent = getNotificationIcon(notification.type);
                          return (
                            <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <div className={`p-2 rounded-full ${
                                notification.type === 'critical' ? 'bg-red-100' :
                                notification.type === 'warning' ? 'bg-yellow-100' :
                                notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                <IconComponent className={`h-4 w-4 ${
                                  notification.type === 'critical' ? 'text-red-600' :
                                  notification.type === 'warning' ? 'text-yellow-600' :
                                  notification.type === 'success' ? 'text-green-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{notification.title}</h4>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(notification.status)}
                                    <span className="text-xs text-gray-500">
                                      {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                                {notification.farmerName && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    {notification.farmerName} • {notification.treeId?.replace('container-', 'Tree ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
                </>
                )}
              </TabsContent>

              <TabsContent value="disputes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Farm vs Plant Data Discrepancies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {disputes.map((dispute) => (
                        <div key={dispute.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{dispute.farmerName}</h3>
                                <p className="text-sm text-gray-600">Tree: {dispute.treeId.replace('container-', 'Tree ')}</p>
                              </div>
                            </div>
                            <Badge 
                              className={`${getDisputeStatusColor(dispute.status)} text-white`}
                            >
                              {getDisputeStatusText(dispute.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-medium text-blue-800 mb-2">Farm Reading</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>pH Level:</span>
                                  <span className="font-medium">{dispute.farmPH}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Volume:</span>
                                  <span className="font-medium">{dispute.farmVolume}L</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Time:</span>
                                  <span className="font-medium">{dispute.farmTimestamp.toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="font-medium text-green-800 mb-2">Plant Reading</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>pH Level:</span>
                                  <span className="font-medium">{dispute.plantPH}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Volume:</span>
                                  <span className="font-medium">{dispute.plantVolume}L</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Time:</span>
                                  <span className="font-medium">{dispute.plantTimestamp.toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-yellow-800">pH Discrepancy:</span>
                              <span className={`font-bold ${dispute.discrepancy > 1.0 ? 'text-red-600' : 'text-orange-600'}`}>
                                {dispute.discrepancy.toFixed(1)} pH units
                              </span>
                            </div>
                            <div className="mt-2">
                              <Progress 
                                value={Math.min((dispute.discrepancy / 2) * 100, 100)} 
                                className="h-2" 
                              />
                            </div>
                          </div>

                          {dispute.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAcceptFarmReading(dispute.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept Farm Reading
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAcceptPlantReading(dispute.id)}>
                                Accept Plant Reading
                              </Button>
                              <Button size="sm" variant="outline" className="text-orange-600" onClick={() => handleRequestRetest(dispute.id)}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Request Re-test
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Quality Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qualityReports.map((report, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{report.period}</h3>
                            <Badge variant="outline">
                              {((report.acceptedSap / report.totalHarvest) * 100).toFixed(0)}% Acceptance Rate
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{report.totalHarvest}L</div>
                              <div className="text-xs text-gray-600">Total Harvest</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{report.acceptedSap}L</div>
                              <div className="text-xs text-gray-600">Accepted</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{report.rejectedSap}L</div>
                              <div className="text-xs text-gray-600">Rejected</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">{report.disputes}</div>
                              <div className="text-xs text-gray-600">Disputes</div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <span className="text-sm">Average pH:</span>
                                <span className="font-medium">{report.avgPH}</span>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <span className="text-sm">Quality Score:</span>
                                <span className="font-medium">{report.avgQuality}/5.0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Advanced Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HarvestTrendChart />
                  <QualityDistributionChart />
                  <FarmerPerformanceRadarChart />
                  
                  {/* Efficiency Metrics Card */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="font-medium">QA Travel Time Reduction</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">78%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Sap Rejection Rate</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">12%</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Auto-Approval Rate</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">85%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Impact Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Manual QA Reduction</span>
                            <span className="font-medium">80%</span>
                          </div>
                          <Progress value={80} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Dispute Resolution Speed</span>
                            <span className="font-medium">65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Farmer Satisfaction</span>
                            <span className="font-medium">92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Quality Consistency</span>
                            <span className="font-medium">88%</span>
                          </div>
                          <Progress value={88} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Alert Detail Dialog */}
      <Dialog open={!!alertDetailDialog} onOpenChange={() => setAlertDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {alertDetailDialog && (() => {
                const IconComponent = getNotificationIcon(alertDetailDialog.type);
                return <IconComponent className="h-5 w-5" />;
              })()}
              {alertDetailDialog?.title}
            </DialogTitle>
            <DialogDescription>
              Alert Details
            </DialogDescription>
          </DialogHeader>
          {alertDetailDialog && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${getNotificationColor(alertDetailDialog.type)}`}>
                <p>{alertDetailDialog.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="mt-1">{getStatusBadge(alertDetailDialog.status)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Priority</div>
                  <div className="mt-1">{getPriorityBadge(alertDetailDialog.priority)}</div>
                </div>
              </div>

              {alertDetailDialog.farmerName && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Assigned Farmer</div>
                  <div className="font-medium mt-1">{alertDetailDialog.farmerName}</div>
                </div>
              )}

              {alertDetailDialog.treeId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Tree/Container</div>
                  <div className="font-medium mt-1">{alertDetailDialog.treeId.replace('container-', 'Tree ')}</div>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Timestamp</div>
                <div className="font-medium mt-1">
                  {alertDetailDialog.timestamp.toLocaleDateString()} at {alertDetailDialog.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertDetailDialog(null)}>Close</Button>
            {alertDetailDialog && alertDetailDialog.status === 'active' && (
              <>
                <Button variant="outline" onClick={() => {
                  handleAcknowledgeAlert(alertDetailDialog.id);
                  setAlertDetailDialog(null);
                }}>
                  Acknowledge
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                  handleMarkResolved(alertDetailDialog.id);
                  setAlertDetailDialog(null);
                }}>
                  Mark Resolved
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
