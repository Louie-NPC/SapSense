

// Set mobile-specific base URL
const API_BASE_URL = 'http://192.168.19.187:3001/api';

// Override apiRequest for mobile with AsyncStorage
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  let token = '';
  
  try {
    // Get token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    token = await AsyncStorage.getItem('token') || '';
    
    // Fallback for debugging/demo
    // @ts-ignore
    if (!token && global.authToken) token = global.authToken;
  } catch (e) {
    console.warn('Could not retrieve token:', e);
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `Error ${response.status}: Request failed`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
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
    // Updated to match PostgreSQL naming
    assigned_trees?: string[]; 
    location?: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  verify: async (): Promise<{ user: LoginResponse['user'] }> => {
    return apiRequest('/auth/verify');
  },
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
  current_humidity?: number;
  current_battery_level?: number;
  status?: 'healthy' | 'warning' | 'critical' | 'optimal' | 'harvest';
  last_reading?: string;
  created_at?: string;
  is_disabled?: boolean;
  sleep_mode?: boolean;
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

  // Mark tree as harvested
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

  // Added: Get historical sensor data for charts
  getSensorData: async (id: string, limit?: number): Promise<any[]> => {
    const url = limit ? `/trees/${id}/sensor-data?limit=${limit}` : `/trees/${id}/sensor-data`;
    return apiRequest(url);
  },

  toggleSleepMode: async (id: string, sleepMode: boolean): Promise<{ message: string; sleep_mode: boolean }> => {
    return apiRequest(`/trees/${id}/sleep-mode`, {
      method: 'PUT',
      body: JSON.stringify({ sleep_mode: sleepMode }),
    });
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
  timestamp: string;
}

export const harvestApi = {
  // Get individual farmer harvest stats (Used for the dashboard cards)
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

  // Get harvest history for a farmer
  getByFarmer: async (farmerId: string, limit?: number): Promise<HarvestRecord[]> => {
    let url = `/harvest/farmer/${farmerId}`;
    if (limit) url += `?limit=${limit}`;
    return apiRequest(url);
  },

  // Added: Get recent harvests globally (if needed for activity feed)
  getRecent: async (limit?: number): Promise<HarvestRecord[]> => {
    const url = limit ? `/harvest/recent?limit=${limit}` : '/harvest/recent';
    return apiRequest(url);
  },
};

// ==================== PAYROLL & BONUSES (Optional for Farmer View) ====================

export const payrollApi = {
  getByFarmer: async (farmerId: string) => {
    return apiRequest(`/payroll/farmer/${farmerId}`);
  },
};

export const bonusDeductionsApi = {
  getByFarmer: async (farmerId: string) => {
    return apiRequest(`/bonus-deductions/farmer/${farmerId}`);
  },
};

export default {
  auth: authApi,
  trees: treesApi,
  harvest: harvestApi,
  payroll: payrollApi,
  bonusDeductions: bonusDeductionsApi
};