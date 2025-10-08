import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { BranchProvider } from './contexts/BranchContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/admin/Companies';
import SetupWizard from './pages/company/SetupWizard';
import LicensePage from './pages/company/LicensePage';
import CompanyPortal from './pages/company/CompanyPortal';
import LicenseManagement from './pages/company/LicenseManagement';
import BranchSelection from './pages/company/BranchSelection';
import CompanyBranchDashboard from './pages/company/CompanyBranchDashboard';
import UomsPage from './pages/company/Uoms';
import BranchesUpload from './pages/company/BranchesUpload';
import CustomersUpload from './pages/company/CustomersUpload';
import VendorsUpload from './pages/company/VendorsUpload';
import BranchDashboard from './pages/branch/Dashboard';
import NewBranchDashboard from './pages/branch/BranchDashboard';
import InventoryList from './pages/branch/InventoryList';
import InventoryForm from './pages/branch/InventoryForm';
import InventoryUpload from './pages/branch/InventoryUpload';
import Reports from './pages/branch/Reports';
import ItemMaster from './pages/branch/ItemMaster';
import StockManagement from './pages/branch/StockManagement';
import BatchTracking from './pages/branch/BatchTracking';
import UomManagement from './pages/branch/UomManagement';
import InventoryReports from './pages/branch/InventoryReports';
import Sales from './pages/branch/Sales';
import Purchases from './pages/branch/Purchases';
import Users from './pages/admin/Users';
import CompanyDetails from './pages/admin/CompanyDetails';
import UserProfile from './pages/UserProfile';
// duplicate import removed

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <BranchProvider>
          <Router>
            <div className="App">
            <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            {/* Company Portal Routes - More specific routes first */}
            <Route path="/company/:companyCode/setup" element={<SetupWizard />} />
            <Route path="/company/:companyCode/branch/:branchId/dashboard" element={<CompanyBranchDashboard />} />
            <Route path="/company/:companyCode/branches" element={<BranchSelection />} />
            <Route path="/company/:companyCode/license" element={<LicenseManagement />} />
            <Route path="/company/:companyCode" element={<CompanyPortal />} />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} />
              
              {/* Super Admin Routes */}
              <Route path="admin/companies" element={<Companies />} />
              <Route path="admin/companies/:id" element={<CompanyDetails />} />
              <Route path="admin/users" element={<Users />} />
              
              {/* Company Admin Routes */}
              <Route path="company/setup" element={<SetupWizard />} />
              <Route path="company/license" element={<LicensePage />} />
              <Route path="company/uoms" element={<UomsPage />} />
              <Route path="company/branches/upload" element={<BranchesUpload />} />
              <Route path="company/customers/upload" element={<CustomersUpload />} />
              <Route path="company/vendors/upload" element={<VendorsUpload />} />

              {/* Branch Admin Routes */}
              <Route path="branch" element={<BranchDashboard />} />
              <Route path="branch/dashboard" element={<NewBranchDashboard />} />
              <Route path="branch/select" element={<BranchSelection />} />
              <Route path="branch/inventory" element={<InventoryList />} />
              <Route path="branch/inventory/new" element={<InventoryForm />} />
              <Route path="branch/inventory/:id" element={<InventoryForm />} />
              <Route path="branch/inventory/upload" element={<InventoryUpload />} />
              <Route path="branch/item-master" element={<ItemMaster />} />
              <Route path="branch/stock" element={<StockManagement />} />
              <Route path="branch/batch-tracking" element={<BatchTracking />} />
              <Route path="branch/uoms" element={<UomManagement />} />
              <Route path="branch/inventory-reports" element={<InventoryReports />} />
              <Route path="branch/sales" element={<Sales />} />
              <Route path="branch/purchases" element={<Purchases />} />
              <Route path="branch/reports" element={<Reports />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
            </div>
          </Router>
        </BranchProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
