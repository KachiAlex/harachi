import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const CountrySelector: React.FC = () => {
  const { 
    userContext, 
    availableCountries, 
    switchCountry, 
    loading 
  } = useAppStore();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectCountry = async (countryId: number) => {
    await switchCountry(countryId);
    setIsOpen(false);
  };

  const currentCountry = availableCountries.find(c => c.id === userContext?.countryId);

  // Country flag emojis mapping
  const countryFlags: { [key: string]: string } = {
    'DE': '🇩🇪',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'NG': '🇳🇬',
    'US': '🇺🇸',
  };

  if (!userContext?.tenantId) {
    return null; // Don't show if no company selected
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">
          {currentCountry ? (
            <>
              {countryFlags[currentCountry.countryCode] || '🌍'} {currentCountry.name}
            </>
          ) : (
            'Select Country'
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Select Country</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {availableCountries.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No countries available
                </div>
              ) : (
                availableCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => handleSelectCountry(country.id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                      country.id === userContext?.countryId ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {countryFlags[country.countryCode] || '🌍'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{country.name}</div>
                        <div className="text-xs text-gray-500">
                          {country.currencyCode} • {country.taxSystem}
                        </div>
                      </div>
                      {country.id === userContext?.countryId && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountrySelector;
