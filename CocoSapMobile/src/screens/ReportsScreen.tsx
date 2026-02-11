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

interface QualityReport {
  period: string;
  totalHarvest: number;
  acceptedSap: number;
  rejectedSap: number;
  avgPH: number;
  avgQuality: number;
  disputes: number;
}

const ReportsScreen = () => {
  const navigation = useNavigation();

  const [qualityReports] = useState<QualityReport[]>([
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

  const totalHarvest = qualityReports.reduce((sum, r) => sum + r.totalHarvest, 0);
  const totalAccepted = qualityReports.reduce((sum, r) => sum + r.acceptedSap, 0);
  const totalRejected = qualityReports.reduce((sum, r) => sum + r.rejectedSap, 0);
  const totalDisputes = qualityReports.reduce((sum, r) => sum + r.disputes, 0);
  const acceptanceRate = (totalAccepted / totalHarvest) * 100;

  const exportReport = () => {
    const reportData = {
      generatedOn: new Date().toLocaleDateString(),
      summary: {
        totalHarvest: totalHarvest.toFixed(1),
        acceptanceRate: acceptanceRate.toFixed(1),
        totalDisputes,
      },
      weeklyReports: qualityReports
    };
    
    Alert.alert(
      'Report Exported',
      `Quality report exported successfully!\n\nTotal Harvest: ${reportData.summary.totalHarvest}L\nAcceptance Rate: ${reportData.summary.acceptanceRate}%\nDisputes: ${reportData.summary.totalDisputes}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quality Reports</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Harvest</Text>
              <Text style={styles.summaryValue}>{totalHarvest.toFixed(1)}L</Text>
              <Text style={styles.summarySubtext}>Last 3 weeks</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Acceptance Rate</Text>
              <Text style={styles.summaryValue}>{acceptanceRate.toFixed(1)}%</Text>
              <Text style={styles.summarySubtext}>Quality standard</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Disputes</Text>
              <Text style={styles.summaryValue}>{totalDisputes}</Text>
              <Text style={styles.summarySubtext}>Resolved cases</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Rejected Sap</Text>
              <Text style={styles.summaryValue}>{totalRejected.toFixed(1)}L</Text>
              <Text style={styles.summarySubtext}>Quality issues</Text>
            </View>
          </View>
        </View>

        {/* Weekly Reports */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Weekly Quality Reports</Text>
          {qualityReports.map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportPeriod}>{report.period}</Text>
                <View style={styles.acceptanceBadge}>
                  <Text style={styles.acceptanceText}>
                    {((report.acceptedSap / report.totalHarvest) * 100).toFixed(0)}% Acceptance
                  </Text>
                </View>
              </View>
              
              <View style={styles.reportMetrics}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Total Harvest:</Text>
                  <Text style={styles.metricValue}>{report.totalHarvest}L</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Accepted Sap:</Text>
                  <Text style={styles.metricValue}>{report.acceptedSap}L</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Rejected Sap:</Text>
                  <Text style={styles.metricValue}>{report.rejectedSap}L</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Average pH:</Text>
                  <Text style={styles.metricValue}>{report.avgPH}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Quality Rating:</Text>
                  <Text style={styles.metricValue}>{report.avgQuality}/5.0</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Disputes:</Text>
                  <Text style={styles.metricValue}>{report.disputes}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
            <Text style={styles.exportButtonText}>📊 Export Full Report</Text>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    width: '48%',
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
  reportsSection: {
    padding: 16,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  acceptanceBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  acceptanceText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  reportMetrics: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  actionSection: {
    padding: 16,
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportsScreen;
