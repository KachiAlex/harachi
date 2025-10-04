import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FirestoreService } from '../../services/firestoreService';
import { toast } from 'react-hot-toast';
import { useAppStore } from '../../store/useAppStore';

const AdminDashboard: React.FC = () => {
  const { businessDate } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ tenants: 0, countries: 0, branches: 0, companies: 0, warehouses: 0, users: 0, roles: 0, licenses: 0 });
  const [datasets, setDatasets] = useState({
    tenants: [] as any[],
    countries: [] as any[],
    branches: [] as any[],
    companies: [] as any[],
    warehouses: [] as any[],
    users: [] as any[],
    roles: [] as any[],
    licenses: [] as any[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tenants, countries, branches, companies, warehouses, users, roles] = await Promise.all([
        FirestoreService.getTenants(),
        FirestoreService.getCountries(),
        FirestoreService.getBranches(),
        FirestoreService.getCompanies(),
        FirestoreService.getWarehouses(),
        FirestoreService.getUsers(),
        FirestoreService.getRoles(),
      ]);
      
      // Count total licenses across all companies
      const licenseCount = await FirestoreService.getTotalLicenseCount();
      
      setDatasets({ tenants, countries, branches, companies, warehouses, users, roles, licenses: [] });
      setCounts({
        tenants: tenants.length,
        countries: countries.length,
        branches: branches.length,
        companies: companies.length,
        warehouses: warehouses.length,
        users: users.length,
        roles: roles.length,
        licenses: licenseCount,
      });
    } catch (e: any) {
      const msg = e?.message || 'Failed to load admin dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const businessDateLabel = useMemo(() => new Date(businessDate || Date.now()).toLocaleDateString(), [businessDate]);

  const filteredCounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return counts;
    const matches = (obj: any) => {
      const keys = ['name', 'displayName', 'email', 'code', 'itemCode', 'countryCode', 'branchName'];
      for (const key of keys) {
        const val = obj?.[key];
        if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
      }
      // Fallback: scan string values
      return Object.values(obj).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
    };
    return {
      tenants: datasets.tenants.filter(matches).length,
      companies: datasets.companies.filter(matches).length,
      countries: datasets.countries.filter(matches).length,
      branches: datasets.branches.filter(matches).length,
      warehouses: datasets.warehouses.filter(matches).length,
      users: datasets.users.filter(matches).length,
      roles: datasets.roles.filter(matches).length,
      licenses: counts.licenses, // License count doesn't change with search
    };
  }, [search, datasets, counts]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            className="border rounded-md px-3 py-2 w-96"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-primary" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="text-sm text-gray-600">Business Date: {businessDateLabel}</div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Tenants</div>
          <div className="text-2xl font-semibold">{filteredCounts.tenants}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Companies</div>
          <div className="text-2xl font-semibold">{filteredCounts.companies}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Countries</div>
          <div className="text-2xl font-semibold">{filteredCounts.countries}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Branches</div>
          <div className="text-2xl font-semibold">{filteredCounts.branches}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Warehouses</div>
          <div className="text-2xl font-semibold">{filteredCounts.warehouses}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-semibold">{filteredCounts.users}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Roles</div>
          <div className="text-2xl font-semibold">{filteredCounts.roles}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Licenses</div>
          <div className="text-2xl font-semibold">{filteredCounts.licenses}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


