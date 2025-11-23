import { useEffect, useRef, useState } from 'react';
import { MapPin, Check } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  error?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  error
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps) {
        initAutocomplete();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=fr`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', initAutocomplete);
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      try {
        if (!inputRef.current || !window.google?.maps?.places) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'fr' },
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['address']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setInputValue(place.formatted_address);
            onChange(place.formatted_address);
            setIsValidated(true);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Google Maps Autocomplete:', error);
        setIsLoading(false);
      }
    };

    loadGoogleMapsScript();
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsValidated(false);
    onChange('');
  };

  return (
    <div>
      <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
        <MapPin className="w-4 h-4 mr-2 text-slate-500" />
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-500' : isValidated ? 'border-green-500' : 'border-slate-300'
          } ${isLoading ? 'bg-slate-100' : 'bg-white'} pr-10`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
        {isValidated && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {!isValidated && inputValue && !error && (
        <p className="mt-1 text-sm text-amber-600">Veuillez sélectionner une adresse dans les suggestions</p>
      )}
      <p className="mt-1 text-xs text-slate-500">Powered by Google</p>
    </div>
  );
}
