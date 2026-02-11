// Firebase Database Initialization Script
// This script seeds the Firestore database with initial data

import { 
  doc, 
  setDoc, 
  getDocs, 
  collection,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { COLLECTIONS } from './firestore-collections';

// ==================== INITIAL DATA ====================

const initialUsers = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@sapsense.com',
    password: 'admin123',
    role: 'admin' as const,
    status: 'active' as const,
    phone: '+63 912 000 0001'
  },
  {
    id: 'farmer-1',
    name: 'Juan Dela Cruz',
    email: 'juan@sapsense.com',
    password: 'farmer123',
    role: 'farmer' as const,
    assignedTrees: ['container-1', 'container-2', 'container-3'],
    location: 'Block A, Section 1',
    status: 'active' as const,
    phone: '+63 912 345 6789'
  },
  {
    id: 'farmer-2',
    name: 'Maria Santos',
    email: 'maria@sapsense.com',
    password: 'farmer123',
    role: 'farmer' as const,
    assignedTrees: ['container-4', 'container-5', 'container-6'],
    location: 'Block B, Section 2',
    status: 'active' as const,
    phone: '+63 912 345 6790'
  },
  {
    id: 'farmer-3',
    name: 'Pedro Garcia',
    email: 'pedro@sapsense.com',
    password: 'farmer123',
    role: 'farmer' as const,
    assignedTrees: ['container-7', 'container-8', 'container-9'],
    location: 'Block A, Section 3',
    status: 'active' as const,
    phone: '+63 912 345 6791'
  },
  {
    id: 'farmer-4',
    name: 'Ana Reyes',
    email: 'ana@sapsense.com',
    password: 'farmer123',
    role: 'farmer' as const,
    assignedTrees: ['container-10', 'container-11', 'container-12'],
    location: 'Block C, Section 1',
    status: 'inactive' as const,
    phone: '+63 912 345 6792'
  }
];

const initialEmployees = [
  {
    id: 'farmer-1',
    userId: 'farmer-1',
    name: 'Juan Dela Cruz',
    email: 'juan@sapsense.com',
    phone: '+63 912 345 6789',
    assignedTrees: ['container-1', 'container-2', 'container-3'],
    status: 'active' as const,
    location: 'Block A, Section 1',
    joinDate: '2024-01-15',
    totalHarvest: 182,
    avgQuality: 4.8
  },
  {
    id: 'farmer-2',
    userId: 'farmer-2',
    name: 'Maria Santos',
    email: 'maria@sapsense.com',
    phone: '+63 912 345 6790',
    assignedTrees: ['container-4', 'container-5', 'container-6'],
    status: 'active' as const,
    location: 'Block B, Section 2',
    joinDate: '2024-02-01',
    totalHarvest: 152,
    avgQuality: 4.5
  },
  {
    id: 'farmer-3',
    userId: 'farmer-3',
    name: 'Pedro Garcia',
    email: 'pedro@sapsense.com',
    phone: '+63 912 345 6791',
    assignedTrees: ['container-7', 'container-8', 'container-9'],
    status: 'active' as const,
    location: 'Block A, Section 3',
    joinDate: '2024-01-20',
    totalHarvest: 168,
    avgQuality: 4.2
  },
  {
    id: 'farmer-4',
    userId: 'farmer-4',
    name: 'Ana Reyes',
    email: 'ana@sapsense.com',
    phone: '+63 912 345 6792',
    assignedTrees: ['container-10', 'container-11', 'container-12'],
    status: 'inactive' as const,
    location: 'Block C, Section 1',
    joinDate: '2023-12-10',
    totalHarvest: 95,
    avgQuality: 3.9
  }
];

