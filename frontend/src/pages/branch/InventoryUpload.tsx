import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../firebase/config';
import { ref, uploadBytes } from 'firebase/storage';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { apiService } from '../../services/api';
import { InventoryItem } from '../../types';

const InventoryUpload: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setRows([]);
    setSuccessCount(null);
  };

  const parseFile = async () => {
    if (!file) return;
    setError(null);
    setRows([]);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      setRows(parsed.data as any[]);
    } else {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const data = XLSX.utils.sheet_to_json(ws);
      setRows(data as any[]);
    }
  };

  const handleImport = async () => {
    if (!user?.companyId || !file) return;
    try {
      setLoading(true);
      setError(null);

      // Upload raw file to Storage for audit
      const storageRef = ref(storage, `uploads/${user.companyId}/inventory/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);

      // Import to Firestore
      let count = 0;
      for (const r of rows) {
        const item: Omit<InventoryItem, 'id'> = {
          sku: String(r.sku || r.SKU || r.code || ''),
          name: String(r.name || r.Name || ''),
          category: r.category || r.Category || undefined,
          uomId: String(r.uomId || r.UoM || r.unit || ''),
          uomName: r.uomName || r.UoMName || undefined,
          quantityOnHand: Number(r.quantityOnHand ?? r.qty ?? r.Quantity ?? 0) || 0,
          reorderLevel: r.reorderLevel ? Number(r.reorderLevel) : undefined,
          warehouseId: r.warehouseId || undefined,
          branchId: r.branchId || undefined,
          companyId: user.companyId,
          isActive: true,
        };
        if (item.sku && item.name && item.uomId) {
          await apiService.createInventoryItem(user.companyId, item);
          count++;
        }
      }
      setSuccessCount(count);
    } catch (e: any) {
      setError(e?.message || 'Failed to import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upload Inventory Sheet</h1>
      </div>

      <div className="card space-y-4">
        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={parseFile} disabled={!file}>Parse</button>
          <button className="btn-primary" onClick={handleImport} disabled={!file || rows.length === 0 || loading}>{loading ? 'Importing...' : 'Import'}</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {successCount !== null && <div className="text-green-700">Imported {successCount} items</div>}
      </div>

      {rows.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UoM</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.slice(0, 50).map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{r.sku || r.SKU || r.code}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.name || r.Name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.uomId || r.UoM || r.unit}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.quantityOnHand ?? r.qty ?? r.Quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryUpload;
