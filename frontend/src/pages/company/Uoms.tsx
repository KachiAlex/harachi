import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { UnitOfMeasure } from '../../types';

const UomsPage: React.FC = () => {
  const { user } = useAuth();
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [form, setForm] = useState<Partial<UnitOfMeasure>>({ name: '', code: '', isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      if (editingId) {
        await apiService.updateUom(user.companyId, editingId, form);
      } else {
        await apiService.createUom(user.companyId, {
          name: form.name!,
          code: form.code!,
          isActive: true,
          companyId: user.companyId,
        });
      }
      setForm({ name: '', code: '', isActive: true });
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u: UnitOfMeasure) => {
    setEditingId(u.id);
    setForm({ name: u.name, code: u.code, isActive: u.isActive });
  };

  const handleDelete = async (id: string) => {
    if (!user?.companyId) return;
    const ok = window.confirm('Delete this UoM?');
    if (!ok) return;
    await apiService.deleteUom(user.companyId, id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Units of Measure</h1>
      </div>

      <div className="card space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="input-field" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input className="input-field" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={loading} className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', code: '', isActive: true }); }} className="btn-secondary">Cancel</button>}
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uoms.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{u.code}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    <button onClick={() => handleEdit(u)} className="text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {uoms.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">No UoMs yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UomsPage;


