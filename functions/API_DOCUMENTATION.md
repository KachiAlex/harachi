# Harachi ERP API Documentation

## Base URL
```
https://your-project.cloudfunctions.net/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "error": "Error message (if any)"
}
```

## Error Codes
- `400` - Bad Request (validation errors, missing parameters)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Companies Management

### Get All Companies
**GET** `/admin/companies`
- **Access**: Super Admin only
- **Response**: List of companies with user and country counts

### Get Company by ID
**GET** `/admin/companies/:id`
- **Access**: Super Admin or Company Admin
- **Response**: Company details with countries and users

### Create Company
**POST** `/admin/companies`
- **Access**: Super Admin only
- **Body**:
  ```json
  {
    "name": "Company Name",
    "code": "COMP001",
    "description": "Optional description"
  }
  ```

### Update Company
**PUT** `/admin/companies/:id`
- **Access**: Super Admin or Company Admin
- **Body**: Same as create

### Delete Company
**DELETE** `/admin/companies/:id`
- **Access**: Super Admin only
- **Note**: Soft delete (marks as inactive)

### Get Company Countries
**GET** `/admin/companies/:id/countries`
- **Access**: Super Admin or Company Admin

### Create Country
**POST** `/admin/companies/:id/countries`
- **Access**: Super Admin or Company Admin
- **Body**:
  ```json
  {
    "name": "Country Name",
    "code": "US"
  }
  ```

---

## User Management

### Get All Users
**GET** `/admin/users?companyId=:companyId`
- **Access**: Super Admin, Company Admin, or Branch Admin
- **Query Parameters**:
  - `companyId` (optional): Filter by company

### Get User by ID
**GET** `/admin/users/:id`
- **Access**: Self, Super Admin, Company Admin, or Branch Admin

### Create User
**POST** `/admin/users`
- **Access**: Super Admin or Company Admin
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123",
    "companyId": "company-id",
    "roles": ["Branch Admin", "Inventory Officer"]
  }
  ```

### Update User
**PUT** `/admin/users/:id`
- **Access**: Self, Super Admin, or Company Admin
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["Branch Admin"],
    "isActive": true
  }
  ```

### Delete User
**DELETE** `/admin/users/:id`
- **Access**: Super Admin or Company Admin
- **Note**: Soft delete (marks as inactive)

### Change Password
**PUT** `/admin/users/:id/password`
- **Access**: Self, Super Admin, or Company Admin
- **Body**:
  ```json
  {
    "currentPassword": "old-password",
    "newPassword": "new-password"
  }
  ```

---

## Inventory Management

### Item Classes

#### Get All Item Classes
**GET** `/inventory/item-classes`
- **Access**: All authenticated users
- **Response**: List of item classes for the user's company

#### Create Item Class
**POST** `/inventory/item-classes`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "name": "Raw Materials",
    "code": "RAW",
    "parentId": "parent-class-id" // optional
  }
  ```

### Items

#### Get All Items
**GET** `/inventory/items?itemClassId=:id&search=:term`
- **Access**: All authenticated users
- **Query Parameters**:
  - `itemClassId` (optional): Filter by item class
  - `search` (optional): Search by name or code

#### Get Item by ID
**GET** `/inventory/items/:id`
- **Access**: All authenticated users
- **Response**: Item details with UOMs

#### Create Item
**POST** `/inventory/items`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "name": "Item Name",
    "code": "ITEM001",
    "description": "Item description",
    "itemClassId": "class-id"
  }
  ```

#### Update Item
**PUT** `/inventory/items/:id`
- **Access**: Company Admin or Branch Admin
- **Body**: Same as create

### UOMs (Units of Measure)

#### Get All UOMs
**GET** `/inventory/uoms`
- **Access**: All authenticated users

#### Create UOM
**POST** `/inventory/uoms`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "name": "Kilogram",
    "code": "KG"
  }
  ```

### Item UOMs

#### Get Item UOMs
**GET** `/inventory/items/:itemId/uoms`
- **Access**: All authenticated users

#### Add UOM to Item
**POST** `/inventory/items/:itemId/uoms`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "uomId": "uom-id",
    "conversionFactor": 1000,
    "isBaseUOM": true
  }
  ```

### Stock Balances

#### Get Stock Balances
**GET** `/inventory/stock-balances?branchId=:id`
- **Access**: All authenticated users
- **Query Parameters**:
  - `branchId` (required): Branch ID to get stock for

---

## Sales Management

### Customers

#### Get All Customers
**GET** `/sales/customers?search=:term`
- **Access**: All authenticated users
- **Query Parameters**:
  - `search` (optional): Search by name, code, or email

#### Get Customer by ID
**GET** `/sales/customers/:id`
- **Access**: All authenticated users

