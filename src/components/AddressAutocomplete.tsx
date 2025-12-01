import React, { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const initAutocomplete = async () => {
      if (!inputRef.current) return;

      try {
        // @ts-expect-error - Google Maps API
        const { Autocomplete } = await google.maps.importLibrary("places");
        
        autocompleteRef.current = new Autocomplete(inputRef.current, {
          fields: ['formatted_address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            // Update local state to keep input value visible
            setLocalValue(place.formatted_address);
            // Update parent component
            onChange(place.formatted_address);
          }
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    initAutocomplete();
  }, [onChange]);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className="flex h-20 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        color: '#000000',
        WebkitTextFillColor: '#000000'
      }}
    />
  );
}