const initialPayPeriods = [
  {
    id: 'period-1',
    name: 'January 2024 - Week 4',
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    status: 'active' as const,
    totalPayroll: 45250.00,
    employeeCount: 4
  },
  {
    id: 'period-2',
    name: 'January 2024 - Week 3',
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    status: 'closed' as const,
    totalPayroll: 42180.50,
    employeeCount: 4
  },
  {
    id: 'period-3',
    name: 'January 2024 - Week 2',
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    status: 'closed' as const,
    totalPayroll: 38920.00,
    employeeCount: 3
  }
];

const initialPayroll = [
  {
    id: 'payroll-1',
    farmerId: 'farmer-1',
    farmerName: 'Juan Dela Cruz',
    email: 'juan@sapsense.com',
    payPeriod: 'January 2024 - Week 4',
    payPeriodId: 'period-1',
    baseHarvest: 182,
    qualityBonus: 850.00,
    deductions: 150.00,
    grossPay: 5400.00,
    netPay: 6100.00,
    status: 'pending' as const,
    paymentDate: '2024-01-29',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'payroll-2',
    farmerId: 'farmer-2',
    farmerName: 'Maria Santos',
    email: 'maria@sapsense.com',
    payPeriod: 'January 2024 - Week 4',
    payPeriodId: 'period-1',
    baseHarvest: 152.8,
    qualityBonus: 620.00,
    deductions: 0,
    grossPay: 4584.00,
    netPay: 5204.00,
    status: 'processing' as const,
    paymentDate: '2024-01-29',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'payroll-3',
    farmerId: 'farmer-3',
    farmerName: 'Pedro Garcia',
    email: 'pedro@sapsense.com',
    payPeriod: 'January 2024 - Week 4',
    payPeriodId: 'period-1',
    baseHarvest: 168.4,
    qualityBonus: 480.00,
    deductions: 200.00,
    grossPay: 5052.00,
    netPay: 5332.00,
    status: 'paid' as const,
    paymentDate: '2024-01-28',
    paymentMethod: 'Cash'
  },
  {
    id: 'payroll-4',
    farmerId: 'farmer-4',
    farmerName: 'Ana Reyes',
    email: 'ana@sapsense.com',
    payPeriod: 'January 2024 - Week 4',
    payPeriodId: 'period-1',
    baseHarvest: 95,
    qualityBonus: 180.00,
    deductions: 350.00,
    grossPay: 2850.00,
    netPay: 2680.00,
    status: 'on-hold' as const,
    paymentDate: '2024-01-29',
    paymentMethod: 'Bank Transfer'
  }
];

