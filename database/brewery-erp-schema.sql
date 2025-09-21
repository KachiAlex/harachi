-- Brewery ERP Database Schema
-- Multi-tenant brewery operations with global inventory, production, and quality control
-- Supports multi-country operations with full traceability

-- ============================================================================
-- CORE MULTI-TENANT STRUCTURE
-- ============================================================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_tier VARCHAR(20) CHECK (subscription_tier IN ('BASIC', 'PREMIUM', 'ENTERPRISE')) DEFAULT 'BASIC',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    country_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    currency_code CHAR(3) NOT NULL, -- ISO 4217
    tax_system VARCHAR(20) CHECK (tax_system IN ('VAT', 'GST', 'SALES_TAX', 'NONE')) DEFAULT 'VAT',
    timezone VARCHAR(50) NOT NULL, -- IANA timezone
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, country_code)
);

CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    branch_type VARCHAR(20) CHECK (branch_type IN ('BREWERY', 'PACKAGING', 'TAPROOM', 'DISTRIBUTION', 'WAREHOUSE')),
    street_address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, branch_code)
);

CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    warehouse_type VARCHAR(20) CHECK (warehouse_type IN ('RAW_MATERIALS', 'WORK_IN_PROCESS', 'FINISHED_GOODS', 'PACKAGING', 'GENERAL')),
    temperature_controlled BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, code)
);

-- ============================================================================
-- ITEM MANAGEMENT & INVENTORY
-- ============================================================================

CREATE TABLE item_classes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES item_classes(id),
    code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    posting_class VARCHAR(50),
    default_warehouse_id INTEGER REFERENCES warehouses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    item_class_id INTEGER REFERENCES item_classes(id),
    sku VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    valuation_method VARCHAR(20) CHECK (valuation_method IN ('STANDARD', 'AVERAGE', 'FIFO', 'LIFO')) DEFAULT 'STANDARD',
    planning_method VARCHAR(20) CHECK (planning_method IN ('MRP', 'REORDER_POINT', 'NONE')) DEFAULT 'NONE',
    posting_class VARCHAR(50),
    tax_category VARCHAR(50),
    default_warehouse_id INTEGER REFERENCES warehouses(id),
    base_uom VARCHAR(10) DEFAULT 'EA',
    sales_uom VARCHAR(10),
    purchase_uom VARCHAR(10),
    active BOOLEAN DEFAULT true,
    stock_item BOOLEAN DEFAULT true,
    global_item BOOLEAN DEFAULT true, -- Available across all countries in company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, sku)
);

-- Country restrictions for items (if not global)
CREATE TABLE item_country_restrictions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, country_id)
);

CREATE TABLE item_uoms (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    uom_code VARCHAR(10) NOT NULL,
    divisible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, uom_code)
);

CREATE TABLE uom_conversions (
    id SERIAL PRIMARY KEY,
    item_uom_from INTEGER REFERENCES item_uoms(id) ON DELETE CASCADE,
    item_uom_to INTEGER REFERENCES item_uoms(id) ON DELETE CASCADE,
    factor DECIMAL(18,6) NOT NULL,
    operation VARCHAR(10) CHECK (operation IN ('MULTIPLY', 'DIVIDE')) DEFAULT 'MULTIPLY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lot_serial (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    lot_no VARCHAR(100) NOT NULL,
    manufacture_date DATE,
    expiry_date DATE,
    supplier_lot VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, lot_no)
);

CREATE TABLE stock_balances (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    lot_serial_id INTEGER REFERENCES lot_serial(id),
    qty_on_hand DECIMAL(18,6) DEFAULT 0,
    qty_allocated DECIMAL(18,6) DEFAULT 0,
    qty_available DECIMAL(18,6) GENERATED ALWAYS AS (qty_on_hand - qty_allocated) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, warehouse_id, COALESCE(lot_serial_id, 0))
);

CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    lot_serial_id INTEGER REFERENCES lot_serial(id),
    trx_type VARCHAR(30) CHECK (trx_type IN ('RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER', 'PRODUCTION_CONSUME', 'PRODUCTION_YIELD')) NOT NULL,
    qty DECIMAL(18,6) NOT NULL,
    unit_cost DECIMAL(18,6),
    reference_type VARCHAR(50), -- 'PO', 'PRODUCTION_ORDER', 'ADJUSTMENT', etc.
    reference_id INTEGER,
    notes TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER, -- Reference to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUPPLIERS & CUSTOMERS
-- ============================================================================

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    supplier_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    street_address TEXT,
    city VARCHAR(100),
    country_code CHAR(2),
    tax_id VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, supplier_code)
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    customer_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    street_address TEXT,
    city VARCHAR(100),
    country_code CHAR(2),
    tax_id VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, customer_code)
);

-- ============================================================================
-- PROCUREMENT
-- ============================================================================

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    po_number VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'CLOSED', 'CANCELLED')) DEFAULT 'DRAFT',
    total_amount DECIMAL(18,2) DEFAULT 0,
    currency_code CHAR(3) DEFAULT 'USD',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, po_number)
);

CREATE TABLE po_lines (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    qty_ordered DECIMAL(18,6) NOT NULL,
    qty_received DECIMAL(18,6) DEFAULT 0,
    unit_cost DECIMAL(18,6) NOT NULL,
    uom VARCHAR(10) NOT NULL,
    line_total DECIMAL(18,2) GENERATED ALWAYS AS (qty_ordered * unit_cost) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(po_id, line_number)
);

CREATE TABLE goods_receipts (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    receipt_date DATE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goods_receipt_lines (
    id SERIAL PRIMARY KEY,
    goods_receipt_id INTEGER REFERENCES goods_receipts(id) ON DELETE CASCADE,
    po_line_id INTEGER REFERENCES po_lines(id) ON DELETE CASCADE,
    qty_received DECIMAL(18,6) NOT NULL,
    lot_no VARCHAR(100),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SALES
-- ============================================================================

CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    so_number VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL,
    requested_delivery_date DATE,
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')) DEFAULT 'DRAFT',
    total_amount DECIMAL(18,2) DEFAULT 0,
    currency_code CHAR(3) DEFAULT 'USD',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, so_number)
);

CREATE TABLE so_lines (
    id SERIAL PRIMARY KEY,
    so_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    qty_ordered DECIMAL(18,6) NOT NULL,
    qty_shipped DECIMAL(18,6) DEFAULT 0,
    unit_price DECIMAL(18,6) NOT NULL,
    uom VARCHAR(10) NOT NULL,
    line_total DECIMAL(18,2) GENERATED ALWAYS AS (qty_ordered * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(so_id, line_number)
);

CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    so_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
    shipment_number VARCHAR(100) NOT NULL,
    ship_date DATE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRODUCTION & MANUFACTURING
-- ============================================================================

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE, -- Finished good
    recipe_code VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    batch_size DECIMAL(18,6) NOT NULL,
    batch_uom VARCHAR(10) DEFAULT 'L',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, recipe_code)
);

CREATE TABLE recipe_lines (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE, -- Ingredient
    qty_per_batch DECIMAL(18,6) NOT NULL,
    uom VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, line_number)
);

CREATE TABLE production_orders (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    batch_no VARCHAR(100) NOT NULL,
    planned_qty DECIMAL(18,6) NOT NULL,
    actual_qty DECIMAL(18,6),
    status VARCHAR(20) CHECK (status IN ('PLANNED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED')) DEFAULT 'PLANNED',
    planned_start_date DATE NOT NULL,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, batch_no)
);

