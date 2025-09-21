/**
 * Firebase Admin User Setup Script
 * Run this after setting up Firebase to create the initial admin user
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createAdminUser() {
  const email = 'onyedika.akoma@gmail.com';
  const password = 'dikaoliver2660';
  const displayName = 'Onyedika Akoma';
  
  try {
    console.log('Creating admin user...');
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true
    });

    console.log('✅ User created successfully:', userRecord.uid);

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      role: 'admin',
      companyId: 'bogo-food-beverage',
      permissions: [
        'users:read', 'users:write', 'users:delete',
        'companies:read', 'companies:write', 'companies:delete',
        'inventory:read', 'inventory:write', 'inventory:delete',
        'production:read', 'production:write', 'production:delete',
        'procurement:read', 'procurement:write', 'procurement:delete',
        'quality:read', 'quality:write', 'quality:delete',
        'reports:read', 'reports:write',
        'settings:read', 'settings:write'
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await firestore.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ User profile created in Firestore');

    // Create company record
    const companyData = {
      id: 'bogo-food-beverage',
      name: 'Bogo Food & Beverage',
      slug: 'bogo-food-beverage',
      subscriptionTier: 'ENTERPRISE',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await firestore.collection('companies').doc('bogo-food-beverage').set(companyData);
    console.log('✅ Company record created');

    // Create Nigeria country record
    const countryData = {
      id: 'nigeria',
      companyId: 'bogo-food-beverage',
      name: 'Nigeria',
      countryCode: 'NG',
      currencyCode: 'NGN',
      taxSystem: 'VAT',
      timezone: 'Africa/Lagos',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await firestore.collection('countries').doc('nigeria').set(countryData);
    console.log('✅ Nigeria country record created');

    // Create Lagos branch
    const branchData = {
      id: 'lagos-brewery',
      countryId: 'nigeria',
      name: 'Lagos Brewery',
      branchCode: 'LAG001',
      branchType: 'BREWERY',
      address: {
        streetAddress: '123 Industrial Road',
        city: 'Lagos',
        stateProvince: 'Lagos State',
        postalCode: '100001',
        countryCode: 'NG'
      },
      contactInfo: {
        phone: '+234-1-234-5678',
        email: 'lagos@bogofood.com'
      },
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await firestore.collection('branches').doc('lagos-brewery').set(branchData);
    console.log('✅ Lagos branch record created');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nAdmin User Details:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Role: admin`);
    console.log(`Company: Bogo Food & Beverage`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('2. Deploy Storage security rules: firebase deploy --only storage');
    console.log('3. Start your React app: npm start');
    console.log('4. Login with the admin credentials above');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n⚠️  User already exists. Updating user profile...');
      
      try {
        // Get existing user
        const existingUser = await auth.getUserByEmail(email);
        
        // Update user profile in Firestore
        await firestore.collection('users').doc(existingUser.uid).set({
          uid: existingUser.uid,
          email: email,
          displayName: displayName,
          role: 'admin',
          companyId: 'bogo-food-beverage',
          permissions: [
            'users:read', 'users:write', 'users:delete',
            'companies:read', 'companies:write', 'companies:delete',
            'inventory:read', 'inventory:write', 'inventory:delete',
            'production:read', 'production:write', 'production:delete',
            'procurement:read', 'procurement:write', 'procurement:delete',
            'quality:read', 'quality:write', 'quality:delete',
            'reports:read', 'reports:write',
            'settings:read', 'settings:write'
          ],
          isActive: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Existing user profile updated');
        console.log(`UID: ${existingUser.uid}`);
      } catch (updateError) {
        console.error('❌ Error updating existing user:', updateError);
      }
    }
  } finally {
    process.exit(0);
  }
}

// Run the setup
createAdminUser();
