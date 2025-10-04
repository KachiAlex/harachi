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
const batchSchema = joi_1.default.object({
    itemId: joi_1.default.string().required(),
    branchId: joi_1.default.string().required(),
    batchNumber: joi_1.default.string().required(),
    lotNumber: joi_1.default.string().optional(),
    productionDate: joi_1.default.date().optional(),
    expiryDate: joi_1.default.date().optional(),
    supplierBatch: joi_1.default.string().optional(),
    quantity: joi_1.default.number().positive().required(),
    uomId: joi_1.default.string().required(),
    qualityStatus: joi_1.default.string().valid('PENDING', 'PASSED', 'FAILED', 'QUARANTINE').default('PENDING'),
    notes: joi_1.default.string().optional()
});
const batchMovementSchema = joi_1.default.object({
    batchId: joi_1.default.string().required(),
    movementType: joi_1.default.string().valid('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT').required(),
    quantity: joi_1.default.number().required(),
    fromBranchId: joi_1.default.string().optional(),
    toBranchId: joi_1.default.string().optional(),
    referenceType: joi_1.default.string().valid('PURCHASE', 'SALE', 'PRODUCTION', 'TRANSFER', 'ADJUSTMENT').required(),
    referenceId: joi_1.default.string().optional(),
    notes: joi_1.default.string().optional()
});
// BATCH MANAGEMENT
// Get all batches for an item
router.get('/batches', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { itemId, branchId, status, expiryDate } = req.query;
        let query = db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .orderBy('createdAt', 'desc');
        if (itemId) {
            query = query.where('itemId', '==', itemId);
        }
        if (branchId) {
            query = query.where('branchId', '==', branchId);
        }
        if (status) {
            query = query.where('qualityStatus', '==', status);
        }
        if (expiryDate) {
            const expiryDateObj = new Date(expiryDate);
            query = query.where('expiryDate', '<=', admin.firestore.Timestamp.fromDate(expiryDateObj));
        }
        const batchesSnapshot = await query.get();
        const batches = batchesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, batches });
    }
    catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get batch by ID
router.get('/batches/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const batchDoc = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .get();
        if (!batchDoc.exists) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        const batchData = batchDoc.data();
        // Get batch movements
        const movementsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('batchMovements')
            .where('batchId', '==', id)
            .orderBy('createdAt', 'desc')
            .get();
        const movements = movementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({
            success: true,
            batch: {
                id: batchDoc.id,
                ...batchData,
                movements
            }
        });
    }
    catch (error) {
        console.error('Get batch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create batch
router.post('/batches', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { error, value } = batchSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { itemId, branchId, batchNumber, lotNumber, productionDate, expiryDate, supplierBatch, quantity, uomId, qualityStatus, notes } = value;
        // Verify item exists and supports batch tracking
        const itemDoc = await db.collection('companies')
            .doc(companyId)
            .collection('itemMasters')
            .doc(itemId)
            .get();
        if (!itemDoc.exists) {
            return res.status(400).json({ error: 'Item not found' });
        }
        const itemData = itemDoc.data();
        if (!itemData?.isBatchTracked) {
            return res.status(400).json({ error: 'Item does not support batch tracking' });
        }
        // Check if batch number already exists for this item
        const existingBatch = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .where('itemId', '==', itemId)
            .where('batchNumber', '==', batchNumber)
            .limit(1)
            .get();
        if (!existingBatch.empty) {
            return res.status(400).json({ error: 'Batch number already exists for this item' });
        }
        // Create batch
        const batchData = {
            itemId,
            branchId,
            batchNumber,
            lotNumber: lotNumber || null,
            productionDate: productionDate ? admin.firestore.Timestamp.fromDate(new Date(productionDate)) : null,
            expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
            supplierBatch: supplierBatch || null,
            quantity,
            uomId,
            qualityStatus,
            notes: notes || '',
            companyId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user?.id
        };
        const batchRef = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .add(batchData);
        // Create initial batch movement
        const movementData = {
            batchId: batchRef.id,
            movementType: 'IN',
            quantity,
            fromBranchId: null,
            toBranchId: branchId,
            referenceType: 'PRODUCTION',
            referenceId: null,
            notes: 'Initial batch creation',
            companyId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user?.id
        };
        await db.collection('companies')
            .doc(companyId)
            .collection('batchMovements')
            .add(movementData);
        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            batch: {
                id: batchRef.id,
                ...batchData
            }
        });
    }
    catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update batch
router.put('/batches/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const { qualityStatus, notes, expiryDate } = req.body;
        const batchDoc = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .get();
        if (!batchDoc.exists) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (qualityStatus) {
            updateData.qualityStatus = qualityStatus;
        }
        if (notes !== undefined) {
            updateData.notes = notes;
        }
        if (expiryDate) {
            updateData.expiryDate = admin.firestore.Timestamp.fromDate(new Date(expiryDate));
        }
        await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .update(updateData);
        res.json({
            success: true,
            message: 'Batch updated successfully'
        });
    }
    catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// BATCH MOVEMENTS
