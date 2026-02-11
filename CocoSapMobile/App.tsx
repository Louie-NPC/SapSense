import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import FarmerDashboardScreen from './src/screens/FarmerDashboardScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NotFoundScreen from './src/screens/NotFoundScreen';
import MonitoringScreen from './src/screens/MonitoringScreen';
import EmployeesScreen from './src/screens/EmployeesScreen';
import PayrollScreen from './src/screens/PayrollScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// Main Navigator component that handles authentication state
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could add a loading screen here
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={user ? (user.role === 'admin' ? 'AdminDashboard' : 'FarmerDashboard') : 'Login'}
    >
      {user ? (
        // User is authenticated
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />
          <Stack.Screen name="Monitoring" component={MonitoringScreen} />
          <Stack.Screen name="Employees" component={EmployeesScreen} />
          <Stack.Screen name="Payroll" component={PayrollScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="NotFound" component={NotFoundScreen} />
        </>
      ) : (
        // User is not authenticated
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App; 