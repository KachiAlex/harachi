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
const itemMasterSchema = Joi.object({
  name: Joi.string().min(2).required(),
  code: Joi.string().min(2).max(20).required(),
  description: Joi.string().optional(),
  itemClassId: Joi.string().required(),
  category: Joi.string().optional(),
  brand: Joi.string().optional(),
  model: Joi.string().optional(),
  specifications: Joi.object().optional(),
  isActive: Joi.boolean().default(true),
  isSerialized: Joi.boolean().default(false),
  isBatchTracked: Joi.boolean().default(false),
  hasExpiry: Joi.boolean().default(false),
  shelfLife: Joi.number().optional(), // in days
  reorderPoint: Joi.number().optional(),
  reorderQuantity: Joi.number().optional(),
  unitCost: Joi.number().optional(),
  unitPrice: Joi.number().optional(),
  taxRate: Joi.number().optional(),
  uoms: Joi.array().items(Joi.object({
    uomId: Joi.string().required(),
    conversionFactor: Joi.number().positive().required(),
    isBaseUOM: Joi.boolean().required(),
    unitCost: Joi.number().optional(),
    unitPrice: Joi.number().optional()
  })).min(1).required()
});

const updateItemMasterSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  brand: Joi.string().optional(),
  model: Joi.string().optional(),
  specifications: Joi.object().optional(),
  isActive: Joi.boolean().optional(),
  isSerialized: Joi.boolean().optional(),
  isBatchTracked: Joi.boolean().optional(),
  hasExpiry: Joi.boolean().optional(),
  shelfLife: Joi.number().optional(),
  reorderPoint: Joi.number().optional(),
  reorderQuantity: Joi.number().optional(),
  unitCost: Joi.number().optional(),
  unitPrice: Joi.number().optional(),
  taxRate: Joi.number().optional(),
  uoms: Joi.array().items(Joi.object({
    uomId: Joi.string().required(),
    conversionFactor: Joi.number().positive().required(),
    isBaseUOM: Joi.boolean().required(),
    unitCost: Joi.number().optional(),
    unitPrice: Joi.number().optional()
  })).optional()
});

// ITEM MASTER ROUTES

