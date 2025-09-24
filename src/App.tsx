import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAppStore } from './store/useAppStore';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import TopBar from './components/layout/TopBar';
import LeftNav from './components/layout/LeftNav';
import RightRail from './components/layout/RightRail';

// Page Components
import Dashboard from './pages/Dashboard';
import ItemClassesPage from './components/inventory/ItemClassesPage';
import ItemsPage from './pages/inventory/ItemsPage';
import StockBalancesPage from './pages/inventory/StockBalancesPage';
import RecipesPage from './pages/production/RecipesPage';
import ProductionOrdersPage from './pages/production/ProductionOrdersPage';
import BatchesPage from './pages/production/BatchesPage';
import PurchaseOrdersPage from './pages/procurement/PurchaseOrdersPage';
import GoodsReceiptsPage from './pages/procurement/GoodsReceiptsPage';
import QCTestsPage from './pages/quality/QCTestsPage';
import TraceabilityPage from './pages/quality/TraceabilityPage';
import InterCountryTransfersPage from './pages/multi-country/InterCountryTransfersPage';
import GlobalReportsPage from './pages/multi-country/GlobalReportsPage';
import TenantsPage from './pages/admin/TenantsPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDataViewsPage from './pages/admin/DataViewsPage';
import CountriesPage from './pages/admin/CountriesPage';
import BranchesPage from './pages/admin/BranchesPage';
import RolesPage from './pages/admin/RolesPage';
import UsersPage from './pages/admin/UsersPage';
import TenantShell from './pages/tenant/TenantShell';
import TenantSettings from './pages/tenant/TenantSettings';
import TenantCountries from './pages/tenant/TenantCountries';
import TenantBranches from './pages/tenant/TenantBranches';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { sidebarCollapsed, initializeApp, loading, error } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🍺</div>
          <div className="text-xl font-semibold text-gray-900 mb-2">BrewERP</div>
          <div className="text-gray-500">Loading application...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-gray-900 mb-2">Error Loading Application</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation */}
        <LeftNav />

        {/* Main Content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } mt-16`}>
          <div className="h-full">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:read']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/tenants" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:read']}>
                  <TenantsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/data-views" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:write']}>
                  <AdminDataViewsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/countries" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:write']}>
                  <CountriesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/branches" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:write']}>
                  <BranchesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:write']}>
                  <RolesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredPermissions={['admin:tenants:write']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              
              {/* Tenant Routes */}
              <Route path="/t/:tenantId/*" element={
                <ProtectedRoute requiredPermissions={['tenant:settings:read']}>
                  <TenantShell />
                </ProtectedRoute>
              }>
                <Route path="settings" element={<TenantSettings />} />
                <Route path="countries" element={<TenantCountries />} />
                <Route path="branches" element={<TenantBranches />} />
              </Route>
              
              {/* Inventory Routes */}
              <Route path="/inventory/item-classes" element={
                <ProtectedRoute requiredPermissions={['inventory:read']}>
                  <ItemClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/inventory/items" element={
                <ProtectedRoute requiredPermissions={['inventory:read']}>
                  <ItemsPage />
                </ProtectedRoute>
              } />
              <Route path="/inventory/stock-balances" element={
                <ProtectedRoute requiredPermissions={['inventory:read']}>
                  <StockBalancesPage />
                </ProtectedRoute>
              } />
              
              {/* Production Routes */}
              <Route path="/production/recipes" element={
                <ProtectedRoute requiredPermissions={['production:read']}>
                  <RecipesPage />
                </ProtectedRoute>
              } />
              <Route path="/production/orders" element={
                <ProtectedRoute requiredPermissions={['production:read']}>
                  <ProductionOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/production/batches" element={
                <ProtectedRoute requiredPermissions={['production:read']}>
                  <BatchesPage />
                </ProtectedRoute>
              } />
              
              {/* Procurement Routes */}
              <Route path="/procurement/purchase-orders" element={
                <ProtectedRoute requiredPermissions={['procurement:read']}>
                  <PurchaseOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/procurement/goods-receipts" element={
                <ProtectedRoute requiredPermissions={['procurement:read']}>
                  <GoodsReceiptsPage />
                </ProtectedRoute>
              } />
              
              {/* Quality Routes */}
              <Route path="/quality/qc-tests" element={
                <ProtectedRoute requiredPermissions={['quality:read']}>
                  <QCTestsPage />
                </ProtectedRoute>
              } />
              <Route path="/quality/traceability" element={
                <ProtectedRoute requiredPermissions={['quality:read']}>
                  <TraceabilityPage />
                </ProtectedRoute>
              } />
              
              {/* Multi-Country Routes */}
              <Route path="/multi-country/transfers" element={
                <ProtectedRoute requiredPermissions={['inventory:read', 'procurement:read']}>
                  <InterCountryTransfersPage />
                </ProtectedRoute>
              } />
              <Route path="/multi-country/reports" element={
                <ProtectedRoute requiredPermissions={['reports:read']}>
                  <GlobalReportsPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<div className="p-8 text-center text-gray-500">Page not found</div>} />
            </Routes>
          </div>
        </main>

        {/* Right Rail */}
        <RightRail />
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
