import React, { useState } from 'react';
import { Search, Calendar, User, ChevronDown, Bell, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';
import CompanySelector from './CompanySelector';
import CountrySelector from './CountrySelector';
import BranchSelector from './BranchSelector';

const TopBar: React.FC = () => {
  const { 
    userContext, 
    businessDate, 
    setBusinessDate,
    rightRailOpen,
    setRightRailOpen 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search
    console.log('Searching for:', searchQuery);
  };

  const handleDateChange = (date: string) => {
    setBusinessDate(date);
    setShowDatePicker(false);
    // TODO: Validate business date and show confirmation if back-dating
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">🍺</div>
            <span className="text-xl font-semibold text-primary-600">BrewERP</span>
          </div>
          
          {/* Global Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, batches, orders..."
              className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Center Section - Quick Actions */}
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost">
            <Bell className="w-4 h-4" />
          </button>
          <button className="btn btn-ghost">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          {/* Context Selectors */}
          <div className="flex items-center gap-3">
            <CompanySelector />
            <CountrySelector />
            <BranchSelector />
          </div>

          {/* Business Date */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(businessDate), 'MMM dd, yyyy')}</span>
            </button>
            
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Date
                  </label>
                  <input
                    type="date"
                    value={businessDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="btn btn-secondary text-xs px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                    className="btn btn-primary text-xs px-3 py-1"
                  >
                    Today
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Currency Display */}
          {userContext?.currencyCode && (
            <div className="text-sm text-primary-600 font-medium">
              {userContext.currencyCode}
            </div>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {userContext?.tenantName?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="font-medium text-gray-900">John Doe</div>
                  <div className="text-sm text-gray-500">Production Manager</div>
                  {userContext && (
                    <>
                      <div className="text-xs text-gray-400 mt-1">
                        {userContext.tenantName}
                      </div>
                      {userContext.branchName && (
                        <div className="text-xs text-gray-400">
                          {userContext.branchName}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Preferences
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Help & Support
                  </button>
                  <hr className="my-1" />
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Rail Toggle */}
          <button
            onClick={() => setRightRailOpen(!rightRailOpen)}
            className={`btn btn-ghost ${rightRailOpen ? 'bg-gray-100' : ''}`}
          >
            📝
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
