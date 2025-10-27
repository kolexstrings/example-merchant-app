import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, STORAGE_KEYS, generateUserId, validateEmail, validateName } from '@/lib/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUserJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson);
          setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  // Get all users from localStorage
  const getUsers = (): User[] => {
    try {
      const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users from localStorage:', error);
      return [];
    }
  };

  // Save users to localStorage
  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  };

  // Register a new user
  const register = async (name: string, email: string): Promise<{ success: boolean; message: string }> => {
    // Validate inputs
    if (!validateName(name)) {
      return { success: false, message: 'Name must be at least 2 characters long' };
    }

    if (!validateEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: generateUserId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    // Save user
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Auto-login the new user
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true, message: 'Account created successfully! Welcome!' };
  };

  // Login user
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // For simplicity, we're just checking email existence
    // In a real app, you'd validate password hash
    const users = getUsers();
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return { success: false, message: 'No account found with this email address' };
    }

    // In a real app, you'd verify the password here
    // For this simulation, any email that exists can "login"

    // Set current user
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true, message: 'Login successful! Welcome back!' };
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
