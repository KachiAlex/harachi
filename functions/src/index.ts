import { onRequest } from 'firebase-functions/v1/https';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler';

// Initialize Firebase Admin (lazy initialization)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Import and mount routes
import companiesRouter from './routes/companies';
import usersRouter from './routes/users';
import inventoryRouter from './routes/inventory';
import salesRouter from './routes/sales';
import purchasesRouter from './routes/purchases';
import stockRouter from './routes/stock';
import itemMasterRouter from './routes/itemMaster';
import batchTrackingRouter from './routes/batchTracking';
import inventoryReportsRouter from './routes/inventoryReports';

app.use('/admin/companies', companiesRouter);
app.use('/admin/users', usersRouter);
app.use('/inventory', inventoryRouter);
app.use('/sales', salesRouter);
app.use('/purchases', purchasesRouter);
app.use('/stock', stockRouter);
app.use('/item-master', itemMasterRouter);
app.use('/batch-tracking', batchTrackingRouter);
app.use('/inventory-reports', inventoryReportsRouter);

// Legacy endpoints (keeping for backward compatibility)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  res.json({
    success: true,
    message: 'Login endpoint ready',
    email
  });
});

// Legacy companies endpoints (keeping for backward compatibility)
app.get('/companies', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('companies').get();
    const companies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json({ success: true, companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/companies', async (req, res) => {
  try {
    const { name, code, harachiId } = req.body;
    
    if (!name || !code) {
      res.status(400).json({ error: 'Name and code are required' });
      return;
    }

    const docRef = await admin.firestore().collection('companies').add({
      name,
      code,
      harachiId: harachiId || 'default',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', notFound);

// Error handling middleware
app.use(errorHandler);

// Export the Express app as a Cloud Function (1st Gen)
export const api = onRequest(app);

// Export Firestore triggers
export * from './triggers';