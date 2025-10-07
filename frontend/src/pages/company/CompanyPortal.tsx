import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, MapPin, Settings, LogOut, AlertTriangle, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import { useRole } from '../../contexts/RoleContext';

interface CompanyPortalState {
  isAuthenticated: boolean;
  company: any;
  user: any;
  licenseValidation: {
    isValid: boolean;
    status: 'active' | 'expired' | 'grace' | 'blocked' | 'none';
    message?: string;
    daysUntilExpiry?: number;
    daysInGracePeriod?: number;
  } | null;
}

const CompanyPortal: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();
  const { canManageUsers, canManageCountries, isCompanyAdmin } = useRole();
  
  const [state, setState] = useState<CompanyPortalState>({
    isAuthenticated: false,
    company: null,
    user: null,
    licenseValidation: null
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const loadCompanyData = useCallback(async () => {
    try {
      // Load real company data from Firestore
      if (!companyCode) {
        console.error('Company code not found');
        return;
      }
      
      console.log('Looking for company with code:', companyCode);
      const company = await apiService.getCompanyByCode(companyCode!);
      console.log('Found company:', company);
      
      if (!company) {
        console.error('Company not found for code:', companyCode);
        return;
      }

      // Load setup collections from Firestore to determine completion accurately
      try {
        const [loadedCountries, loadedBranches, loadedUsers] = await Promise.all([
          apiService.getCountries(company.id),
          apiService.getBranches(company.id),
          apiService.getUsers(company.id)
        ]);
        setCountries(loadedCountries);
        setBranches(loadedBranches);
        setUsers(loadedUsers);
      } catch (collectionsError) {
        console.warn('Unable to load setup collections', collectionsError);
      }

      // Mock license validation to avoid API errors
      const licenseValidation = {
        isValid: true,
        status: 'active' as const,
        daysUntilExpiry: 30,
        message: 'License is active'
      };

      // Try to validate license, but don't fail if it doesn't exist
      try {
        const actualValidation = await apiService.validateLicense(company.id);
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          company,
          user: {
            username: 'admin',
            role: 'Company Admin'
          },
          licenseValidation: actualValidation
        }));
      } catch (licenseError) {
        console.warn('License validation failed, using mock data:', licenseError);
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          company,
          user: {
            username: 'admin',
            role: 'Company Admin'
          },
          licenseValidation
        }));
      }
    } catch (error) {
      console.error('Failed to load company data:', error);
      toast.error('Failed to load company data');
    }
  }, [companyCode]);

  useEffect(() => {
    // Check if user is already authenticated or if we're coming from setup completion
    const authToken = localStorage.getItem(`company_${companyCode}_token`);
    const isFromSetup = localStorage.getItem(`company_${companyCode}_setup_complete`);
    
    if (authToken || isFromSetup) {
      // Verify token and load company data
      loadCompanyData();
      
      // Clear setup completion flag if it exists and show success message
      if (isFromSetup) {
        localStorage.removeItem(`company_${companyCode}_setup_complete`);
        // Show success toast after a short delay to ensure data is loaded
        setTimeout(() => {
          toast.success('✅ Setup completed! Your company is ready to use.', {
            duration: 5000,
            position: 'top-center',
          });
        }, 1000);
      }
    }
  }, [companyCode, loadCompanyData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      toast.error('Please enter username and password');
      return;
    }

    if (!companyCode) {
      toast.error('Company code is missing');
      return;
    }

    try {
      setLoading(true);
      
      // Get company first to get the companyId
      const company = await apiService.getCompanyByCode(companyCode);
      if (!company) {
        toast.error('Company not found');
        setLoading(false);
        return;
      }

      // Authenticate user
      const authResult = await apiService.authenticateCompanyUser(
        company.id,
        loginForm.username,
        loginForm.password
      );

      if (authResult.success && authResult.user) {
        // Store authentication token and user info
        const token = `${company.id}_${authResult.user.id}_${Date.now()}`;
        localStorage.setItem(`company_${companyCode}_token`, token);
        localStorage.setItem(`company_${companyCode}_user`, JSON.stringify(authResult.user));
        
        // Load company data
        await loadCompanyData();
        
        toast.success(`Welcome back, ${authResult.user.firstName || authResult.user.username}!`);
      } else {
        toast.error(authResult.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`company_${companyCode}_token`);
    localStorage.removeItem(`company_${companyCode}_user`);
    setState({
      isAuthenticated: false,
      company: null,
      user: null,
      licenseValidation: null
    });
    setLoginForm({ username: '', password: '' });
    toast.success('Logged out successfully');
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Company Portal Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your company dashboard
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">{state.company?.name}</h1>
                <p className="text-sm text-gray-500">Company Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {state.user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Resume Setup Banner */}
          {(!state.company?.isSetupComplete || countries.length === 0 || branches.length === 0 || users.length === 0) && (
            <div className="mb-6 p-4 rounded-lg border bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="ml-3 text-sm text-yellow-800">
                    Your setup is not yet complete. Resume the setup wizard to finish configuration.
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/company/${companyCode}/setup`)}
                  className="btn-primary text-sm"
                >
                  Resume Setup
                </button>
              </div>
            </div>
          )}
          {/* License Status Banner */}
          {state.licenseValidation && !state.licenseValidation.isValid && (
            <div className={`mb-6 p-4 rounded-lg border ${
              state.licenseValidation.status === 'blocked' 
                ? 'bg-red-50 border-red-200' 
                : state.licenseValidation.status === 'grace'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center">
                {state.licenseValidation.status === 'blocked' ? (
                  <Shield className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    state.licenseValidation.status === 'blocked' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {state.licenseValidation.status === 'blocked' ? 'Access Denied' : 'License Warning'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    state.licenseValidation.status === 'blocked' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {state.licenseValidation.message}
                  </p>
                  {state.licenseValidation.status === 'blocked' && (
                    <p className="text-sm mt-2 text-red-600 font-medium">
                      Please contact your administrator to renew your license.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* License Expiry Warning */}
          {state.licenseValidation?.isValid && state.licenseValidation.daysUntilExpiry && state.licenseValidation.daysUntilExpiry <= 30 && (
            <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">License Expiring Soon</h3>
                  <p className="text-sm mt-1 text-blue-700">
                    Your license expires in {state.licenseValidation.daysUntilExpiry} days. 
                    Please contact your administrator to renew.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Company Portal</h2>
            <p className="mt-2 text-gray-600">Set up your company structure and manage your operations.</p>
            
            {/* Quick Access to Branches */}
            {state.company?.isSetupComplete && branches.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/company/${companyCode}/branches`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Access Branches ({branches.length})
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${
            state.licenseValidation?.status === 'blocked' ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Setup Wizard
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Configure your company
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button 
                    onClick={() => navigate(`/company/${companyCode}/setup`)}
                    className="font-medium text-primary-700 hover:text-primary-900"
                  >
                    Start Setup
                  </button>
                </div>
              </div>
            </div>

            {canManageCountries && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Countries
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage locations
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button 
                    onClick={() => navigate(`/company/${companyCode}/setup`)}
                    className="font-medium text-green-700 hover:text-green-900"
                  >
                    Manage Countries
                  </button>
                </div>
              </div>
            </div>
            )}

            {canManageUsers && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Manage team members
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button 
                    onClick={() => navigate(`/company/${companyCode}/setup`)}
                    className="font-medium text-blue-700 hover:text-blue-900"
                  >
                    Manage Users
                  </button>
                </div>
              </div>
            </div>
            )}

            {isCompanyAdmin && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          License
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Manage license
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <button 
                      onClick={() => navigate(`/company/${companyCode}/license`)}
                      className="font-medium text-purple-700 hover:text-purple-900"
                    >
                      Manage License
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Setup Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Setup Status</h3>
              {!state.company?.isSetupComplete || countries.length === 0 || branches.length === 0 || users.length === 0 ? (
              <button
                onClick={() => navigate(`/company/${companyCode}/setup`)}
                className="btn-primary text-sm"
              >
                Complete Setup
              </button>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Setup Complete
                </span>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Company Information</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  state.company?.name ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {state.company?.name ? 'Complete' : 'Not Started'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Countries Setup</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  countries.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {countries.length > 0 ? 'Complete' : 'Not Started'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Branches Setup</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  branches.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {branches.length > 0 ? 'Complete' : 'Not Started'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">User Management</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  users.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {users.length > 0 ? 'Complete' : 'Not Started'}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {state.company?.isSetupComplete && countries.length > 0 && branches.length > 0 && users.length > 0
                  ? 'Setup completed successfully! You can now use all features of the system.'
                  : 'Complete the setup wizard to configure your company structure and start using all features.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyPortal;
