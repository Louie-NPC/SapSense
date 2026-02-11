// Database Initialization Component
// Admin tool to initialize Firestore with seed data

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Users,
  Banknote,
  Calendar,
  Bell,
  Settings,
  TreePine
} from 'lucide-react';
import { initializeFirestoreData, checkIfDataExists, createAuthUsers } from '@/config/firestore-init';

const DatabaseInit: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [dataExists, setDataExists] = useState<boolean | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [authResults, setAuthResults] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    const exists = await checkIfDataExists();
    setDataExists(exists);
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setProgress(10);
    setResult(null);
    setAuthResults([]);

    try {
      // Initialize Firestore data
      setProgress(30);
      const firestoreResult = await initializeFirestoreData();
      setProgress(70);

      // Create auth users
      const authResult = await createAuthUsers();
      setAuthResults(authResult.results);
      setProgress(100);

      setResult(firestoreResult);
      await checkData();
    } catch (error) {
      setResult({ success: false, message: `Error: ${error}` });
    } finally {
      setIsInitializing(false);
    }
  };

  const collections = [
    { name: 'Users', icon: Users, description: 'Admin and farmer accounts' },
    { name: 'Employees', icon: Users, description: 'Employee/farmer details' },
    { name: 'Payroll', icon: Banknote, description: 'Payroll records' },
    { name: 'Pay Periods', icon: Calendar, description: 'Pay period management' },
    { name: 'Bonus/Deductions', icon: Banknote, description: 'Bonuses and deductions' },
    { name: 'Notifications', icon: Bell, description: 'Alerts and notifications' },
    { name: 'Disputes', icon: AlertTriangle, description: 'Quality disputes' },
    { name: 'Tree Containers', icon: TreePine, description: 'Sensor data' },
    { name: 'Settings', icon: Settings, description: 'System configuration' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Database className="h-6 w-6 mr-2 text-green-600" />
              Firebase Database Initialization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold">Database Status</h3>
                <p className="text-sm text-gray-600">
                  {dataExists === null 
                    ? 'Checking...' 
                    : dataExists 
                      ? 'Data already exists in Firestore' 
                      : 'Database is empty - ready for initialization'}
                </p>
              </div>
              <Badge className={dataExists ? 'bg-green-500' : 'bg-yellow-500'}>
                {dataExists === null ? 'Checking' : dataExists ? 'Initialized' : 'Empty'}
              </Badge>
            </div>

            {/* Collections to be created */}
            <div>
              <h3 className="font-semibold mb-3">Collections to be created:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {collections.map((col) => (
                  <div key={col.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <col.icon className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{col.name}</p>
                      <p className="text-xs text-gray-500">{col.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isInitializing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Initializing database...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Result */}
            {result && (
              <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>{result.success ? 'Success!' : 'Error'}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            {/* Auth Results */}
            {authResults.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Authentication Users:</h4>
                <div className="space-y-1 text-sm">
                  {authResults.map((msg, index) => (
                    <p key={index}>{msg}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Accounts Info */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Demo Accounts (after initialization):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                <div><strong>Admin:</strong> admin@sapsense.com / admin123</div>
                <div><strong>Farmer 1:</strong> juan@sapsense.com / farmer123</div>
                <div><strong>Farmer 2:</strong> maria@sapsense.com / farmer123</div>
                <div><strong>Farmer 3:</strong> pedro@sapsense.com / farmer123</div>
                <div><strong>Farmer 4:</strong> ana@sapsense.com / farmer123</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleInitialize}
                disabled={isInitializing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Initialize Database
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={checkData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Enable Firestore in Firebase Console</h4>
              <p className="text-sm text-gray-600">
                Go to Firebase Console → Build → Firestore Database → Create Database
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Enable Authentication</h4>
              <p className="text-sm text-gray-600">
                Go to Firebase Console → Build → Authentication → Get Started → Enable Email/Password
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Set Firestore Rules (for development)</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">4. Click Initialize Database</h4>
              <p className="text-sm text-gray-600">
                This will create all collections with sample data and authentication users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseInit;
