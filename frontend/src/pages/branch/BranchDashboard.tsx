import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { useBranch } from '../../contexts/BranchContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalSales: number;
  totalPurchases: number;
  activeOrders: number;
  pendingOrders: number;
}

const BranchDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranch();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    totalSales: 0,
    totalPurchases: 0,
    activeOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      navigate('/branch/select');
      return;
    }
    loadDashboardData();
  }, [selectedBranch]);

  const loadDashboardData = async () => {
    try {
      setLoading(false);
      // TODO: Load actual data from API
      // For now, using mock data
      setStats({
        totalItems: 48,
        lowStockItems: 5,
        totalSales: 125000,
        totalPurchases: 85000,
        activeOrders: 12,
        pendingOrders: 3
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to load dashboard data');
    }
  };

  const quickActions = [
    {
      title: 'Item Master',
      description: 'Manage inventory items',
      icon: Package,
      color: 'blue',
      path: '/branch/item-master'
    },
    {
      title: 'Stock Management',
      description: 'Track stock movements',
      icon: Activity,
      color: 'green',
      path: '/branch/stock'
    },
    {
      title: 'Sales Orders',
      description: 'Manage sales',
      icon: ShoppingCart,
      color: 'purple',
      path: '/branch/sales'
    },
    {
      title: 'Purchase Orders',
      description: 'Manage purchases',
      icon: TrendingUp,
      color: 'orange',
      path: '/branch/purchases'
    },
    {
      title: 'Inventory Reports',
      description: 'View analytics',
      icon: DollarSign,
      color: 'indigo',
      path: '/branch/inventory-reports'
    },
    {
      title: 'Batch Tracking',
      description: 'Track batches & lots',
      icon: AlertTriangle,
      color: 'red',
      path: '/branch/batch-tracking'
    }
  ];

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'blue',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'red',
      trend: '-3',
      trendUp: false
    },
    {
      title: 'Total Sales',
      value: `$${(stats.totalSales / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: 'green',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: 'purple',
      trend: '+5',
      trendUp: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome to {selectedBranch?.name}
            </h1>
            <p className="text-blue-100">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Logged in as</p>
            <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                    <Icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: 'Stock Adjustment', item: 'Premium Malt', qty: '+50 kg', time: '2 hours ago', type: 'in' },
              { action: 'Sales Order', item: 'SO-2024-001', qty: '-20 units', time: '3 hours ago', type: 'out' },
              { action: 'Purchase Order', item: 'PO-2024-015', qty: '+100 units', time: '5 hours ago', type: 'in' },
              { action: 'Stock Transfer', item: 'Cascade Hops', qty: '-15 kg', time: '1 day ago', type: 'out' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'in' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    activity.type === 'in' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {activity.qty}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;

