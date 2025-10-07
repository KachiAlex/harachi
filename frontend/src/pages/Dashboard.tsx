import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import DemoDataGenerator from '../components/DemoDataGenerator';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Users, 
  MapPin, 
  Package, 
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Key
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [license, setLicense] = useState<any | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadLicense = async () => {
      if (!user?.company?.id) return;
      
      setLicenseLoading(true);
      try {
        const activeLicense = await apiService.getActiveLicense(user.company.id);
        setLicense(activeLicense);
      } catch (error) {
        console.error('Failed to load license:', error);
      } finally {
        setLicenseLoading(false);
      }
    };

    loadLicense();
  }, [user?.company?.id]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('License code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (!user) return null;

  const isSuperAdmin = user.roles.some(role => role.name === 'Super Admin');
  const isCompanyAdmin = user.roles.some(role => role.name === 'Company Admin');

  const stats = [
    {
      name: 'Companies',
      value: isSuperAdmin ? '12' : '1',
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Users',
      value: isSuperAdmin ? '156' : isCompanyAdmin ? '24' : '8',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Countries',
      value: isCompanyAdmin ? '3' : '1',
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      name: 'Branches',
      value: isCompanyAdmin ? '8' : '2',
      icon: Building2,
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      name: 'Manage Inventory',
      description: 'View and manage inventory items',
      href: '/branch/inventory',
      icon: Package,
      roles: ['Branch Admin', 'Inventory Officer', 'Auditor'],
    },
    {
      name: 'Sales Orders',
      description: 'Create and track sales orders',
      href: '/branch/sales',
      icon: ShoppingCart,
      roles: ['Branch Admin', 'Auditor'],
    },
    {
      name: 'Purchase Orders',
      description: 'Manage purchase orders and vendors',
      href: '/branch/purchases',
      icon: ShoppingBag,
      roles: ['Branch Admin', 'Inventory Officer', 'Auditor'],
    },
    {
      name: 'Financial Reports',
      description: 'View financial reports and analytics',
      href: '/branch/finance',
      icon: DollarSign,
      roles: ['Branch Admin', 'Accountant', 'Auditor'],
    },
  ];

  const canAccess = (requiredRoles: string[]) => {
    return requiredRoles.some(role => 
      user.roles.some(userRole => userRole.name === role)
    );
  };

  const filteredQuickActions = quickActions.filter(action => canAccess(action.roles));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.firstName}! Here's what's happening with your {user.company?.name || 'company'} account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* License Information */}
      {isCompanyAdmin && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">License Information</h2>
          <div className="card">
            {licenseLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading license...</span>
              </div>
            ) : license ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Key className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Active License</h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">Active</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">License Code</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white border rounded-lg p-3 font-mono text-sm font-semibold text-gray-900 break-all">
                        {license.code}
                      </div>
                      <button
                        onClick={() => copyToClipboard(license.code)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          copied 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Expires:</span>
                      <span className="ml-1 text-gray-900">{new Date(license.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Duration:</span>
                      <span className="ml-1 text-gray-900">{license.years} year(s)</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Issued:</span>
                      <span className="ml-1 text-gray-900">{new Date(license.issuedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active License</h3>
                <p className="text-gray-600 mb-4">No active license found for your company.</p>
                <a href="/company/license" className="btn-primary">Manage License</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Data Generator - Only for Company Admin */}
      {isCompanyAdmin && user?.company?.id && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup</h2>
          <DemoDataGenerator companyId={user.company.id} />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.name}
                href={action.href}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center">
                  <Icon className="h-8 w-8 text-primary-600" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New inventory item added</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Sales order #SO-001 created</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Purchase order #PO-001 pending approval</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
