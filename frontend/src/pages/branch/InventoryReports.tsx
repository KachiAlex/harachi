import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface ReportData {
  classA?: any[];
  classB?: any[];
  classC?: any[];
  items?: any[];
  totalValue?: number;
  averageTurnover?: number;
}

const InventoryReports: React.FC = () => {
  const { user } = useAuth();
  const [activeReport, setActiveReport] = useState<'abc' | 'turnover' | 'slowmoving' | 'valuation'>('abc');
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(false);

  const reports = [
    { id: 'abc', name: 'ABC Analysis', icon: BarChart3, description: 'Classify items by value and importance' },
    { id: 'turnover', name: 'Inventory Turnover', icon: Activity, description: 'Analyze stock rotation rates' },
    { id: 'slowmoving', name: 'Slow-Moving Items', icon: TrendingDown, description: 'Identify items with low movement' },
    { id: 'valuation', name: 'Stock Valuation', icon: TrendingUp, description: 'Current stock value and trends' },
  ];

  const loadReport = useCallback(async (reportType: string) => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getInventoryReports(user.companyId, reportType);
      setReportData(data);
    } catch (error: any) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load report data');
      setReportData({});
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport, loadReport]);

  const handleExport = () => {
    toast.success('Export functionality coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive inventory insights and analytics</p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
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
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading report data...</div>
          ) : activeReport === 'abc' ? (
            <div className="space-y-4">
              <p className="text-gray-600">ABC analysis categorizes inventory into three groups:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Class A (High Value)</h3>
                  <p className="text-sm text-blue-700 mt-1">20% of items, 80% of value</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {reportData.classA?.length || 0} items
                  </p>
                  {reportData.classA && reportData.classA.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {reportData.classA.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-xs text-blue-800">
                          • {item.name || item.itemId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Class B (Medium Value)</h3>
                  <p className="text-sm text-green-700 mt-1">30% of items, 15% of value</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {reportData.classB?.length || 0} items
                  </p>
                  {reportData.classB && reportData.classB.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {reportData.classB.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-xs text-green-800">
                          • {item.name || item.itemId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Class C (Low Value)</h3>
                  <p className="text-sm text-gray-700 mt-1">50% of items, 5% of value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {reportData.classC?.length || 0} items
                  </p>
                  {reportData.classC && reportData.classC.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {reportData.classC.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-800">
                          • {item.name || item.itemId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {(!reportData.classA && !reportData.classB && !reportData.classC) && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  No data available. Add items and transactions to generate ABC analysis.
                </p>
              )}
            </div>
          ) : activeReport === 'turnover' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Average Turnover Rate</h3>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    {reportData.averageTurnover?.toFixed(1) || '0.0'}x
                  </p>
                  <p className="text-sm text-blue-700 mt-1">per year</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Fast Moving</h3>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {reportData.items?.filter((i: any) => i.turnoverRate > 5).length || 0}
                  </p>
                  <p className="text-sm text-green-700 mt-1">items (more than 5x/year)</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-900">Slow Moving</h3>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">
                    {reportData.items?.filter((i: any) => i.turnoverRate < 2).length || 0}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">items (less than 2x/year)</p>
                </div>
              </div>
              {reportData.items && reportData.items.length > 0 ? (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Top Items by Turnover</h3>
                  <div className="space-y-2">
                    {reportData.items.slice(0, 5).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.name || item.itemId}</span>
                        <span className="text-sm font-semibold">{item.turnoverRate?.toFixed(1)}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  No turnover data available yet.
                </p>
              )}
            </div>
          ) : activeReport === 'slowmoving' ? (
            <div className="space-y-4">
              {reportData.items && reportData.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Movement</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Idle</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name || item.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.lastMovement ? new Date(item.lastMovement).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stockLevel || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.daysIdle || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No slow-moving items identified</p>
                </div>
              )}
            </div>
          ) : activeReport === 'valuation' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Stock Value</h3>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    ₦{(reportData.totalValue || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">at cost price</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Potential Sales Value</h3>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    ₦{((reportData.totalValue || 0) * 1.3).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700 mt-1">estimated retail value</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Value Distribution</h3>
                <p className="text-sm text-gray-600">
                  Detailed valuation breakdown coming soon...
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;