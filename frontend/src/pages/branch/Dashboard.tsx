import React from 'react';

const BranchDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branch Dashboard</h1>
        <p className="text-gray-600">Overview of branch operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
          <p className="text-gray-600 text-sm mt-1">Stock levels and movements</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Sales</h2>
          <p className="text-gray-600 text-sm mt-1">Recent orders and invoices</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Purchases</h2>
          <p className="text-gray-600 text-sm mt-1">Recent POs and receipts</p>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;