const initialBonusDeductions = [
  {
    id: 'bd-1',
    farmerId: 'farmer-1',
    farmerName: 'Juan Dela Cruz',
    type: 'bonus' as const,
    category: 'Performance',
    amount: 500.00,
    description: 'Exceeded monthly harvest target by 20%',
    date: '2024-01-25',
    status: 'approved' as const
  },
  {
    id: 'bd-2',
    farmerId: 'farmer-1',
    farmerName: 'Juan Dela Cruz',
    type: 'bonus' as const,
    category: 'Quality',
    amount: 350.00,
    description: 'Highest quality rating for the month',
    date: '2024-01-25',
    status: 'approved' as const
  },
  {
    id: 'bd-3',
    farmerId: 'farmer-3',
    farmerName: 'Pedro Garcia',
    type: 'deduction' as const,
    category: 'Equipment',
    amount: 200.00,
    description: 'Equipment damage - collection container',
    date: '2024-01-20',
    status: 'approved' as const
  },
  {
    id: 'bd-4',
    farmerId: 'farmer-4',
    farmerName: 'Ana Reyes',
    type: 'deduction' as const,
    category: 'Absence',
    amount: 350.00,
    description: 'Unexcused absence - 2 days',
    date: '2024-01-18',
    status: 'pending' as const
  },
  {
    id: 'bd-5',
    farmerId: 'farmer-2',
    farmerName: 'Maria Santos',
    type: 'bonus' as const,
    category: 'Attendance',
    amount: 200.00,
    description: 'Perfect attendance for the month',
    date: '2024-01-26',
    status: 'pending' as const
  }
];

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'critical' as const,
    title: 'Critical pH Level Alert',
    message: 'Tree container-5 pH level has dropped to 4.2 - immediate attention required',
    timestamp: new Date('2024-01-15T10:30:00'),
    farmerId: 'farmer-2',
    farmerName: 'Maria Santos',
    treeId: 'container-5',
    status: 'active' as const,
    priority: 'high' as const
  },
  {
    id: 'notif-2',
    type: 'warning' as const,
    title: 'Quality Threshold Warning',
    message: 'Tree container-8 sap quality approaching minimum threshold (3.8/5.0)',
    timestamp: new Date('2024-01-15T09:15:00'),
    farmerId: 'farmer-3',
    farmerName: 'Pedro Garcia',
    treeId: 'container-8',
    status: 'acknowledged' as const,
    priority: 'medium' as const
  },
  {
    id: 'notif-3',
    type: 'info' as const,
    title: 'Harvest Reminder',
    message: 'Tree container-1 is ready for harvest - optimal pH level achieved (5.6)',
    timestamp: new Date('2024-01-15T08:45:00'),
    farmerId: 'farmer-1',
    farmerName: 'Juan Dela Cruz',
    treeId: 'container-1',
    status: 'active' as const,
    priority: 'low' as const
  },
  {
    id: 'notif-4',
    type: 'success' as const,
    title: 'Quality Improvement',
    message: 'Tree container-3 pH levels have stabilized after treatment',
    timestamp: new Date('2024-01-15T07:20:00'),
    farmerId: 'farmer-1',
    farmerName: 'Juan Dela Cruz',
    treeId: 'container-3',
    status: 'resolved' as const,
    priority: 'low' as const
  }
];

const initialDisputes = [
  {
    id: 'dispute-1',
    farmerId: 'farmer-1',
    farmerName: 'Juan Dela Cruz',
    treeId: 'container-1',
    farmPH: 5.4,
    plantPH: 6.8,
    farmVolume: 8.5,
    plantVolume: 8.2,
    farmTimestamp: new Date('2024-01-15T08:30:00'),
    plantTimestamp: new Date('2024-01-15T14:20:00'),
    status: 'pending' as const,
    discrepancy: 1.4
  },
  {
    id: 'dispute-2',
    farmerId: 'farmer-2',
    farmerName: 'Maria Santos',
    treeId: 'container-4',
    farmPH: 5.6,
    plantPH: 5.8,
    farmVolume: 9.1,
    plantVolume: 9.0,
    farmTimestamp: new Date('2024-01-14T09:15:00'),
    plantTimestamp: new Date('2024-01-14T15:45:00'),
    status: 'resolved' as const,
    discrepancy: 0.2
  },
  {
    id: 'dispute-3',
    farmerId: 'farmer-3',
    farmerName: 'Pedro Garcia',
    treeId: 'container-7',
    farmPH: 5.2,
    plantPH: 7.1,
    farmVolume: 7.8,
    plantVolume: 7.5,
    farmTimestamp: new Date('2024-01-13T07:45:00'),
    plantTimestamp: new Date('2024-01-13T13:30:00'),
    status: 'rejected' as const,
    discrepancy: 1.9
  }
];