// Create batch movement
router.post('/batches/:id/movements', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const { error, value } = batchMovementSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { movementType, quantity, fromBranchId, toBranchId, referenceType, referenceId, notes } = value;
        // Get batch details
        const batchDoc = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .get();
        if (!batchDoc.exists) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        const batchData = batchDoc.data();
        if (!batchData) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        // Check if batch has sufficient quantity for OUT movements
        if (movementType === 'OUT') {
            const movementsSnapshot = await db.collection('companies')
                .doc(companyId)
                .collection('batchMovements')
                .where('batchId', '==', id)
                .get();
            let currentQuantity = 0;
            for (const movementDoc of movementsSnapshot.docs) {
                const movementData = movementDoc.data();
                if (movementData.movementType === 'IN') {
                    currentQuantity += movementData.quantity;
                }
                else if (movementData.movementType === 'OUT') {
                    currentQuantity -= movementData.quantity;
                }
            }
            if (currentQuantity < quantity) {
                return res.status(400).json({ error: 'Insufficient batch quantity' });
            }
        }
        // Create batch movement
        const movementData = {
            batchId: id,
            movementType,
            quantity,
            fromBranchId: fromBranchId || null,
            toBranchId: toBranchId || batchData.branchId,
            referenceType,
            referenceId: referenceId || null,
            notes: notes || '',
            companyId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user?.id
        };
        const movementRef = await db.collection('companies')
            .doc(companyId)
            .collection('batchMovements')
            .add(movementData);
        res.status(201).json({
            success: true,
            message: 'Batch movement recorded successfully',
            movement: {
                id: movementRef.id,
                ...movementData
            }
        });
    }
    catch (error) {
        console.error('Create batch movement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get batch movements
router.get('/batches/:id/movements', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        const movementsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('batchMovements')
            .where('batchId', '==', id)
            .orderBy('createdAt', 'desc')
            .get();
        const movements = movementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, movements });
    }
    catch (error) {
        console.error('Get batch movements error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// BATCH TRACEABILITY
// Get batch traceability (upstream and downstream)
router.get('/batches/:id/traceability', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;
        // Get batch details
        const batchDoc = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .get();
        if (!batchDoc.exists) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        const batchData = batchDoc.data();
        if (!batchData) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        // Get all movements for this batch
        const movementsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('batchMovements')
            .where('batchId', '==', id)
            .orderBy('createdAt', 'asc')
            .get();
        const movements = movementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Calculate current quantity
        let currentQuantity = 0;
        for (const movement of movements) {
            if (movement.movementType === 'IN') {
                currentQuantity += movement.quantity;
            }
            else if (movement.movementType === 'OUT') {
                currentQuantity -= movement.quantity;
            }
        }
        // Get related batches (if any)
        const relatedBatches = [];
        // Find batches that were created from this batch (downstream)
        const downstreamSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .where('itemId', '==', batchData.itemId)
            .where('supplierBatch', '==', batchData.batchNumber)
            .get();
        for (const doc of downstreamSnapshot.docs) {
            relatedBatches.push({
                id: doc.id,
                ...doc.data(),
                relationship: 'downstream'
            });
        }
        // Find supplier batch (upstream)
        if (batchData.supplierBatch) {
            const upstreamSnapshot = await db.collection('companies')
                .doc(companyId)
                .collection('batches')
                .where('itemId', '==', batchData.itemId)
                .where('batchNumber', '==', batchData.supplierBatch)
                .get();
            for (const doc of upstreamSnapshot.docs) {
                relatedBatches.push({
                    id: doc.id,
                    ...doc.data(),
                    relationship: 'upstream'
                });
            }
        }
        res.json({
            success: true,
            traceability: {
                batch: {
                    id: batchDoc.id,
                    ...batchData,
                    currentQuantity
                },
                movements,
                relatedBatches
            }
        });
    }
    catch (error) {
        console.error('Get batch traceability error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// EXPIRY ALERTS
// Get expiry alerts
router.get('/alerts/expiry', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { daysAhead = 30 } = req.query;
        const alertDate = new Date();
        alertDate.setDate(alertDate.getDate() + parseInt(daysAhead));
        const batchesSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .where('expiryDate', '<=', admin.firestore.Timestamp.fromDate(alertDate))
            .where('expiryDate', '>', admin.firestore.Timestamp.now())
            .get();
        const expiryAlerts = batchesSnapshot.docs.map(doc => {
            const batchData = doc.data();
            const expiryDate = batchData.expiryDate.toDate();
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return {
                id: doc.id,
                ...batchData,
                daysUntilExpiry,
                isExpired: daysUntilExpiry <= 0
            };
        });
        res.json({
            success: true,
            alerts: expiryAlerts,
            count: expiryAlerts.length
        });
    }
    catch (error) {
        console.error('Get expiry alerts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// QUALITY CONTROL
// Update batch quality status
router.put('/batches/:id/quality', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { qualityStatus, testResults, notes } = req.body;
        const companyId = req.user?.companyId;
        if (!qualityStatus || !['PENDING', 'PASSED', 'FAILED', 'QUARANTINE'].includes(qualityStatus)) {
            return res.status(400).json({ error: 'Invalid quality status' });
        }
        const batchDoc = await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .get();
        if (!batchDoc.exists) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        const updateData = {
            qualityStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (testResults) {
            updateData.testResults = testResults;
        }
        if (notes) {
            updateData.qualityNotes = notes;
        }
        await db.collection('companies')
            .doc(companyId)
            .collection('batches')
            .doc(id)
            .update(updateData);
        res.json({
            success: true,
            message: 'Batch quality status updated successfully'
        });
    }
    catch (error) {
        console.error('Update batch quality error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
