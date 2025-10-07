import React, { useState, useEffect, useCallback } from 'react';
import { Ruler, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { UnitOfMeasure } from '../../types';
import toast from 'react-hot-toast';

const UomManagement: React.FC = () => {
  const { user } = useAuth();
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<UnitOfMeasure>>({ name: '', code: '', isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.companyId) return;
    const data = await apiService.getUoms(user.companyId);
    setUoms(data);
  }, [user?.companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!user?.companyId || !form.name || !form.code) return;
    try {
      setLoading(true);
      if (editingId) {
        await apiService.updateUom(user.companyId, editingId, form);
        toast.success('UoM updated successfully');
      } else {
        await apiService.createUom(user.companyId, form as any);
        toast.success('UoM created successfully');
      }
      await load();
      setShowForm(false);
      setForm({ name: '', code: '', isActive: true });
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save UoM');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.companyId || !window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteUom(user.companyId, id);
      toast.success('UoM deleted');
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete UoM');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units of Measure</h1>
          <p className="text-gray-600">Manage measurement units and conversions</p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', code: '', isActive: true });
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add UoM</span>
        </button>
      </div>

      {/* UoM List */}
      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uoms.map((uom) => (
              <tr key={uom.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{uom.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{uom.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    uom.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {uom.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setForm(uom);
                      setEditingId(uom.id);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(uom.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {uoms.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No units of measure found. Click "Add UoM" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit UoM' : 'Add New UoM'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., KG, L, PCS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Kilogram, Liter, Pieces"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UomManagement;