const initialTreeContainers = [
  { id: 'container-1', name: 'Tree 1', location: 'Block A, Section 1', assignedFarmerId: 'farmer-1', assignedFarmerName: 'Juan Dela Cruz', currentPH: 5.4, currentVolume: 8.5, currentTemperature: 28, status: 'healthy' as const },
  { id: 'container-2', name: 'Tree 2', location: 'Block A, Section 1', assignedFarmerId: 'farmer-1', assignedFarmerName: 'Juan Dela Cruz', currentPH: 5.6, currentVolume: 7.2, currentTemperature: 29, status: 'healthy' as const },
  { id: 'container-3', name: 'Tree 3', location: 'Block A, Section 1', assignedFarmerId: 'farmer-1', assignedFarmerName: 'Juan Dela Cruz', currentPH: 5.3, currentVolume: 9.1, currentTemperature: 27, status: 'healthy' as const },
  { id: 'container-4', name: 'Tree 4', location: 'Block B, Section 2', assignedFarmerId: 'farmer-2', assignedFarmerName: 'Maria Santos', currentPH: 5.8, currentVolume: 6.8, currentTemperature: 30, status: 'healthy' as const },
  { id: 'container-5', name: 'Tree 5', location: 'Block B, Section 2', assignedFarmerId: 'farmer-2', assignedFarmerName: 'Maria Santos', currentPH: 4.2, currentVolume: 5.5, currentTemperature: 32, status: 'critical' as const },
  { id: 'container-6', name: 'Tree 6', location: 'Block B, Section 2', assignedFarmerId: 'farmer-2', assignedFarmerName: 'Maria Santos', currentPH: 5.5, currentVolume: 8.0, currentTemperature: 28, status: 'healthy' as const },
  { id: 'container-7', name: 'Tree 7', location: 'Block A, Section 3', assignedFarmerId: 'farmer-3', assignedFarmerName: 'Pedro Garcia', currentPH: 5.2, currentVolume: 7.8, currentTemperature: 29, status: 'healthy' as const },
  { id: 'container-8', name: 'Tree 8', location: 'Block A, Section 3', assignedFarmerId: 'farmer-3', assignedFarmerName: 'Pedro Garcia', currentPH: 4.9, currentVolume: 6.2, currentTemperature: 31, status: 'warning' as const },
  { id: 'container-9', name: 'Tree 9', location: 'Block A, Section 3', assignedFarmerId: 'farmer-3', assignedFarmerName: 'Pedro Garcia', currentPH: 5.7, currentVolume: 8.8, currentTemperature: 27, status: 'healthy' as const },
  { id: 'container-10', name: 'Tree 10', location: 'Block C, Section 1', assignedFarmerId: 'farmer-4', assignedFarmerName: 'Ana Reyes', currentPH: 5.4, currentVolume: 7.0, currentTemperature: 28, status: 'healthy' as const },
  { id: 'container-11', name: 'Tree 11', location: 'Block C, Section 1', assignedFarmerId: 'farmer-4', assignedFarmerName: 'Ana Reyes', currentPH: 5.5, currentVolume: 6.5, currentTemperature: 29, status: 'healthy' as const },
  { id: 'container-12', name: 'Tree 12', location: 'Block C, Section 1', assignedFarmerId: 'farmer-4', assignedFarmerName: 'Ana Reyes', currentPH: 5.6, currentVolume: 7.5, currentTemperature: 28, status: 'healthy' as const }
];

const initialSettings = {
  phThresholds: {
    optimalMin: 5.0,
    optimalMax: 5.5,
    criticalMin: 4.8,
    criticalMax: 7.2
  },
  volumeAlert: 90,
  temperatureAlert: 35,
  notifications: {
    pushEnabled: true,
    smsEnabled: true,
    emailEnabled: false,
    soundEnabled: true
  },
  autoApproval: {
    enabled: true,
    phTolerance: 0.3,
    volumeTolerance: 0.5
  },
  calibration: {
    phOffset: 0.0,
    lastCalibrated: '2024-01-15',
    nextDue: '2024-02-15'
  }
};

// ==================== INITIALIZATION FUNCTIONS ====================

export const checkIfDataExists = async (): Promise<boolean> => {
  try {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return !usersSnapshot.empty;
  } catch (error) {
    console.error('Error checking data:', error);
    return false;
  }
};

