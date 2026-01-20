'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  vehicleType: string;
  vehicleNumber: string;
  address: string;
  preferredDateTime: string;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  cancelBooking: (bookingId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'urban_auto_users';
const CURRENT_USER_KEY = 'urban_auto_current_user';
const BOOKINGS_KEY = 'urban_auto_bookings';

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadBookings(parsedUser.id);
    }
    setIsLoading(false);
  }, []);

  const loadBookings = (userId: string) => {
    const allBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    setBookings(allBookings.filter((b: Booking) => b.userId === userId));
  };

  const getUsers = (): Array<User & { passwordHash: string }> => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  };

  const saveUsers = (users: Array<User & { passwordHash: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    const users = getUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: hashPassword(password)
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, error: 'No account found with this email' };
    }

    if (foundUser.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Incorrect password' };
    }

    const { passwordHash, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    loadBookings(userWithoutPassword.id);
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setBookings([]);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!user) return;

    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      userId: user.id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const allBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    allBookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));
    
    setBookings(prev => [...prev, newBooking]);
  };

  const cancelBooking = (bookingId: string) => {
    const allBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const updatedBookings = allBookings.filter((b: Booking) => b.id !== bookingId);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, bookings, addBooking, cancelBooking }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
