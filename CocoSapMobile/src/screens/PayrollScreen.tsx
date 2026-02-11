import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

const PayrollScreen = () => {
  const navigation = useNavigation();

  // Same harvest data as AdminDashboard
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

  const processPayroll = () => {
    const totalPayroll = harvestData.reduce((sum, f) => sum + calculateSalary(f), 0);
    Alert.alert(
      'Payroll Processed',
      `Total payroll of ₱${totalPayroll.toLocaleString()} has been processed for ${harvestData.length} employees.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payroll Management</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Monthly Payroll Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Employees</Text>
            <Text style={styles.summaryValue}>{harvestData.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Payroll</Text>
            <Text style={styles.summaryValue}>
              ₱{harvestData.reduce((sum, f) => sum + calculateSalary(f), 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.employeeSection}>
          <Text style={styles.sectionTitle}>Employee Salaries</Text>
          {harvestData.map((farmer) => (
            <View key={farmer.farmerId} style={styles.employeeCard}>
              <View style={styles.employeeHeader}>
                <Text style={styles.employeeName}>{farmer.farmerName}</Text>
                <Text style={styles.employeeSalary}>₱{calculateSalary(farmer).toLocaleString()}</Text>
              </View>
              <View style={styles.employeeDetails}>
                <Text style={styles.detailText}>Harvest: {farmer.monthlyHarvest}L</Text>
                <Text style={styles.detailText}>Quality: {farmer.qualityRating}/5.0</Text>
                <Text style={styles.detailText}>Base Rate: ₱{farmer.baseRate}/L</Text>
                <Text style={styles.detailText}>Bonus Rate: ₱{farmer.bonusRate}/L</Text>
              </View>
              <View style={styles.salaryBreakdown}>
                <Text style={styles.breakdownText}>
                  Base Pay: ₱{(farmer.monthlyHarvest * farmer.baseRate).toLocaleString()}
                </Text>
                <Text style={styles.breakdownText}>
                  Quality Bonus: ₱{(farmer.monthlyHarvest * farmer.bonusRate * (farmer.qualityRating / 5)).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.processButton} onPress={processPayroll}>
            <Text style={styles.processButtonText}>Process Payroll</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  summarySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  employeeSection: {
    padding: 16,
  },
  employeeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  employeeSalary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  employeeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  salaryBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  actionSection: {
    padding: 16,
  },
  processButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PayrollScreen;
