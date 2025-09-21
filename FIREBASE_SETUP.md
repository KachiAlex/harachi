# Firebase Setup Guide for Brewery ERP

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `brewery-erp-bogo` (or your preferred name)
4. Enable Google Analytics (optional)
5. Wait for project creation

## 2. Enable Firebase Services

### Authentication
1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Optionally enable other providers (Google, Microsoft, etc.)

### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select location (choose closest to your users)

### Storage
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode" (we'll update rules later)
4. Select location (same as Firestore)

### Hosting (Optional)
1. Go to Hosting
2. Click "Get started"
3. Follow the setup instructions

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add a web app
4. Register app with name: "Brewery ERP Web"
5. Copy the configuration object

## 4. Environment Variables

Create a `.env` file in your project root with:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Configuration
REACT_APP_APP_NAME=Brewery ERP
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

## 5. Deploy Security Rules

### Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase in your project
```bash
firebase init
```

Select:
- Firestore
- Storage
- Hosting (optional)

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 6. Create Initial Admin User

### Option A: Using Firebase Console (Manual)
1. Go to Authentication > Users
2. Click "Add user"
3. Email: `onyedika.akoma@gmail.com`
4. Password: `dikaoliver2660`
5. Click "Add user"

### Option B: Using Setup Script (Automated)
1. Download your Firebase Admin SDK service account key:
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save as `scripts/serviceAccountKey.json`

2. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

3. Run the setup script:
   ```bash
   node scripts/setup-admin-user.js
   ```

Then manually add user profile to Firestore:
1. Go to Firestore Database
2. Start collection: `users`
3. Document ID: (the UID from Authentication)
4. Add fields:
   ```json
   {
     "uid": "user_uid_here",
     "email": "admin@bogofood.com",
     "displayName": "System Administrator",
     "role": "admin",
     "companyId": "bogo-food-beverage",
     "permissions": [
       "users:read", "users:write", "users:delete",
       "companies:read", "companies:write", "companies:delete",
       "inventory:read", "inventory:write", "inventory:delete",
       "production:read", "production:write", "production:delete",
       "procurement:read", "procurement:write", "procurement:delete",
       "quality:read", "quality:write", "quality:delete",
       "reports:read", "reports:write",
       "settings:read", "settings:write"
     ],
     "isActive": true,
     "createdAt": "current_timestamp",
     "updatedAt": "current_timestamp"
   }
   ```

## 7. Create Demo Data

Add company data to Firestore:

### Collection: `companies`
Document ID: `bogo-food-beverage`
```json
{
  "id": "bogo-food-beverage",
  "name": "Bogo Food & Beverage",
  "slug": "bogo-food-beverage",
  "subscriptionTier": "ENTERPRISE",
  "active": true,
  "createdAt": "current_timestamp",
  "updatedAt": "current_timestamp"
}
```

### Collection: `countries`
Document ID: `nigeria`
```json
{
  "id": "nigeria",
  "companyId": "bogo-food-beverage",
  "name": "Nigeria",
  "countryCode": "NG",
  "currencyCode": "NGN",
  "taxSystem": "VAT",
  "timezone": "Africa/Lagos",
  "active": true,
  "createdAt": "current_timestamp"
}
```

## 8. Test the Application

1. Start your React application:
   ```bash
   npm start
   ```

2. Navigate to `/login`
3. Login with admin credentials
4. Verify all features work correctly

## 9. Production Deployment

### Update Security Rules for Production
- Review and tighten security rules
- Remove test data
- Set up proper user management

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

### Permission Errors
If you get "Firebase Storage: User does not have permission" errors:

1. Check that security rules are deployed:
   ```bash
   firebase deploy --only storage
   ```

2. Verify user has proper permissions in Firestore
3. Check that user document exists in `/users/{uid}`
4. Ensure user has `isActive: true`

### Authentication Issues
1. Verify Firebase config in `.env` file
2. Check that Authentication is enabled in Firebase Console
3. Ensure Email/Password provider is enabled

### Firestore Permission Denied
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Check user permissions in user document
3. Verify user belongs to correct company

## Demo Users

**Primary Admin User:**
- **Admin**: `onyedika.akoma@gmail.com` / `dikaoliver2660`

For testing purposes, create these additional users:

- **Manager**: `manager@bogofood.com` / `manager123`
- **Operator**: `operator@bogofood.com` / `operator123`  
- **Auditor**: `auditor@bogofood.com` / `auditor123`

Each should have appropriate role and permissions in their user document.
