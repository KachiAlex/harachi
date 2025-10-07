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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementCompanyCountsUsers = exports.decrementCompanyCountsBranches = exports.decrementCompanyCounts = exports.updateCompanyCountsUsers = exports.updateCompanyCountsBranches = exports.updateCompanyCounts = exports.addUserTimestamps = exports.addCompanyTimestamps = exports.enforceUniqueUsername = exports.enforceUniqueCompanyCode = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (lazy initialization)
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Enforce unique company code
exports.enforceUniqueCompanyCode = (0, firestore_1.onDocumentCreated)('companies/{companyId}', async (event) => {
    const companyData = event.data?.data();
    if (!companyData?.code)
        return;
    const companyCode = companyData.code.toLowerCase();
    // Check for existing companies with the same code (case-insensitive)
    const existingCompanies = await db
        .collection('companies')
        .where('code', '==', companyCode)
        .get();
    if (existingCompanies.size > 1) {
        // Delete the duplicate and throw error
        await db.collection('companies').doc(event.params.companyId).delete();
        throw new Error(`Company code '${companyData.code}' already exists`);
    }
});
// Enforce unique username within company
exports.enforceUniqueUsername = (0, firestore_1.onDocumentCreated)('users/{userId}', async (event) => {
    const userData = event.data?.data();
    if (!userData?.username || !userData?.companyId)
        return;
    const username = userData.username.toLowerCase();
    const companyId = userData.companyId;
    // Check for existing users with the same username in the same company
    const existingUsers = await db
        .collection('users')
        .where('username', '==', username)
        .where('companyId', '==', companyId)
        .get();
    if (existingUsers.size > 1) {
        // Delete the duplicate and throw error
        await db.collection('users').doc(event.params.userId).delete();
        throw new Error(`Username '${userData.username}' already exists in this company`);
    }
});
// Add server timestamps to company updates
exports.addCompanyTimestamps = (0, firestore_1.onDocumentUpdated)('companies/{companyId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    // Check if any data actually changed
    const hasChanges = Object.keys(after).some(key => key !== 'updatedAt' && before[key] !== after[key]);
    if (hasChanges) {
        await event.data?.after.ref.update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
});
// Add server timestamps to user updates
exports.addUserTimestamps = (0, firestore_1.onDocumentUpdated)('users/{userId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    // Check if any data actually changed
    const hasChanges = Object.keys(after).some(key => key !== 'updatedAt' && before[key] !== after[key]);
    if (hasChanges) {
        await event.data?.after.ref.update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
});
// Update company counts when subcollections change
exports.updateCompanyCounts = (0, firestore_1.onDocumentCreated)('companies/{companyId}/countries/{countryId}', async (event) => {
    const companyId = event.params.companyId;
    await updateCompanyCount(companyId, 'countriesCount');
});
exports.updateCompanyCountsBranches = (0, firestore_1.onDocumentCreated)('companies/{companyId}/branches/{branchId}', async (event) => {
    const companyId = event.params.companyId;
    await updateCompanyCount(companyId, 'branchesCount');
});
exports.updateCompanyCountsUsers = (0, firestore_1.onDocumentCreated)('users/{userId}', async (event) => {
    const userData = event.data?.data();
    if (!userData?.companyId)
        return;
    await updateCompanyCount(userData.companyId, 'usersCount');
});
// Helper function to update company counts
async function updateCompanyCount(companyId, countField) {
    try {
        const companyRef = db.collection('companies').doc(companyId);
        const companyDoc = await companyRef.get();
        if (!companyDoc.exists)
            return;
        // Get current count
        const currentCount = companyDoc.data()?.[countField] || 0;
        // Update the count
        await companyRef.update({
            [countField]: currentCount + 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        console.error(`Error updating ${countField} for company ${companyId}:`, error);
    }
}
// Decrement counts when documents are deleted
exports.decrementCompanyCounts = (0, firestore_1.onDocumentDeleted)('companies/{companyId}/countries/{countryId}', async (event) => {
    const companyId = event.params.companyId;
    await decrementCompanyCount(companyId, 'countriesCount');
});
exports.decrementCompanyCountsBranches = (0, firestore_1.onDocumentDeleted)('companies/{companyId}/branches/{branchId}', async (event) => {
    const companyId = event.params.companyId;
    await decrementCompanyCount(companyId, 'branchesCount');
});
exports.decrementCompanyCountsUsers = (0, firestore_1.onDocumentDeleted)('users/{userId}', async (event) => {
    const userData = event.data?.data();
    if (!userData?.companyId)
        return;
    await decrementCompanyCount(userData.companyId, 'usersCount');
});
// Helper function to decrement company counts
async function decrementCompanyCount(companyId, countField) {
    try {
        const companyRef = db.collection('companies').doc(companyId);
        const companyDoc = await companyRef.get();
        if (!companyDoc.exists)
            return;
        // Get current count
        const currentCount = companyDoc.data()?.[countField] || 0;
        // Update the count (don't go below 0)
        await companyRef.update({
            [countField]: Math.max(0, currentCount - 1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        console.error(`Error decrementing ${countField} for company ${companyId}:`, error);
    }
}
