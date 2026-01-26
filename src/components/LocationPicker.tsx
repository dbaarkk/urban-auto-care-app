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

  const RAIPUR_CENTER = { lat: 21.2514, lng: 81.6296 };
  const RAIPUR_BOUNDS = [
    [81.50, 21.15], // SW [lng, lat]
    [81.75, 21.35]  // NE [lng, lat]
  ];

  export default function LocationPicker({ onSelect, onClose, initialCoords, initialAddress }: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [address, setAddress] = useState(initialAddress || '');
    const [coords, setCoords] = useState(initialCoords || RAIPUR_CENTER);
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
            zoom: 13,
            zoomControl: true,
            location: true,
            // Restrict to Raipur bounds if supported by the version
            maxBounds: RAIPUR_BOUNDS
          }
        });

        mapInstanceRef.current = map;

        map.on('load', () => {
          setIsMapLoaded(true);
          
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
            marker.setLngLat([newCoords.lng, newCoords.lat]);
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
        const response = await fetch(`https://search.mappls.com/search/address/rev-geocode?lat=${c.lat}&lng=${c.lng}&access_token=${MAPPLS_TOKEN}`);
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
        // Append Raipur to query to ensure results are relevant
        const fullQuery = searchQuery.toLowerCase().includes('raipur') 
          ? searchQuery 
          : `${searchQuery} Raipur`;

        const response = await fetch(`https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(fullQuery)}&itemCount=1&access_token=${MAPPLS_TOKEN}`);
        const data = await response.json();
      
      let result = null;
      let newLat = 0;
      let newLng = 0;
      let newAddr = '';

      if (data.copResults) {
        result = Array.isArray(data.copResults) ? data.copResults[0] : data.copResults;
        newLat = parseFloat(result.latitude || result.lat);
        newLng = parseFloat(result.longitude || result.lng);
        newAddr = result.formattedAddress || result.formatted_address;
      } else if (data.results && data.results[0]) {
        result = data.results[0];
        newLat = parseFloat(result.lat || result.latitude);
        newLng = parseFloat(result.lng || result.longitude);
        newAddr = result.formatted_address || result.formattedAddress;
      }

      if (newLat && newLng) {
        const newCoords = { lat: newLat, lng: newLng };
        setCoords(newCoords);
        setAddress(newAddr);
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter([newLng, newLat]); // [lng, lat]
          mapInstanceRef.current.setZoom(15);
          markerRef.current.setLngLat([newLng, newLat]); // [lng, lat]
        }
      } else if (result && result.eLoc) {
        // If only eLoc is returned, we need to fetch details for coordinates
        const detailResponse = await fetch(`https://atlas.mappls.com/api/places/eloc/${result.eLoc}?access_token=${MAPPLS_TOKEN}`);
        const detailData = await detailResponse.json();
        if (detailData.latitude && detailData.longitude) {
          const detailLat = parseFloat(detailData.latitude);
          const detailLng = parseFloat(detailData.longitude);
          const newCoords = { lat: detailLat, lng: detailLng };
          setCoords(newCoords);
          setAddress(newAddr || detailData.formattedAddress);
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter([detailLng, detailLat]);
            mapInstanceRef.current.setZoom(15);
            markerRef.current.setLngLat([detailLng, detailLat]);
          }
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
            placeholder="Search location in India..."
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
