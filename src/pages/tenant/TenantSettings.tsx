import React from 'react';

const TenantSettings: React.FC = () => {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="text-md font-semibold mb-3">Tenant Profile</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" placeholder="Business Name" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Slug</label>
          <input className="w-full border rounded px-3 py-2" placeholder="tenant-slug" />
        </div>
      </div>
    </div>
  );
};

export default TenantSettings;


