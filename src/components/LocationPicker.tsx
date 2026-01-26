'use client';

import { useEffect, useRef, useState } from 'react';
import { mappls, mappls_plugin } from 'mappls-web-maps';
import { Button } from './ui/button';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import { Input } from './ui/input';

interface LocationPickerProps {
  onSelect: (address: string, coords: { lat: number; lng: number }) => void;
  onClose: () => void;
  initialCoords?: { lat: number; lng: number };
  initialAddress?: string;
}

const MAPPLS_TOKEN = 'gptxrebbfjeohukcnuzrhdjduowmjuniwzme';

export default function LocationPicker({ onSelect, onClose, initialCoords, initialAddress }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState(initialAddress || '');
  const [coords, setCoords] = useState(initialCoords || { lat: 28.6139, lng: 77.2090 });
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapplsObj = new mappls();

    mapplsObj.initialize(MAPPLS_TOKEN, { map: true, layer: 'vector', version: '3.0' }, () => {
      const map = mapplsObj.Map({
        id: 'mappls-map',
        properties: {
          center: [coords.lng, coords.lat],
          zoom: 15,
          zoomControl: true,
          location: true,
        }
      });

      mapInstanceRef.current = map;

      map.on('load', () => {
        setIsMapLoaded(true);
        
        // Add Marker
        const marker = new mapplsObj.Marker({
          map: map,
          position: { lat: coords.lat, lng: coords.lng },
          draggable: true
        });
        markerRef.current = marker;

        marker.on('dragend', (e: any) => {
          const newPos = e.target.getLngLat();
          const newCoords = { lat: newPos.lat, lng: newPos.lng };
          setCoords(newCoords);
          reverseGeocode(newCoords);
        });

        map.on('click', (e: any) => {
          const newCoords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
          marker.setLngLat(e.lngLat);
          setCoords(newCoords);
          reverseGeocode(newCoords);
        });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const reverseGeocode = async (c: { lat: number; lng: number }) => {
    try {
      const response = await fetch(`https://apis.mappls.com/advancedmaps/v1/${MAPPLS_TOKEN}/rev_geocode?lat=${c.lat}&lng=${c.lng}`);
      const data = await response.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      // Using Atlas Geocode API with the static token
      const response = await fetch(`https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(searchQuery)}&itemCount=1`, {
        headers: {
          'Authorization': `Bearer ${MAPPLS_TOKEN}`
        }
      });
      
      const data = await response.json();
      if (data.copResults) {
        const result = data.copResults;
        const newCoords = { lat: parseFloat(result.latitude), lng: parseFloat(result.longitude) };
        setCoords(newCoords);
        setAddress(result.formattedAddress);
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter([newCoords.lng, newCoords.lat]);
          markerRef.current.setLngLat([newCoords.lng, newCoords.lat]);
        }
      } else if (data.results && data.results[0]) {
        const result = data.results[0];
        const newCoords = { lat: parseFloat(result.lat), lng: parseFloat(result.lng) };
        setCoords(newCoords);
        setAddress(result.formatted_address);
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter([newCoords.lng, newCoords.lat]);
          markerRef.current.setLngLat([newCoords.lng, newCoords.lat]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 flex items-center gap-3 bg-zinc-900 border-b border-zinc-800">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400">
          <X className="w-6 h-6" />
        </Button>
        <div className="flex-1 relative">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location..."
            className="bg-zinc-800 border-zinc-700 text-white pl-10 h-11"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <div id="mappls-map" ref={mapRef} className="w-full h-full" />
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-900 border-t border-zinc-800 pb-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-1">
            <MapPin className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm">Selected Location</h3>
            <p className="text-zinc-400 text-sm line-clamp-2 mt-1">
              {address || 'Move marker or search to select location'}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => address && onSelect(address, coords)}
          disabled={!address}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 font-semibold text-lg"
        >
          Use this location
        </Button>
      </div>
    </div>
  );
}
