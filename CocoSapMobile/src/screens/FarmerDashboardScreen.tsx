import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useResponsive } from '../hooks/useResponsive';

type RootStackParamList = {
  Login: undefined;
  AdminDashboard: undefined;
  FarmerDashboard: undefined;
  Notifications: undefined;
  TreeDetails: { treeId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SensorData {
  id: string;
  name: string;
  ph: number;
  temperature: number;
  volume: number;
  humidity: number;
  batteryLevel: number;
  lastUpdate: Date;
  location: { lat: number; lng: number };
  status: 'optimal' | 'warning' | 'critical' | 'harvest';
}

interface AlertData {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  timestamp: Date;
  treeId?: string;
}

const FarmerDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { isSmallScreen, isTablet } = useResponsive();

  // State management
  const [containers, setContainers] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Generate realistic sensor data based on assigned trees
  const generateSensorData = (id: string, index: number): SensorData => {
    const baseTime = Date.now();
    const variation = Math.sin(baseTime / 300000 + index) * 0.3; // 5-minute cycle

    const basePh = 5.2 + variation + (Math.random() - 0.5) * 0.4;
    const baseTemp = 28 + Math.sin(baseTime / 600000) * 3 + (Math.random() - 0.5) * 2;
    const baseVolume = 15 + Math.sin(baseTime / 900000 + index) * 8 + (Math.random() - 0.5) * 3;
    const baseHumidity = 75 + Math.sin(baseTime / 450000) * 10 + (Math.random() - 0.5) * 5;

    let status: SensorData['status'] = 'optimal';
    if (basePh >= 5.0 && basePh <= 5.5 && baseVolume > 18) status = 'harvest';
    else if (basePh < 4.8 || basePh > 6.5 || baseTemp > 35) status = 'critical';
    else if (basePh < 5.0 || basePh > 5.8 || baseTemp > 32) status = 'warning';

    return {
      id,
      name: `Tree ${String.fromCharCode(65 + index)}${(index + 1).toString().padStart(2, '0')}`,
      ph: Number(basePh.toFixed(2)),
      temperature: Number(baseTemp.toFixed(1)),
      volume: Number(baseVolume.toFixed(2)),
      humidity: Number(baseHumidity.toFixed(1)),
      batteryLevel: 60 + Math.random() * 40,
      lastUpdate: new Date(),
      location: {
        lat: 14.5995 + (Math.random() - 0.5) * 0.01,
        lng: 120.9842 + (Math.random() - 0.5) * 0.01
      },
      status
    };
  };

  // Initialize containers based on user's assigned trees
  useEffect(() => {
    if (user?.assignedTrees) {
      const farmerContainers = user.assignedTrees.map((treeId, index) =>
        generateSensorData(treeId, parseInt(treeId.split('-')[1]) - 1)
      );
      setContainers(farmerContainers);
    }
  }, [user]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setContainers(prev => prev.map(container => {
        const updated = generateSensorData(container.id, parseInt(container.id.split('-')[1]) - 1);

        // Check for harvest alerts
        if (updated.status === 'harvest' && container.status !== 'harvest') {
          const alertMessage = `🥥 Harvest ready! ${updated.name} - pH at ${updated.ph} (Optimal range)`;
          setAlerts(prev => [...prev, {
            id: `alert-${Date.now()}`,
            message: alertMessage,
            type: 'info',
            timestamp: new Date(),
            treeId: updated.id
          }]);

          Alert.alert(
            "Harvest Alert! 🌴",
            `${updated.name} is ready for harvest (pH: ${updated.ph})`,
            [{ text: 'OK' }]
          );
        }

        // Check for critical alerts
        if (updated.status === 'critical' && container.status !== 'critical') {
          const alertMessage = `⚠️ Critical alert! ${updated.name} - pH: ${updated.ph}, Temp: ${updated.temperature}°C`;
          setAlerts(prev => [...prev, {
            id: `alert-${Date.now()}`,
            message: alertMessage,
            type: 'critical',
            timestamp: new Date(),
            treeId: updated.id
          }]);
        }

        return updated;
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      if (user?.assignedTrees) {
        const farmerContainers = user.assignedTrees.map((treeId, index) =>
          generateSensorData(treeId, parseInt(treeId.split('-')[1]) - 1)
        );
        setContainers(farmerContainers);
      }
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: SensorData['status']) => {
    switch (status) {
      case 'harvest': return '#10b981';
      case 'optimal': return '#22c55e';
      case 'warning': return '#eab308';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: SensorData['status']) => {
    switch (status) {
      case 'harvest': return 'Ready to Harvest';
      case 'optimal': return 'Optimal';
      case 'warning': return 'Monitor Closely';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const filteredContainers = filterStatus === 'all'
    ? containers
    : containers.filter(c => c.status === filterStatus);

  const totalVolume = containers.reduce((sum, container) => sum + container.volume, 0);
  const harvestReady = containers.filter(c => c.status === 'harvest').length;
  const criticalContainers = containers.filter(c => c.status === 'critical').length;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>🥥 My Trees</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
            {user?.location && (
              <Text style={styles.locationText}>📍 {user.location}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.alertIcon}>🔔</Text>
              {alerts.length > 0 && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{alerts.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryGrid, isTablet && styles.summaryGridTablet]}>
            <View style={[styles.summaryCard, isSmallScreen && styles.summaryCardSmall]}>
              <Text style={styles.summaryLabel}>My Trees</Text>
              <Text style={styles.summaryValue}>{containers.length}</Text>
              <Text style={styles.summarySubtext}>Assigned to me</Text>
            </View>
            <View style={[styles.summaryCard, isSmallScreen && styles.summaryCardSmall]}>
              <Text style={styles.summaryLabel}>Ready to Harvest</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>{harvestReady}</Text>
              <Text style={styles.summarySubtext}>Optimal pH range</Text>
            </View>
            <View style={[styles.summaryCard, isSmallScreen && styles.summaryCardSmall]}>
              <Text style={styles.summaryLabel}>Total Volume</Text>
              <Text style={styles.summaryValue}>{totalVolume.toFixed(1)}L</Text>
              <Text style={styles.summarySubtext}>Current collection</Text>
            </View>
            <View style={[styles.summaryCard, isSmallScreen && styles.summaryCardSmall]}>
              <Text style={styles.summaryLabel}>Critical Alerts</Text>
              <Text style={[styles.summaryValue, { color: criticalContainers > 0 ? '#ef4444' : '#22c55e' }]}>
                {criticalContainers}
              </Text>
              <Text style={styles.summarySubtext}>Need attention</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Filter by Status</Text>
          <View style={styles.filterButtons}>
            {['all', 'harvest', 'optimal', 'warning', 'critical'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.filterButtonActive
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.filterButtonTextActive
                ]}>
                  {status === 'all' ? 'All' : getStatusText(status as SensorData['status'])}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Container Grid */}
        <View style={styles.containerSection}>
          <Text style={styles.sectionTitle}>Tree Monitoring ({filteredContainers.length})</Text>
          <View style={styles.containerGrid}>
            {filteredContainers.map((container) => (
              <TouchableOpacity
                key={container.id}
                style={[
                  styles.containerCard,
                  { borderLeftColor: getStatusColor(container.status) }
                ]}
                onPress={() => setSelectedContainer(
                  selectedContainer === container.id ? null : container.id
                )}
              >
                <View style={styles.containerHeader}>
                  <Text style={styles.containerName}>{container.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(container.status) }
                  ]}>
                    <Text style={styles.statusText}>{getStatusText(container.status)}</Text>
                  </View>
                </View>

                <View style={styles.sensorGrid}>
                  <View style={styles.sensorItem}>
                    <Text style={styles.sensorLabel}>pH</Text>
                    <Text style={[
                      styles.sensorValue,
                      { color: container.ph >= 5.0 && container.ph <= 5.5 ? '#10b981' : '#ef4444' }
                    ]}>
                      {container.ph}
                    </Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={styles.sensorLabel}>Temp</Text>
                    <Text style={styles.sensorValue}>{container.temperature}°C</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={styles.sensorLabel}>Volume</Text>
                    <Text style={styles.sensorValue}>{container.volume}L</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={styles.sensorLabel}>Battery</Text>
                    <Text style={styles.sensorValue}>{container.batteryLevel.toFixed(0)}%</Text>
                  </View>
                </View>

                {selectedContainer === container.id && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Humidity:</Text>
                      <Text style={styles.detailValue}>{container.humidity}%</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Update:</Text>
                      <Text style={styles.detailValue}>
                        {container.lastUpdate.toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>
                        {container.location.lat.toFixed(4)}, {container.location.lng.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Recent Alerts ({alerts.length})</Text>
            {alerts.slice(-3).reverse().map((alert) => (
              <View key={alert.id} style={[
                styles.alertCard,
                { borderLeftColor: alert.type === 'critical' ? '#ef4444' : '#10b981' }
              ]}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {alert.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 11,
    color: '#059669',
    flexWrap: 'wrap',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    minWidth: 100,
  },
  alertButton: {
    position: 'relative',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIcon: {
    fontSize: 20,
  },
  alertBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryGridTablet: {
    justifyContent: 'space-around',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardSmall: {
    width: '47%',
    minWidth: 140,
    padding: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 10,
    color: '#9ca3af',
  },
  filterSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  containerSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  containerGrid: {
    gap: 12,
  },
  containerCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  containerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sensorItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  sensorLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  alertsSection: {
    padding: 16,
    paddingTop: 0,
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default FarmerDashboardScreen;