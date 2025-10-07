import React, { useState, useEffect, useCallback } from 'react';
import { Box, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  baseUom?: string;
  itemClassId?: string;
  brand?: string;
  model?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  unitPrice?: number;
  isActive: boolean;
  isBatchTracked?: boolean;
  hasExpiry?: boolean;
}

interface ItemFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  itemClassId: string;
  brand: string;
  model: string;
  reorderPoint: number | string;
  reorderQuantity: number | string;
  unitCost: number | string;
  unitPrice: number | string;
  isActive: boolean;
  isBatchTracked: boolean;
  hasExpiry: boolean;
}

const ItemMaster: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    code: '',
    name: '',
    description: '',
    category: '',
    itemClassId: 'default',
    brand: '',
    model: '',
    reorderPoint: '',
    reorderQuantity: '',
    unitCost: '',
    unitPrice: '',
    isActive: true,
    isBatchTracked: false,
    hasExpiry: false
  });
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getItems(user.companyId);
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
      toast.error('Failed to load item master');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenForm = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        itemClassId: item.itemClassId || 'default',
        brand: item.brand || '',
        model: item.model || '',
        reorderPoint: item.reorderPoint || '',
        reorderQuantity: item.reorderQuantity || '',
        unitCost: item.unitCost || '',
        unitPrice: item.unitPrice || '',
        isActive: item.isActive,
        isBatchTracked: item.isBatchTracked || false,
        hasExpiry: item.hasExpiry || false
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        category: '',
        itemClassId: 'default',
        brand: '',
        model: '',
        reorderPoint: '',
        reorderQuantity: '',
        unitCost: '',
        unitPrice: '',
        isActive: true,
        isBatchTracked: false,
        hasExpiry: false
      });
    }
    setShowForm(true);
  };

  const handleSaveItem = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in required fields (Code and Name)');
      return;
    }

    try {
      setSaving(true);
      const itemData = {
        ...formData,
        companyId: user?.companyId,
        reorderPoint: formData.reorderPoint ? Number(formData.reorderPoint) : undefined,
        reorderQuantity: formData.reorderQuantity ? Number(formData.reorderQuantity) : undefined,
        unitCost: formData.unitCost ? Number(formData.unitCost) : undefined,
        unitPrice: formData.unitPrice ? Number(formData.unitPrice) : undefined
      };

      if (editingItem) {
        await apiService.updateItem(editingItem.id, itemData);
        toast.success('Item updated successfully');
      } else {
        await apiService.createItem(itemData);
        toast.success('Item created successfully');
      }

      setShowForm(false);
      loadItems();
    } catch (error: any) {
      console.error('Failed to save item:', error);
      toast.error(error.response?.data?.error || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await apiService.deleteItem(item.id);
      toast.success('Item deleted successfully');
      loadItems();
    } catch (error: any) {
      console.error('Failed to delete item:', error);
      toast.error(error.response?.data?.error || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Master</h1>
          <p className="text-gray-600">Manage items, UOM conversions, and product catalog</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by item name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <Box className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-semibold">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Box className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active Items</p>
              <p className="text-xl font-semibold">{items.filter(i => i.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Box className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-xl font-semibold">{new Set(items.map(i => i.category)).size}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Box className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base UOM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No items found. Click "Add Item" to create your first item.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.baseUom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenForm(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., ITEM001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Product Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Item description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Electronics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Brand Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Model Number"
                  />
                </div>
              </div>

              {/* Inventory Settings */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Inventory Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                    <input
                      type="number"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                      className="input w-full"
                      placeholder="Min. quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity</label>
                    <input
                      type="number"
                      value={formData.reorderQuantity}
                      onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                      className="input w-full"
                      placeholder="Order quantity"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                      className="input w-full"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="input w-full"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isBatchTracked}
                      onChange={(e) => setFormData({ ...formData, isBatchTracked: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Batch Tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasExpiry}
                      onChange={(e) => setFormData({ ...formData, hasExpiry: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has Expiry Date</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemMaster;