CREATE TABLE production_materials (
    id SERIAL PRIMARY KEY,
    production_order_id INTEGER REFERENCES production_orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    lot_serial_id INTEGER REFERENCES lot_serial(id),
    planned_qty DECIMAL(18,6) NOT NULL,
    consumed_qty DECIMAL(18,6) DEFAULT 0,
    uom VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_attributes (
    id SERIAL PRIMARY KEY,
    production_order_id INTEGER REFERENCES production_orders(id) ON DELETE CASCADE,
    brew_date DATE,
    tank_id VARCHAR(50),
    abv DECIMAL(5,2), -- Alcohol by volume
    og DECIMAL(6,3), -- Original gravity
    fg DECIMAL(6,3), -- Final gravity
    fermentation_days INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- QUALITY CONTROL
-- ============================================================================

CREATE TABLE qc_tests (
    id SERIAL PRIMARY KEY,
    lot_serial_id INTEGER REFERENCES lot_serial(id) ON DELETE CASCADE,
    test_type VARCHAR(100) NOT NULL,
    test_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'PASSED', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING',
    tested_by INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE qc_results (
    id SERIAL PRIMARY KEY,
    qc_test_id INTEGER REFERENCES qc_tests(id) ON DELETE CASCADE,
    parameter VARCHAR(100) NOT NULL,
    expected_value VARCHAR(100),
    actual_value VARCHAR(100) NOT NULL,
    result VARCHAR(20) CHECK (result IN ('PASS', 'FAIL', 'WARNING')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FINANCIAL INTEGRATION
-- ============================================================================

CREATE TABLE gl_accounts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, account_code)
);

CREATE TABLE gl_journals (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    journal_number VARCHAR(100) NOT NULL,
    journal_date DATE NOT NULL,
    source VARCHAR(50), -- 'INVENTORY', 'PRODUCTION', 'SALES', etc.
    reference_type VARCHAR(50),
    reference_id INTEGER,
    description TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, journal_number)
);

CREATE TABLE gl_journal_lines (
    id SERIAL PRIMARY KEY,
    journal_id INTEGER REFERENCES gl_journals(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    gl_account_id INTEGER REFERENCES gl_accounts(id) ON DELETE CASCADE,
    debit_amount DECIMAL(18,2) DEFAULT 0,
    credit_amount DECIMAL(18,2) DEFAULT 0,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(journal_id, line_number)
);

-- ============================================================================
-- MULTI-COUNTRY OPERATIONS
-- ============================================================================

CREATE TABLE inter_country_transfers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    transfer_number VARCHAR(100) NOT NULL,
    from_country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    to_country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    from_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    to_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED')) DEFAULT 'PENDING',
    ship_date DATE NOT NULL,
    expected_receipt_date DATE,
    actual_receipt_date DATE,
    customs_reference VARCHAR(100),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, transfer_number)
);

CREATE TABLE transfer_lines (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER REFERENCES inter_country_transfers(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    lot_serial_id INTEGER REFERENCES lot_serial(id),
    qty_shipped DECIMAL(18,6) NOT NULL,
    qty_received DECIMAL(18,6),
    uom VARCHAR(10) NOT NULL,
    unit_cost DECIMAL(18,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(transfer_id, line_number)
);

-- ============================================================================
-- USER MANAGEMENT & AUDIT
-- ============================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_company_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DOCUMENT MANAGEMENT
-- ============================================================================

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    record_type VARCHAR(100), -- 'ITEM', 'BATCH', 'QC_TEST', etc.
    record_id INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Multi-tenant indexes
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_countries_company ON countries(company_id);
CREATE INDEX idx_branches_country ON branches(country_id);
CREATE INDEX idx_warehouses_branch ON warehouses(branch_id);

-- Item management indexes
CREATE INDEX idx_items_company_sku ON items(company_id, sku);
CREATE INDEX idx_items_class ON items(item_class_id);
CREATE INDEX idx_stock_balances_item_warehouse ON stock_balances(item_id, warehouse_id);
CREATE INDEX idx_stock_balances_warehouse ON stock_balances(warehouse_id);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- Lot traceability indexes
CREATE INDEX idx_lot_serial_item ON lot_serial(item_id);
CREATE INDEX idx_lot_serial_lot_no ON lot_serial(lot_no);

-- Production indexes
CREATE INDEX idx_production_orders_company ON production_orders(company_id);
CREATE INDEX idx_production_orders_batch_no ON production_orders(batch_no);
CREATE INDEX idx_production_orders_status ON production_orders(status);

-- Procurement indexes
CREATE INDEX idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

-- Quality control indexes
CREATE INDEX idx_qc_tests_lot ON qc_tests(lot_serial_id);
CREATE INDEX idx_qc_tests_status ON qc_tests(status);

-- Multi-country operations indexes
CREATE INDEX idx_transfers_company ON inter_country_transfers(company_id);
CREATE INDEX idx_transfers_from_country ON inter_country_transfers(from_country_id);
CREATE INDEX idx_transfers_to_country ON inter_country_transfers(to_country_id);

-- Audit indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update stock balances trigger
CREATE OR REPLACE FUNCTION update_stock_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock balance when inventory transaction is inserted
    INSERT INTO stock_balances (item_id, warehouse_id, lot_serial_id, qty_on_hand)
    VALUES (NEW.item_id, NEW.warehouse_id, NEW.lot_serial_id, NEW.qty)
    ON CONFLICT (item_id, warehouse_id, COALESCE(lot_serial_id, 0))
    DO UPDATE SET 
        qty_on_hand = stock_balances.qty_on_hand + NEW.qty,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_balance
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_balance();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample company
INSERT INTO companies (name, tax_id, slug, subscription_tier) VALUES 
('Global Brewing Co.', 'GB-123456789', 'global-brewing', 'ENTERPRISE');

-- Insert sample countries
INSERT INTO countries (company_id, name, country_code, currency_code, timezone) VALUES 
(1, 'Germany', 'DE', 'EUR', 'Europe/Berlin'),
(1, 'United Kingdom', 'GB', 'GBP', 'Europe/London'),
(1, 'France', 'FR', 'EUR', 'Europe/Paris'),
(1, 'Nigeria', 'NG', 'NGN', 'Africa/Lagos');

-- Insert sample branches
INSERT INTO branches (country_id, name, branch_code, branch_type, city) VALUES 
(1, 'Munich Brewery', 'MUN-BREW', 'BREWERY', 'Munich'),
(1, 'Berlin Packaging', 'BER-PACK', 'PACKAGING', 'Berlin'),
(2, 'London Distribution', 'LON-DIST', 'DISTRIBUTION', 'London'),
(3, 'Paris Distribution', 'PAR-DIST', 'DISTRIBUTION', 'Paris'),
(4, 'Lagos Brewery', 'LAG-BREW', 'BREWERY', 'Lagos');

-- Insert sample warehouses
INSERT INTO warehouses (branch_id, code, name, warehouse_type) VALUES 
(1, 'MUN-RAW', 'Munich Raw Materials', 'RAW_MATERIALS'),
(1, 'MUN-FG', 'Munich Finished Goods', 'FINISHED_GOODS'),
(2, 'BER-PACK', 'Berlin Packaging Materials', 'PACKAGING'),
(3, 'LON-FG', 'London Finished Goods', 'FINISHED_GOODS'),
(4, 'PAR-FG', 'Paris Finished Goods', 'FINISHED_GOODS'),
(5, 'LAG-RAW', 'Lagos Raw Materials', 'RAW_MATERIALS'),
(5, 'LAG-FG', 'Lagos Finished Goods', 'FINISHED_GOODS');

-- Insert sample item classes
INSERT INTO item_classes (company_id, code, description, posting_class) VALUES 
(1, 'RAW', 'Raw Materials', 'RAW_MATERIALS'),
(1, 'PACK', 'Packaging Materials', 'PACKAGING'),
(1, 'FG', 'Finished Goods', 'FINISHED_GOODS');

-- Insert child item classes
INSERT INTO item_classes (company_id, parent_id, code, description, posting_class) VALUES 
(1, 1, 'GRAINS', 'Grains & Malts', 'RAW_MATERIALS'),
(1, 1, 'HOPS', 'Hops', 'RAW_MATERIALS'),
(1, 1, 'YEAST', 'Yeast', 'RAW_MATERIALS'),
(1, 2, 'BOTTLES', 'Bottles', 'PACKAGING'),
(1, 2, 'CANS', 'Cans', 'PACKAGING'),
(1, 3, 'BEER', 'Beer Products', 'FINISHED_GOODS');

-- Insert sample items
INSERT INTO items (company_id, item_class_id, sku, description, base_uom, sales_uom, purchase_uom) VALUES 
(1, 4, 'MALT-PILSNER', 'Pilsner Malt - German', 'KG', 'KG', 'MT'),
(1, 5, 'HOPS-HALLERTAU', 'Hallertau Hops - Noble', 'KG', 'KG', 'KG'),
(1, 6, 'YEAST-LAGER', 'Lager Yeast - Dry', 'KG', 'KG', 'KG'),
(1, 7, 'BOTTLE-500ML', 'Glass Bottle 500ml Brown', 'EA', 'EA', 'CASE'),
(1, 8, 'CAN-500ML', 'Aluminum Can 500ml', 'EA', 'EA', 'CASE'),
(1, 9, 'BEER-PILSNER', 'Pilsner Classic', 'L', 'BOTTLE', 'L'),
(1, 9, 'BEER-IPA', 'IPA Hoppy', 'L', 'BOTTLE', 'L');

COMMENT ON TABLE companies IS 'Multi-tenant companies/organizations';
COMMENT ON TABLE countries IS 'Countries where each company operates';
COMMENT ON TABLE branches IS 'Physical locations (breweries, distribution centers, etc.)';
COMMENT ON TABLE warehouses IS 'Storage locations within branches';
COMMENT ON TABLE item_classes IS 'Hierarchical item classification';
COMMENT ON TABLE items IS 'Master item/SKU data';
COMMENT ON TABLE stock_balances IS 'Real-time inventory balances by item/warehouse/lot';
COMMENT ON TABLE inventory_transactions IS 'All inventory movements with full audit trail';
COMMENT ON TABLE inter_country_transfers IS 'Cross-border inventory transfers';
COMMENT ON TABLE production_orders IS 'Manufacturing batch orders';
COMMENT ON TABLE qc_tests IS 'Quality control testing records';
COMMENT ON TABLE audit_logs IS 'Complete system audit trail';
