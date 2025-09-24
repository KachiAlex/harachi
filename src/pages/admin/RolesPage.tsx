import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Permission, Role } from '../../types';
import { FirestoreService } from '../../services/firestoreService';
import { useAppStore } from '../../store/useAppStore';

const allPermissions: Permission[] = [
  'admin:tenants:read','admin:tenants:write','tenant:settings:read','tenant:settings:write',
  'inventory:read','inventory:write','production:read','production:write',
  'procurement:read','procurement:write','quality:read','quality:write','reports:read','global:read'
];

const emptyRole: Role = {
  id: '',
  tenantId: undefined,
  name: '',
  description: '',
  permissions: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const RolesPage: React.FC = () => {
  const { userContext } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Role | null>(null);
  const tenantId = userContext?.tenantId;

  const load = async () => {
    setLoading(true);
    try {
      const data = await FirestoreService.getRoles(tenantId);
      setRoles(data as Role[]);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tenantId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return roles;
    return roles.filter(r => r.name.toLowerCase().includes(s));
  }, [roles, search]);

  const beginCreate = () => setEditing({ ...emptyRole, tenantId });
  const beginEdit = (r: Role) => setEditing(r);
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    try {
      setLoading(true);
      const payload = {
        tenantId: editing.tenantId,
        name: editing.name,
        description: editing.description,
        permissions: editing.permissions,
        isActive: !!editing.isActive,
        createdAt: editing.createdAt || new Date(),
        updatedAt: new Date(),
      };
      if (!editing.id) {
        await FirestoreService.createRole(payload);
        toast.success('Role created');
      } else {
        await FirestoreService.updateRole(editing.id, payload);
        toast.success('Role updated');
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
    if (!window.confirm('Delete this role?')) return;
    try {
      setLoading(true);
      await FirestoreService.deleteRole(id);
      toast.success('Role deleted');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm: Permission) => {
    if (!editing) return;
    const exists = editing.permissions.includes(perm);
    setEditing({
      ...editing,
      permissions: exists ? editing.permissions.filter(p => p !== perm) : [...editing.permissions, perm]
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Admin • Roles</h1>
        <button onClick={beginCreate} className="btn btn-primary">+ New Role</button>
      </div>

      <div className="mb-4 flex gap-3">
        <input className="input" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Permissions</th>
              <th className="text-left px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.permissions.length}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {r.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-blue-600 mr-3" onClick={() => beginEdit(r)}>Edit</button>
                  <button className="text-red-600" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">No roles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{editing.id ? 'Edit Role' : 'New Role'}</div>
              <button onClick={cancel} className="text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Active</label>
                <div className="flex items-center gap-2 mt-2">
                  <input id="role-active" type="checkbox" checked={!!editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                  <label htmlFor="role-active">Active</label>
                </div>
              </div>
              <div className="col-span-2">
                <label className="label">Permissions</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-72 overflow-y-auto border rounded p-2">
                  {allPermissions.map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editing.permissions.includes(p)}
                        onChange={() => togglePermission(p)}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
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

export default RolesPage;


