// Firestore Collection Types and References
// This file defines all collection schemas and provides typed references

import { 
  collection, 
  doc, 
  CollectionReference,
  DocumentReference 
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== TYPE DEFINITIONS ====================

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer';
  assignedTrees?: string[];
  location?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDoc {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  assignedTrees: string[];
  status: 'active' | 'inactive';
  location: string;
  joinDate: string;
  totalHarvest: number;
  avgQuality: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollDoc {
  id: string;
  farmerId: string;
  farmerName: string;
  email: string;
  payPeriod: string;
  payPeriodId: string;
  baseHarvest: number;
  qualityBonus: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: 'pending' | 'processing' | 'paid' | 'on-hold';
  paymentDate: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BonusDeductionDoc {
  id: string;
  farmerId: string;
  farmerName: string;
  type: 'bonus' | 'deduction';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface PayPeriodDoc {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'processing';
  totalPayroll: number;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HarvestDoc {
  id: string;
  farmerId: string;
  farmerName: string;
  treeId: string;
  volume: number;
  phLevel: number;
  quality: number;
  temperature: number;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface NotificationDoc {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  farmerId?: string;
  farmerName?: string;
  treeId?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeDoc {
  id: string;
  farmerId: string;
  farmerName: string;
  treeId: string;
  farmPH: number;
  plantPH: number;
  farmVolume: number;
  plantVolume: number;
  farmTimestamp: Date;
  plantTimestamp: Date;
  status: 'pending' | 'resolved' | 'rejected';
  discrepancy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettingsDoc {
  phThresholds: {
    optimalMin: number;
    optimalMax: number;
    criticalMin: number;
    criticalMax: number;
  };
  volumeAlert: number;
  temperatureAlert: number;
  notifications: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    soundEnabled: boolean;
  };
  autoApproval: {
    enabled: boolean;
    phTolerance: number;
    volumeTolerance: number;
  };
  calibration: {
    phOffset: number;
    lastCalibrated: string;
    nextDue: string;
  };
  updatedAt: Date;
}

export interface TreeContainerDoc {
  id: string;
  name: string;
  location: string;
  assignedFarmerId?: string;
  assignedFarmerName?: string;
  currentPH: number;
  currentVolume: number;
  currentTemperature: number;
  status: 'healthy' | 'warning' | 'critical';
  lastReading: Date;
  createdAt: Date;
}

// ==================== COLLECTION REFERENCES ====================

export const usersCollection = collection(db, 'users') as CollectionReference<UserDoc>;
export const employeesCollection = collection(db, 'employees') as CollectionReference<EmployeeDoc>;
export const payrollCollection = collection(db, 'payroll') as CollectionReference<PayrollDoc>;
export const bonusDeductionsCollection = collection(db, 'bonusDeductions') as CollectionReference<BonusDeductionDoc>;
export const payPeriodsCollection = collection(db, 'payPeriods') as CollectionReference<PayPeriodDoc>;
export const harvestCollection = collection(db, 'harvest') as CollectionReference<HarvestDoc>;
export const notificationsCollection = collection(db, 'notifications') as CollectionReference<NotificationDoc>;
export const disputesCollection = collection(db, 'disputes') as CollectionReference<DisputeDoc>;
export const treeContainersCollection = collection(db, 'treeContainers') as CollectionReference<TreeContainerDoc>;

// Settings document reference
export const systemSettingsDoc = doc(db, 'settings', 'system') as DocumentReference<SystemSettingsDoc>;

// ==================== COLLECTION NAMES ====================

export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  PAYROLL: 'payroll',
  BONUS_DEDUCTIONS: 'bonusDeductions',
  PAY_PERIODS: 'payPeriods',
  HARVEST: 'harvest',
  NOTIFICATIONS: 'notifications',
  DISPUTES: 'disputes',
  TREE_CONTAINERS: 'treeContainers',
  SETTINGS: 'settings'
} as const;
