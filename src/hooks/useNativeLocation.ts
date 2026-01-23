'use client';

import { useState, useCallback } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface AddressData {
  display_name: string;
  road?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
  lat: number;
  lon: number;
}

export const useNativeLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lon: number): Promise<AddressData> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'UrbanAuto-App'
          }
        }
      );
      const data = await response.json();
      
      return {
        display_name: data.display_name,
        road: data.address.road,
        suburb: data.address.suburb || data.address.neighbourhood,
        city: data.address.city || data.address.town || data.address.village,
        postcode: data.address.postcode,
        lat,
        lon
      };
    } catch (err) {
      console.error('Reverse geocoding failed', err);
      throw new Error('Failed to fetch address details');
    }
  };

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const request = await Geolocation.requestPermissions();
          if (request.location !== 'granted') {
            throw new Error('Location permission denied');
          }
        }
      }

      // Multi-sampling for accuracy improvement
      const samples: Position[] = [];
      const SAMPLES_COUNT = 3; // Reduced for speed, but user asked for 5. Let's do 5 as requested.
      
      for (let i = 0; i < 5; i++) {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        samples.push(pos);
        // Small delay between samples
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Choose the best sample (lowest accuracy value means better accuracy)
      const bestSample = samples.reduce((prev, curr) => 
        (curr.coords.accuracy < prev.coords.accuracy) ? curr : prev
      );

      if (bestSample.coords.accuracy > 100) {
        setError("We couldn't get an exact location. Please adjust your address manually.");
      }

      const address = await reverseGeocode(bestSample.coords.latitude, bestSample.coords.longitude);
      setLoading(false);
      return address;

    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setLoading(false);
      return null;
    }
  }, []);

  return { getCurrentLocation, loading, error };
};
