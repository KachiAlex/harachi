export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: Company;
  roles: Role[];
}

export interface Company {
  id: string;
  name: string;
  code: string;
  schemaName: string;
  isActive: boolean;
  countries?: Country[];
  users?: User[];
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
