// Core Types for Brewery ERP System

export interface Company {
  id: number;
  name: string;
  taxId?: string;
  slug: string;
  subscriptionTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: number;
  companyId: number;
  name: string;
  countryCode: string; // ISO 3166-1 alpha-2
  currencyCode: string; // ISO 4217
  taxSystem: 'VAT' | 'GST' | 'SALES_TAX' | 'NONE';
  timezone: string; // IANA timezone
  active: boolean;
  createdAt: string;
}

export interface Branch {
  id: number;
  countryId: number;
  name: string;
  branchCode: string;
  branchType: 'BREWERY' | 'PACKAGING' | 'TAPROOM' | 'DISTRIBUTION' | 'WAREHOUSE';
  address?: Address;
  contactInfo?: ContactInfo;
  active: boolean;
  createdAt: string;
}

export interface Warehouse {
  id: number;
  branchId: number;
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
  tenantId: number;
  tenantName: string;
  countryId?: number;
  countryName?: string;
  countryCode?: string;
  currencyCode?: string;
  branchId?: number;
  branchName?: string;
  defaultWarehouseId?: number;
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
  id: number;
  itemId: number;
  lotNo: string;
  manufactureDate?: string;
  expiryDate?: string;
  supplierLot?: string;
  createdAt: string;
}

export interface StockBalance {
  id: number;
  itemId: number;
  warehouseId: number;
  lotSerialId?: number;
  qtyOnHand: number;
  qtyAllocated: number;
  qtyAvailable: number;
  item: Item;
  warehouse: Warehouse;
  lotSerial?: LotSerial;
}

export interface InventoryTransaction {
  id: number;
  itemId: number;
  warehouseId: number;
  lotSerialId?: number;
  trxType: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER' | 'PRODUCTION_CONSUME' | 'PRODUCTION_YIELD';
  qty: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
  transactionDate: string;
  createdBy: number;
  createdAt: string;
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
  id: number;
  companyId: number;
  itemId: number;
  recipeCode: string;
  description?: string;
  batchSize: number;
  batchUom: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDetail extends Recipe {
  finishedGood: Item;
  ingredients: RecipeLine[];
}

export interface RecipeLine {
  id: number;
  recipeId: number;
  lineNumber: number;
  itemId: number;
  qtyPerBatch: number;
  uom: string;
  item: Item;
}

export interface ProductionOrder {
  id: number;
  companyId: number;
  recipeId: number;
  batchNo: string;
  plannedQty: number;
  actualQty?: number;
  status: 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';
  plannedStartDate: string;
  actualStartDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrderDetail extends ProductionOrder {
  recipe: RecipeDetail;
  materialConsumption: ProductionMaterial[];
  batchAttributes?: BatchAttributes;
}

export interface ProductionMaterial {
  id: number;
  productionOrderId: number;
  itemId: number;
  lotSerialId?: number;
  plannedQty: number;
  consumedQty: number;
  uom: string;
  item: Item;
  lotSerial?: LotSerial;
}

export interface BatchAttributes {
  id: number;
  productionOrderId: number;
  brewDate?: string;
  tankId?: string;
  abv?: number; // Alcohol by volume
  og?: number;  // Original gravity
  fg?: number;  // Final gravity
  fermentationDays?: number;
  notes?: string;
}

export interface QCTest {
  id: number;
  lotSerialId: number;
  testType: string;
  testDate: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED';
  testedBy: number;
  notes?: string;
  createdAt: string;
}

export interface QCResult {
  id: number;
  qcTestId: number;
  parameter: string;
  expectedValue?: string;
  actualValue: string;
  result: 'PASS' | 'FAIL' | 'WARNING';
  notes?: string;
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
