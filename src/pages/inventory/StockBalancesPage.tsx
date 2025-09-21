import React from 'react';
import { BarChart3, AlertTriangle, Download } from 'lucide-react';

const StockBalancesPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Stock Balances
          </h1>
          <p className="text-gray-600 mt-1">Current inventory levels across all warehouses</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn btn-primary">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900">2</div>
              <div className="text-sm text-gray-600">Critical Stock</div>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-lg font-semibold text-gray-900">€2.4M</div>
              <div className="text-sm text-gray-600">Total Inventory Value</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex gap-4 mb-6">
          <select className="select w-48">
            <option>All Warehouses</option>
            <option>Munich - Raw Materials</option>
            <option>Munich - Finished Goods</option>
            <option>Berlin - Packaging</option>
          </select>
          <select className="select w-48">
            <option>All Item Classes</option>
            <option>Raw Materials</option>
            <option>Packaging</option>
            <option>Finished Goods</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Non-zero only</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">Item</th>
                <th className="table-head">Warehouse</th>
                <th className="table-head">Lot/Serial</th>
                <th className="table-head">On Hand</th>
                <th className="table-head">Allocated</th>
                <th className="table-head">Available</th>
                <th className="table-head">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">MALT-PILSNER</div>
                    <div className="text-sm text-gray-500">Pilsner Malt - German</div>
                  </div>
                </td>
                <td className="table-cell">Munich - Raw Materials</td>
                <td className="table-cell">LOT-2024-001</td>
                <td className="table-cell">2,450.5 KG</td>
                <td className="table-cell">200.0 KG</td>
                <td className="table-cell">2,250.5 KG</td>
                <td className="table-cell">
                  <span className="status-badge status-active">Good</span>
                </td>
              </tr>
              <tr className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">HOPS-HALLERTAU</div>
                    <div className="text-sm text-gray-500">Hallertau Hops - Noble</div>
                  </div>
                </td>
                <td className="table-cell">Munich - Raw Materials</td>
                <td className="table-cell">LOT-2024-002</td>
                <td className="table-cell">15.2 KG</td>
                <td className="table-cell">10.0 KG</td>
                <td className="table-cell">5.2 KG</td>
                <td className="table-cell">
                  <span className="status-badge status-failed">Critical</span>
                </td>
              </tr>
              <tr className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">BOTTLE-500ML</div>
                    <div className="text-sm text-gray-500">Glass Bottle 500ml Brown</div>
                  </div>
                </td>
                <td className="table-cell">Berlin - Packaging</td>
                <td className="table-cell">-</td>
                <td className="table-cell">15,000 EA</td>
                <td className="table-cell">2,000 EA</td>
                <td className="table-cell">13,000 EA</td>
                <td className="table-cell">
                  <span className="status-badge status-active">Good</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockBalancesPage;
