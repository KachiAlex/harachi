"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const db = admin.firestore();
// JWT secret
const JWT_SECRET = functions.config().jwt?.secret || 'your-secret-key';
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
// Validation schemas
const customerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    code: joi_1.default.string().min(2).max(20).required(),
    email: joi_1.default.string().email().optional(),
    phone: joi_1.default.string().optional(),
    address: joi_1.default.string().optional()
});
const salesOrderSchema = joi_1.default.object({
    customerId: joi_1.default.string().required(),
    branchId: joi_1.default.string().required(),
    orderDate: joi_1.default.date().required(),
    deliveryDate: joi_1.default.date().optional(),
    items: joi_1.default.array().items(joi_1.default.object({
        itemId: joi_1.default.string().required(),
        uomId: joi_1.default.string().required(),
        quantity: joi_1.default.number().positive().required(),
        unitPrice: joi_1.default.number().positive().required()
    })).min(1).required()
});
const updateSalesOrderSchema = joi_1.default.object({
    status: joi_1.default.string().valid('Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled').optional(),
    deliveryDate: joi_1.default.date().optional(),
    items: joi_1.default.array().items(joi_1.default.object({
        itemId: joi_1.default.string().required(),
        uomId: joi_1.default.string().required(),
        quantity: joi_1.default.number().positive().required(),
        unitPrice: joi_1.default.number().positive().required()
    })).optional()
});
// CUSTOMER ROUTES
// Get all customers for a company
router.get('/customers', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { search } = req.query;
        let query = db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .where('isActive', '==', true);
        const customersSnapshot = await query.get();
        let customers = customersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Filter by search term if provided
        if (search) {
            const searchTerm = search.toLowerCase();
            customers = customers.filter(customer => customer.name.toLowerCase().includes(searchTerm) ||
                customer.code.toLowerCase().includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm)));
        }
        res.json({ success: true, customers });
    }
    catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get customer by ID
router.get('/customers/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const customerDoc = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .doc(id)
            .get();
        if (!customerDoc.exists) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({
            success: true,
            customer: {
                id: customerDoc.id,
                ...customerDoc.data()
            }
        });
    }
    catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create customer
router.post('/customers', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { error, value } = customerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, code, email, phone, address } = value;
        // Check if code already exists
        const existingCustomer = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .where('code', '==', code)
            .limit(1)
            .get();
        if (!existingCustomer.empty) {
            return res.status(400).json({ error: 'Customer code already exists' });
        }
        // Create customer
        const customerData = {
            name,
            code,
            email: email || '',
            phone: phone || '',
            address: address || '',
            companyId: companyId,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const customerRef = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .add(customerData);
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            customer: {
                id: customerRef.id,
                ...customerData
            }
        });
    }
    catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update customer
