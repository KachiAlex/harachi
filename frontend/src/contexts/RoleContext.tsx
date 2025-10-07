import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface RoleContextType {
  userRole: string | null;
  isCompanyAdmin: boolean;
  isBranchManager: boolean;
  isStaff: boolean;
  canManageUsers: boolean;
  canManageBranches: boolean;
  canManageCountries: boolean;
  canViewFinance: boolean;
  canManageInventory: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: React.ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user?.roles && Array.isArray(user.roles)) {
      // Get the highest privilege role
      const roles = user.roles;
      const roleNames = roles.map((role: any) => typeof role === 'string' ? role : role.name || role.role);
      
      if (roleNames.includes('Company Admin')) {
        setUserRole('Company Admin');
      } else if (roleNames.includes('Branch Manager')) {
        setUserRole('Branch Manager');
      } else if (roleNames.includes('Staff Member')) {
        setUserRole('Staff Member');
      } else {
        setUserRole(roleNames[0] || null);
      }
    } else {
      setUserRole(null);
    }
  }, [user]);

  const isCompanyAdmin = userRole === 'Company Admin';
  const isBranchManager = userRole === 'Branch Manager';
  const isStaff = userRole === 'Staff Member';

  // Permission matrix
  const canManageUsers = isCompanyAdmin;
  const canManageBranches = isCompanyAdmin || isBranchManager;
  const canManageCountries = isCompanyAdmin || isBranchManager;
  const canViewFinance = isCompanyAdmin;
  const canManageInventory = isCompanyAdmin || isBranchManager;

  const value: RoleContextType = {
    userRole,
    isCompanyAdmin,
    isBranchManager,
    isStaff,
    canManageUsers,
    canManageBranches,
    canManageCountries,
    canViewFinance,
    canManageInventory,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
