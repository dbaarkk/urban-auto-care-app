'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getServiceById, services } from '@/lib/services-data';
import { ArrowLeft, Calendar, MapPin, Car, FileText, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, Suspense, useRef } from 'react';
import { toast } from 'sonner';

function BookingContent() {
  const { user, isLoading, addBooking } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  
  const [selectedService, setSelectedService] = useState(serviceId || '');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  const service = getServiceById(selectedService);

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

  const vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedService) newErrors.service = 'Please select a service';
    if (!vehicleType) newErrors.vehicleType = 'Please select vehicle type';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!date) newErrors.date = 'Please select a date';
    if (!time) newErrors.time = 'Please select a time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    addBooking({
      serviceId: selectedService,
      serviceName: service?.name || '',
      vehicleType,
      vehicleNumber,
      address,
      preferredDateTime: `${date} ${time}`,
      notes,
    });

    setSubmitting(false);
    toast.success('Booking confirmed!', {
      description: 'We will contact you shortly to confirm your appointment.',
    });
    router.push('/bookings');
  };

  const minDate = new Date().toISOString().split('T')[0];

    const fetchLocation = async () => {
      if (fetchingLocation) return;
      setFetchingLocation(true);
      
      const options = {
        enableHighAccuracy: false, // Faster initial fetch
        timeout: 5000,
        maximumAge: 60000 // Use cached position if available within last minute
      };

      const getAddress = async (latitude: number, longitude: number) => {
        try {
          // BigDataCloud is generally faster for reverse geocoding
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const addressParts = [];
          if (data.locality) addressParts.push(data.locality);
          if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
          if (data.city && data.city !== data.locality) addressParts.push(data.city);
          
          const fullAddress = addressParts.join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(fullAddress);
          toast.success('Location detected');
        } catch {
          // Fallback to Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`,
              { headers: { 'User-Agent': 'UrbanAuto/1.0' } }
            );
            const data = await response.json();
            if (data.display_name) {
              setAddress(data.display_name);
              toast.success('Location detected');
            } else {
              setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        }
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Start reverse geocoding immediately
          getAddress(latitude, longitude);
          setFetchingLocation(false);
          setLocationFetched(true);
        },
        (error) => {
          console.error('Location error:', error);
          setFetchingLocation(false);
          setLocationFetched(true);
          toast.error('Could not fetch location automatically');
        },
        options
      );
    };


  const handleAddressFocus = async () => {
    if (address || fetchingLocation || locationFetched) return;
    
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    // Check permission status using Permissions API
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'denied') {
          // Permission was previously denied - user must reset in browser settings
          toast.error('Location blocked. Reset in browser settings: Site Settings > Location > Allow', {
            duration: 5000
          });
          setLocationFetched(true);
          return;
        }
        
        // Permission is 'prompt' or 'granted' - proceed to request
        fetchLocation();
      } catch {
        // Permissions API failed, try directly
        fetchLocation();
      }
    } else {
      // No Permissions API, try directly
      fetchLocation();
    }
  };

  return (
    <div className="mobile-container bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Book Service</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {service && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3">
              <Image
                src={service.image}
                alt={service.name}
                width={70}
                height={70}
                className="rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{service.subtitle}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {service.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            Select Service
          </h3>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.service ? 'border-red-400' : 'border-gray-200'} bg-gray-50 text-sm outline-none`}
          >
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            Vehicle Details
          </h3>
          
          <label className="text-sm text-gray-600 mb-2 block">Vehicle Type *</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  vehicleType === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.vehicleType && <p className="text-red-500 text-xs mb-3">{errors.vehicleType}</p>}

          <label className="text-sm text-gray-600 mb-1.5 block">Vehicle Number (Optional)</label>
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder="e.g., CG 04 AB 1234"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none"
          />
        </div>

<div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Service Address
              </h3>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={handleAddressFocus}
                placeholder={fetchingLocation ? "Fetching your location..." : "Tap to fetch your location or enter manually"}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-400' : 'border-gray-200'} bg-gray-50 text-sm outline-none resize-none`}
              />
              {fetchingLocation && (
                <p className="text-primary text-xs mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Fetching your location...
                </p>
              )}
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Preferred Date & Time
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                className={`w-full px-4 py-3 rounded-xl border ${errors.date ? 'border-red-400' : 'border-gray-200'} bg-gray-50 text-sm outline-none`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${errors.time ? 'border-red-400' : 'border-gray-200'} bg-gray-50 text-sm outline-none`}
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Additional Notes (Optional)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific requirements or issues with your vehicle..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Confirm Booking
            </>
          )}
        </button>

        <div className="h-20" />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
