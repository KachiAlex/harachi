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
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isSuperAdmin = user.roles.some(role => role.name === 'Super Admin');
  const isCompanyAdmin = user.roles.some(role => role.name === 'Company Admin');
  const isBranchAdmin = user.roles.some(role => role.name === 'Branch Admin');
  const isAccountant = user.roles.some(role => role.name === 'Accountant');
  const isInventoryOfficer = user.roles.some(role => role.name === 'Inventory Officer');
  const isAuditor = user.roles.some(role => role.name === 'Auditor');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
    
    // Super Admin routes
    { name: 'Companies', href: '/admin/companies', icon: Building2, roles: ['Super Admin'] },
    { name: 'Users', href: '/admin/users', icon: Users, roles: ['Super Admin'] },
    
    // Company Admin routes
    { name: 'Setup Wizard', href: '/company/setup', icon: Settings, roles: ['Company Admin'] },
    { name: 'Countries', href: '/company/countries', icon: MapPin, roles: ['Company Admin'] },
    { name: 'Branches', href: '/company/branches', icon: Building2, roles: ['Company Admin'] },
    { name: 'Users', href: '/company/users', icon: Users, roles: ['Company Admin'] },
    
    // Branch Admin & User routes
    { name: 'Inventory', href: '/branch/inventory', icon: Package, roles: ['Branch Admin', 'Inventory Officer', 'Auditor'] },
    { name: 'Sales', href: '/branch/sales', icon: ShoppingCart, roles: ['Branch Admin', 'Auditor'] },
    { name: 'Purchases', href: '/branch/purchases', icon: ShoppingBag, roles: ['Branch Admin', 'Inventory Officer', 'Auditor'] },
    { name: 'Finance', href: '/branch/finance', icon: DollarSign, roles: ['Branch Admin', 'Accountant', 'Auditor'] },
    { name: 'Reports', href: '/branch/reports', icon: BarChart3, roles: ['Branch Admin', 'Accountant', 'Auditor'] },
  ];

  const canAccess = (requiredRoles: string[]) => {
    if (requiredRoles.includes('*')) return true;
    return requiredRoles.some(role => 
      user.roles.some(userRole => userRole.name === role)
    );
  };

  const filteredNavigation = navigation.filter(item => canAccess(item.roles));

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
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
