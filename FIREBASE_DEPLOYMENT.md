# Harachi ERP Firebase Deployment Guide

Complete deployment guide for the multi-tenant ERP system using Firebase services.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Firebase Authentication enabled
- Firestore database created

### One-Command Deployment
```bash
# Deploy everything
./firebase-deploy.sh
```

## 📋 Manual Deployment Steps

### 1. Firebase Project Setup
```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select services:
# - Functions
# - Firestore
# - Hosting
# - Storage
```

### 2. Environment Configuration
```bash
# Set Firebase Functions config
firebase functions:config:set jwt.secret="your-super-secret-jwt-key"
firebase functions:config:set app.environment="production"

# Set environment variables for frontend
echo "REACT_APP_API_URL=https://us-central1-your-project.cloudfunctions.net/api" > frontend/.env
```

### 3. Install Dependencies
```bash
# Backend dependencies
cd functions
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Build and Deploy
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Firebase
firebase deploy
```

## 🏗️ Firebase Architecture

### Services Used
- **Firebase Functions**: Backend API with Express.js
- **Firestore**: Multi-tenant NoSQL database
- **Firebase Hosting**: Frontend React SPA
- **Firebase Authentication**: User management
- **Firebase Storage**: File uploads (optional)

### Multi-Tenant Structure
```
Firestore Collections:
├── companies/{companyId}
│   ├── countries/{countryId}
│   ├── branches/{branchId}
│   ├── users/{userId}
│   ├── inventory/{itemId}
│   ├── transactions/{transactionId}
│   └── finance/{entryId}
├── users/{userId}
│   └── roles/{roleId}
└── audit_logs/{logId}
```

## 🔐 Security Configuration

### Firestore Security Rules
- **Multi-tenant isolation**: Users can only access their company's data
- **Role-based access**: Different permissions for different roles
- **Audit logging**: All operations are logged

### Authentication
- **JWT tokens** for API authentication
- **Firebase Auth** for user management
- **Role-based permissions** in Firestore rules

## 📊 Database Schema

### Global Collections
- `companies` - Tenant companies
- `users` - System users with company association
- `audit_logs` - System audit trail

### Company-Specific Collections
- `companies/{companyId}/countries` - Company countries
- `companies/{companyId}/branches` - Company branches
- `companies/{companyId}/inventory` - Inventory items
- `companies/{companyId}/transactions` - Inventory transactions
- `companies/{companyId}/finance` - Financial entries

## 🚀 Deployment Commands

### Full Deployment
```bash
firebase deploy
```

### Selective Deployment
```bash
# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only firestore rules
firebase deploy --only firestore:rules
```

### Environment Management
```bash
# Set production config
firebase functions:config:set app.environment="production"

# Set development config
firebase functions:config:set app.environment="development"
```

## 🔧 Development Setup

### Local Development
```bash
# Start Firebase emulators
firebase emulators:start

# Start with specific services
firebase emulators:start --only functions,firestore,hosting
```

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5001/your-project/us-central1/api

# Backend (firebase functions:config)
firebase functions:config:set jwt.secret="your-secret"
```

## 📈 Scaling and Performance

### Firestore Optimization
- **Composite indexes** for complex queries
- **Batch operations** for bulk updates
- **Pagination** for large datasets
- **Caching** for frequently accessed data

### Functions Optimization
- **Cold start optimization** with connection pooling
- **Memory allocation** based on workload
- **Timeout configuration** for long-running operations

## 🔍 Monitoring and Logging

### Firebase Console
- **Functions logs**: Real-time function execution logs
- **Firestore usage**: Database read/write metrics
- **Hosting analytics**: Website performance metrics
- **Authentication**: User activity and security events

### Custom Monitoring
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api

# View logs with filters
firebase functions:log --filter="severity>=ERROR"
```

## 🛠️ Maintenance Operations

### Database Management
```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backup

# Import Firestore data
gcloud firestore import gs://your-bucket/backup
```

### Function Updates
```bash
# Deploy specific function
firebase deploy --only functions:api

# Rollback function
firebase functions:log --limit 10
```

### Hosting Updates
```bash
# Deploy to preview channel
firebase hosting:channel:deploy preview

# Deploy to production
firebase hosting:channel:deploy production
```

## 🔒 Security Best Practices

### Authentication
- Enable **multi-factor authentication**
- Configure **OAuth providers** (Google, Microsoft)
- Set up **custom claims** for role-based access
- Implement **session management**

### Firestore Security
- **Validate data** in security rules
- **Use indexes** for efficient queries
- **Implement rate limiting** in functions
- **Monitor access patterns**

### API Security
- **Rate limiting** on all endpoints
- **Input validation** with Joi schemas
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers

## 📚 Troubleshooting

### Common Issues
1. **Function timeout**: Increase timeout in firebase.json
2. **CORS errors**: Check CORS configuration in functions
3. **Permission denied**: Verify Firestore security rules
4. **Build failures**: Check Node.js version compatibility

### Debug Commands
```bash
# Test functions locally
firebase emulators:start --only functions

# Debug Firestore rules
firebase emulators:start --only firestore

# Check deployment status
firebase projects:list
```

## 🎯 Production Checklist

### Pre-Deployment
- [ ] Firebase project configured
- [ ] Authentication providers enabled
- [ ] Firestore security rules tested
- [ ] Environment variables set
- [ ] Custom domain configured (optional)

### Post-Deployment
- [ ] Functions deployed successfully
- [ ] Hosting accessible
- [ ] Firestore rules active
- [ ] Authentication working
- [ ] API endpoints responding

### Security Checklist
- [ ] Firestore rules properly configured
- [ ] Authentication providers secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented

## 🆘 Support

For deployment issues:
1. Check Firebase Console for errors
2. Review function logs: `firebase functions:log`
3. Test locally with emulators
4. Verify Firestore security rules
5. Check authentication configuration

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
