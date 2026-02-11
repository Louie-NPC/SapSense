import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MonitoringScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monitoring</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Coconut Sap Monitoring</Text>
        <Text style={styles.subtitle}>Real-time sensor data and analytics</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🥥 Monitoring dashboard coming soon...
          </Text>
          <Text style={styles.description}>
            This screen will show real-time data from coconut sap collection sensors including:
          </Text>
          <Text style={styles.listItem}>• pH levels</Text>
          <Text style={styles.listItem}>• Temperature readings</Text>
          <Text style={styles.listItem}>• Volume measurements</Text>
          <Text style={styles.listItem}>• Humidity data</Text>
        </View>
      </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  placeholder: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});

export default MonitoringScreen;
