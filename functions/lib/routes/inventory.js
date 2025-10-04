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
const itemClassSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    code: joi_1.default.string().min(2).max(10).required(),
    parentId: joi_1.default.string().optional()
});
const itemSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    code: joi_1.default.string().min(2).max(20).required(),
    description: joi_1.default.string().optional(),
    itemClassId: joi_1.default.string().required()
});
const uomSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    code: joi_1.default.string().min(2).max(10).required()
});
const itemUOMSchema = joi_1.default.object({
    itemId: joi_1.default.string().required(),
    uomId: joi_1.default.string().required(),
    conversionFactor: joi_1.default.number().positive().required(),
    isBaseUOM: joi_1.default.boolean().required()
});
// ITEM CLASSES ROUTES
// Get all item classes for a company
router.get('/item-classes', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const itemClassesSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('itemClasses')
            .where('isActive', '==', true)
            .get();
        const itemClasses = itemClassesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, itemClasses });
    }
    catch (error) {
        console.error('Get item classes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create item class
router.post('/item-classes', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { error, value } = itemClassSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, code, parentId } = value;
        // Check if code already exists
        const existingClass = await db.collection('companies')
            .doc(companyId)
            .collection('itemClasses')
            .where('code', '==', code)
            .limit(1)
            .get();
        if (!existingClass.empty) {
            return res.status(400).json({ error: 'Item class code already exists' });
        }
        // Create item class
        const itemClassData = {
            name,
            code,
            parentId: parentId || null,
            companyId,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const itemClassRef = await db.collection('companies')
            .doc(companyId)
            .collection('itemClasses')
            .add(itemClassData);
        res.status(201).json({
            success: true,
            message: 'Item class created successfully',
            itemClass: {
                id: itemClassRef.id,
                ...itemClassData
            }
        });
    }
    catch (error) {
        console.error('Create item class error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ITEMS ROUTES
// Get all items for a company
router.get('/items', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { itemClassId, search } = req.query;
        let query = db.collection('companies')
            .doc(companyId)
            .collection('items')
            .where('isActive', '==', true);
        if (itemClassId) {
            query = query.where('itemClassId', '==', itemClassId);
        }
        const itemsSnapshot = await query.get();
        let items = itemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Filter by search term if provided
        if (search) {
            const searchTerm = search.toLowerCase();
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm) ||
                item.code.toLowerCase().includes(searchTerm));
        }
        res.json({ success: true, items });
    }
    catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get item by ID
router.get('/items/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const itemDoc = await db.collection('companies')
            .doc(companyId)
            .collection('items')
            .doc(id)
            .get();
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        const itemData = itemDoc.data();
        // Get item UOMs
        const uomsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('itemUOMs')
            .where('itemId', '==', id)
            .get();
        const uoms = uomsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({
            success: true,
            item: {
                id: itemDoc.id,
                ...itemData,
                uoms
            }
        });
    }
    catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create item
router.post('/items', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { error, value } = itemSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, code, description, itemClassId } = value;
        // Check if code already exists
        const existingItem = await db.collection('companies')
            .doc(companyId)
            .collection('items')
            .where('code', '==', code)
            .limit(1)
            .get();
        if (!existingItem.empty) {
            return res.status(400).json({ error: 'Item code already exists' });
        }
        // Verify item class exists
        const itemClassDoc = await db.collection('companies')
            .doc(companyId)
            .collection('itemClasses')
            .doc(itemClassId)
            .get();
        if (!itemClassDoc.exists) {
            return res.status(400).json({ error: 'Item class not found' });
        }
        // Create item
        const itemData = {
            name,
            code,
            description: description || '',
            itemClassId,
            companyId,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const itemRef = await db.collection('companies')
            .doc(companyId)
            .collection('items')
            .add(itemData);
        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item: {
                id: itemRef.id,
                ...itemData
            }
        });
    }
    catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update item
