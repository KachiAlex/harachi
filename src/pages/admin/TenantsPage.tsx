import React, { useState } from 'react';
import { Tenant } from '../../types';

const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: 'harachi-demo',
      name: 'Harachi Demo Tenant',
      slug: 'harachi-demo',
      subscriptionTier: 'ENTERPRISE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system',
    },
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Tenants</h1>
        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">+ New Tenant</button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Slug</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Tier</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.subscriptionTier}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <a className="text-blue-600 hover:underline" href={`/t/${t.slug}`}>Open Dashboard</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantsPage;


