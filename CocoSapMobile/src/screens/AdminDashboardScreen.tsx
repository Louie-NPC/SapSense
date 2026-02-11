import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StatsCards from '../components/StatsCards';

type RootStackParamList = {
  Login: undefined;
  AdminDashboard: undefined;
  FarmerDashboard: undefined;
  Monitoring: undefined;
  Employees: undefined;
  Payroll: undefined;
  Reports: undefined;
  Settings: undefined;
  Notifications: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const AdminDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  // Enhanced employee data with harvest performance - matching web app
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

    Alert.alert(
      'Report Generated',
      `Total Employees: ${reportData.totalEmployees}\nTotal Harvest: ${reportData.totalHarvest.toFixed(1)}L\nTotal Salaries: ₱${reportData.totalSalaries.toLocaleString()}`,
      [{ text: 'OK' }]
    );
  };

  // Summary calculations
  const totalTrees = 12;
  const totalHarvest = harvestData.reduce((sum, f) => sum + f.monthlyHarvest, 0);
  const totalSalaries = harvestData.reduce((sum, f) => sum + calculateSalary(f), 0);
  const avgQuality = harvestData.reduce((sum, f) => sum + f.qualityRating, 0) / harvestData.length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>🥥 SapSense Admin</Text>
            <Text style={styles.headerSubtitle}>Farm Management System</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
          <Text style={styles.welcomeSubtext}>Manage your coconut sap farm operations</Text>
        </View>

        {/* Stats Cards */}
        <StatsCards
          totalTrees={totalTrees}
          activeEmployees={harvestData.length}
          totalHarvest={totalHarvest}
          totalSalaries={totalSalaries}
        />

        {/* Performance Summary */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Average Quality Rating</Text>
            <Text style={styles.performanceValue}>{avgQuality.toFixed(1)}/5.0</Text>
            <Text style={styles.performanceSubtext}>Excellent quality standards</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('Monitoring')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View Monitoring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={generateReport}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Generate Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.menuGrid}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Employees')}
            >
              <Text style={styles.menuIcon}>👥</Text>
              <Text style={styles.menuItemText}>Employees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Payroll')}
            >
              <Text style={styles.menuIcon}>💰</Text>
              <Text style={styles.menuItemText}>Payroll</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Reports')}
            >
              <Text style={styles.menuIcon}>📈</Text>
              <Text style={styles.menuItemText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    fontSize: 12,
    color: '#6b7280',
    flexWrap: 'wrap',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  performanceSection: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  performanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  performanceSubtext: {
    fontSize: 12,
    color: '#10b981',
  },
  quickActionsSection: {
    padding: 16,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#059669',
  },
  secondaryAction: {
    backgroundColor: '#3b82f6',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  menuSection: {
    padding: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen; 