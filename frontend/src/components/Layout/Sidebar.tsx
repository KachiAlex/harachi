import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MapPin, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  DollarSign,
  BarChart3,
  Settings,
  Box,
  Layers,
  GitBranch,
  Ruler,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();

  if (!user) return null;

  // Role checks for navigation filtering
  const userRoles = user.roles.map(role => role.name);
  const isSuperAdmin = userRoles.includes('Super Admin');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
    { name: 'Branch Dashboard', href: '/branch/dashboard', icon: LayoutDashboard, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin'] },
    { name: 'Switch Branch', href: '/branch/select', icon: RefreshCw, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin'] },
    
    // Super Admin routes
    { name: 'Companies', href: '/admin/companies', icon: Building2, roles: ['Super Admin'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['Super Admin'] },
    
    // Company Admin routes
    { name: 'Setup Wizard', href: '/company/setup', icon: Settings, roles: ['Company Admin'] },
    { name: 'Countries', href: '/company/countries', icon: MapPin, roles: ['Company Admin'] },
    { name: 'Branches Upload', href: '/company/branches/upload', icon: Building2, roles: ['Company Admin'] },
    { name: 'Users', href: '/company/users', icon: Users, roles: ['Company Admin'] },
    { name: 'Licensing', href: '/company/licensing', icon: Settings, roles: ['Company Admin', 'Super Admin'] },
    { name: 'UoM', href: '/company/uoms', icon: Settings, roles: ['Company Admin'] },
    { name: 'Customers Upload', href: '/company/customers/upload', icon: Users, roles: ['Company Admin'] },
    { name: 'Vendors Upload', href: '/company/vendors/upload', icon: Users, roles: ['Company Admin'] },
    
    // Branch Admin & User routes - Inventory Management
    { name: 'Inventory', href: '/branch/inventory', icon: Package, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin', 'Auditor'] },
    { name: 'Item Master', href: '/branch/item-master', icon: Box, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin', 'Auditor'] },
    { name: 'Stock Management', href: '/branch/stock', icon: Layers, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin', 'Auditor'] },
    { name: 'Batch Tracking', href: '/branch/batch-tracking', icon: GitBranch, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin', 'Auditor'] },
    { name: 'Units of Measure', href: '/branch/uoms', icon: Ruler, roles: ['Branch Admin', 'Branch Manager', 'Company Admin'] },
    
    // Sales & Purchases
    { name: 'Sales', href: '/branch/sales', icon: ShoppingCart, roles: ['Branch Admin', 'Branch Manager', 'Company Admin', 'Auditor'] },
    { name: 'Purchases', href: '/branch/purchases', icon: ShoppingBag, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin', 'Auditor'] },
    
    // Finance & Reports
    { name: 'Finance', href: '/branch/finance', icon: DollarSign, roles: ['Branch Admin', 'Branch Manager', 'Accountant', 'Company Admin', 'Auditor'] },
    { name: 'Inventory Reports', href: '/branch/inventory-reports', icon: BarChart3, roles: ['Branch Admin', 'Branch Manager', 'Accountant', 'Company Admin', 'Auditor'] },
  ];

  const canAccess = (requiredRoles: string[]) => {
    if (requiredRoles.includes('*')) return true;
    return requiredRoles.some(role => userRoles.includes(role));
  };

  const filteredNavigation = navigation.filter(item => canAccess(item.roles));

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      {/* Selected Branch Indicator - Only show for non-Super Admin users */}
      {selectedBranch && !isSuperAdmin && (
        <div className="mt-4 mx-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900 truncate">
                Current Branch
              </p>
              <p className="text-sm font-semibold text-blue-700 truncate">
                {selectedBranch.name}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="mt-8 px-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
