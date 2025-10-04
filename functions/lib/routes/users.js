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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
const createUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    firstName: joi_1.default.string().min(2).required(),
    lastName: joi_1.default.string().min(2).required(),
    password: joi_1.default.string().min(6).required(),
    companyId: joi_1.default.string().required(),
    roles: joi_1.default.array().items(joi_1.default.string()).min(1).required()
});
const updateUserSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).optional(),
    lastName: joi_1.default.string().min(2).optional(),
    roles: joi_1.default.array().items(joi_1.default.string()).optional(),
    isActive: joi_1.default.boolean().optional()
});
// Get all users for a company
router.get('/', verifyToken, async (req, res) => {
    try {
        const { companyId } = req.query;
        const userCompanyId = req.user?.companyId;
        // Check if user has access to view users
        if (!req.user?.roles?.includes('Super Admin') &&
            !req.user?.roles?.includes('Company Admin') &&
            !req.user?.roles?.includes('Branch Admin')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Super Admin can view all users, others only their company
        const targetCompanyId = req.user?.roles?.includes('Super Admin')
            ? companyId || userCompanyId
            : userCompanyId;
        if (!targetCompanyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const usersSnapshot = await db.collection('users')
            .where('companyId', '==', targetCompanyId)
            .get();
        const users = [];
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            // Get user roles
            const rolesSnapshot = await db.collection('users')
                .doc(doc.id)
                .collection('roles')
                .get();
            const roles = rolesSnapshot.docs.map(roleDoc => roleDoc.data());
            users.push({
                id: doc.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                roles,
                isActive: userData.isActive,
                createdAt: userData.createdAt,
                lastLogin: userData.lastLogin
            });
        }
        res.json({ success: true, users });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user has access to view this user
        if (req.user?.id !== id &&
            !req.user?.roles?.includes('Super Admin') &&
            !req.user?.roles?.includes('Company Admin') &&
            !req.user?.roles?.includes('Branch Admin')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get user roles
        const rolesSnapshot = await db.collection('users')
            .doc(id)
            .collection('roles')
            .get();
        const roles = rolesSnapshot.docs.map(roleDoc => roleDoc.data());
        res.json({
            success: true,
            user: {
                id: userDoc.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                companyId: userData.companyId,
                roles,
                isActive: userData.isActive,
                createdAt: userData.createdAt,
                lastLogin: userData.lastLogin
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create user
router.post('/', verifyToken, async (req, res) => {
    try {
        // Check if user has permission to create users
        if (!req.user?.roles?.includes('Super Admin') &&
            !req.user?.roles?.includes('Company Admin')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { error, value } = createUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { email, firstName, lastName, password, companyId, roles } = value;
        // Check if user already exists
        const existingUser = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        if (!existingUser.empty) {
            return res.status(400).json({ error: 'User with this email already exists' });
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
            firstName,
            lastName,
            password: hashedPassword,
            companyId,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const userRef = await db.collection('users').add(userData);
        // Add roles
        for (const roleName of roles) {
            await db.collection('users')
                .doc(userRef.id)
                .collection('roles')
                .add({
                name: roleName,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: userRef.id
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user has permission to update this user
        if (req.user?.id !== id &&
            !req.user?.roles?.includes('Super Admin') &&
            !req.user?.roles?.includes('Company Admin')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { error, value } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Update user data
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (value.firstName)
            updateData.firstName = value.firstName;
        if (value.lastName)
            updateData.lastName = value.lastName;
        if (value.isActive !== undefined)
            updateData.isActive = value.isActive;
        await db.collection('users').doc(id).update(updateData);
        // Update roles if provided
        if (value.roles) {
            // Delete existing roles
            const rolesSnapshot = await db.collection('users')
                .doc(id)
                .collection('roles')
                .get();
            const batch = db.batch();
            rolesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            // Add new roles
            for (const roleName of value.roles) {
                await db.collection('users')
                    .doc(id)
                    .collection('roles')
                    .add({
                    name: roleName,
                    isActive: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        res.json({
            success: true,
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete user (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Check if user has permission to delete users
        if (!req.user?.roles?.includes('Super Admin') &&
            !req.user?.roles?.includes('Company Admin')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { id } = req.params;
        // Prevent self-deletion
        if (req.user?.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Soft delete - mark as inactive
        await db.collection('users').doc(id).update({
            isActive: false,
            deletedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Change user password
router.put('/:id/password', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        // Check if user has permission to change password
        if (req.user?.id !== id &&
            !req.user?.roles?.includes('Super Admin') &&
            !req.user?.roles?.includes('Company Admin')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verify current password (unless Super Admin)
        if (req.user?.id === id) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password required' });
            }
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, userData.password);
            if (!isValidPassword) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await db.collection('users').doc(id).update({
            password: hashedPassword,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
