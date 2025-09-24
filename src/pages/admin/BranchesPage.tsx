import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Branch, Country } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { useAppStore } from '../../store/useAppStore';

const emptyForm: Branch = {
  id: '',
  countryId: '',
  name: '',
  branchCode: '',
  branchType: 'WAREHOUSE',
  active: true,
  createdAt: new Date().toISOString(),
};

const BranchesPage: React.FC = () => {
  const { companies, currentCompany } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Branch | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const activeCompanyId = currentCompany?.id || companies[0]?.id || '';

  const loadCountries = async () => {
    if (!activeCompanyId) return;
    try {
      const data = await FirestoreService.getCountriesByCompany(activeCompanyId);
      setCountries(data);
      if (!selectedCountry && data.length) setSelectedCountry(data[0].id);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load countries');
    }
  };

  const loadBranches = async () => {
    if (!selectedCountry) return;
    setLoading(true);
    try {
      const data = await FirestoreService.getBranchesByCountry(selectedCountry);
      setBranches(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, [activeCompanyId]);

  useEffect(() => {
    loadBranches();
    // eslint-disable-next-line
  }, [selectedCountry]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return branches;
    return branches.filter(b =>
      b.name.toLowerCase().includes(s) ||
      b.branchCode.toLowerCase().includes(s)
    );
  }, [branches, search]);

  const beginCreate = () => {
    if (!selectedCountry) {
      toast.error('Please select a country first');
      return;
    }
    setEditing({ ...emptyForm, countryId: selectedCountry });
  };

  const beginEdit = (b: Branch) => setEditing(b);
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    try {
      setLoading(true);
      if (!editing.id) {
        await FirestoreService.createBranch({
          countryId: editing.countryId,
          name: editing.name,
          branchCode: editing.branchCode,
          branchType: editing.branchType,
          address: editing.address,
          contactInfo: editing.contactInfo,
          active: !!editing.active,
          createdAt: new Date().toISOString(),
        });
        toast.success('Branch created');
      } else {
        await FirestoreService.updateBranch(editing.id, {
          name: editing.name,
          branchCode: editing.branchCode,
          branchType: editing.branchType,
          address: editing.address,
          contactInfo: editing.contactInfo,
          active: !!editing.active,
        });
        toast.success('Branch updated');
      }
      setEditing(null);
      await loadBranches();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this branch?')) return;
    try {
      setLoading(true);
      await FirestoreService.deleteBranch(id);
      toast.success('Branch deleted');
      await loadBranches();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Admin • Branches</h1>
        <button onClick={beginCreate} className="btn btn-primary">+ New Branch</button>
      </div>

      <div className="mb-4 flex gap-3 items-center">
        <select className="input" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          <option value="">Select country</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Search branches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Code</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-t">
                <td className="px-3 py-2">{b.name}</td>
                <td className="px-3 py-2">{b.branchCode}</td>
                <td className="px-3 py-2">{b.branchType}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${b.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {b.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-blue-600 mr-3" onClick={() => beginEdit(b)}>Edit</button>
                  <button className="text-red-600" onClick={() => remove(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No branches</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{editing.id ? 'Edit Branch' : 'New Branch'}</div>
              <button onClick={cancel} className="text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Country</label>
                <select className="input" value={editing.countryId} onChange={(e) => setEditing({ ...editing, countryId: e.target.value })}>
                  <option value="">Select country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Name</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Code</label>
                <input className="input" value={editing.branchCode} onChange={(e) => setEditing({ ...editing, branchCode: e.target.value.toUpperCase() })} />
              </div>
              <div className="col-span-2">
                <label className="label">Type</label>
                <select className="input" value={editing.branchType} onChange={(e) => setEditing({ ...editing, branchType: e.target.value as Branch['branchType'] })}>
                  <option value="BREWERY">BREWERY</option>
                  <option value="PACKAGING">PACKAGING</option>
                  <option value="TAPROOM">TAPROOM</option>
                  <option value="DISTRIBUTION">DISTRIBUTION</option>
                  <option value="WAREHOUSE">WAREHOUSE</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input id="active" type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                <label htmlFor="active">Active</label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;


