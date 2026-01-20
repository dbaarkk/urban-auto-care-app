'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut, ChevronRight, HelpCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isLoading, logout, bookings } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/signup');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.replace('/signup');
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', onClick: () => toast.info('Profile editing coming soon') },
    { icon: HelpCircle, label: 'Contact Urban Auto', href: '/contact' },
    { icon: Info, label: 'About Us', href: '/about' },
  ];

  return (
    <div className="mobile-container bg-gray-50 min-h-screen safe-bottom">
      <header className="bg-primary px-4 pt-4 pb-20 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </header>

      <div className="px-4 -mt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">+91 {user.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{bookings.length}</p>
              <p className="text-xs text-gray-500">Bookings</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'Completed').length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'Pending').length}
              </p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => item.href ? router.push(item.href) : item.onClick?.()}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-gray-900">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-red-50 transition-colors"
        >
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-sm font-medium text-red-600">Logout</span>
        </button>

        <div className="mt-6 text-center">
          <Image
            src="/urban-auto-logo.jpg"
            alt="Urban Auto"
            width={40}
            height={40}
            className="rounded-lg mx-auto mb-2"
          />
          <p className="text-xs text-gray-400">Urban Auto v1.0.0</p>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