#### Create Customer
**POST** `/sales/customers`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "name": "Customer Name",
    "code": "CUST001",
    "email": "customer@example.com",
    "phone": "+1234567890",
    "address": "Customer Address"
  }
  ```

#### Update Customer
**PUT** `/sales/customers/:id`
- **Access**: Company Admin or Branch Admin
- **Body**: Same as create

### Sales Orders

#### Get All Sales Orders
**GET** `/sales/orders?branchId=:id&status=:status&customerId=:id&startDate=:date&endDate=:date`
- **Access**: All authenticated users
- **Query Parameters**:
  - `branchId` (optional): Filter by branch
  - `status` (optional): Filter by status
  - `customerId` (optional): Filter by customer
  - `startDate` (optional): Filter from date
  - `endDate` (optional): Filter to date

#### Get Sales Order by ID
**GET** `/sales/orders/:id`
- **Access**: All authenticated users
- **Response**: Order details with items

#### Create Sales Order
**POST** `/sales/orders`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "customerId": "customer-id",
    "branchId": "branch-id",
    "orderDate": "2024-01-01",
    "deliveryDate": "2024-01-05",
    "items": [
      {
        "itemId": "item-id",
        "uomId": "uom-id",
        "quantity": 10,
        "unitPrice": 25.50
      }
    ]
  }
  ```

#### Update Sales Order
**PUT** `/sales/orders/:id`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "status": "Confirmed",
    "deliveryDate": "2024-01-05",
    "items": [...] // optional, replaces all items
  }
  ```

#### Delete Sales Order
**DELETE** `/sales/orders/:id`
- **Access**: Company Admin or Branch Admin
- **Note**: Only draft orders can be deleted

---

## Purchase Management

### Vendors

#### Get All Vendors
**GET** `/purchases/vendors?search=:term`
- **Access**: All authenticated users
- **Query Parameters**:
  - `search` (optional): Search by name, code, or email

#### Get Vendor by ID
**GET** `/purchases/vendors/:id`
- **Access**: All authenticated users

#### Create Vendor
**POST** `/purchases/vendors`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "name": "Vendor Name",
    "code": "VEND001",
    "email": "vendor@example.com",
    "phone": "+1234567890",
    "address": "Vendor Address"
  }
  ```

#### Update Vendor
**PUT** `/purchases/vendors/:id`
- **Access**: Company Admin or Branch Admin
- **Body**: Same as create

### Purchase Orders

#### Get All Purchase Orders
**GET** `/purchases/orders?branchId=:id&status=:status&vendorId=:id&startDate=:date&endDate=:date`
- **Access**: All authenticated users
- **Query Parameters**: Same as sales orders

#### Get Purchase Order by ID
**GET** `/purchases/orders/:id`
- **Access**: All authenticated users
- **Response**: Order details with items

#### Create Purchase Order
**POST** `/purchases/orders`
- **Access**: Company Admin or Branch Admin
- **Body**:
  ```json
  {
    "vendorId": "vendor-id",
    "branchId": "branch-id",
    "orderDate": "2024-01-01",
    "expectedDate": "2024-01-05",
    "items": [
      {
        "itemId": "item-id",
        "uomId": "uom-id",
        "quantity": 10,
        "unitPrice": 25.50
      }
    ]
  }
  ```

#### Update Purchase Order
**PUT** `/purchases/orders/:id`
- **Access**: Company Admin or Branch Admin
- **Body**: Same format as sales orders

#### Delete Purchase Order
**DELETE** `/purchases/orders/:id`
- **Access**: Company Admin or Branch Admin
- **Note**: Only draft orders can be deleted

---

## Status Codes

### Sales Order Status
- `Draft` - Order is being prepared
- `Confirmed` - Order has been confirmed
- `Shipped` - Order has been shipped
- `Delivered` - Order has been delivered
- `Cancelled` - Order has been cancelled

### Purchase Order Status
- `Draft` - Order is being prepared
- `Sent` - Order has been sent to vendor
- `Received` - Order has been received
- `Cancelled` - Order has been cancelled

---

## Role-Based Access Control

### Super Admin
- Full system access
- Can manage all companies
- Can create and manage users across all companies

### Company Admin
- Can manage their company
- Can create and manage users within their company
- Can manage inventory, sales, and purchases

### Branch Admin
- Can manage their branch
- Can view and manage inventory, sales, and purchases for their branch

### Inventory Officer
- Can manage inventory items
- Can view sales and purchase orders

### Accountant
- Can view financial reports
- Can view sales and purchase orders

### Auditor
- Read-only access to all data within their scope

---

## Rate Limiting
- 1000 requests per hour per user
- 100 requests per minute per user

## Pagination
For endpoints that return lists, use:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Example: `/sales/orders?page=2&limit=50`
