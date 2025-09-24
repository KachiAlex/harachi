// Core Types for Brewery ERP System

export interface Company {
  id: string;
  name: string;
  taxId?: string;
  slug: string;
  subscriptionTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Multi-tenant core types
export type SystemRole = 'SYSTEM_ADMIN' | 'TENANT_ADMIN' | 'TENANT_MANAGER' | 'TENANT_OPERATOR' | 'TENANT_AUDITOR';

export interface Tenant {
  id: string;            // GUID/ULID
  name: string;          // Legal/business name
  slug: string;          // URL-safe identifier
  domain?: string;       // Custom domain (optional)
  subscriptionTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface TenantCountry {
  id: string;
  tenantId: string;
  name: string;
  countryCode: string;   // ISO 3166-1 alpha-2
  currencyCode: string;  // ISO 4217
  timezone: string;      // IANA timezone
  taxSystem: 'VAT' | 'GST' | 'SALES_TAX' | 'NONE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBranch {
  id: string;
  tenantId: string;
  countryId: string;     // references TenantCountry.id
  name: string;
  code: string;
  branchType: 'BREWERY' | 'PACKAGING' | 'TAPROOM' | 'DISTRIBUTION' | 'WAREHOUSE';
  address?: Address;
  contactInfo?: ContactInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Permission =
  | 'admin:tenants:read'
  | 'admin:tenants:write'
  | 'tenant:settings:read'
  | 'tenant:settings:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'production:read'
  | 'production:write'
  | 'procurement:read'
  | 'procurement:write'
  | 'quality:read'
  | 'quality:write'
  | 'reports:read'
  | 'global:read';

// RBAC Entities
export interface Role {
  id: string;
  tenantId?: string; // undefined means system-level role
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string; // auth uid
  email: string;
  displayName?: string;
  tenantId?: string;
  countryId?: string;
  branchId?: string;
  roleId?: string; // references Role.id
  permissions?: Permission[]; // effective overrides (optional)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Country {
  id: string;
  companyId: string;
  name: string;
  countryCode: string; // ISO 3166-1 alpha-2
  currencyCode: string; // ISO 4217
  taxSystem: 'VAT' | 'GST' | 'SALES_TAX' | 'NONE';
  timezone: string; // IANA timezone
  active: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  countryId: string;
  name: string;
  branchCode: string;
  branchType: 'BREWERY' | 'PACKAGING' | 'TAPROOM' | 'DISTRIBUTION' | 'WAREHOUSE';
  address?: Address;
  contactInfo?: ContactInfo;
  active: boolean;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  branchId: string;
  code: string;
  name: string;
  warehouseType: 'RAW_MATERIALS' | 'WORK_IN_PROCESS' | 'FINISHED_GOODS' | 'PACKAGING' | 'GENERAL';
  temperatureControlled: boolean;
  active: boolean;
  createdAt: string;
}

export interface Address {
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface UserContext {
  tenantId: string;
  tenantName: string;
  countryId?: string;
  countryName?: string;
  countryCode?: string;
  currencyCode?: string;
  branchId?: string;
  branchName?: string;
  defaultWarehouseId?: string;
  permissions: string[];
  businessDate: string;
}

export interface ItemClass {
  id: string;
  companyId: string;
  parentId?: string;
  code: string;
  name: string;
  description: string;
  postingClass?: string;
  defaultWarehouseId?: string;
  children?: ItemClass[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Item {
  id: string;
  itemCode: string;
  description: string;
  itemClassId: string;
  postingClassId: string;
  baseUOM: string;
  weightUOM: string;
  volumeUOM: string;
  isActive: boolean;
  isSerialized: boolean;
  isLotTracked: boolean;
  isPurchasable: boolean;
  isSellable: boolean;
  isManufactured: boolean;
  defaultWarehouse: string;
  reorderPoint: number;
  reorderQty: number;
  standardCost: number;
  lastCost: number;
  averageCost: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ItemDetail extends Item {
  itemClass: ItemClass;
  uomConversions: UOMConversion[];
  currentStock?: number;
}

export interface UOMConversion {
  id: string;
  itemId: string;
  fromUOM: string;
  toUOM: string;
  conversionFactor: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface LotSerial {
  id: string;
  itemId: string;
  lotNo: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  supplierLot?: string;
  createdAt: Date;
}

export interface StockBalance {
  id: string;
  itemId: string;
  warehouseId: string;
  lotSerialId?: string;
  qtyOnHand: number;
  qtyAllocated: number;
  qtyAvailable: number;
  item: Item;
  warehouse: Warehouse;
  lotSerial?: LotSerial;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  warehouseId: string;
  lotSerialId?: string;
  trxType: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER' | 'PRODUCTION_CONSUME' | 'PRODUCTION_YIELD';
  qty: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  transactionDate: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  companyId: string;
  supplierCode: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'COD' | 'PREPAID';
  currencyCode: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId: string;
  poNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'CLOSED' | 'CANCELLED';
  totalAmount: number;
  currencyCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface POLine {
  id: string;
  poId: string;
  lineNumber: number;
  itemId: string;
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
  uom: string;
  item: Item;
}

export interface GoodsReceipt {
  id: string;
  companyId: string;
  poId: string;
  grNumber: string;
  receiptDate: Date;
  warehouseId: string;
  supplierId: string;
  status: 'DRAFT' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
  totalQty: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GRLine {
  id: string;
  grId: string;
  poLineId: string;
  itemId: string;
  qtyReceived: number;
  qtyAccepted: number;
  qtyRejected: number;
  unitCost: number;
  uom: string;
  lotNumber?: string;
  expiryDate?: Date;
  item: Item;
}

export interface Recipe {
  id: string;
  companyId: string;
  itemId: string;
  recipeCode: string;
  description?: string;
  batchSize: number;
  batchUom: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeDetail extends Recipe {
  finishedGood: Item;
  ingredients: RecipeLine[];
}

export interface RecipeLine {
  id: string;
  recipeId: string;
  lineNumber: number;
  itemId: string;
  qtyPerBatch: number;
  uom: string;
  item: Item;
}

export interface ProductionOrder {
  id: string;
  companyId: string;
  recipeId: string;
  batchNo: string;
  plannedQty: number;
  actualQty?: number;
  status: 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
  plannedStartDate: Date;
  actualStartDate?: Date;
  plannedEndDate?: Date;
  actualEndDate?: Date;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionOrderDetail extends ProductionOrder {
  recipe: RecipeDetail;
  materialConsumption: ProductionMaterial[];
  batchAttributes?: BatchAttributes;
}

export interface ProductionMaterial {
  id: string;
  productionOrderId: string;
  itemId: string;
  lotSerialId?: string;
  plannedQty: number;
  consumedQty: number;
  uom: string;
  item: Item;
  lotSerial?: LotSerial;
}

export interface BatchAttributes {
  id: string;
  productionOrderId: string;
  brewDate?: Date;
  tankId?: string;
  abv?: number; // Alcohol by volume
  og?: number;  // Original gravity
  fg?: number;  // Final gravity
  fermentationDays?: number;
  notes?: string;
}

export interface QCTest {
  id: string;
  lotSerialId: string;
  testType: 'INCOMING_INSPECTION' | 'IN_PROCESS' | 'FINAL_PRODUCT' | 'STABILITY' | 'MICROBIOLOGICAL' | 'SENSORY' | 'CHEMICAL' | 'PHYSICAL';
  testDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  testedBy: string;
  notes: string;
  createdAt: Date;
  companyId: string;
  batchNo: string;
  itemId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface QCResult {
  id: string;
  qcTestId: string;
  parameter: string;
  expectedValue: string;
  actualValue: string;
  result: 'PASS' | 'FAIL' | 'WARNING';
  notes: string;
}

export interface InterCountryTransfer {
  id: number;
  companyId: number;
  transferNumber: string;
  fromCountryId: number;
  toCountryId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
  shipDate: string;
  expectedReceiptDate?: string;
  actualReceiptDate?: string;
  customsReference?: string;
  lines: TransferLine[];
  createdAt: string;
}

export interface TransferLine {
  id: number;
  transferId: number;
  lineNumber: number;
  itemId: number;
  lotSerialId?: number;
  qtyShipped: number;
  qtyReceived?: number;
  uom: string;
  unitCost?: number;
  item: Item;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// UI State Types
export interface TreeNode {
  id: string | number;
  label: string;
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  data?: any;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  validation?: any;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

// Chart/Dashboard Types
export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large';
  data: any;
  refreshInterval?: number;
}
