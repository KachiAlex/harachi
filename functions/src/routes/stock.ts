import express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const router = express.Router();
const db = admin.firestore();

// JWT secret
const JWT_SECRET = functions.config().jwt?.secret || 'your-secret-key';

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation schemas
const stockMovementSchema = Joi.object({
  itemId: Joi.string().required(),
  branchId: Joi.string().required(),
  uomId: Joi.string().required(),
  quantity: Joi.number().required(),
  movementType: Joi.string().valid('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT').required(),
  referenceType: Joi.string().valid('PURCHASE', 'SALE', 'TRANSFER', 'ADJUSTMENT', 'PRODUCTION').required(),
  referenceId: Joi.string().optional(),
  batchNumber: Joi.string().optional(),
  lotNumber: Joi.string().optional(),
  expiryDate: Joi.date().optional(),
  notes: Joi.string().optional()
});

const stockAdjustmentSchema = Joi.object({
  itemId: Joi.string().required(),
  branchId: Joi.string().required(),
  uomId: Joi.string().required(),
  quantity: Joi.number().required(),
  reason: Joi.string().required(),
  notes: Joi.string().optional()
});

// STOCK MOVEMENTS

// Get stock movements for an item
router.get('/movements', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { itemId, branchId, startDate, endDate, movementType, limit = 50 } = req.query;

    let query = db.collection('companies')
      .doc(companyId)
      .collection('stockMovements')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string));

    if (itemId) {
      query = query.where('itemId', '==', itemId);
    }

    if (branchId) {
      query = query.where('branchId', '==', branchId) as any;
    }

    if (movementType) {
      query = query.where('movementType', '==', movementType);
    }

    if (startDate) {
      query = query.where('createdAt', '>=', new Date(startDate as string));
    }

    if (endDate) {
      query = query.where('createdAt', '<=', new Date(endDate as string));
    }

    const movementsSnapshot = await query.get();
    const movements = movementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, movements });

  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create stock movement
router.post('/movements', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { error, value } = stockMovementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      itemId,
      branchId,
      uomId,
      quantity,
      movementType,
      referenceType,
      referenceId,
      batchNumber,
      lotNumber,
      expiryDate,
      notes
    } = value;

    // Verify item exists
    const itemDoc = await db.collection('companies')
      .doc(companyId)
      .collection('items')
      .doc(itemId)
      .get();

    if (!itemDoc.exists) {
      return res.status(400).json({ error: 'Item not found' });
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

    // Get current stock balance
    const stockBalanceDoc = await db.collection('companies')
      .doc(companyId)
      .collection('stockBalances')
      .where('itemId', '==', itemId)
      .where('branchId', '==', branchId)
      .where('uomId', '==', uomId)
      .limit(1)
      .get();

    let currentQuantity = 0;
    let stockBalanceId = null;

    if (!stockBalanceDoc.empty) {
      const stockData = stockBalanceDoc.docs[0].data();
      currentQuantity = stockData.quantity || 0;
      stockBalanceId = stockBalanceDoc.docs[0].id;
    }

    // Calculate new quantity based on movement type
    let newQuantity = currentQuantity;
    if (movementType === 'IN' || movementType === 'ADJUSTMENT') {
      newQuantity += quantity;
    } else if (movementType === 'OUT') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    }

    // Create stock movement record
    const movementData = {
      itemId,
      branchId,
      uomId,
      quantity,
      movementType,
      referenceType,
      referenceId: referenceId || null,
      batchNumber: batchNumber || null,
      lotNumber: lotNumber || null,
      expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
      notes: notes || '',
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.id
    };

    const movementRef = await db.collection('companies')
      .doc(companyId)
      .collection('stockMovements')
      .add(movementData);

    // Update or create stock balance
    const stockBalanceData = {
      itemId,
      branchId,
      uomId,
      quantity: newQuantity,
      reservedQuantity: 0, // Will be updated separately
      availableQuantity: newQuantity,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      companyId
    };

    if (stockBalanceId) {
      await db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .doc(stockBalanceId)
        .update(stockBalanceData);
    } else {
      await db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .add(stockBalanceData);
    }

    res.status(201).json({
      success: true,
      message: 'Stock movement recorded successfully',
      movement: {
        id: movementRef.id,
        ...movementData
      },
      newStockQuantity: newQuantity
    });

  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STOCK ADJUSTMENTS

