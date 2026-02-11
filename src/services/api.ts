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

export default {
  auth: authApi,
  users: usersApi,
  employees: employeesApi,
  healthCheck,
};
