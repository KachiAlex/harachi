import React, { useState } from 'react';
import { GitBranch, Search, QrCode } from 'lucide-react';

const BatchTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batch & Lot Tracking</h1>
        <p className="text-gray-600">Complete traceability for batches and lots</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by batch number, lot number, or item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <GitBranch className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active Batches</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <QrCode className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Tracked Items</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <GitBranch className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <GitBranch className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Expired Batches</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="card">
        <div className="p-6 text-center text-gray-500">
          <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Batch & Lot Tracking</h3>
          <p className="mb-4">
            Track batches and lots with complete upstream and downstream traceability.
          </p>
          <p className="text-sm">Feature implementation in progress...</p>
        </div>
      </div>
    </div>
  );
};

export default BatchTracking;
