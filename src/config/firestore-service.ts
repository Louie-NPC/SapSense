// Firestore Service Functions
// CRUD operations for all collections

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestore-collections';
import type { 
  UserDoc, 
  EmployeeDoc, 
  PayrollDoc, 
  BonusDeductionDoc, 
  PayPeriodDoc,
  HarvestDoc,
  NotificationDoc,
  DisputeDoc,
  SystemSettingsDoc,
  TreeContainerDoc
} from './firestore-collections';

// ==================== USERS ====================

export const getUsers = async (): Promise<UserDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDoc));
};

export const getUserById = async (userId: string): Promise<UserDoc | null> => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as UserDoc : null;
};

export const getUserByEmail = async (email: string): Promise<UserDoc | null> => {
  const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserDoc;
};

export const updateUser = async (userId: string, data: Partial<UserDoc>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

// ==================== EMPLOYEES ====================

export const getEmployees = async (): Promise<EmployeeDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeDoc));
};

export const getEmployeeById = async (employeeId: string): Promise<EmployeeDoc | null> => {
  const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as EmployeeDoc : null;
};

export const getActiveEmployees = async (): Promise<EmployeeDoc[]> => {
  const q = query(collection(db, COLLECTIONS.EMPLOYEES), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeDoc));
};

export const addEmployee = async (data: Omit<EmployeeDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.EMPLOYEES), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updateEmployee = async (employeeId: string, data: Partial<EmployeeDoc>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);
  await deleteDoc(docRef);
};

// ==================== PAYROLL ====================

export const getPayrollRecords = async (): Promise<PayrollDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.PAYROLL));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayrollDoc));
};

export const getPayrollByPeriod = async (periodId: string): Promise<PayrollDoc[]> => {
  const q = query(collection(db, COLLECTIONS.PAYROLL), where('payPeriodId', '==', periodId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayrollDoc));
};

export const getPayrollByFarmer = async (farmerId: string): Promise<PayrollDoc[]> => {
  const q = query(collection(db, COLLECTIONS.PAYROLL), where('farmerId', '==', farmerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayrollDoc));
};

export const addPayrollRecord = async (data: Omit<PayrollDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.PAYROLL), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updatePayrollRecord = async (payrollId: string, data: Partial<PayrollDoc>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PAYROLL, payrollId);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

export const updatePayrollStatus = async (payrollId: string, status: PayrollDoc['status']): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PAYROLL, payrollId);
  await updateDoc(docRef, { 
    status, 
    updatedAt: Timestamp.now(),
    ...(status === 'paid' && { paymentDate: new Date().toISOString().split('T')[0] })
  });
};

// ==================== BONUS/DEDUCTIONS ====================

export const getBonusDeductions = async (): Promise<BonusDeductionDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.BONUS_DEDUCTIONS));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BonusDeductionDoc));
};

export const getBonusDeductionsByFarmer = async (farmerId: string): Promise<BonusDeductionDoc[]> => {
  const q = query(collection(db, COLLECTIONS.BONUS_DEDUCTIONS), where('farmerId', '==', farmerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BonusDeductionDoc));
};

export const getPendingBonusDeductions = async (): Promise<BonusDeductionDoc[]> => {
  const q = query(collection(db, COLLECTIONS.BONUS_DEDUCTIONS), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BonusDeductionDoc));
};

export const addBonusDeduction = async (data: Omit<BonusDeductionDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.BONUS_DEDUCTIONS), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updateBonusDeductionStatus = async (id: string, status: BonusDeductionDoc['status']): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BONUS_DEDUCTIONS, id);
  await updateDoc(docRef, { status, updatedAt: Timestamp.now() });
};

// ==================== PAY PERIODS ====================

export const getPayPeriods = async (): Promise<PayPeriodDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.PAY_PERIODS));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayPeriodDoc));
};

export const getActivePayPeriod = async (): Promise<PayPeriodDoc | null> => {
  const q = query(collection(db, COLLECTIONS.PAY_PERIODS), where('status', '==', 'active'), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as PayPeriodDoc;
};

export const addPayPeriod = async (data: Omit<PayPeriodDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.PAY_PERIODS), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updatePayPeriodStatus = async (periodId: string, status: PayPeriodDoc['status']): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PAY_PERIODS, periodId);
  await updateDoc(docRef, { status, updatedAt: Timestamp.now() });
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async (): Promise<NotificationDoc[]> => {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDoc));
};

export const getActiveNotifications = async (): Promise<NotificationDoc[]> => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS), 
    where('status', '==', 'active'),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDoc));
};

export const addNotification = async (data: Omit<NotificationDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updateNotificationStatus = async (notifId: string, status: NotificationDoc['status']): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notifId);
  await updateDoc(docRef, { status, updatedAt: Timestamp.now() });
};

// Subscribe to notifications in real-time
export const subscribeToNotifications = (callback: (notifications: NotificationDoc[]) => void) => {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDoc));
    callback(notifications);
  });
};

// ==================== DISPUTES ====================

export const getDisputes = async (): Promise<DisputeDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.DISPUTES));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisputeDoc));
};

export const getPendingDisputes = async (): Promise<DisputeDoc[]> => {
  const q = query(collection(db, COLLECTIONS.DISPUTES), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisputeDoc));
};

export const addDispute = async (data: Omit<DisputeDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.DISPUTES), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updateDisputeStatus = async (disputeId: string, status: DisputeDoc['status']): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
  await updateDoc(docRef, { status, updatedAt: Timestamp.now() });
};

// ==================== TREE CONTAINERS ====================

export const getTreeContainers = async (): Promise<TreeContainerDoc[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.TREE_CONTAINERS));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TreeContainerDoc));
};

export const getTreesByFarmer = async (farmerId: string): Promise<TreeContainerDoc[]> => {
  const q = query(collection(db, COLLECTIONS.TREE_CONTAINERS), where('assignedFarmerId', '==', farmerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TreeContainerDoc));
};

export const updateTreeContainer = async (treeId: string, data: Partial<TreeContainerDoc>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.TREE_CONTAINERS, treeId);
  await updateDoc(docRef, { ...data, lastReading: Timestamp.now() });
};

// Subscribe to tree containers in real-time
export const subscribeToTreeContainers = (callback: (trees: TreeContainerDoc[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.TREE_CONTAINERS), (snapshot) => {
    const trees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TreeContainerDoc));
    callback(trees);
  });
};

// ==================== SETTINGS ====================

export const getSystemSettings = async (): Promise<SystemSettingsDoc | null> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'system');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as SystemSettingsDoc : null;
};

export const updateSystemSettings = async (data: Partial<SystemSettingsDoc>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'system');
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

// ==================== HARVEST ====================

export const getHarvestRecords = async (): Promise<HarvestDoc[]> => {
  const q = query(collection(db, COLLECTIONS.HARVEST), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestDoc));
};

export const getHarvestByFarmer = async (farmerId: string): Promise<HarvestDoc[]> => {
  const q = query(
    collection(db, COLLECTIONS.HARVEST), 
    where('farmerId', '==', farmerId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestDoc));
};

export const addHarvestRecord = async (data: Omit<HarvestDoc, 'id' | 'createdAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTIONS.HARVEST), {
    ...data,
    createdAt: now
  });
  return docRef.id;
};