router.put('/customers/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const { error, value } = customerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const customerDoc = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .doc(id)
            .get();
        if (!customerDoc.exists) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        // Update customer
        await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .doc(id)
            .update({
            ...value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({
            success: true,
            message: 'Customer updated successfully'
        });
    }
    catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// SALES ORDER ROUTES
// Get all sales orders for a company
router.get('/orders', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { branchId, status, customerId, startDate, endDate } = req.query;
        let query = db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .orderBy('orderDate', 'desc');
        if (branchId) {
            query = query.where('branchId', '==', branchId);
        }
        if (status) {
            query = query.where('status', '==', status);
        }
        if (customerId) {
            query = query.where('customerId', '==', customerId);
        }
        if (startDate) {
            query = query.where('orderDate', '>=', new Date(startDate));
        }
        if (endDate) {
            query = query.where('orderDate', '<=', new Date(endDate));
        }
        const ordersSnapshot = await query.get();
        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, orders });
    }
    catch (error) {
        console.error('Get sales orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get sales order by ID
router.get('/orders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const orderDoc = await db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .doc(id)
            .get();
        if (!orderDoc.exists) {
            return res.status(404).json({ error: 'Sales order not found' });
        }
        const orderData = orderDoc.data();
        // Get order items
        const itemsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('salesOrderItems')
            .where('salesOrderId', '==', id)
            .get();
        const items = itemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({
            success: true,
            order: {
                id: orderDoc.id,
                ...orderData,
                items
            }
        });
    }
    catch (error) {
        console.error('Get sales order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create sales order
router.post('/orders', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { error, value } = salesOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { customerId, branchId, orderDate, deliveryDate, items } = value;
        // Verify customer exists
        const customerDoc = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .doc(customerId)
            .get();
        if (!customerDoc.exists) {
            return res.status(400).json({ error: 'Customer not found' });
        }
        // Verify branch exists
        const branchDoc = await db.collection('companies')
            .doc(companyId)
            .collection('branches')
            .doc(branchId)
            .get();
        if (!branchDoc.exists) {
            return res.status(400).json({ error: 'Branch not found' });
        }
        // Generate order number
        const orderNumber = `SO-${Date.now()}`;
        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        // Create sales order
        const orderData = {
            orderNumber,
            customerId,
            branchId,
            companyId: companyId,
            status: 'Draft',
            orderDate: admin.firestore.Timestamp.fromDate(new Date(orderDate)),
            deliveryDate: deliveryDate ? admin.firestore.Timestamp.fromDate(new Date(deliveryDate)) : null,
            totalAmount,
            currency: 'USD', // Default currency
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const orderRef = await db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .add(orderData);
        // Create order items
        const batch = db.batch();
        for (const item of items) {
            const itemRef = db.collection('companies')
                .doc(companyId)
                .collection('salesOrderItems')
                .doc();
            const itemData = {
                salesOrderId: orderRef.id,
                itemId: item.itemId,
                uomId: item.uomId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                companyId: companyId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };
            batch.set(itemRef, itemData);
        }
        await batch.commit();
        res.status(201).json({
            success: true,
            message: 'Sales order created successfully',
            order: {
                id: orderRef.id,
                ...orderData
            }
        });
    }
    catch (error) {
        console.error('Create sales order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update sales order
router.put('/orders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const { error, value } = updateSalesOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const orderDoc = await db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .doc(id)
            .get();
        if (!orderDoc.exists) {
            return res.status(404).json({ error: 'Sales order not found' });
        }
        const orderData = orderDoc.data();
        if (!orderData) {
            return res.status(404).json({ error: 'Sales order not found' });
        }
        // Check if order can be modified
        if (orderData.status !== 'Draft' && !value.status) {
            return res.status(400).json({ error: 'Only draft orders can be modified' });
        }
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (value.status) {
            updateData.status = value.status;
        }
        if (value.deliveryDate) {
            updateData.deliveryDate = admin.firestore.Timestamp.fromDate(new Date(value.deliveryDate));
        }
        // Update items if provided
        if (value.items) {
            // Delete existing items
            const existingItemsSnapshot = await db.collection('companies')
                .doc(companyId)
                .collection('salesOrderItems')
                .where('salesOrderId', '==', id)
                .get();
            const batch = db.batch();
            existingItemsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Add new items
            for (const item of value.items) {
                const itemRef = db.collection('companies')
                    .doc(companyId)
                    .collection('salesOrderItems')
                    .doc();
                const itemData = {
                    salesOrderId: id,
                    itemId: item.itemId,
                    uomId: item.uomId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity * item.unitPrice,
                    companyId: companyId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                };
                batch.set(itemRef, itemData);
            }
            // Recalculate total amount
            const totalAmount = value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            updateData.totalAmount = totalAmount;
            await batch.commit();
        }
        // Update order
        await db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .doc(id)
            .update(updateData);
        res.json({
            success: true,
            message: 'Sales order updated successfully'
        });
    }
    catch (error) {
        console.error('Update sales order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete sales order
router.delete('/orders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const orderDoc = await db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .doc(id)
            .get();
        if (!orderDoc.exists) {
            return res.status(404).json({ error: 'Sales order not found' });
        }
        const orderData = orderDoc.data();
        if (!orderData) {
            return res.status(404).json({ error: 'Sales order not found' });
        }
        // Only allow deletion of draft orders
        if (orderData.status !== 'Draft') {
            return res.status(400).json({ error: 'Only draft orders can be deleted' });
        }
        // Delete order items
        const itemsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('salesOrderItems')
            .where('salesOrderId', '==', id)
            .get();
        const batch = db.batch();
        itemsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        // Delete order
        batch.delete(db.collection('companies')
            .doc(companyId)
            .collection('salesOrders')
            .doc(id));
        await batch.commit();
        res.json({
            success: true,
            message: 'Sales order deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete sales order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
