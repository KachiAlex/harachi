import React, { useState, useEffect, useCallback } from 'react';
import { GitBranch, Search, QrCode, Plus, X, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface Batch {
  id: string;
  batchNumber: string;
  itemId: string;
  itemName?: string;
  quantity: number;
  manufacturingDate?: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'recalled';
  isActive: boolean;
}

const BatchTracking: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTraceability, setShowTraceability] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [traceabilityData, setTraceabilityData] = useState<any>(null);
  const [formData, setFormData] = useState({
    batchNumber: '',
    itemId: '',
    quantity: '',
    manufacturingDate: '',
    expiryDate: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const loadBatches = useCallback(async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getBatches(user.companyId);
      setBatches(data.batches || []);
    } catch (error: any) {
      console.error('Failed to load batches:', error);
      toast.error('Failed to load batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleOpenForm = () => {
    setFormData({
      batchNumber: '',
      itemId: '',
      quantity: '',
      manufacturingDate: '',
      expiryDate: '',
      notes: ''
    });
    setShowForm(true);
  };

  const handleSaveBatch = async () => {
    if (!formData.batchNumber || !formData.itemId || !formData.quantity) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      await apiService.createBatch({
        ...formData,
        companyId: user?.companyId,
        branchId: 'default',
        quantity: Number(formData.quantity)
      });
      toast.success('Batch created successfully');
      setShowForm(false);
      loadBatches();
    } catch (error: any) {
      console.error('Failed to create batch:', error);
      toast.error(error.response?.data?.error || 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  };

  const handleViewTraceability = async (batch: Batch) => {
    try {
      setSelectedBatch(batch);
      const data = await apiService.getBatchTraceability(batch.id);
      setTraceabilityData(data);
      setShowTraceability(true);
    } catch (error: any) {
      console.error('Failed to load traceability:', error);
      toast.error('Failed to load traceability data');
    }
  };

  const filteredBatches = batches.filter(batch =>
    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (batch.itemName && batch.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeBatches = batches.filter(b => b.isActive && b.status === 'active').length;
  const expiringSoon = batches.filter(b => {
    if (!b.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;
  const expired = batches.filter(b => b.status === 'expired').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch & Lot Tracking</h1>
          <p className="text-gray-600">Complete traceability for batches and lots</p>
        </div>
        <button onClick={handleOpenForm} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Batch</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by batch number, lot number, or item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <GitBranch className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active Batches</p>
              <p className="text-xl font-semibold">{activeBatches}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <QrCode className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Tracked Items</p>
              <p className="text-xl font-semibold">{new Set(batches.map(b => b.itemId)).size}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-xl font-semibold">{expiringSoon}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Expired Batches</p>
              <p className="text-xl font-semibold">{expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="card">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading batches...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No batches found</h3>
            <p className="mb-4">Start tracking batches for complete traceability.</p>
            <button onClick={handleOpenForm} className="btn-primary">
              <Plus className="h-4 w-4 inline mr-2" />
              Create First Batch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mfg Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {batch.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.itemName || batch.itemId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        batch.status === 'active' ? 'bg-green-100 text-green-800' :
                        batch.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewTraceability(batch)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Traceability"
                      >
                        <Eye className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create New Batch</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., BATCH-001"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

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
              <button onClick={handleSaveBatch} className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Create Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traceability Modal */}
      {showTraceability && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Batch Traceability: {selectedBatch.batchNumber}</h2>
              <button onClick={() => setShowTraceability(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Batch Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Batch Number:</span> {selectedBatch.batchNumber}
                  </div>
                  <div>
                    <span className="text-blue-700">Quantity:</span> {selectedBatch.quantity}
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span> {selectedBatch.status}
                  </div>
                </div>
              </div>

              {traceabilityData ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Traceability Chain</h3>
                  <div className="text-sm text-gray-600">
                    {traceabilityData.upstream && traceabilityData.upstream.length > 0 ? (
                      <div className="space-y-2">
                        {traceabilityData.upstream.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded">
                            <p><strong>Upstream:</strong> {item.description || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No upstream traceability data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Loading traceability data...
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowTraceability(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTracking;