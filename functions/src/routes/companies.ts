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
const companySchema = Joi.object({
  name: Joi.string().min(2).required(),
  code: Joi.string().min(2).max(10).required(),
  description: Joi.string().optional()
});

// Get all companies (Super Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Check if user has Super Admin role
    if (!req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const companiesSnapshot = await db.collection('companies')
      .where('isActive', '==', true)
      .get();

    const companies = [];
    for (const doc of companiesSnapshot.docs) {
      const companyData = doc.data();
      
      // Get user count
      const usersSnapshot = await db.collection('users')
        .where('companyId', '==', doc.id)
        .get();

      // Get countries count
      const countriesSnapshot = await db.collection('companies')
        .doc(doc.id)
        .collection('countries')
        .get();

      companies.push({
        id: doc.id,
        ...companyData,
        userCount: usersSnapshot.size,
        countryCount: countriesSnapshot.size
      });
    }

    res.json({ success: true, companies });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this company
    if (req.user.companyId !== id && !req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const companyDoc = await db.collection('companies').doc(id).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyData = companyDoc.data();

    // Get countries
    const countriesSnapshot = await db.collection('companies')
      .doc(id)
      .collection('countries')
      .get();

    const countries = countriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get users
    const usersSnapshot = await db.collection('users')
      .where('companyId', '==', id)
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      company: {
        id: companyDoc.id,
        ...companyData,
        countries,
        users
      }
    });

  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create company (Super Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user has Super Admin role
    if (!req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = companySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, code, description } = value;

    // Check if company code already exists
    const existingCompany = await db.collection('companies')
      .where('code', '==', code)
      .limit(1)
      .get();

    if (!existingCompany.empty) {
      return res.status(400).json({ error: 'Company code already exists' });
    }

    // Create company
    const companyData = {
      name,
      code,
      description: description || '',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const companyRef = await db.collection('companies').add(companyData);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company: {
        id: companyRef.id,
        ...companyData
      }
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this company
    if (req.user.companyId !== id && !req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = companySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const companyDoc = await db.collection('companies').doc(id).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Update company
    await db.collection('companies').doc(id).update({
      ...value,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Company updated successfully'
    });

  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete company (Super Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user has Super Admin role
    if (!req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const companyDoc = await db.collection('companies').doc(id).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Soft delete - mark as inactive
    await db.collection('companies').doc(id).update({
      isActive: false,
      deletedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company countries
router.get('/:id/countries', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this company
    if (req.user.companyId !== id && !req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const countriesSnapshot = await db.collection('companies')
      .doc(id)
      .collection('countries')
      .get();

    const countries = countriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, countries });

  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create country
router.post('/:id/countries', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this company
    if (req.user.companyId !== id && !req.user.roles.includes('Super Admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    // Create country
    const countryData = {
      name,
      code,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const countryRef = await db.collection('companies')
      .doc(id)
      .collection('countries')
      .add(countryData);

    res.status(201).json({
      success: true,
      message: 'Country created successfully',
      country: {
        id: countryRef.id,
        ...countryData
      }
    });

  } catch (error) {
    console.error('Create country error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
