import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

interface AddressMapProps {
  address: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

export function AddressMap({ address }: AddressMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !address) return;

    // Geocode the address to get lat/lng
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const position = {
          lat: location.lat(),
          lng: location.lng(),
        };
        setCenter(position);
        setMarkerPosition(position);
        setGeocodeError(null);
      } else {
        console.error('Geocode failed:', status);
        setGeocodeError('Unable to find location on map');
      }
    });
  }, [address, isLoaded]);

  if (loadError) {
    return (
      <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-600">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    );
  }

  if (geocodeError) {
    return (
      <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">{geocodeError}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  );
}