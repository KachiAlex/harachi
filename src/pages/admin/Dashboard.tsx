import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input className="border rounded-md px-3 py-2 w-96" placeholder="Search…" />
          <button className="btn-primary">Refresh</button>
        </div>
        <div className="text-sm text-gray-600">Business Date: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Tenants</div>
          <div className="text-2xl font-semibold">1</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Countries</div>
          <div className="text-2xl font-semibold">3</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Branches</div>
          <div className="text-2xl font-semibold">3</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


