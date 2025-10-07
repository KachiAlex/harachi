import React, { useState, useEffect } from 'react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roles: ['User'],
    isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Mock data for now - in real app, fetch from API
        setUsers([
          { id: '1', email: 'admin@company.com', firstName: 'John', lastName: 'Doe', roles: ['Super Admin'], isActive: true },
          { id: '2', email: 'manager@company.com', firstName: 'Jane', lastName: 'Smith', roles: ['Company Admin'], isActive: true },
          { id: '3', email: 'user@company.com', firstName: 'Bob', lastName: 'Johnson', roles: ['Branch Admin'], isActive: true },
        ]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, call API to create user
    console.log('Creating user:', form);
    setShowForm(false);
    setForm({ email: '', firstName: '', lastName: '', roles: ['User'], isActive: true });
  };


  const handleStatusChange = (userId: string, isActive: boolean) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u));
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add User</button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                <select
                  multiple
                  className="input-field"
                  value={form.roles}
                  onChange={e => setForm({ ...form, roles: Array.from(e.target.selectedOptions, option => option.value) })}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Company Admin">Company Admin</option>
                  <option value="Branch Admin">Branch Admin</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Inventory Officer">Inventory Officer</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create User</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role: string) => (
                        <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                    <button 
                      onClick={() => handleStatusChange(user.id, !user.isActive)}
                      className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
