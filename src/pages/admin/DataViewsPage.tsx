import React, { useState } from 'react';

interface DataViewLink {
  id: string;
  label: string;
  href: string;
}

const AdminDataViewsPage: React.FC = () => {
  const [links, setLinks] = useState<DataViewLink[]>([
    { id: 'receipts-2', label: 'Receipts 2', href: '/procurement/goods-receipts' },
    { id: 'transfers-2', label: 'Transfers 2', href: '/multi-country/transfers' },
    { id: 'purchase-receipts-3', label: 'Purchase Receipts 3', href: '/procurement/purchase-orders' },
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Data Views</h1>
        <button className="btn-primary">+ Add Link</button>
      </div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Label</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Target</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {links.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{l.label}</td>
                <td className="px-4 py-3 text-sm text-blue-600">{l.href}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <button className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDataViewsPage;


