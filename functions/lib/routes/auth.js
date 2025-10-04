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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const db = admin.firestore();
// JWT secret (use Firebase Functions config in production)
const JWT_SECRET = functions.config().jwt?.secret || 'your-secret-key';
// Validation schemas
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required()
});
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    firstName: joi_1.default.string().min(2).required(),
    lastName: joi_1.default.string().min(2).required(),
    companyId: joi_1.default.string().required()
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
        const isValidPassword = await bcryptjs_1.default.compare(password, userData.password);
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
        const token = jsonwebtoken_1.default.sign({
            userId: userDoc.id,
            email: userData.email,
            companyId: userData.companyId,
            roles: roles.map(role => role.name)
        }, JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
    }
    catch (error) {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
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
    }
    catch (error) {
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
exports.default = router;
