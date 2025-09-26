#!/bin/bash

# Harachi ERP Firebase Deployment Script
# This script deploys the complete multi-tenant ERP system to Firebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_header "🚀 Starting Harachi ERP Firebase Deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    print_error "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

print_status "Firebase CLI is ready."

# Install dependencies
print_status "Installing dependencies..."

# Install backend dependencies
print_status "Installing backend dependencies..."
cd functions
npm install
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
cd ..

# Copy build to root for Firebase Hosting
print_status "Preparing for Firebase Hosting..."
cp -r frontend/build/* build/ 2>/dev/null || mkdir -p build && cp -r frontend/build/* build/

# Deploy to Firebase
print_status "Deploying to Firebase..."

# Deploy Functions
print_status "Deploying Cloud Functions..."
firebase deploy --only functions

# Deploy Firestore Rules
print_status "Deploying Firestore Rules..."
firebase deploy --only firestore:rules

# Deploy Firestore Indexes
print_status "Deploying Firestore Indexes..."
firebase deploy --only firestore:indexes

# Deploy Hosting
print_status "Deploying Hosting..."
firebase deploy --only hosting

# Deploy Storage Rules
print_status "Deploying Storage Rules..."
firebase deploy --only storage

print_status "🎉 Deployment completed successfully!"

# Get deployment URLs
print_status "📋 Deployment Information:"
echo "🌐 Frontend: https://harachi-erp.web.app"
echo "🔧 Backend API: https://us-central1-harachi-erp.cloudfunctions.net/api"
echo "📊 Firestore: https://console.firebase.google.com/project/harachi-erp/firestore"
echo "🔐 Authentication: https://console.firebase.google.com/project/harachi-erp/authentication"

print_status "📋 Next steps:"
print_status "1. Configure Firebase Authentication providers"
print_status "2. Set up Firestore security rules"
print_status "3. Configure custom domain (optional)"
print_status "4. Set up monitoring and alerts"
print_status "5. Create initial admin user"

print_status "🔍 To view logs: firebase functions:log"
print_status "🛑 To rollback: firebase hosting:channel:delete production"

print_status "💡 Useful commands:"
print_status "  firebase emulators:start  # Start local emulators"
print_status "  firebase functions:log    # View function logs"
print_status "  firebase hosting:channel:deploy preview  # Deploy to preview channel"
