import React from 'react';

const TenantBranches: React.FC = () => {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-md font-semibold">Branches</h2>
        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">+ Add Branch</button>
      </div>
      <div className="text-sm text-gray-600">Manage branches per country for this tenant.</div>
    </div>
  );
};

export default TenantBranches;


