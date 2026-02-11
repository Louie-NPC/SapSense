import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi, employeesApi, RegisterData, UserData } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer';
  assignedTrees?: string[]; // For farmers
  location?: string; // For farmers
  phone?: string;
}

interface RegisterUserData {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'farmer';
  phone?: string;
  assignedTrees?: string[];
  location?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: RegisterUserData) => Promise<{ success: boolean; userId?: string; error?: string }>;
  updateUser: (userId: string, userData: Partial<RegisterUserData>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  getAllUsers: () => Promise<UserData[]>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session and verify token
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Verify token with backend
          const response = await authApi.verify();
          const userData: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
            phone: response.user.phone,
            ...(response.user.role === 'farmer' && {
              assignedTrees: response.user.assigned_trees,
              location: response.user.location
            })
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      // Store token
      localStorage.setItem('token', response.token);
      
      // Get additional user info from employees table if farmer
      let assignedTrees: string[] = [];
      let location: string | undefined;
      
      if (response.user.role === 'farmer') {
        try {
          const employees = await employeesApi.getAll();
          const employee = employees.find(e => e.user_id === response.user.id || e.email === response.user.email);
          if (employee) {
            assignedTrees = employee.assigned_trees || [];
            location = employee.location;
          }
        } catch (err) {
          console.error('Error fetching employee data:', err);
        }
      }
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        phone: response.user.phone,
        ...(response.user.role === 'farmer' && {
          assignedTrees,
          location
        })
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Register a new user via backend API
  const registerUser = async (userData: RegisterUserData): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const registerData: RegisterData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
      };
      
      const response = await authApi.register(registerData);
      return { success: true, userId: response.id };
    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Update an existing user via backend API
  const updateUser = async (userId: string, userData: Partial<RegisterUserData>): Promise<boolean> => {
    try {
      await usersApi.update(userId, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // Delete a user via backend API
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await usersApi.delete(userId);
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  // Get all users from backend API
  const getAllUsers = async (): Promise<UserData[]> => {
    try {
      return await usersApi.getAll();
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser, updateUser, deleteUser, getAllUsers, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
