import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Country } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { useAppStore } from '../../store/useAppStore';

const emptyForm: Country = {
  id: '',
  companyId: '',
  name: '',
  countryCode: '',
  currencyCode: '',
  taxSystem: 'VAT',
  timezone: 'UTC',
  active: true,
  createdAt: new Date().toISOString(),
};

const CountriesPage: React.FC = () => {
  const { companies, currentCompany } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Country | null>(null);

  const activeCompanyId = currentCompany?.id || companies[0]?.id || '';

  const load = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      const data = await FirestoreService.getCountriesByCompany(activeCompanyId);
      setCountries(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeCompanyId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return countries;
    return countries.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.countryCode.toLowerCase().includes(s) ||
      c.currencyCode.toLowerCase().includes(s)
    );
  }, [countries, search]);

  const beginCreate = () => {
    setEditing({ ...emptyForm, companyId: activeCompanyId });
  };

  const beginEdit = (c: Country) => setEditing(c);

  const cancel = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    try {
      setLoading(true);
      if (!editing.id) {
        const id = await FirestoreService.createCountry({
          companyId: activeCompanyId,
          name: editing.name,
          countryCode: editing.countryCode,
          currencyCode: editing.currencyCode,
          taxSystem: editing.taxSystem,
          timezone: editing.timezone,
          active: !!editing.active,
          createdAt: new Date().toISOString(),
        });
        toast.success('Country created');
      } else {
        await FirestoreService.updateCountry(editing.id, {
          name: editing.name,
          countryCode: editing.countryCode,
          currencyCode: editing.currencyCode,
          taxSystem: editing.taxSystem,
          timezone: editing.timezone,
          active: !!editing.active,
        });
        toast.success('Country updated');
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this country?')) return;
    try {
      setLoading(true);
      await FirestoreService.deleteCountry(id);
      toast.success('Country deleted');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Admin • Countries</h1>
        <button onClick={beginCreate} className="btn btn-primary">+ New Country</button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          className="input"
          placeholder="Search countries..."
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
              <th className="text-left px-3 py-2">Currency</th>
              <th className="text-left px-3 py-2">Tax System</th>
              <th className="text-left px-3 py-2">Timezone</th>
              <th className="text-left px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.countryCode}</td>
                <td className="px-3 py-2">{c.currencyCode}</td>
                <td className="px-3 py-2">{c.taxSystem}</td>
                <td className="px-3 py-2">{c.timezone}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-blue-600 mr-3" onClick={() => beginEdit(c)}>Edit</button>
                  <button className="text-red-600" onClick={() => remove(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">No countries</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{editing.id ? 'Edit Country' : 'New Country'}</div>
              <button onClick={cancel} className="text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Country Code</label>
                <input className="input" value={editing.countryCode} onChange={(e) => setEditing({ ...editing, countryCode: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="label">Currency Code</label>
                <input className="input" value={editing.currencyCode} onChange={(e) => setEditing({ ...editing, currencyCode: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="label">Tax System</label>
                <select className="input" value={editing.taxSystem} onChange={(e) => setEditing({ ...editing, taxSystem: e.target.value as Country['taxSystem'] })}>
                  <option value="VAT">VAT</option>
                  <option value="GST">GST</option>
                  <option value="SALES_TAX">SALES_TAX</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Timezone</label>
                <input className="input" value={editing.timezone} onChange={(e) => setEditing({ ...editing, timezone: e.target.value })} />
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

export default CountriesPage;


