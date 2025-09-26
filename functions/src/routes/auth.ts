import express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

const router = express.Router();
const db = admin.firestore();

// JWT secret (use Firebase Functions config in production)
const JWT_SECRET = functions.config().jwt?.secret || 'your-secret-key';

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  companyId: Joi.string().required()
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user in Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get company data
    const companyDoc = await db.collection('companies').doc(userData.companyId).get();
    const companyData = companyDoc.data();

    // Get user roles
    const rolesSnapshot = await db.collection('users')
      .doc(userDoc.id)
      .collection('roles')
      .get();

    const roles = rolesSnapshot.docs.map(doc => doc.data());

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userDoc.id,
        email: userData.email,
        companyId: userData.companyId,
        roles: roles.map(role => role.name)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await userDoc.ref.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: companyData,
        roles
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName, companyId } = value;

    // Check if user already exists
    const existingUser = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Verify company exists
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      companyId,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    };

    const userRef = await db.collection('users').add(userData);

    // Assign default role (Branch Admin)
    await db.collection('users').doc(userRef.id).collection('roles').add({
      name: 'Branch Admin',
      permissions: ['branch.*', 'inventory.*', 'finance.*', 'sales.*', 'purchases.*'],
      assignedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: userRef.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const companyDoc = await db.collection('companies').doc(userData.companyId).get();
    const companyData = companyDoc.data();

    const rolesSnapshot = await db.collection('users')
      .doc(decoded.userId)
      .collection('roles')
      .get();

    const roles = rolesSnapshot.docs.map(doc => doc.data());

    res.json({
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: companyData,
        roles
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a blacklist if needed
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
