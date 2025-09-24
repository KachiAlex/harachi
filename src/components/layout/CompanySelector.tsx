import React, { useState } from 'react';
import { ChevronDown, Building, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const CompanySelector: React.FC = () => {
  const { 
    userContext, 
    availableCompanies, 
    switchTenant, 
    loading 
  } = useAppStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = availableCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCompany = async (companyId: string) => {
    await switchTenant(companyId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const currentCompany = availableCompanies.find(c => c.id === userContext?.tenantId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Building className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">
          {currentCompany?.name || 'Select Company'}
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
              <h3 className="text-sm font-medium text-gray-900 mb-2">Select Company</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No companies found
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                      company.id === userContext?.tenantId ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-xs text-gray-500">
                          {company.subscriptionTier} • {company.slug}
                        </div>
                      </div>
                      {company.id === userContext?.tenantId && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        </div>
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

export default CompanySelector;
