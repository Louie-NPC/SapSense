import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardsProps {
  totalTrees: number;
  activeEmployees: number;
  totalHarvest: number;
  totalSalaries: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalTrees,
  activeEmployees,
  totalHarvest,
  totalSalaries,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.card, styles.greenCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Total Trees</Text>
            <Text style={styles.cardValue}>{totalTrees}</Text>
            <Text style={styles.cardSubtext}>+2 from last month</Text>
          </View>
          <View style={[styles.iconContainer, styles.greenIcon]}>
            <Text style={styles.iconText}>🌴</Text>
          </View>
        </View>

        <View style={[styles.card, styles.blueCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Active Farmers</Text>
            <Text style={styles.cardValue}>{activeEmployees}</Text>
            <Text style={styles.cardSubtext}>All active</Text>
          </View>
          <View style={[styles.iconContainer, styles.blueIcon]}>
            <Text style={styles.iconText}>👥</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.orangeCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Monthly Harvest</Text>
            <Text style={styles.cardValue}>{totalHarvest.toFixed(1)}L</Text>
            <Text style={styles.cardSubtext}>+15% from last month</Text>
          </View>
          <View style={[styles.iconContainer, styles.orangeIcon]}>
            <Text style={styles.iconText}>📈</Text>
          </View>
        </View>

        <View style={[styles.card, styles.purpleCard]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Total Payroll</Text>
            <Text style={styles.cardValue}>₱{totalSalaries.toLocaleString()}</Text>
            <Text style={styles.cardSubtext}>This month</Text>
          </View>
          <View style={[styles.iconContainer, styles.purpleIcon]}>
            <Text style={styles.iconText}>💰</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  greenCard: {
    borderLeftColor: '#10b981',
  },
  blueCard: {
    borderLeftColor: '#3b82f6',
  },
  orangeCard: {
    borderLeftColor: '#f59e0b',
  },
  purpleCard: {
    borderLeftColor: '#8b5cf6',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 10,
    color: '#10b981',
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenIcon: {
    backgroundColor: '#dcfce7',
  },
  blueIcon: {
    backgroundColor: '#dbeafe',
  },
  orangeIcon: {
    backgroundColor: '#fef3c7',
  },
  purpleIcon: {
    backgroundColor: '#ede9fe',
  },
  iconText: {
    fontSize: 16,
  },
});

export default StatsCards;