router.put('/items/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const { error, value } = itemSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const itemDoc = await db.collection('companies')
            .doc(companyId)
            .collection('items')
            .doc(id)
            .get();
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        // Update item
        await db.collection('companies')
            .doc(companyId)
            .collection('items')
            .doc(id)
            .update({
            ...value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({
            success: true,
            message: 'Item updated successfully'
        });
    }
    catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// UOM ROUTES
// Get all UOMs for a company
router.get('/uoms', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const uomsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('uoms')
            .where('isActive', '==', true)
            .get();
        const uoms = uomsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, uoms });
    }
    catch (error) {
        console.error('Get UOMs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create UOM
router.post('/uoms', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { error, value } = uomSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, code } = value;
        // Check if code already exists
        const existingUOM = await db.collection('companies')
            .doc(companyId)
            .collection('uoms')
            .where('code', '==', code)
            .limit(1)
            .get();
        if (!existingUOM.empty) {
            return res.status(400).json({ error: 'UOM code already exists' });
        }
        // Create UOM
        const uomData = {
            name,
            code,
            companyId,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const uomRef = await db.collection('companies')
            .doc(companyId)
            .collection('uoms')
            .add(uomData);
        res.status(201).json({
            success: true,
            message: 'UOM created successfully',
            uom: {
                id: uomRef.id,
                ...uomData
            }
        });
    }
    catch (error) {
        console.error('Create UOM error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ITEM UOM ROUTES
// Get item UOMs
router.get('/items/:itemId/uoms', verifyToken, async (req, res) => {
    try {
        const { itemId } = req.params;
        const companyId = req.user?.companyId;
        const itemUOMsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('itemUOMs')
            .where('itemId', '==', itemId)
            .get();
        const itemUOMs = itemUOMsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, itemUOMs });
    }
    catch (error) {
        console.error('Get item UOMs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add UOM to item
router.post('/items/:itemId/uoms', verifyToken, async (req, res) => {
    try {
        const { itemId } = req.params;
        const companyId = req.user?.companyId;
        const { error, value } = itemUOMSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { uomId, conversionFactor, isBaseUOM } = value;
        // Verify item exists
        const itemDoc = await db.collection('companies')
            .doc(companyId)
            .collection('items')
            .doc(itemId)
            .get();
        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        // Verify UOM exists
        const uomDoc = await db.collection('companies')
            .doc(companyId)
            .collection('uoms')
            .doc(uomId)
            .get();
        if (!uomDoc.exists) {
            return res.status(404).json({ error: 'UOM not found' });
        }
        // Check if UOM already exists for this item
        const existingItemUOM = await db.collection('companies')
            .doc(companyId)
            .collection('itemUOMs')
            .where('itemId', '==', itemId)
            .where('uomId', '==', uomId)
            .limit(1)
            .get();
        if (!existingItemUOM.empty) {
            return res.status(400).json({ error: 'UOM already exists for this item' });
        }
        // If this is set as base UOM, unset other base UOMs for this item
        if (isBaseUOM) {
            const baseUOMsSnapshot = await db.collection('companies')
                .doc(companyId)
                .collection('itemUOMs')
                .where('itemId', '==', itemId)
                .where('isBaseUOM', '==', true)
                .get();
            const batch = db.batch();
            baseUOMsSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isBaseUOM: false });
            });
            await batch.commit();
        }
        // Create item UOM
        const itemUOMData = {
            itemId,
            uomId,
            conversionFactor,
            isBaseUOM,
            companyId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const itemUOMRef = await db.collection('companies')
            .doc(companyId)
            .collection('itemUOMs')
            .add(itemUOMData);
        res.status(201).json({
            success: true,
            message: 'UOM added to item successfully',
            itemUOM: {
                id: itemUOMRef.id,
                ...itemUOMData
            }
        });
    }
    catch (error) {
        console.error('Add item UOM error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// STOCK BALANCE ROUTES
// Get stock balances for a branch
router.get('/stock-balances', verifyToken, async (req, res) => {
    try {
        const { branchId } = req.query;
        const companyId = req.user?.companyId;
        if (!branchId) {
            return res.status(400).json({ error: 'Branch ID required' });
        }
        const stockBalancesSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('stockBalances')
            .where('branchId', '==', branchId)
            .get();
        const stockBalances = stockBalancesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, stockBalances });
    }
    catch (error) {
        console.error('Get stock balances error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
