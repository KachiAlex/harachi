// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
  countryCount?: number;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  countryId: string;
  companyId: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
}

// Inventory Types
export interface ItemClass {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Item {
  id: string;
  name: string;
  code: string;
  description?: string;
  itemClassId: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UOM {
  id: string;
  name: string;
  code: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ItemUOM {
  id: string;
  itemId: string;
  uomId: string;
  conversionFactor: number;
  isBaseUOM: boolean;
  companyId: string;
}

export interface StockBalance {
  id: string;
  itemId: string;
  branchId: string;
  uomId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  companyId: string;
  lastUpdated: Date;
}

// Sales Types
export interface Customer {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  branchId: string;
  companyId: string;
  status: 'Draft' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  totalAmount: number;
  currency: string;
  createdAt: Date;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  itemId: string;
  uomId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  companyId: string;
}

// Purchase Types
export interface Vendor {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  branchId: string;
  companyId: string;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  orderDate: Date;
  expectedDate?: Date;
  totalAmount: number;
  currency: string;
  createdAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  uomId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  companyId: string;
}

// License Types
export interface License {
  id: string;
  companyId: string;
  code: string;
  years: number;
  issuedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateCompanyRequest {
  name: string;
  code: string;
  description?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  companyId: string;
  roles: string[];
}

export interface CreateItemRequest {
  name: string;
  code: string;
  description?: string;
  itemClassId: string;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  branchId: string;
  orderDate: Date;
  deliveryDate?: Date;
  items: {
    itemId: string;
    uomId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  branchId: string;
  orderDate: Date;
  expectedDate?: Date;
  items: {
    itemId: string;
    uomId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
