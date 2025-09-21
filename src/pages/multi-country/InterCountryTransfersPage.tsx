import React from 'react';
import { Truck } from 'lucide-react';

const InterCountryTransfersPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Inter-Country Transfers
          </h1>
          <p className="text-gray-600 mt-1">Manage transfers between countries and customs</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inter-Country Transfers</h3>
          <p className="text-gray-500">This feature is coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default InterCountryTransfersPage;
