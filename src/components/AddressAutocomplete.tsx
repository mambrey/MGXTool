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
  const isSelectingFromAutocomplete = useRef(false);

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
            isSelectingFromAutocomplete.current = true;
            // Update local state to keep input value visible
            setLocalValue(place.formatted_address);
            // Update parent component
            onChange(place.formatted_address);
            // Reset flag after a short delay
            setTimeout(() => {
              isSelectingFromAutocomplete.current = false;
            }, 100);
          }
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    initAutocomplete();
  }, []); // Remove onChange from dependencies to prevent re-initialization

  // Sync local value with prop value only if not currently selecting from autocomplete
  useEffect(() => {
    if (!isSelectingFromAutocomplete.current) {
      setLocalValue(value);
      if (inputRef.current && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
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