'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceName: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed';
  totalAmount?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  bookings: Booking[];
  refreshBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  const refreshBookings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data.map(b => ({
        id: b.id,
        userId: b.user_id,
        serviceName: b.service_name,
        bookingDate: b.booking_date,
        status: b.status,
        totalAmount: b.total_amount,
        createdAt: b.created_at
      })));
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            phone: profile.phone
          });
        }
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            phone: profile.phone
          });
        }
      } else {
        setUser(null);
        setBookings([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshBookings();
    }
  }, [user]);

    const signup = async (name: string, email: string, phone: string, password: string) => {
      try {
        // Call the custom API route to create user with auto-confirmation
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Signup failed');

        // After successful creation and auto-confirmation, log the user in to establish session
        const loginResult = await login(email, password);
        if (!loginResult.success) throw new Error(loginResult.error || 'Login after signup failed');

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    };

  
    const login = async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
        if (error) {
          // If email is not confirmed but password is correct, Supabase returns this error
          // We bypass this to allow instant login as requested
          if (error.message.toLowerCase().includes('email not confirmed')) {
            // We need the user ID to fetch the profile. 
            // We can't get it from signInWithPassword if it fails.
            // But we can try to fetch the profile by email since RLS is disabled.
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', email)
              .single();
            
            if (profileError || !profileData) throw new Error('Email not confirmed and profile not found');
            
            setUser({
              id: profileData.id,
              name: profileData.full_name,
              email: profileData.email,
              phone: profileData.phone
            });
            return { success: true };
          }
          throw error;
        }

        if (!data.user) throw new Error('Login failed');
  
        const profile = await fetchProfile(data.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            phone: profile.phone
          });
        }
  
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookings([]);
  };

  const addBooking = async (bookingData: any) => {
    if (!user) return { success: false, error: 'Not logged in' };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            service_name: bookingData.serviceName,
            booking_date: bookingData.bookingDate,
            total_amount: bookingData.totalAmount,
          }
        ])
        .select();

      if (error) throw error;
      await refreshBookings();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      await refreshBookings();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      bookings, 
      refreshBookings,
      addBooking, 
      cancelBooking 
    }}>
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
