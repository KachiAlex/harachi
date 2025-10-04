import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  MapPin, 
  Users, 
  Settings,
  Check,
  Globe,
  Home,
  UserPlus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Country, Branch } from '../../types';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const SetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { companyCode } = useParams<{ companyCode: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'company-info',
      title: 'Company Information',
      description: 'Set up basic company details',
      icon: <Building2 className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'countries',
      title: 'Countries & Locations',
      description: 'Add countries where you operate',
      icon: <Globe className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'branches',
      title: 'Branches & Offices',
      description: 'Set up your branch locations',
      icon: <Home className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'users',
      title: 'Team Members',
      description: 'Add users and assign roles',
      icon: <UserPlus className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'settings',
      title: 'Final Settings',
      description: 'Configure system preferences',
      icon: <Settings className="h-6 w-6" />,
      completed: false
    }
  ]);

  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    industry: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    countries: [] as Country[],
    branches: [] as Branch[],
    users: []
  });

  // State for current form inputs
  const [countryForm, setCountryForm] = useState({ name: '', code: '' });
  const [branchForm, setBranchForm] = useState({ name: '', countryId: '', address: '', phone: '', email: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', username: '', role: '', password: '' });

  // Load saved data on component mount
  useEffect(() => {
    if (user?.companyId) {
      loadSavedData();
    }
  }, [user?.companyId]);

  const loadSavedData = async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const [savedCountries, savedBranches] = await Promise.all([
        apiService.getCountries(user.companyId),
        apiService.getBranches(user.companyId)
      ]);
      
      setFormData(prev => ({
        ...prev,
        countries: savedCountries,
        branches: savedBranches
      }));
    } catch (err) {
      console.error('Error loading saved data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Country management functions
  const addCountry = async () => {
    if (!countryForm.name || !countryForm.code) {
      toast.error('Please enter both country name and code');
      return;
    }

    if (!user?.companyId) {
      toast.error('Company ID not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const countryData = {
        name: countryForm.name,
        code: countryForm.code,
        isActive: true,
        createdAt: new Date()
      };

      const countryId = await apiService.createCountry(user.companyId, countryData);
      
      // Add to local state
      const newCountry = { id: countryId, ...countryData };
      setFormData(prev => ({
        ...prev,
        countries: [...prev.countries, newCountry]
      }));
      
      setCountryForm({ name: '', code: '' });
      toast.success('Country added successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to add country');
      toast.error('Failed to add country');
    } finally {
      setLoading(false);
    }
  };

  const removeCountry = async (countryId: string) => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      await apiService.deleteCountry(user.companyId, countryId);
      
      setFormData(prev => ({
        ...prev,
        countries: prev.countries.filter(country => country.id !== countryId)
      }));
      
      toast.success('Country removed successfully');
    } catch (err: any) {
      toast.error('Failed to remove country');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validation for current step
    if (currentStep === 1 && formData.countries.length === 0) {
      toast.error('Please add at least one country before proceeding');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      handleCompleteSetup();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteSetup = () => {
    // Mark all steps as completed
    setSteps(prev => prev.map(step => ({ ...step, completed: true })));
    toast.success('Setup completed successfully!');
    navigate('/company/dashboard');
  };

  const markStepComplete = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="input-field"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Code *
                </label>
                <input
                  type="text"
                  value={formData.companyCode}
                  onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                  className="input-field"
                  placeholder="Enter company code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Industry</option>
                  <option value="food-beverage">Food & Beverage</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter company address"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Countries & Locations</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Add the countries where your company operates. You can add branches for each country in the next step.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Country name"
                  value={countryForm.name}
                  onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                  className="input-field flex-1"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Country code (e.g., US, UK)"
                  value={countryForm.code}
                  onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                  className="input-field w-32"
                  disabled={loading}
                  maxLength={3}
                />
                <button 
                  onClick={addCountry}
                  disabled={loading || !countryForm.name || !countryForm.code}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Country'}
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Added Countries ({formData.countries.length}):
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.countries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No countries added yet</p>
                      <p className="text-xs">Add at least one country to continue</p>
                    </div>
                  ) : (
                    formData.countries.map((country) => (
                      <div key={country.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{country.name} ({country.code})</span>
                        </div>
                        <button 
                          onClick={() => removeCountry(country.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Branches & Offices</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Set up your branch locations. Each branch can have its own inventory and users.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Branch name"
                  className="input-field"
                />
                <select 
                  className="input-field"
                  value={branchForm.countryId}
                  onChange={(e) => setBranchForm({ ...branchForm, countryId: e.target.value })}
                >
                  <option value="">Select Country</option>
                  {formData.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                <button className="btn-primary">
                  Add Branch
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Added Branches:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Home className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-900">New York Branch</span>
                        <p className="text-xs text-gray-500">United States</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Add team members who will use the system. You can assign different roles and permissions.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Username"
                  className="input-field"
                />
                <select className="input-field">
                  <option value="">Select Role</option>
                  <option value="admin">Company Admin</option>
                  <option value="manager">Branch Manager</option>
                  <option value="staff">Staff Member</option>
                </select>
                <button className="btn-primary md:col-span-2">
                  Add User
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Added Users:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-900">John Doe</span>
                        <p className="text-xs text-gray-500">john@company.com - Company Admin</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Final Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">System Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications about system updates</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto-backup</p>
                      <p className="text-xs text-gray-500">Automatically backup data daily</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-factor Authentication</p>
                      <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Data Import</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Import existing data</p>
                  <button className="btn-secondary">Upload CSV/Excel File</button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Setup</h1>
              <p className="text-sm text-gray-600">Configure your company settings</p>
            </div>
            <button
              onClick={() => navigate('/company/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Skip Setup
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index <= currentStep
                    ? step.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3 mr-6">
                  <p className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          <button
            onClick={() => {
              markStepComplete(currentStep);
              handleNext();
            }}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;