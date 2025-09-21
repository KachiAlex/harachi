# Quick Admin User Setup

## Method 1: Firebase Console (Recommended)

1. Go to your Firebase Console
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter:
   - **Email**: `onyedika.akoma@gmail.com`
   - **Password**: `dikaoliver2660`
5. Click "Add user"
6. Copy the generated UID

## Method 2: Create User Profile in Firestore

After creating the user in Authentication:

1. Go to Firestore Database
2. Start collection: `users`
3. Document ID: `[paste the UID from step 6 above]`
4. Add these fields:

```json
{
  "uid": "[paste UID here]",
  "email": "onyedika.akoma@gmail.com",
  "displayName": "Onyedika Akoma",
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
  "createdAt": "[current timestamp]",
  "updatedAt": "[current timestamp]"
}
```

## Method 3: Company Setup

Create the company record in Firestore:

1. Collection: `companies`
2. Document ID: `bogo-food-beverage`
3. Add these fields:

```json
{
  "id": "bogo-food-beverage",
  "name": "Bogo Food & Beverage",
  "slug": "bogo-food-beverage",
  "subscriptionTier": "ENTERPRISE",
  "active": true,
  "createdAt": "[current timestamp]",
  "updatedAt": "[current timestamp]"
}
```

## Test Login

After setup:
1. Start your React app: `npm start`
2. Navigate to `/login`
3. Login with: `onyedika.akoma@gmail.com` / `dikaoliver2660`
4. You should have full admin access to all modules

## Troubleshooting

If login fails:
1. Check that the user exists in Firebase Authentication
2. Verify the user profile exists in Firestore `/users/{uid}`
3. Ensure `isActive: true` in the user profile
4. Check that security rules are deployed
5. Verify the company record exists in Firestore
