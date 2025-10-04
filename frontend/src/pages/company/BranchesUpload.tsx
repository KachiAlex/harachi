import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../firebase/config';
import { ref, uploadBytes } from 'firebase/storage';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { apiService } from '../../services/api';

const BranchesUpload: React.FC = () => {
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
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      setRows(data as any[]);
    }
  };

  const handleImport = async () => {
    if (!user?.companyId || !file) return;
    try {
      setLoading(true);
      setError(null);
      const storageRef = ref(storage, `uploads/${user.companyId}/branches/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);

      let count = 0;
      for (const r of rows) {
        const branch = {
          name: String(r.name || r.Name || ''),
          code: String(r.code || r.Code || ''),
          address: r.address || '',
          countryId: r.countryId || '',
          isActive: true,
        };
        if (branch.name && branch.code) {
          await apiService.createBranch(user.companyId, branch as any);
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
      <h1 className="text-2xl font-bold text-gray-900">Upload Branches</h1>
      <div className="card space-y-4">
        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={parseFile} disabled={!file}>Parse</button>
          <button className="btn-primary" onClick={handleImport} disabled={!file || rows.length === 0 || loading}>{loading ? 'Importing...' : 'Import'}</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {successCount !== null && <div className="text-green-700">Imported {successCount} branches</div>}
      </div>
    </div>
  );
};

export default BranchesUpload;


