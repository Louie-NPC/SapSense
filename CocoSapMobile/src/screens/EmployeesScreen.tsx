import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EmployeesScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employees</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Employee Management</Text>
        <Text style={styles.subtitle}>Manage farm workers and assignments</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            👥 Employee management coming soon...
          </Text>
          <Text style={styles.description}>
            This screen will allow you to:
          </Text>
          <Text style={styles.listItem}>• View all farm employees</Text>
          <Text style={styles.listItem}>• Assign workers to specific trees</Text>
          <Text style={styles.listItem}>• Track work schedules</Text>
          <Text style={styles.listItem}>• Monitor productivity</Text>
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

export default EmployeesScreen;
