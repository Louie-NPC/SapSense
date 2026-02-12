// API Service for PostgreSQL Backend Communication

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// ==================== AUTH API ====================

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'farmer';
    phone?: string;
    status?: string;
    assigned_trees?: string[];
    location?: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'farmer';
  phone?: string;
  assigned_trees?: string[];
  location?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: RegisterData): Promise<{ message: string; id: string }> => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verify: async (): Promise<{ user: LoginResponse['user'] }> => {
    return apiRequest('/auth/verify');
  },
};

// ==================== USERS API ====================

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer';
  phone?: string;
  status?: 'active' | 'inactive';
  assigned_trees?: string[];
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export const usersApi = {
  getAll: async (): Promise<UserData[]> => {
    return apiRequest('/users');
  },

  getById: async (id: string): Promise<UserData> => {
    return apiRequest(`/users/${id}`);
  },

  update: async (id: string, data: Partial<UserData>): Promise<{ message: string }> => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== EMPLOYEES API ====================

export interface EmployeeData {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  assigned_trees?: string[];
  status?: 'active' | 'inactive';
  location?: string;
  join_date?: string;
  total_harvest?: number;
  avg_quality?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeData {
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  assigned_trees?: string[];
  location?: string;
  join_date?: string;
  status?: 'active' | 'inactive';
}

export const employeesApi = {
  getAll: async (): Promise<EmployeeData[]> => {
    return apiRequest('/employees');
  },

  getById: async (id: string): Promise<EmployeeData> => {
    return apiRequest(`/employees/${id}`);
  },

  create: async (data: CreateEmployeeData): Promise<{ message: string; id: string }> => {
    return apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<EmployeeData>): Promise<{ message: string }> => {
    return apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  return apiRequest('/health');
};

// ==================== TREES API ====================

export interface TreeData {
  id: string;
  name: string;
  location?: string;
  assigned_farmer_id?: string;
  assigned_farmer_name?: string;
  current_ph?: number;
  current_volume?: number;
  current_temperature?: number;
  status?: 'healthy' | 'warning' | 'critical' | 'optimal' | 'harvest';
  last_reading?: string;
  created_at?: string;
}

export interface CreateTreeData {
  name: string;
  location?: string;
}

export interface SensorReading {
  id: number;
  ph: number;
  volume: number;
  temperature: number;
  humidity?: number;
  battery_level?: number;
  latitude?: number;
  longitude?: number;
  status: string;
  timestamp: string;
}

export const treesApi = {
  getAll: async (): Promise<TreeData[]> => {
    return apiRequest('/trees');
  },

  getById: async (id: string): Promise<TreeData> => {
    return apiRequest(`/trees/${id}`);
  },

  getByFarmer: async (farmerId: string): Promise<TreeData[]> => {
    return apiRequest(`/trees/farmer/${farmerId}`);
  },

  create: async (data: CreateTreeData): Promise<{ message: string; id: string; name: string; sensorTable: string }> => {
    return apiRequest('/trees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<TreeData>): Promise<{ message: string }> => {
    return apiRequest(`/trees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string; deletedTree: string; deletedTable: string }> => {
    return apiRequest(`/trees/${id}`, {
      method: 'DELETE',
    });
  },

  getSensorData: async (id: string, limit?: number): Promise<SensorReading[]> => {
    const url = limit ? `/trees/${id}/sensor-data?limit=${limit}` : `/trees/${id}/sensor-data`;
    return apiRequest(url);
  },

  sendSensorData: async (id: string, data: {
    ph: number;
    volume: number;
    temperature: number;
    humidity?: number;
    battery_level?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<{ message: string; status: string }> => {
    return apiRequest(`/trees/${id}/sensor-data`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Mark tree as harvested - records harvest, updates employee total_harvest, resets volume
  harvestTree: async (id: string, data?: {
    farmer_id?: string;
    farmer_name?: string;
  }): Promise<{
    message: string;
    harvest_id: string;
    volume: number;
    quality: number;
    farmer_id: string;
    farmer_name: string;
  }> => {
    return apiRequest(`/trees/${id}/harvest`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // Get harvest history
  getHarvestHistory: async (farmerId?: string, limit?: number): Promise<HarvestRecord[]> => {
    let url = '/harvest';
    const params = new URLSearchParams();
    if (farmerId) params.append('farmer_id', farmerId);
    if (limit) params.append('limit', limit.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return apiRequest(url);
  },
};

// ==================== HARVEST API ====================

export interface HarvestRecord {
  id: string;
  farmer_id: string;
  farmer_name: string;
  tree_id: string;
  tree_name?: string;
  volume: number;
  ph_level: number;
  quality: number;
  temperature?: number;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Employee performance data from harvest records
export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  assignedTrees: string[];
  totalHarvest: number;
  monthHarvest: number;
  weekHarvest: number;
  todayHarvest: number;
  avgQuality: number;
  harvestCount: number;
}

// Recent harvest activity
export interface RecentHarvest {
  id: string;
  farmerId: string;
  farmerName: string;
  treeId: string;
  treeName: string;
  volume: number;
  phLevel: number;
  quality: number;
  temperature: number;
  timestamp: string;
  status: string;
}

// Harvest performance metrics
export interface HarvestMetrics {
  efficiency: number;
  productivity: number;
  currentVolume: number;
  previousVolume: number;
  volumeGrowth: number;
  avgQuality: number;
  harvestCount: number;
  totalTrees: number;
  activeEmployees: number;
}

export const harvestApi = {
  getAll: async (limit?: number): Promise<HarvestRecord[]> => {
    const url = limit ? `/harvest?limit=${limit}` : '/harvest';
    return apiRequest(url);
  },

  getByFarmer: async (farmerId: string, limit?: number): Promise<HarvestRecord[]> => {
    let url = `/harvest/farmer/${farmerId}`;
    if (limit) url += `?limit=${limit}`;
    return apiRequest(url);
  },

  getSummary: async (): Promise<{
    total_volume: number;
    total_records: number;
    avg_quality: number;
    today_volume: number;
    week_volume: number;
    month_volume: number;
  }> => {
    return apiRequest('/harvest/summary');
  },

  // Get all employees' harvest performance with accurate monthly/weekly data
  getEmployeesPerformance: async (): Promise<EmployeePerformance[]> => {
    return apiRequest('/harvest/employees/performance');
  },

  // Get recent harvest activities
  getRecent: async (limit?: number): Promise<RecentHarvest[]> => {
    const url = limit ? `/harvest/recent?limit=${limit}` : '/harvest/recent';
    return apiRequest(url);
  },

  // Get harvest performance metrics
  getMetrics: async (): Promise<HarvestMetrics> => {
    return apiRequest('/harvest/metrics');
  },

  // Get individual farmer harvest stats
  getFarmerStats: async (farmerId: string): Promise<{
    total_volume: number;
    total_records: number;
    avg_quality: number;
    today_volume: number;
    week_volume: number;
    month_volume: number;
  }> => {
    return apiRequest(`/harvest/farmer/${farmerId}/stats`);
  },
};

// ==================== PAYROLL API ====================

export interface PayrollData {
  id: string;
  farmer_id: string;
  farmer_name: string;
  email?: string;
  pay_period?: string;
  pay_period_id?: string;
  base_harvest: number;
  quality_bonus: number;
  deductions: number;
  gross_pay: number;
  net_pay: number;
  status: 'pending' | 'processing' | 'paid' | 'on-hold';
  payment_date?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePayrollData {
  farmer_id: string;
  farmer_name: string;
  email?: string;
  pay_period?: string;
  pay_period_id?: string;
  base_harvest: number;
  quality_bonus: number;
  deductions: number;
  gross_pay: number;
  net_pay: number;
  payment_method?: string;
}

export const payrollApi = {
  getAll: async (): Promise<PayrollData[]> => {
    return apiRequest('/payroll');
  },

  getById: async (id: string): Promise<PayrollData> => {
    return apiRequest(`/payroll/${id}`);
  },

  getByPeriod: async (periodId: string): Promise<PayrollData[]> => {
    return apiRequest(`/payroll/period/${periodId}`);
  },

  getByFarmer: async (farmerId: string): Promise<PayrollData[]> => {
    return apiRequest(`/payroll/farmer/${farmerId}`);
  },

  create: async (data: CreatePayrollData): Promise<{ message: string; id: string }> => {
    return apiRequest('/payroll', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<PayrollData>): Promise<{ message: string }> => {
    return apiRequest(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: PayrollData['status']): Promise<{ message: string }> => {
    return apiRequest(`/payroll/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== PAY PERIODS API ====================

export interface PayPeriodData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed' | 'processing';
  total_payroll: number;
  employee_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePayPeriodData {
  name: string;
  start_date: string;
  end_date: string;
}

export const payPeriodsApi = {
  getAll: async (): Promise<PayPeriodData[]> => {
    return apiRequest('/pay-periods');
  },

  getActive: async (): Promise<PayPeriodData | null> => {
    return apiRequest('/pay-periods/active');
  },

  create: async (data: CreatePayPeriodData): Promise<{ message: string; id: string }> => {
    return apiRequest('/pay-periods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<PayPeriodData>): Promise<{ message: string }> => {
    return apiRequest(`/pay-periods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ==================== BONUS DEDUCTIONS API ====================

export interface BonusDeductionData {
  id: string;
  farmer_id: string;
  farmer_name: string;
  type: 'bonus' | 'deduction';
  category?: string;
  amount: number;
  description?: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface CreateBonusDeductionData {
  farmer_id: string;
  farmer_name: string;
  type: 'bonus' | 'deduction';
  category?: string;
  amount: number;
  description?: string;
  date?: string;
}

export const bonusDeductionsApi = {
  getAll: async (): Promise<BonusDeductionData[]> => {
    return apiRequest('/bonus-deductions');
  },

  getByFarmer: async (farmerId: string): Promise<BonusDeductionData[]> => {
    return apiRequest(`/bonus-deductions/farmer/${farmerId}`);
  },

  getPending: async (): Promise<BonusDeductionData[]> => {
    return apiRequest('/bonus-deductions/pending');
  },

  create: async (data: CreateBonusDeductionData): Promise<{ message: string; id: string }> => {
    return apiRequest('/bonus-deductions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: BonusDeductionData['status']): Promise<{ message: string }> => {
    return apiRequest(`/bonus-deductions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export default {
  auth: authApi,
  users: usersApi,
  employees: employeesApi,
  trees: treesApi,
  harvest: harvestApi,
  payroll: payrollApi,
  payPeriods: payPeriodsApi,
  bonusDeductions: bonusDeductionsApi,
  healthCheck,
};
