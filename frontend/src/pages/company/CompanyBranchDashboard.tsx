import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  ShoppingBag, 
  DollarSign, 
  Box, 
  Layers, 
  BarChart3, 
  GitBranch, 
  Ruler, 
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Settings,
  UserPlus,
  MapPin,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import { useBranch } from '../../contexts/BranchContext';

const CompanyBranchDashboard: React.FC = () => {
  const { companyCode, branchId } = useParams<{ companyCode: string; branchId: string }>();
  const navigate = useNavigate();
  const { selectedBranch, loading: branchLoading } = useBranch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    lowStockAlerts: 0,
    totalSales: 0,
    activeOrders: 0,
    recentActivity: [] as any[]
  });

  const loadDashboardData = useCallback(async () => {
    if (!selectedBranch || !companyCode) {
      setError('No branch or company selected. Please select a branch to view the dashboard.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load company data
      const companyData = await apiService.getCompanyByCode(companyCode);
      setCompany(companyData);

      // Fetch data for dashboard cards
      const [items, lowStockAlerts, salesOrders, purchaseOrders] = await Promise.all([
        apiService.getItems(selectedBranch.id),
        apiService.getLowStockAlerts(selectedBranch.id),
        apiService.getSalesOrders(selectedBranch.id),
        apiService.getPurchaseOrders(selectedBranch.id)
      ]);

      setDashboardData({
        totalItems: items.length,
        lowStockAlerts: lowStockAlerts.length,
        totalSales: salesOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
        activeOrders: salesOrders.filter((order: any) => order.status !== 'completed' && order.status !== 'cancelled').length +
                      purchaseOrders.filter((order: any) => order.status !== 'completed' && order.status !== 'cancelled').length,
        recentActivity: [
          { id: 'act1', type: 'Stock Adjustment', description: 'Premium Malt (+50 kg)', time: '2 hours ago' },
          { id: 'act2', type: 'Sales Order', description: 'SO-2024-001 (-20 units)', time: '1 day ago' },
          { id: 'act3', type: 'Purchase Order', description: 'PO-2024-015 (+100 units)', time: '2 days ago' },
        ]
      });

    } catch (err: any) {
      console.error('Failed to load branch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
      toast.error(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, companyCode]);

  useEffect(() => {
    if (!branchLoading && selectedBranch) {
      loadDashboardData();
    } else if (!branchLoading && !selectedBranch) {
      // If no branch is selected after loading, redirect to branch selection
      navigate(`/company/${companyCode}/branches`);
    }
  }, [selectedBranch, branchLoading, loadDashboardData, navigate, companyCode]);

  if (branchLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <AlertTriangle className="h-24 w-24 text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Dashboard Error</h2>
        <p className="text-gray-600 text-center max-w-md">
          {error}
        </p>
        <button 
          onClick={() => navigate(`/company/${companyCode}/branches`)}
          className="mt-8 btn-primary"
        >
          Select Another Branch
        </button>
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <Home className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Branch Selected</h2>
        <p className="text-gray-600 text-center max-w-md">
          Please select a branch to view its dashboard and manage operations.
        </p>
        <button 
          onClick={() => navigate(`/company/${companyCode}/branches`)}
          className="mt-8 btn-primary"
        >
          Go to Branch Selection
        </button>
      </div>
    );
  }

  const quickActions = [
    { name: 'Item Master', icon: Box, href: `/company/${companyCode}/branch/${branchId}/item-master`, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin'] },
    { name: 'Stock Management', icon: Layers, href: `/company/${companyCode}/branch/${branchId}/stock`, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin'] },
    { name: 'Sales Orders', icon: ShoppingCart, href: `/company/${companyCode}/branch/${branchId}/sales`, roles: ['Branch Admin', 'Branch Manager', 'Sales Officer', 'Company Admin'] },
    { name: 'Purchase Orders', icon: ShoppingBag, href: `/company/${companyCode}/branch/${branchId}/purchases`, roles: ['Branch Admin', 'Branch Manager', 'Purchase Officer', 'Company Admin'] },
    { name: 'Inventory Reports', icon: BarChart3, href: `/company/${companyCode}/branch/${branchId}/inventory-reports`, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin', 'Auditor'] },
    { name: 'Batch Tracking', icon: GitBranch, href: `/company/${companyCode}/branch/${branchId}/batch-tracking`, roles: ['Branch Admin', 'Branch Manager', 'Inventory Officer', 'Company Admin'] },
  ];

  const companyActions = [
    { name: 'Company Settings', icon: Settings, href: `/company/${companyCode}/settings`, roles: ['Company Admin'] },
    { name: 'User Management', icon: UserPlus, href: `/company/${companyCode}/users`, roles: ['Company Admin'] },
    { name: 'Branch Management', icon: MapPin, href: `/company/${companyCode}/branches`, roles: ['Company Admin'] },
    { name: 'Company Dashboard', icon: Building2, href: `/company/${companyCode}`, roles: ['Company Admin'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">{company?.name}</h1>
                <p className="text-sm text-gray-500">Company Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, Admin</span>
              <button
                onClick={() => navigate(`/company/${companyCode}`)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Building2 className="h-4 w-4" />
                <span>Company Portal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Branch Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to {selectedBranch.name} Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                {selectedBranch.address}, {selectedBranch.countryId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-sm text-gray-500">Branch: {selectedBranch.name}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Items" 
              value={dashboardData.totalItems} 
              icon={<Package className="h-6 w-6 text-blue-500" />} 
              trend="+12%" 
              trendType="positive" 
            />
            <StatCard 
              title="Low Stock Alerts" 
              value={dashboardData.lowStockAlerts} 
              icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />} 
              trend="-3" 
              trendType="negative" 
            />
            <StatCard 
              title="Total Sales" 
              value={`$${dashboardData.totalSales.toLocaleString()}`} 
              icon={<DollarSign className="h-6 w-6 text-green-500" />} 
              trend="+5%" 
              trendType="positive" 
            />
            <StatCard 
              title="Active Orders" 
              value={dashboardData.activeOrders} 
              icon={<ShoppingCart className="h-6 w-6 text-purple-500" />} 
              trend="+5" 
              trendType="positive" 
            />
          </div>

          {/* Company Management Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Company Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {companyActions.map((action) => (
                <QuickActionCard 
                  key={action.name}
                  name={action.name}
                  icon={action.icon}
                  href={action.href}
                  onClick={() => navigate(action.href)}
                />
              ))}
            </div>
          </div>

          {/* Branch Operations */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Branch Operations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <QuickActionCard 
                  key={action.name}
                  name={action.name}
                  icon={action.icon}
                  href={action.href}
                  onClick={() => navigate(action.href)}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white shadow rounded-lg p-6">
              {dashboardData.recentActivity.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentActivity.map((activity) => (
                    <li key={activity.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; trendType?: 'positive' | 'negative' }> = ({
  title,
  value,
  icon,
  trend,
  trendType
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trendType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendType === 'positive' ? <ArrowUpRight className="h-4 w-4 mr-0.5" /> : <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                  {trend}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const QuickActionCard: React.FC<{ name: string; icon: React.ElementType; href: string; onClick: () => void }> = ({
  name,
  icon: Icon,
  onClick
}) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200 text-gray-800 hover:text-blue-600"
  >
    <Icon className="h-8 w-8 mb-3" />
    <span className="text-md font-medium text-center">{name}</span>
  </button>
);

export default CompanyBranchDashboard;
