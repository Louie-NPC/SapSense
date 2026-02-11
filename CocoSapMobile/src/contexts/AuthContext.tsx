import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer';
  assignedTrees?: string[]; // For farmers
  location?: string; // For farmers
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app launch
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Mock users database - matching web app
  const mockUsers = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@gmav.com',
      password: 'admin123',
      role: 'admin' as const
    },
    {
      id: 'farmer-1',
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      password: 'farmer123',
      role: 'farmer' as const,
      assignedTrees: ['container-1', 'container-2', 'container-3'],
      location: 'Block A, Section 1'
    },
    {
      id: 'farmer-2',
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: 'farmer123',
      role: 'farmer' as const,
      assignedTrees: ['container-4', 'container-5', 'container-6'],
      location: 'Block B, Section 2'
    },
    {
      id: 'farmer-3',
      name: 'Pedro Garcia',
      email: 'pedro@example.com',
      password: 'farmer123',
      role: 'farmer' as const,
      assignedTrees: ['container-7', 'container-8', 'container-9'],
      location: 'Block A, Section 3'
    }
  ];

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          ...(foundUser.role === 'farmer' && {
            assignedTrees: foundUser.assignedTrees,
            location: foundUser.location
          })
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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