// Get all item masters with full details
router.get('/', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { itemClassId, search, isActive = true } = req.query;

    let query = db.collection('companies')
      .doc(companyId)
      .collection('itemMasters')
      .where('isActive', '==', isActive === 'true');

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
      const searchTerm = (search as string).toLowerCase();
      items = items.filter(item => 
        (item as any).name.toLowerCase().includes(searchTerm) ||
        (item as any).code.toLowerCase().includes(searchTerm) ||
        ((item as any).description && (item as any).description.toLowerCase().includes(searchTerm))
      );
    }

    // Get UOMs for each item
    for (const item of items) {
      const uomsSnapshot = await db.collection('companies')
        .doc(companyId)
        .collection('itemUOMs')
        .where('itemId', '==', item.id)
        .get();

      (item as any).uoms = uomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    res.json({ success: true, items });

  } catch (error) {
    console.error('Get item masters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get item master by ID with full details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const itemDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('itemMasters')
      .doc(id)
      .get();

    if (!itemDoc.exists) {
      return res.status(404).json({ error: 'Item master not found' });
    }

    const itemData = itemDoc.data();

    // Get UOMs
    const uomsSnapshot = await db.collection('companies')
      .doc(companyId!)
      .collection('itemUOMs')
      .where('itemId', '==', id)
      .get();

    const uoms = uomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get stock balances across all branches
    const stockBalancesSnapshot = await db.collection('companies')
      .doc(companyId!)
      .collection('stockBalances')
      .where('itemId', '==', id)
      .get();

    const stockBalances = stockBalancesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      item: {
        id: itemDoc.id,
        ...itemData,
        uoms,
        stockBalances
      }
    });

  } catch (error) {
    console.error('Get item master error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create item master
router.post('/', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { error, value } = itemMasterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { uoms, ...itemData } = value;

    // Check if code already exists
    const existingItem = await db.collection('companies')
      .doc(companyId)
      .collection('itemMasters')
      .where('code', '==', itemData.code)
      .limit(1)
      .get();

    if (!existingItem.empty) {
      return res.status(400).json({ error: 'Item code already exists' });
    }

    // Verify item class exists
    const itemClassDoc = await db.collection('companies')
      .doc(companyId)
      .collection('itemClasses')
      .doc(itemData.itemClassId)
      .get();

    if (!itemClassDoc.exists) {
      return res.status(400).json({ error: 'Item class not found' });
    }

    // Create item master
    const masterData = {
      ...itemData,
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const itemRef = await db.collection('companies')
      .doc(companyId)
      .collection('itemMasters')
      .add(masterData);

    // Create UOMs
    const batch = db.batch();
    for (const uom of uoms) {
      const uomRef = db.collection('companies')
        .doc(companyId)
        .collection('itemUOMs')
        .doc();

      const uomData = {
        itemId: itemRef.id,
        uomId: uom.uomId,
        conversionFactor: uom.conversionFactor,
        isBaseUOM: uom.isBaseUOM,
        unitCost: uom.unitCost || null,
        unitPrice: uom.unitPrice || null,
        companyId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(uomRef, uomData);
    }

    await batch.commit();

    res.status(201).json({
      success: true,
      message: 'Item master created successfully',
      item: {
        id: itemRef.id,
        ...masterData
      }
    });

  } catch (error) {
    console.error('Create item master error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update item master
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { error, value } = updateItemMasterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { uoms, ...updateData } = value;

    const itemDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('itemMasters')
      .doc(id)
      .get();

    if (!itemDoc.exists) {
      return res.status(404).json({ error: 'Item master not found' });
    }

    // Update item master
    await db.collection('companies')
      .doc(companyId!)
      .collection('itemMasters')
      .doc(id)
      .update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Update UOMs if provided
    if (uoms) {
      // Delete existing UOMs
      const existingUOMsSnapshot = await db.collection('companies')
        .doc(companyId!)
        .collection('itemUOMs')
        .where('itemId', '==', id)
        .get();

      const batch = db.batch();
      existingUOMsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new UOMs
      for (const uom of uoms) {
        const uomRef = db.collection('companies')
          .doc(companyId!)
          .collection('itemUOMs')
          .doc();

        const uomData = {
          itemId: id,
          uomId: uom.uomId,
          conversionFactor: uom.conversionFactor,
          isBaseUOM: uom.isBaseUOM,
          unitCost: uom.unitCost || null,
          unitPrice: uom.unitPrice || null,
          companyId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.set(uomRef, uomData);
      }

      await batch.commit();
    }

    res.json({
      success: true,
      message: 'Item master updated successfully'
    });

  } catch (error) {
    console.error('Update item master error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete item master (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const itemDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('itemMasters')
      .doc(id)
      .get();

    if (!itemDoc.exists) {
      return res.status(404).json({ error: 'Item master not found' });
    }

    // Check if item has stock
    const stockBalancesSnapshot = await db.collection('companies')
      .doc(companyId!)
      .collection('stockBalances')
      .where('itemId', '==', id)
      .get();

    const hasStock = stockBalancesSnapshot.docs.some(doc => doc.data().quantity > 0);

    if (hasStock) {
      return res.status(400).json({ error: 'Cannot delete item with existing stock' });
    }

    // Soft delete
    await db.collection('companies')
      .doc(companyId!)
      .collection('itemMasters')
      .doc(id)
      .update({
        isActive: false,
        deletedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'Item master deleted successfully'
    });

  } catch (error) {
    console.error('Delete item master error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UOM CONVERSION ROUTES

// Get UOM conversion factors for an item
router.get('/:id/uoms', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const uomsSnapshot = await db.collection('companies')
      .doc(companyId!)
      .collection('itemUOMs')
      .where('itemId', '==', id)
      .get();

    const uoms = uomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, uoms });

  } catch (error) {
    console.error('Get item UOMs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Convert quantity between UOMs
router.post('/:id/convert', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fromUomId, toUomId, quantity } = req.body;
    const companyId = req.user?.companyId;

    if (!fromUomId || !toUomId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get UOM conversion factors
    const fromUomDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('itemUOMs')
      .where('itemId', '==', id)
      .where('uomId', '==', fromUomId)
      .limit(1)
      .get();

    const toUomDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('itemUOMs')
      .where('itemId', '==', id)
      .where('uomId', '==', toUomId)
      .limit(1)
      .get();

    if (fromUomDoc.empty || toUomDoc.empty) {
      return res.status(400).json({ error: 'UOM not found for this item' });
    }

    const fromUomData = fromUomDoc.docs[0].data();
    const toUomData = toUomDoc.docs[0].data();

    // Convert to base UOM first, then to target UOM
    const baseQuantity = quantity * fromUomData.conversionFactor;
    const convertedQuantity = baseQuantity / toUomData.conversionFactor;

    res.json({
      success: true,
      conversion: {
        fromUomId,
        toUomId,
        originalQuantity: quantity,
        convertedQuantity: convertedQuantity,
        conversionFactor: fromUomData.conversionFactor / toUomData.conversionFactor
      }
    });

  } catch (error) {
    console.error('Convert UOM error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// STOCK ALERTS

// Get low stock alerts
router.get('/alerts/low-stock', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { branchId } = req.query;

    // Get all items with reorder points
    const itemsSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('itemMasters')
      .where('isActive', '==', true)
      .where('reorderPoint', '>', 0)
      .get();

    const lowStockAlerts = [];

    for (const itemDoc of itemsSnapshot.docs) {
      const itemData = itemDoc.data();
      
      let query = db.collection('companies')
        .doc(companyId)
        .collection('stockBalances')
        .where('itemId', '==', itemDoc.id);

      if (branchId) {
        query = query.where('branchId', '==', branchId);
      }

      const stockSnapshot = await query.get();
      
      for (const stockDoc of stockSnapshot.docs) {
        const stockData = stockDoc.data();
        
        if (stockData.quantity <= itemData.reorderPoint) {
          lowStockAlerts.push({
            itemId: itemDoc.id,
            itemName: itemData.name,
            itemCode: itemData.code,
            branchId: stockData.branchId,
            currentStock: stockData.quantity,
            reorderPoint: itemData.reorderPoint,
            reorderQuantity: itemData.reorderQuantity || 0,
            uomId: stockData.uomId
          });
        }
      }
    }

    res.json({
      success: true,
      alerts: lowStockAlerts,
      count: lowStockAlerts.length
    });

  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
