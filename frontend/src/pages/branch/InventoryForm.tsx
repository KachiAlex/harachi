import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { InventoryItem, UnitOfMeasure } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const InventoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [form, setForm] = useState<Partial<InventoryItem>>({
    sku: '',
    name: '',
    uomId: '',
    quantityOnHand: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.companyId) return;
      try {
        const u = await apiService.getUoms(user.companyId);
        setUoms(u);
        if (id) {
          const all = await apiService.getInventory(user.companyId);
          const found = all.find(x => x.id === id);
          if (found) setForm(found);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load data');
      }
    };
    load();
  }, [id, user?.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;
    try {
      setLoading(true);
      setError(null);
      if (id) {
        await apiService.updateInventoryItem(user.companyId, id, form as InventoryItem);
      } else {
        await apiService.createInventoryItem(user.companyId, {
          ...(form as InventoryItem),
          companyId: user.companyId,
        });
      }
      navigate('/branch/inventory');
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{id ? 'Edit' : 'Create'} Item</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input className="input-field" value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input className="input-field" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
          <select className="input-field" value={form.uomId || ''} onChange={e => setForm({ ...form, uomId: e.target.value })} required>
            <option value="">Select UoM</option>
            {uoms.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity On Hand</label>
          <input type="number" className="input-field" value={form.quantityOnHand ?? 0} onChange={e => setForm({ ...form, quantityOnHand: Number(e.target.value) })} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => navigate('/branch/inventory')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;


