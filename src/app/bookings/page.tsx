'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Calendar, Clock, MapPin, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function BookingsPage() {
  const { user, isLoading, bookings, cancelBooking } = useAuth();
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const handleCancel = (id: string) => {
    setCancellingId(id);
  };

  const confirmCancel = () => {
    if (cancellingId) {
      cancelBooking(cancellingId);
      toast.success('Booking cancelled');
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings]);

  return (
    <div className="mobile-container bg-gray-50 min-h-screen safe-bottom">
      <header className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Bookings</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {sortedBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No bookings yet</h3>
            <p className="text-sm text-gray-500 mb-4">Book a service to get started</p>
            <button
              onClick={() => router.push('/services')}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{booking.vehicleType}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{booking.preferredDateTime}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{booking.address}</span>
                  </div>
                  {booking.vehicleNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                        {booking.vehicleNumber}
                      </span>
                    </div>
                  )}
                </div>

                {booking.status === 'Pending' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="mt-3 w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {cancellingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Cancel Booking?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
