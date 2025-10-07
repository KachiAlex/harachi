import React, { useState, useRef, useEffect } from 'react';
import { useBranch } from '../../contexts/BranchContext';
import { Home, ChevronDown, Check, MapPin } from 'lucide-react';

const BranchSelector: React.FC = () => {
  const { selectedBranch, branches, loading, selectBranch } = useBranch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Home className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Home className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">No branches</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Home className="h-4 w-4 text-primary-600" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500">Branch</span>
          <span className="text-sm font-medium text-gray-900">
            {selectedBranch?.name || 'Select Branch'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Select Branch
            </div>
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  selectBranch(branch);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors ${
                  selectedBranch?.id === branch.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Home className={`h-4 w-4 ${
                    selectedBranch?.id === branch.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{branch.name}</span>
                    {branch.address && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {branch.address}
                      </span>
                    )}
                  </div>
                </div>
                {selectedBranch?.id === branch.id && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;

