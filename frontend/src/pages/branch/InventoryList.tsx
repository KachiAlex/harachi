import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { InventoryItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { Package, Search, Plus, AlertTriangle, Edit2, Trash2, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    const load = async () => {
      if (!user?.company?.id) { 
        setLoading(false); 
        return; 
      }
      try {
        setLoading(true);
        const data = await apiService.getInventory(user.company.id);
        setItems(data);
        setFilteredItems(data);
      } catch (e: any) {
        const errorMsg = e?.message || 'Failed to load inventory';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.company?.id, selectedBranch]);

  // Filter and search effect
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'low') {
      filtered = filtered.filter(item => {
        const onHand = item.quantityOnHand ?? 0;
        const reorder = item.reorderLevel ?? 0;
        return onHand > 0 && onHand <= reorder;
      });
    } else if (filterStatus === 'out') {
      filtered = filtered.filter(item => (item.quantityOnHand ?? 0) === 0);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!user?.company?.id) return;
    const ok = window.confirm('Delete this item? This action cannot be undone.');
    if (!ok) return;
    try {
      setDeletingId(id);
      await apiService.deleteInventoryItem(user.company.id, id);
      const data = await apiService.getInventory(user.company.id);
      setItems(data);
      toast.success('Item deleted successfully');
    } catch (e: any) {
      const errorMsg = e?.message || 'Failed to delete';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const onHand = item.quantityOnHand ?? 0;
    const reorder = item.reorderLevel ?? 0;

    if (onHand === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-4 w-4" /> };
    } else if (onHand <= reorder) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: <TrendingDown className="h-4 w-4" /> };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: <Package className="h-4 w-4" /> };
  };

  const lowStockCount = items.filter(item => {
    const onHand = item.quantityOnHand ?? 0;
    const reorder = item.reorderLevel ?? 0;
    return onHand > 0 && onHand <= reorder;
  }).length;

  const outOfStockCount = items.filter(item => (item.quantityOnHand ?? 0) === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 text-primary-600 mr-2" />
            Inventory
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedBranch ? `Viewing: ${selectedBranch.name}` : 'Select a branch to view inventory'}
          </p>
        </div>
        <button
          onClick={() => navigate('/branch/inventory/new')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockCount}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'low'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterStatus('out')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'out'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UoM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map(item => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.category || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.uomName || item.uomId || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{item.quantityOnHand ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.reorderLevel ?? 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => navigate(`/branch/inventory/${item.id}`)}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingId === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">No items found</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by adding your first inventory item'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
