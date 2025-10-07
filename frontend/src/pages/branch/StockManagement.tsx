import React, { useState, useEffect } from 'react';
import { Layers, Plus, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const StockManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'movements' | 'adjustments' | 'transfers'>('movements');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Track stock movements, adjustments, and transfers</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <p className="text-xl font-semibold">₦0.00</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <ArrowUpDown className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Movements Today</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Pending Transfers</p>
              <p className="text-xl font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Movements
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'adjustments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Adjustments
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transfers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transfers
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'movements' && (
          <div className="p-6 text-center text-gray-500">
            <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Stock Movements</h3>
            <p>Track all incoming and outgoing stock movements. Feature coming soon...</p>
          </div>
        )}
        {activeTab === 'adjustments' && (
          <div className="p-6 text-center text-gray-500">
            <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Stock Adjustments</h3>
            <p>Record stock adjustments and corrections. Feature coming soon...</p>
          </div>
        )}
        {activeTab === 'transfers' && (
          <div className="p-6 text-center text-gray-500">
            <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Stock Transfers</h3>
            <p>Manage inter-branch stock transfers. Feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;
