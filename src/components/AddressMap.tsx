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
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!isLoaded || !address) {
      console.log('AddressMap: Not ready to geocode', { isLoaded, address });
      return;
    }

    // Clean up the address - trim whitespace
    const cleanAddress = address.trim();
    if (!cleanAddress) {
      console.log('AddressMap: Empty address after cleaning');
      setGeocodeError('No address provided');
      return;
    }

    console.log('AddressMap: Starting geocode for address:', cleanAddress);
    setIsGeocoding(true);
    setGeocodeError(null);

    // Geocode the address to get lat/lng
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: cleanAddress }, (results, status) => {
      console.log('AddressMap: Geocode response', { status, results });
      setIsGeocoding(false);

      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const position = {
          lat: location.lat(),
          lng: location.lng(),
        };
        console.log('AddressMap: Geocode successful', position);
        setCenter(position);
        setMarkerPosition(position);
        setGeocodeError(null);
      } else {
        console.error('AddressMap: Geocode failed', { status, address: cleanAddress });
        
        // Provide more specific error messages
        let errorMessage = 'Unable to find location on map';
        if (status === 'ZERO_RESULTS') {
          errorMessage = 'Address not found. Please check the address format.';
        } else if (status === 'OVER_QUERY_LIMIT') {
          errorMessage = 'Map service temporarily unavailable. Please try again later.';
        } else if (status === 'REQUEST_DENIED') {
          errorMessage = 'Map service access denied. Please check API configuration.';
        } else if (status === 'INVALID_REQUEST') {
          errorMessage = 'Invalid address format.';
        }
        
        setGeocodeError(errorMessage);
      }
    });
  }, [address, isLoaded]);

  if (loadError) {
    console.error('AddressMap: Load error', loadError);
    return (
      <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <p className="text-sm text-red-600 font-medium">Error loading map</p>
          <p className="text-xs text-gray-500 mt-1">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || isGeocoding) {
    return (
      <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (geocodeError) {
    return (
      <div className="w-full h-64 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <p className="text-sm text-gray-600 font-medium">{geocodeError}</p>
          <p className="text-xs text-gray-500 mt-2">Address: {address}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
          >
            Open in Google Maps
          </a>
        </div>
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