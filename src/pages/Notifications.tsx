
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, CheckCircle, AlertTriangle, Info, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

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

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState<NotificationAlert | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationAlert[]>([
    {
      id: 'notif-1',
      type: 'critical',
      title: 'Critical pH Level Alert',
      message: 'Tree container-5 pH level has dropped to 4.2 - immediate attention required',
      timestamp: new Date('2024-01-15T10:30:00'),
      farmerId: 'farmer-2',
      farmerName: 'Maria Santos',
      treeId: 'container-5',
      status: 'active',
      priority: 'high'
    },
    {
      id: 'notif-2',
      type: 'warning',
      title: 'Quality Threshold Warning',
      message: 'Tree container-8 sap quality approaching minimum threshold (3.8/5.0)',
      timestamp: new Date('2024-01-15T09:15:00'),
      farmerId: 'farmer-3',
      farmerName: 'Pedro Garcia',
      treeId: 'container-8',
      status: 'acknowledged',
      priority: 'medium'
    },
    {
      id: 'notif-3',
      type: 'info',
      title: 'Harvest Reminder',
      message: 'Tree container-1 is ready for harvest - optimal pH level achieved (5.6)',
      timestamp: new Date('2024-01-15T08:45:00'),
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      treeId: 'container-1',
      status: 'active',
      priority: 'low'
    },
    {
      id: 'notif-4',
      type: 'success',
      title: 'Quality Improvement',
      message: 'Tree container-3 pH levels have stabilized after treatment',
      timestamp: new Date('2024-01-15T07:20:00'),
      farmerId: 'farmer-1',
      farmerName: 'Juan Dela Cruz',
      treeId: 'container-3',
      status: 'resolved',
      priority: 'low'
    }
  ]);

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

  const handleAcknowledge = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: 'acknowledged' } : n)
    );
  };

  const handleResolve = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: 'resolved' } : n)
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleViewDetails = (notification: NotificationAlert) => {
    setDetailDialog(notification);
  };

  const activeNotifications = notifications.filter(n => n.status === 'active');
  const acknowledgedNotifications = notifications.filter(n => n.status === 'acknowledged');
  const resolvedNotifications = notifications.filter(n => n.status === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Notifications & Alerts</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage system notifications and alerts</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {user?.name}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Active Alerts */}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDismiss(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
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
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAcknowledge(notification.id)}
                        >
                          Acknowledge
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(notification)}>
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => handleResolve(notification.id)}
                        >
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
                    <div key={notification.id} className="flex items-start space-x-3 p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
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
                          <h4 className="font-medium dark:text-white">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(notification.status)}
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
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
      </main>

      {/* Notification Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailDialog && (() => {
                const IconComponent = getNotificationIcon(detailDialog.type);
                return <IconComponent className="h-5 w-5" />;
              })()}
              {detailDialog?.title}
            </DialogTitle>
            <DialogDescription>
              Notification Details
            </DialogDescription>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${getNotificationColor(detailDialog.type)}`}>
                <p>{detailDialog.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                  <div className="mt-1">{getStatusBadge(detailDialog.status)}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Priority</div>
                  <div className="mt-1">{getPriorityBadge(detailDialog.priority)}</div>
                </div>
              </div>

              {detailDialog.farmerName && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Assigned Farmer</div>
                  <div className="font-medium mt-1 dark:text-white">{detailDialog.farmerName}</div>
                </div>
              )}

              {detailDialog.treeId && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tree/Container</div>
                  <div className="font-medium mt-1 dark:text-white">{detailDialog.treeId.replace('container-', 'Tree ')}</div>
                </div>
              )}

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Timestamp</div>
                <div className="font-medium mt-1 dark:text-white">
                  {detailDialog.timestamp.toLocaleDateString()} at {detailDialog.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(null)}>Close</Button>
            {detailDialog && detailDialog.status === 'active' && (
              <>
                <Button variant="outline" onClick={() => {
                  handleAcknowledge(detailDialog.id);
                  setDetailDialog(null);
                }}>
                  Acknowledge
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                  handleResolve(detailDialog.id);
                  setDetailDialog(null);
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

export default Notifications;
