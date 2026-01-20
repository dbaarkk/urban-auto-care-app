"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  address: string;
  vehicleType: string;
  vehicleNumber: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: "Pending" | "Confirmed" | "Completed";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "userId" | "createdAt" | "status">) => void;
  cancelBooking: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("urban_auto_user");
    const storedBookings = localStorage.getItem("urban_auto_bookings");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, phone: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("urban_auto_users") || "[]");
    const existingUser = users.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    const newUser: User & { passwordHash: string } = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: hashPassword(password),
    };

    users.push(newUser);
    localStorage.setItem("urban_auto_users", JSON.stringify(users));

    const { passwordHash, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("urban_auto_user", JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("urban_auto_users") || "[]");
    const foundUser = users.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, error: "No account found with this email" };
    }

    if (foundUser.passwordHash !== hashPassword(password)) {
      return { success: false, error: "Incorrect password" };
    }

    const { passwordHash, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem("urban_auto_user", JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("urban_auto_user");
  };

  const addBooking = (bookingData: Omit<Booking, "id" | "userId" | "createdAt" | "status">) => {
    if (!user) return;

    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      userId: user.id,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem("urban_auto_bookings", JSON.stringify(updatedBookings));
  };

  const cancelBooking = (id: string) => {
    const updatedBookings = bookings.filter(b => b.id !== id);
    setBookings(updatedBookings);
    localStorage.setItem("urban_auto_bookings", JSON.stringify(updatedBookings));
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
