import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const BranchSelector: React.FC = () => {
  const { 
    userContext, 
    availableBranches, 
    switchBranch, 
    loading 
  } = useAppStore();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectBranch = async (branchId: number) => {
    await switchBranch(branchId);
    setIsOpen(false);
  };

  const currentBranch = availableBranches.find(b => b.id === userContext?.branchId);

  // Branch type icons
  const branchTypeIcons: { [key: string]: string } = {
    'BREWERY': '🏭',
    'PACKAGING': '📦',
    'TAPROOM': '🍻',
    'DISTRIBUTION': '🚚',
    'WAREHOUSE': '🏢',
  };

  if (!userContext?.countryId) {
    return null; // Don't show if no country selected
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">
          {currentBranch ? (
            <>
              {branchTypeIcons[currentBranch.branchType] || '🏢'} {currentBranch.name}
            </>
          ) : (
            'Select Branch'
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
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Select Branch</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {availableBranches.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No branches available for this country
                </div>
              ) : (
                availableBranches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch.id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                      branch.id === userContext?.branchId ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {branchTypeIcons[branch.branchType] || '🏢'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{branch.name}</div>
                        <div className="text-xs text-gray-500">
                          {branch.branchType.replace('_', ' ')} • {branch.branchCode}
                        </div>
                        {branch.address?.city && (
                          <div className="text-xs text-gray-400">
                            {branch.address.city}
                          </div>
                        )}
                      </div>
                      {branch.id === userContext?.branchId && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {availableBranches.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button className="text-xs text-primary-600 hover:text-primary-700">
                  + Request access to more branches
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BranchSelector;
