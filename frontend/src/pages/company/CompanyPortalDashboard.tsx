import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

const CompanyPortalDashboard: React.FC = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalUsers: 0,
    totalItems: 0,
    totalSales: 0,
    setupComplete: false
  });

  useEffect(() => {
    console.log('CompanyPortalDashboard mounted with companyCode:', companyCode);
    
    // Check for authenticated company portal user
    const storedUser = localStorage.getItem('companyPortalUser');
    const storedCode = localStorage.getItem('companyPortalCode');
    
    console.log('Checking authentication:', { storedUser: !!storedUser, storedCode, currentCode: companyCode });
    
    if (!storedUser || storedCode !== companyCode) {
      console.log('No authenticated user found, redirecting to login');
      navigate(`/company/${companyCode}/access`, { replace: true });
      return;
    }
    
    try {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      console.log('Authenticated user:', user);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      navigate(`/company/${companyCode}/access`, { replace: true });
      return;
    }
    
    const loadCompanyData = async () => {
      if (!companyCode) {
        console.log('No company code provided');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading company data for:', companyCode);
        
        // Load company data
        const companyData = await apiService.getCompanyByCode(companyCode);
        if (!companyData) {
          throw new Error('Company not found');
        }
        setCompany(companyData);

        // Load company statistics
        const [branches, users, countries] = await Promise.all([
          apiService.getBranches(companyData.id),
          apiService.getUsers(companyData.id),
          apiService.getCountries(companyData.id)
        ]);

        // Calculate total items across all branches
        let totalItems = 0;
        for (const branch of branches) {
          try {
            const items = await apiService.getItems(branch.id);
            totalItems += items.length;
          } catch (error) {
            console.warn(`Failed to load items for branch ${branch.id}:`, error);
          }
        }

        setStats({
          totalBranches: branches.length,
          totalUsers: users.length,
          totalItems,
          totalSales: 0, // TODO: Calculate from actual sales data
          setupComplete: companyData.isSetupComplete || false
        });

      } catch (error: any) {
        console.error('Failed to load company data:', error);
        toast.error(error?.message || 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyCode]);

  const handleStartSetup = () => {
    navigate(`/company/${companyCode}/setup`);
  };

  const handleManageBranches = () => {
    navigate(`/company/${companyCode}/branches`);
  };

  const handleManageUsers = () => {
    navigate(`/company/${companyCode}/users`);
  };

  const handleCompanySettings = () => {
    navigate(`/company/${companyCode}/settings`);
  };

  const handleLogout = () => {
    console.log('Logging out from company portal');
    localStorage.removeItem('companyPortalUser');
    localStorage.removeItem('companyPortalCode');
    toast.success('Logged out successfully');
    navigate(`/company/${companyCode}/access`, { replace: true });
  };

  if (loading) {
    console.log('CompanyPortalDashboard loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h2>
          <p className="text-gray-600 mb-8">The company you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-sm text-gray-600">Company Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {currentUser?.firstName || currentUser?.username || 'Admin'}
              </span>
              <button
                onClick={handleCompanySettings}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Setup Status Banner */}
          {!stats.setupComplete && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Company Setup Required
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Complete your company setup to access all features and start managing your operations.
                  </p>
                </div>
                <button
                  onClick={handleStartSetup}
                  className="ml-4 btn-primary"
                >
                  Start Setup
                </button>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to {company.name}
            </h2>
            <p className="text-lg text-gray-600">
              Manage your company operations, branches, and team members.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Branches"
              value={stats.totalBranches}
              icon={<MapPin className="h-6 w-6 text-blue-500" />}
              description="Operating locations"
            />
            <StatCard
              title="Users"
              value={stats.totalUsers}
              icon={<Users className="h-6 w-6 text-green-500" />}
              description="Team members"
            />
            <StatCard
              title="Inventory Items"
              value={stats.totalItems}
              icon={<Package className="h-6 w-6 text-purple-500" />}
              description="Total items"
            />
            <StatCard
              title="Setup Status"
              value={stats.setupComplete ? "Complete" : "Pending"}
              icon={stats.setupComplete ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Clock className="h-6 w-6 text-yellow-500" />}
              description="Configuration"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Manage Branches"
                description="Set up and manage your branch locations"
                icon={<MapPin className="h-8 w-8 text-blue-600" />}
                onClick={handleManageBranches}
                status={stats.totalBranches > 0 ? 'active' : 'setup'}
              />
              <QuickActionCard
                title="User Management"
                description="Add and manage team members"
                icon={<Users className="h-8 w-8 text-green-600" />}
                onClick={handleManageUsers}
                status={stats.totalUsers > 0 ? 'active' : 'setup'}
              />
              <QuickActionCard
                title="Company Settings"
                description="Configure company information and preferences"
                icon={<Settings className="h-8 w-8 text-gray-600" />}
                onClick={handleCompanySettings}
                status="active"
              />
            </div>
          </div>

          {/* Setup Progress */}
          {!stats.setupComplete && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Your Setup</h3>
              <div className="space-y-3">
                <SetupStep
                  title="Company Information"
                  completed={true}
                  description="Basic company details"
                />
                <SetupStep
                  title="Countries & Locations"
                  completed={stats.totalBranches > 0}
                  description="Operating countries"
                />
                <SetupStep
                  title="Branches & Offices"
                  completed={stats.totalBranches > 0}
                  description="Branch locations"
                />
                <SetupStep
                  title="Team Members"
                  completed={stats.totalUsers > 0}
                  description="User accounts"
                />
                <SetupStep
                  title="Final Configuration"
                  completed={stats.setupComplete}
                  description="Complete setup"
                />
              </div>
              <div className="mt-6">
                <button
                  onClick={handleStartSetup}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Continue Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string }> = ({
  title,
  value,
  icon,
  description
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
            </dd>
            <dd className="text-xs text-gray-500">{description}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const QuickActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; status: 'active' | 'setup' }> = ({
  title,
  description,
  icon,
  onClick,
  status
}) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left w-full"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-4">
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400" />
    </div>
    {status === 'setup' && (
      <div className="mt-3 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
        Setup required
      </div>
    )}
  </button>
);

const SetupStep: React.FC<{ title: string; completed: boolean; description: string }> = ({
  title,
  completed,
  description
}) => (
  <div className="flex items-center">
    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
      completed ? 'bg-green-100' : 'bg-gray-100'
    }`}>
      {completed ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Clock className="h-4 w-4 text-gray-400" />
      )}
    </div>
    <div className="ml-3">
      <p className={`text-sm font-medium ${completed ? 'text-green-900' : 'text-gray-900'}`}>
        {title}
      </p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

export default CompanyPortalDashboard;
