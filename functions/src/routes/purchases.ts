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
const vendorSchema = Joi.object({
  name: Joi.string().min(2).required(),
  code: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional()
});

const purchaseOrderSchema = Joi.object({
  vendorId: Joi.string().required(),
  branchId: Joi.string().required(),
  orderDate: Joi.date().required(),
  expectedDate: Joi.date().optional(),
  items: Joi.array().items(Joi.object({
    itemId: Joi.string().required(),
    uomId: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required()
  })).min(1).required()
});

const updatePurchaseOrderSchema = Joi.object({
  status: Joi.string().valid('Draft', 'Sent', 'Received', 'Cancelled').optional(),
  expectedDate: Joi.date().optional(),
  items: Joi.array().items(Joi.object({
    itemId: Joi.string().required(),
    uomId: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required()
  })).optional()
});

// VENDOR ROUTES

// Get all vendors for a company
router.get('/vendors', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { search } = req.query;
    let query = db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .where('isActive', '==', true);

    const vendorsSnapshot = await query.get();
    let vendors = vendorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by search term if provided
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      vendors = vendors.filter(vendor => 
        (vendor as any).name.toLowerCase().includes(searchTerm) ||
        (vendor as any).code.toLowerCase().includes(searchTerm) ||
        ((vendor as any).email && (vendor as any).email.toLowerCase().includes(searchTerm))
      );
    }

    res.json({ success: true, vendors });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor by ID
router.get('/vendors/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const vendorDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .doc(id)
      .get();

    if (!vendorDoc.exists) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      success: true,
      vendor: {
        id: vendorDoc.id,
        ...vendorDoc.data()
      }
    });

  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create vendor
router.post('/vendors', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { error, value } = vendorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, code, email, phone, address } = value;

    // Check if code already exists
    const existingVendor = await db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .where('code', '==', code)
      .limit(1)
      .get();

    if (!existingVendor.empty) {
      return res.status(400).json({ error: 'Vendor code already exists' });
    }

    // Create vendor
    const vendorData = {
      name,
      code,
      email: email || '',
      phone: phone || '',
      address: address || '',
      companyId,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const vendorRef = await db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .add(vendorData);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      vendor: {
        id: vendorRef.id,
        ...vendorData
      }
    });

  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vendor
router.put('/vendors/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { error, value } = vendorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const vendorDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .doc(id)
      .get();

    if (!vendorDoc.exists) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Update vendor
    await db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .doc(id)
      .update({
        ...value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'Vendor updated successfully'
    });

  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PURCHASE ORDER ROUTES

// Get all purchase orders for a company
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { branchId, status, vendorId, startDate, endDate } = req.query;
    let query = db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .orderBy('orderDate', 'desc');

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (vendorId) {
      query = query.where('vendorId', '==', vendorId);
    }

    if (startDate) {
      query = query.where('orderDate', '>=', new Date(startDate as string));
    }

    if (endDate) {
      query = query.where('orderDate', '<=', new Date(endDate as string));
    }

    const ordersSnapshot = await query.get();
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, orders });

  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get purchase order by ID
router.get('/orders/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const orderDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .doc(id)
      .get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const orderData = orderDoc.data();

    // Get order items
    const itemsSnapshot = await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrderItems')
      .where('purchaseOrderId', '==', id)
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

  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create purchase order
router.post('/orders', verifyToken, async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const { error, value } = purchaseOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { vendorId, branchId, orderDate, expectedDate, items } = value;

    // Verify vendor exists
    const vendorDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('vendors')
      .doc(vendorId)
      .get();

    if (!vendorDoc.exists) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    // Verify branch exists
    const branchDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('branches')
      .doc(branchId)
      .get();

    if (!branchDoc.exists) {
      return res.status(400).json({ error: 'Branch not found' });
    }

    // Generate order number
    const orderNumber = `PO-${Date.now()}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

    // Create purchase order
    const orderData = {
      orderNumber,
      vendorId,
      branchId,
      companyId,
      status: 'Draft',
      orderDate: admin.firestore.Timestamp.fromDate(new Date(orderDate)),
      expectedDate: expectedDate ? admin.firestore.Timestamp.fromDate(new Date(expectedDate)) : null,
      totalAmount,
      currency: 'USD', // Default currency
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const orderRef = await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .add(orderData);

    // Create order items
    const batch = db.batch();
    for (const item of items) {
      const itemRef = db.collection('companies')
        .doc(companyId!)
        .collection('purchaseOrderItems')
        .doc();

      const itemData = {
        purchaseOrderId: orderRef.id,
        itemId: item.itemId,
        uomId: item.uomId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        companyId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(itemRef, itemData);
    }

    await batch.commit();

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      order: {
        id: orderRef.id,
        ...orderData
      }
    });

  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update purchase order
router.put('/orders/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { error, value } = updatePurchaseOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const orderDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .doc(id)
      .get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Check if order can be modified
    if (orderData.status !== 'Draft' && !value.status) {
      return res.status(400).json({ error: 'Only draft orders can be modified' });
    }

    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (value.status) {
      updateData.status = value.status;
    }

    if (value.expectedDate) {
      updateData.expectedDate = admin.firestore.Timestamp.fromDate(new Date(value.expectedDate));
    }

    // Update items if provided
    if (value.items) {
      // Delete existing items
      const existingItemsSnapshot = await db.collection('companies')
        .doc(companyId!)
        .collection('purchaseOrderItems')
        .where('purchaseOrderId', '==', id)
        .get();

      const batch = db.batch();
      existingItemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new items
      for (const item of value.items) {
        const itemRef = db.collection('companies')
          .doc(companyId!)
          .collection('purchaseOrderItems')
          .doc();

        const itemData = {
          purchaseOrderId: id,
          itemId: item.itemId,
          uomId: item.uomId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          companyId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.set(itemRef, itemData);
      }

      // Recalculate total amount
      const totalAmount = value.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      updateData.totalAmount = totalAmount;

      await batch.commit();
    }

    // Update order
    await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .doc(id)
      .update(updateData);

    res.json({
      success: true,
      message: 'Purchase order updated successfully'
    });

  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete purchase order
router.delete('/orders/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const orderDoc = await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .doc(id)
      .get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Only allow deletion of draft orders
    if (orderData.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft orders can be deleted' });
    }

    // Delete order items
    const itemsSnapshot = await db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrderItems')
      .where('purchaseOrderId', '==', id)
      .get();

    const batch = db.batch();
    itemsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete order
    batch.delete(db.collection('companies')
      .doc(companyId!)
      .collection('purchaseOrders')
      .doc(id));

    await batch.commit();

    res.json({
      success: true,
      message: 'Purchase order deleted successfully'
    });

  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
