export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: Company;
  companyId?: string;
  roles: Role[];
}

export interface Company {
  id: string;
  name: string;
  code: string;
  schemaName?: string;
  harachiId?: string;
  isActive: boolean;
  countries?: Country[];
  users?: User[];
  adminUsername?: string;
  adminPassword?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  branches?: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  countryId: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type UserRole = 'Super Admin' | 'Company Admin' | 'Branch Admin' | 'Accountant' | 'Inventory Officer' | 'Auditor';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  companyId: string;
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parentId?: string;
  isActive: boolean;
  companyId: string;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  type: 'Percentage' | 'Fixed';
  isActive: boolean;
  companyId: string;
}

export interface LicenseType {
  id: string;
  name: string;
  duration: number; // in days
  description: string;
  isActive: boolean;
  isTrial: boolean;
  price?: number;
}

export interface License {
  id: string;
  companyId: string;
  licenseTypeId?: string;
  licenseCode: string;
  status: 'active' | 'expired' | 'revoked' | 'grace';
  issuedAt: Date;
  expiresAt: Date;
  gracePeriodEnds?: Date;
  years: number;
  months: number;
  days: number;
  totalDuration: number; // total days
  isTrial: boolean;
  notificationsSent: {
    expiry30?: boolean;
    expiry14?: boolean;
    expiry7?: boolean;
    expiry3?: boolean;
    expired?: boolean;
    gracePeriod?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  companyId: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category?: string;
  uomId: string;
  uomName?: string;
  quantityOnHand: number;
  reorderLevel?: number;
  warehouseId?: string;
  branchId?: string;
  companyId: string;
  isActive: boolean;
}
