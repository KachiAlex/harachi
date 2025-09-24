import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Branch, Country, Role, UserProfile } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { useAppStore } from '../../store/useAppStore';

const emptyUser: UserProfile = {
  id: '',
  email: '',
  displayName: '',
  tenantId: undefined,
  countryId: undefined,
  branchId: undefined,
  roleId: undefined,
  permissions: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const UsersPage: React.FC = () => {
  const { userContext } = useAppStore();
  const tenantId = userContext?.tenantId;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<UserProfile | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        FirestoreService.getUsers(tenantId),
        FirestoreService.getRoles(tenantId),
      ]);
      setUsers(u as UserProfile[]);
      setRoles(r as Role[]);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load users/roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tenantId]);

  useEffect(() => {
    (async () => {
      try {
        // If tenant context holds company -> load tenant countries if available via service
        const cs = await FirestoreService.getCountries();
        setCountries(cs as Country[]);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!editing?.countryId) { setBranches([]); return; }
      try {
        const bs = await FirestoreService.getBranchesByCountry(editing.countryId);
        setBranches(bs as Branch[]);
      } catch {}
    })();
  }, [editing?.countryId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return users;
    return users.filter(u => u.email.toLowerCase().includes(s) || (u.displayName || '').toLowerCase().includes(s));
  }, [users, search]);

  const beginCreate = () => setEditing({ ...emptyUser, tenantId });
  const beginEdit = (u: UserProfile) => setEditing(u);
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    try {
      setLoading(true);
      const payload: any = {
        email: editing.email,
        displayName: editing.displayName,
        tenantId: tenantId,
        countryId: editing.countryId || null,
        branchId: editing.branchId || null,
        roleId: editing.roleId || null,
        permissions: editing.permissions || [],
        isActive: !!editing.isActive,
        createdAt: editing.createdAt || new Date(),
        updatedAt: new Date(),
      };
      if (!editing.id) {
        await FirestoreService.createUser(payload);
        toast.success('User profile created');
      } else {
        await FirestoreService.updateUser(editing.id, payload);
        toast.success('User profile updated');
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
    if (!window.confirm('Delete this user profile?')) return;
    try {
      setLoading(true);
      await FirestoreService.deleteUser(id);
      toast.success('User profile deleted');
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
        <h1 className="text-lg font-semibold">Admin • Users</h1>
        <button onClick={beginCreate} className="btn btn-primary">+ New User</button>
      </div>

      <div className="mb-4 flex gap-3">
        <input className="input" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.displayName}</td>
                <td className="px-3 py-2">{roles.find(r => r.id === u.roleId)?.name || '-'}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-blue-600 mr-3" onClick={() => beginEdit(u)}>Edit</button>
                  <button className="text-red-600" onClick={() => remove(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No users</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{editing.id ? 'Edit User' : 'New User'}</div>
              <button onClick={cancel} className="text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Email</label>
                <input className="input" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Display Name</label>
                <input className="input" value={editing.displayName || ''} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={editing.countryId || ''} onChange={(e) => setEditing({ ...editing, countryId: e.target.value || undefined, branchId: undefined })}>
                  <option value="">-</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Branch</label>
                <select className="input" value={editing.branchId || ''} onChange={(e) => setEditing({ ...editing, branchId: e.target.value || undefined })}>
                  <option value="">-</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Role</label>
                <select className="input" value={editing.roleId || ''} onChange={(e) => setEditing({ ...editing, roleId: e.target.value || undefined })}>
                  <option value="">-</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input id="active" type="checkbox" checked={!!editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
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

export default UsersPage;