export const initializeFirestoreData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🚀 Starting Firestore initialization...');
    const now = Timestamp.now();

    // Check if data already exists
    const dataExists = await checkIfDataExists();
    if (dataExists) {
      console.log('✅ Data already exists, skipping initialization');
      return { success: true, message: 'Data already exists' };
    }

    const batch = writeBatch(db);

    // 1. Initialize Users (without auth - just Firestore documents)
    console.log('📝 Creating users...');
    for (const user of initialUsers) {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      const { password, ...userData } = user;
      batch.set(userRef, {
        ...userData,
        createdAt: now,
        updatedAt: now
      });
    }

    // 2. Initialize Employees
    console.log('👥 Creating employees...');
    for (const employee of initialEmployees) {
      const empRef = doc(db, COLLECTIONS.EMPLOYEES, employee.id);
      batch.set(empRef, {
        ...employee,
        createdAt: now,
        updatedAt: now
      });
    }

    // 3. Initialize Pay Periods
    console.log('📅 Creating pay periods...');
    for (const period of initialPayPeriods) {
      const periodRef = doc(db, COLLECTIONS.PAY_PERIODS, period.id);
      batch.set(periodRef, {
        ...period,
        createdAt: now,
        updatedAt: now
      });
    }

    // 4. Initialize Payroll
    console.log('💰 Creating payroll records...');
    for (const payroll of initialPayroll) {
      const payrollRef = doc(db, COLLECTIONS.PAYROLL, payroll.id);
      batch.set(payrollRef, {
        ...payroll,
        createdAt: now,
        updatedAt: now
      });
    }

    // 5. Initialize Bonus/Deductions
    console.log('🎁 Creating bonus/deductions...');
    for (const bd of initialBonusDeductions) {
      const bdRef = doc(db, COLLECTIONS.BONUS_DEDUCTIONS, bd.id);
      batch.set(bdRef, {
        ...bd,
        createdAt: now,
        updatedAt: now
      });
    }

    // 6. Initialize Notifications
    console.log('🔔 Creating notifications...');
    for (const notif of initialNotifications) {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notif.id);
      batch.set(notifRef, {
        ...notif,
        createdAt: now,
        updatedAt: now
      });
    }

    // 7. Initialize Disputes
    console.log('⚠️ Creating disputes...');
    for (const dispute of initialDisputes) {
      const disputeRef = doc(db, COLLECTIONS.DISPUTES, dispute.id);
      batch.set(disputeRef, {
        ...dispute,
        createdAt: now,
        updatedAt: now
      });
    }

    // 8. Initialize Tree Containers
    console.log('🌴 Creating tree containers...');
    for (const tree of initialTreeContainers) {
      const treeRef = doc(db, COLLECTIONS.TREE_CONTAINERS, tree.id);
      batch.set(treeRef, {
        ...tree,
        lastReading: now,
        createdAt: now
      });
    }

    // 9. Initialize Settings
    console.log('⚙️ Creating system settings...');
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'system');
    batch.set(settingsRef, {
      ...initialSettings,
      updatedAt: now
    });

    // Commit all changes
    await batch.commit();
    console.log('✅ Firestore initialization complete!');
    
    return { success: true, message: 'Database initialized successfully!' };
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    return { success: false, message: `Error: ${error}` };
  }
};

// Create Firebase Auth users
export const createAuthUsers = async (): Promise<{ success: boolean; message: string; results: string[] }> => {
  const results: string[] = [];
  
  for (const user of initialUsers) {
    try {
      await createUserWithEmailAndPassword(auth, user.email, user.password);
      results.push(`✅ Created auth user: ${user.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        results.push(`⏭️ User already exists: ${user.email}`);
      } else {
        results.push(`❌ Failed to create: ${user.email} - ${error.message}`);
      }
    }
  }
  
  return { success: true, message: 'Auth users processed', results };
};

// Export initial data for reference
export { initialUsers, initialEmployees, initialPayPeriods, initialPayroll, initialSettings };
