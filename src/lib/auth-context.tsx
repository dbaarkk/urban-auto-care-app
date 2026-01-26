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
  preferredDateTime: string;
  vehicleType: string;
  vehicleNumber?: string;
  address: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
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
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setBookings(data.map(b => ({
            id: b.id,
            userId: b.user_id,
            serviceName: b.service_name,
            bookingDate: b.booking_date,
            preferredDateTime: b.preferred_date_time || b.booking_date,
            vehicleType: b.vehicle_type || 'Unknown',
            vehicleNumber: b.vehicle_number,
            address: b.address || '',
            notes: b.notes,
            status: b.status || 'Pending',
            totalAmount: b.total_amount,
            createdAt: b.created_at
          })));
        }
      } catch (error) {
        console.error('Error refreshing bookings:', error);
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
    }, [user?.id]); // Use user.id to avoid unnecessary refreshes

    const signup = async (name: string, email: string, phone: string, password: string) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response from signup API:', text);
          throw new Error(text || `Server error (Status: ${response.status})`);
        }

        if (!response.ok) throw new Error(result.error || 'Signup failed');

        if (result.user) {
          setUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone
          });
        }

        login(email, password).catch(err => console.error('Background login error:', err));
        
        return { success: true };
      } catch (error: any) {
        console.error('Signup error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred' };
      }
    };

    const login = async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
    
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', email)
              .maybeSingle();
            
            if (profileError || !profileData) throw new Error('Account not fully set up. Please try signing up again.');
            
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
    
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || 'User',
          email: data.user.email || email,
          phone: data.user.user_metadata?.phone || ''
        });

        fetchProfile(data.user.id).then(profile => {
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.full_name,
              email: profile.email,
              phone: profile.phone
            });
          }
        });
    
        return { success: true };
      } catch (error: any) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'Invalid credentials' };
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
      // Create a date object from preferredDateTime to ensure booking_date is valid
      let bookingDateISO = new Date().toISOString();
      if (bookingData.preferredDateTime) {
        const [d, t] = bookingData.preferredDateTime.split(' ');
        if (d && t) {
          try {
            bookingDateISO = new Date(`${d}T${t}`).toISOString();
          } catch (e) {
            console.warn('Could not parse preferred date time for booking_date:', e);
          }
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            service_name: bookingData.serviceName,
            vehicle_type: bookingData.vehicleType,
            vehicle_number: bookingData.vehicleNumber,
            address: bookingData.address,
            preferred_date_time: bookingData.preferredDateTime,
            booking_date: bookingDateISO,
            notes: bookingData.notes,
            status: 'Pending',
            total_amount: bookingData.totalAmount || 0,
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newBooking: Booking = {
          id: data[0].id,
          userId: data[0].user_id,
          serviceName: data[0].service_name,
          bookingDate: data[0].booking_date,
          preferredDateTime: data[0].preferred_date_time,
          vehicleType: data[0].vehicle_type,
          vehicleNumber: data[0].vehicle_number,
          address: data[0].address,
          notes: data[0].notes,
          status: data[0].status || 'Pending',
          totalAmount: data[0].total_amount,
          createdAt: data[0].created_at
        };
        setBookings(prev => [newBooking, ...prev]);
      } else {
        await refreshBookings();
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Add booking error:', error);
      return { success: false, error: error.message || 'Failed to create booking' };
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
