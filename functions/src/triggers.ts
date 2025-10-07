import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (lazy initialization)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Enforce unique company code
export const enforceUniqueCompanyCode = onDocumentCreated(
  'companies/{companyId}',
  async (event) => {
    const companyData = event.data?.data();
    if (!companyData?.code) return;

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
  }
);

// Enforce unique username within company
export const enforceUniqueUsername = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userData = event.data?.data();
    if (!userData?.username || !userData?.companyId) return;

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
  }
);

// Add server timestamps to company updates
export const addCompanyTimestamps = onDocumentUpdated(
  'companies/{companyId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    
    if (!before || !after) return;

    // Check if any data actually changed
    const hasChanges = Object.keys(after).some(key => 
      key !== 'updatedAt' && before[key] !== after[key]
    );

    if (hasChanges) {
      await event.data?.after.ref.update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
);

// Add server timestamps to user updates
export const addUserTimestamps = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    
    if (!before || !after) return;

    // Check if any data actually changed
    const hasChanges = Object.keys(after).some(key => 
      key !== 'updatedAt' && before[key] !== after[key]
    );

    if (hasChanges) {
      await event.data?.after.ref.update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
);

// Update company counts when subcollections change
export const updateCompanyCounts = onDocumentCreated(
  'companies/{companyId}/countries/{countryId}',
  async (event) => {
    const companyId = event.params.companyId;
    await updateCompanyCount(companyId, 'countriesCount');
  }
);

export const updateCompanyCountsBranches = onDocumentCreated(
  'companies/{companyId}/branches/{branchId}',
  async (event) => {
    const companyId = event.params.companyId;
    await updateCompanyCount(companyId, 'branchesCount');
  }
);

export const updateCompanyCountsUsers = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userData = event.data?.data();
    if (!userData?.companyId) return;
    
    await updateCompanyCount(userData.companyId, 'usersCount');
  }
);

// Helper function to update company counts
async function updateCompanyCount(companyId: string, countField: string) {
  try {
    const companyRef = db.collection('companies').doc(companyId);
    const companyDoc = await companyRef.get();
    
    if (!companyDoc.exists) return;

    // Get current count
    const currentCount = companyDoc.data()?.[countField] || 0;
    
    // Update the count
    await companyRef.update({
      [countField]: currentCount + 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating ${countField} for company ${companyId}:`, error);
  }
}

// Decrement counts when documents are deleted
export const decrementCompanyCounts = onDocumentDeleted(
  'companies/{companyId}/countries/{countryId}',
  async (event) => {
    const companyId = event.params.companyId;
    await decrementCompanyCount(companyId, 'countriesCount');
  }
);

export const decrementCompanyCountsBranches = onDocumentDeleted(
  'companies/{companyId}/branches/{branchId}',
  async (event) => {
    const companyId = event.params.companyId;
    await decrementCompanyCount(companyId, 'branchesCount');
  }
);

export const decrementCompanyCountsUsers = onDocumentDeleted(
  'users/{userId}',
  async (event) => {
    const userData = event.data?.data();
    if (!userData?.companyId) return;
    
    await decrementCompanyCount(userData.companyId, 'usersCount');
  }
);

// Helper function to decrement company counts
async function decrementCompanyCount(companyId: string, countField: string) {
  try {
    const companyRef = db.collection('companies').doc(companyId);
    const companyDoc = await companyRef.get();
    
    if (!companyDoc.exists) return;

    // Get current count
    const currentCount = companyDoc.data()?.[countField] || 0;
    
    // Update the count (don't go below 0)
    await companyRef.update({
      [countField]: Math.max(0, currentCount - 1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error(`Error decrementing ${countField} for company ${companyId}:`, error);
  }
}
