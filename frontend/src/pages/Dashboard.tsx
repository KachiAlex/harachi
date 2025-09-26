import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Users, 
  MapPin, 
  Package, 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ShoppingBag
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isSuperAdmin = user.roles.some(role => role.name === 'Super Admin');
  const isCompanyAdmin = user.roles.some(role => role.name === 'Company Admin');
  const isBranchAdmin = user.roles.some(role => role.name === 'Branch Admin');

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
          Welcome back, {user.firstName}! Here's what's happening with your {user.company.name} account.
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
