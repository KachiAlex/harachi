import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { InventoryItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const InventoryList: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.companyId) { setLoading(false); return; }
      try {
        setLoading(true);
        const data = await apiService.getInventory(user.companyId);
        setItems(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.companyId]);

  const handleDelete = async (id: string) => {
    if (!user?.companyId) return;
    const ok = window.confirm('Delete this item?');
    if (!ok) return;
    try {
      setDeletingId(id);
      await apiService.deleteInventoryItem(user.companyId, id);
      const data = await apiService.getInventory(user.companyId);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <a href="/branch/inventory/new" className="btn-primary">Add Item</a>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UoM</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.sku}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.uomName || item.uomId}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.quantityOnHand ?? 0}</td>
                  <td className="px-4 py-2 text-sm text-right">
                    <a href={`/branch/inventory/${item.id}`} className="text-primary-600 hover:text-primary-700 mr-3">Edit</a>
                    <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="text-red-600 hover:text-red-700">
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No items yet</td>
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
