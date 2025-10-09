import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

const CompanyAccess: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [company, setCompany] = useState<any>(null);

  React.useEffect(() => {
    const loadCompany = async () => {
      if (!companyCode) return;
      
      try {
        const companyData = await apiService.getCompanyByCode(companyCode);
        setCompany(companyData);
      } catch (error) {
        console.error('Failed to load company:', error);
        toast.error('Company not found');
        navigate('/');
      }
    };

    loadCompany();
  }, [companyCode, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== LOGIN ATTEMPT STARTED ===');
    console.log('Form data:', {
      username: loginForm.username,
      password: loginForm.password ? '***' : '(empty)',
      hasUsername: !!loginForm.username.trim(),
      hasPassword: !!loginForm.password.trim()
    });
    
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      console.log('❌ Validation failed: Empty username or password');
      toast.error('Please enter username and password');
      return;
    }

    if (!company?.id) {
      console.log('❌ Validation failed: No company ID');
      toast.error('Company not found');
      return;
    }

    try {
      setLoading(true);
      
      console.log('✅ Validation passed. Calling authenticateCompanyUser...');
      console.log('Parameters:', {
        companyId: company?.id,
        companyName: company?.name,
        companyCode: companyCode,
        username: loginForm.username
      });
      
      // Authenticate company user
      const authResult = await apiService.authenticateCompanyUser(
        company?.id,
        loginForm.username,
        loginForm.password
      );

      console.log('📥 Authentication result received:');
      console.log('Success:', authResult.success);
      console.log('Has user:', !!authResult.user);
      console.log('Message:', authResult.message);
      console.log('User data:', authResult.user ? {
        id: authResult.user.id,
        username: authResult.user.username,
        companyId: authResult.user.companyId,
        roles: authResult.user.roles
      } : 'No user data');

      if (authResult.success) {
        console.log('✅ Authentication successful!');
        
        // Store user data in local storage for company portal session
        if (authResult.user) {
          localStorage.setItem('companyPortalUser', JSON.stringify(authResult.user));
          localStorage.setItem('companyPortalCode', companyCode || '');
          console.log('✅ User data stored in localStorage');
          console.log('Stored keys:', {
            companyPortalUser: !!localStorage.getItem('companyPortalUser'),
            companyPortalCode: localStorage.getItem('companyPortalCode')
          });
        }
        
        toast.success(`Welcome, ${authResult.user?.username || 'User'}!`);
        
        const portalPath = `/company/${companyCode}/portal`;
        console.log('🚀 Navigating to company portal:', portalPath);
        console.log('Current location:', window.location.pathname);
        
        // Use setTimeout to ensure navigation happens after state updates
        setTimeout(() => {
          console.log('Executing navigation...');
          navigate(portalPath, { replace: true });
          console.log('Navigation called. New location should be:', portalPath);
        }, 100);
        
      } else {
        console.log('❌ Authentication failed:', authResult.message);
        toast.error(authResult.message || 'Invalid username or password');
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      });
      toast.error(error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
      console.log('=== LOGIN ATTEMPT ENDED ===');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Company Logo/Branding */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-sm text-gray-600">Company Portal Access</p>
            </div>
          </div>
        </div>
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
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginForm.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in to {company.name}
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Company Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p><strong>Company:</strong> {company.name}</p>
              <p><strong>Code:</strong> {company.code}</p>
              {company.industry && <p><strong>Industry:</strong> {company.industry}</p>}
            </div>
          </div>

          {/* Setup Status */}
          {company.isSetupComplete === false && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Setup Required:</strong> Your company setup is not yet complete. 
                You'll be guided through the setup process after login.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyAccess;