// Create stock adjustment
router.post('/adjustments', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { error, value } = stockAdjustmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { itemId, branchId, uomId, quantity, reason, notes } = value;

    // Verify item exists
    const itemDoc = await db.collection('companies')
      .doc(companyId)
      .collection('items')
      .doc(itemId)
      .get();

    if (!itemDoc.exists) {
      return res.status(400).json({ error: 'Item not found' });
    }

    // Get current stock balance
    const stockBalanceDoc = await db.collection('companies')
      .doc(companyId)
      .collection('stockBalances')
      .where('itemId', '==', itemId)
      .where('branchId', '==', branchId)
      .where('uomId', '==', uomId)
      .limit(1)
      .get();

    const currentQuantity = stockBalanceDoc.empty ? 0 : stockBalanceDoc.docs[0].data().quantity || 0;
    const stockBalanceId = stockBalanceDoc.empty ? null : stockBalanceDoc.docs[0].id;

    // Create adjustment movement
    const adjustmentData = {
      itemId,
      branchId,
      uomId,
      quantity,
      movementType: 'ADJUSTMENT',
      referenceType: 'ADJUSTMENT',
      referenceId: null,
      batchNumber: null,
      lotNumber: null,
      expiryDate: null,
      notes: `Adjustment: ${reason}. ${notes || ''}`,
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.id
    };

    const adjustmentRef = await db.collection('companies')
      .doc(companyId)
      .collection('stockMovements')
      .add(adjustmentData);

    // Update stock balance
    const newQuantity = currentQuantity + quantity;
    const stockBalanceData = {
      itemId,
      branchId,
      uomId,
      quantity: newQuantity,
      reservedQuantity: 0,
      availableQuantity: newQuantity,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      companyId
    };

    if (stockBalanceId) {
      await db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .doc(stockBalanceId)
        .update(stockBalanceData);
    } else {
      await db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .add(stockBalanceData);
    }

    res.status(201).json({
      success: true,
      message: 'Stock adjustment recorded successfully',
      adjustment: {
        id: adjustmentRef.id,
        ...adjustmentData
      },
      newStockQuantity: newQuantity
    });

  } catch (error) {
    console.error('Create stock adjustment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STOCK TRANSFERS

// Create stock transfer between branches
router.post('/transfers', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { itemId, fromBranchId, toBranchId, uomId, quantity, notes } = req.body;

    if (!itemId || !fromBranchId || !toBranchId || !uomId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fromBranchId === toBranchId) {
      return res.status(400).json({ error: 'Source and destination branches cannot be the same' });
    }

    // Check if source branch has sufficient stock
    const sourceStockDoc = await db.collection('companies')
      .doc(companyId)
      .collection('stockBalances')
      .where('itemId', '==', itemId)
      .where('branchId', '==', fromBranchId)
      .where('uomId', '==', uomId)
      .limit(1)
      .get();

    if (sourceStockDoc.empty) {
      return res.status(400).json({ error: 'No stock found in source branch' });
    }

    const sourceStock = sourceStockDoc.docs[0].data();
    if (sourceStock.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock in source branch' });
    }

    // Create transfer record
    const transferData = {
      itemId,
      fromBranchId,
      toBranchId,
      uomId,
      quantity,
      status: 'PENDING',
      notes: notes || '',
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.id
    };

    const transferRef = await db.collection('companies')
      .doc(companyId)
      .collection('stockTransfers')
      .add(transferData);

    // Create OUT movement for source branch
    const outMovementData = {
      itemId,
      branchId: fromBranchId,
      uomId,
      quantity: -quantity, // Negative for OUT
      movementType: 'OUT',
      referenceType: 'TRANSFER',
      referenceId: transferRef.id,
      batchNumber: null,
      lotNumber: null,
      expiryDate: null,
      notes: `Transfer to ${toBranchId}`,
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.id
    };

    await db.collection('companies')
      .doc(companyId)
      .collection('stockMovements')
      .add(outMovementData);

    // Create IN movement for destination branch
    const inMovementData = {
      itemId,
      branchId: toBranchId,
      uomId,
      quantity: quantity, // Positive for IN
      movementType: 'IN',
      referenceType: 'TRANSFER',
      referenceId: transferRef.id,
      batchNumber: null,
      lotNumber: null,
      expiryDate: null,
      notes: `Transfer from ${fromBranchId}`,
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user?.id
    };

    await db.collection('companies')
      .doc(companyId)
      .collection('stockMovements')
      .add(inMovementData);

    // Update stock balances
    const batch = db.batch();

    // Update source branch stock
    const sourceStockRef = db.collection('companies')
      .doc(companyId)
      .collection('stockBalances')
      .doc(sourceStockDoc.docs[0].id);

    batch.update(sourceStockRef, {
      quantity: sourceStock.quantity - quantity,
      availableQuantity: sourceStock.quantity - quantity,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update or create destination branch stock
    const destStockDoc = await db.collection('companies')
      .doc(companyId)
      .collection('stockBalances')
      .where('itemId', '==', itemId)
      .where('branchId', '==', toBranchId)
      .where('uomId', '==', uomId)
      .limit(1)
      .get();

    if (destStockDoc.empty) {
      const destStockRef = db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .doc();

      batch.set(destStockRef, {
        itemId,
        branchId: toBranchId,
        uomId,
        quantity: quantity,
        reservedQuantity: 0,
        availableQuantity: quantity,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        companyId
      });
    } else {
      const destStockRef = db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .doc(destStockDoc.docs[0].id);

      const destStock = destStockDoc.docs[0].data();
      batch.update(destStockRef, {
        quantity: destStock.quantity + quantity,
        availableQuantity: destStock.quantity + quantity,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();

    res.status(201).json({
      success: true,
      message: 'Stock transfer created successfully',
      transfer: {
        id: transferRef.id,
        ...transferData
      }
    });

  } catch (error) {
    console.error('Create stock transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STOCK REPORTS

// Get stock summary by branch
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { branchId } = req.query;

    let query = db.collection('companies')
      .doc(companyId)
      .collection('stockBalances');

    if (branchId) {
      query = query.where('branchId', '==', branchId) as any;
    }

    const stockSnapshot = await query.get();
    const stockBalances = stockSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate summary statistics
    const totalItems = stockBalances.length;
    const totalValue = stockBalances.reduce((sum: number, balance: any) => {
      // This would need item pricing data to calculate actual value
      return sum + (balance.quantity || 0);
    }, 0);

    const lowStockItems = stockBalances.filter((balance: any) => balance.quantity < 10); // Assuming 10 is low stock threshold

    res.json({
      success: true,
      summary: {
        totalItems,
        totalValue,
        lowStockItems: lowStockItems.length,
        stockBalances
      }
    });

  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
