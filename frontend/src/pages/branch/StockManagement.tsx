import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, ArrowUpDown, AlertTriangle, X, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface StockMovement {
  id: string;
  itemId: string;
  itemName?: string;
  movementType: 'IN' | 'OUT';
  quantity: number;
  uomId: string;
  reference: string;
  notes?: string;
  createdAt: string;
}

interface StockSummary {
  totalValue: number;
  movementsToday: number;
  lowStockItems: number;
  pendingTransfers: number;
}

const StockManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'movements' | 'adjustments' | 'transfers'>('movements');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<StockSummary>({
    totalValue: 0,
    movementsToday: 0,
    lowStockItems: 0,
    pendingTransfers: 0
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    movementType: 'IN' as 'IN' | 'OUT',
    quantity: '',
    uomId: 'default',
    reference: '',
    notes: '',
    reason: '',
    fromBranchId: '',
    toBranchId: ''
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const [movementsData, summaryData] = await Promise.all([
        apiService.getStockMovements(user.companyId),
        apiService.getStockSummary(user.companyId)
      ]);
      
      setMovements(movementsData.movements || []);
      setSummary(summaryData.summary || {
        totalValue: 0,
        movementsToday: 0,
        lowStockItems: 0,
        pendingTransfers: 0
      });
    } catch (error: any) {
      console.error('Failed to load stock data:', error);
      toast.error('Failed to load stock data');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenForm = (type: 'movements' | 'adjustments' | 'transfers') => {
    setActiveTab(type);
    setFormData({
      itemId: '',
      movementType: 'IN',
      quantity: '',
      uomId: 'default',
      reference: '',
      notes: '',
      reason: '',
      fromBranchId: '',
      toBranchId: ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.itemId || !formData.quantity) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        companyId: user?.companyId,
        branchId: 'default', // TODO: Get from user context
        quantity: Number(formData.quantity)
      };

      if (activeTab === 'movements') {
        await apiService.createStockMovement(data);
        toast.success('Stock movement recorded');
      } else if (activeTab === 'adjustments') {
        await apiService.createStockAdjustment(data);
        toast.success('Stock adjustment recorded');
      } else if (activeTab === 'transfers') {
        await apiService.createStockTransfer(data);
        toast.success('Stock transfer initiated');
      }

      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to save:', error);
      toast.error(error.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Track stock movements, adjustments, and transfers</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleOpenForm('movements')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Movement</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <p className="text-xl font-semibold">₦{summary.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <ArrowUpDown className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Movements Today</p>
              <p className="text-xl font-semibold">{summary.movementsToday}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-xl font-semibold">{summary.lowStockItems}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Pending Transfers</p>
              <p className="text-xl font-semibold">{summary.pendingTransfers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Movements
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'adjustments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Adjustments
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transfers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transfers
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : movements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No {activeTab} yet</h3>
            <p className="mb-4">Get started by recording your first stock {activeTab.slice(0, -1)}.</p>
            <button onClick={() => handleOpenForm(activeTab)} className="btn-primary">
              <Plus className="h-4 w-4 inline mr-2" />
              New {activeTab === 'movements' ? 'Movement' : activeTab === 'adjustments' ? 'Adjustment' : 'Transfer'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.itemName || movement.itemId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        movement.movementType === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.movementType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                New {activeTab === 'movements' ? 'Stock Movement' : activeTab === 'adjustments' ? 'Adjustment' : 'Transfer'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="input w-full"
                  placeholder="Enter item ID"
                />
              </div>

              {activeTab === 'movements' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
                  <select
                    value={formData.movementType}
                    onChange={(e) => setFormData({ ...formData, movementType: e.target.value as 'IN' | 'OUT' })}
                    className="input w-full"
                  >
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., PO-001"
                  />
                </div>
              </div>

              {activeTab === 'adjustments' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input w-full"
                    placeholder="Reason for adjustment"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary" disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;