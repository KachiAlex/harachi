import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const InventoryReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'abc' | 'turnover' | 'slowmoving' | 'valuation'>('abc');

  const reports = [
    { id: 'abc', name: 'ABC Analysis', icon: BarChart3, description: 'Classify items by value and importance' },
    { id: 'turnover', name: 'Inventory Turnover', icon: Activity, description: 'Analyze stock rotation rates' },
    { id: 'slowmoving', name: 'Slow-Moving Items', icon: TrendingDown, description: 'Identify items with low movement' },
    { id: 'valuation', name: 'Stock Valuation', icon: TrendingUp, description: 'Current stock value and trends' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive inventory insights and analytics</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id as any)}
            className={`card text-left transition-all ${
              activeReport === report.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-lg'
            }`}
          >
            <report.icon className={`h-8 w-8 mb-3 ${
              activeReport === report.id ? 'text-blue-600' : 'text-gray-600'
            }`} />
            <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
            <p className="text-sm text-gray-600">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {reports.find(r => r.id === activeReport)?.name}
          </h2>
          
          {activeReport === 'abc' && (
            <div className="space-y-4">
              <p className="text-gray-600">ABC analysis categorizes inventory into three groups:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Class A (High Value)</h3>
                  <p className="text-sm text-blue-700 mt-1">20% of items, 80% of value</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">0 items</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Class B (Medium Value)</h3>
                  <p className="text-sm text-green-700 mt-1">30% of items, 15% of value</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">0 items</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Class C (Low Value)</h3>
                  <p className="text-sm text-gray-700 mt-1">50% of items, 5% of value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">0 items</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Full implementation coming soon...</p>
            </div>
          )}

          {activeReport === 'turnover' && (
            <div className="text-center text-gray-500 py-8">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Inventory turnover analysis coming soon...</p>
            </div>
          )}

          {activeReport === 'slowmoving' && (
            <div className="text-center text-gray-500 py-8">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Slow-moving items report coming soon...</p>
            </div>
          )}

          {activeReport === 'valuation' && (
            <div className="text-center text-gray-500 py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Stock valuation report coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
