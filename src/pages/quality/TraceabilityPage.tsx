import React, { useState } from 'react';
import { LotSerial, Item, InventoryTransaction, QCTest } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const TraceabilityPage: React.FC = () => {
  const { items } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'lot' | 'item' | 'batch'>('lot');
  const [traceabilityData, setTraceabilityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock traceability data
  const [lots] = useState<LotSerial[]>([
    {
      id: '1',
      itemId: '1',
      lotNo: 'LOT-2024-001',
      manufactureDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15'),
      supplierLot: 'SUP-LOT-001',
      createdAt: new Date(),
    },
    {
      id: '2',
      itemId: '4',
      lotNo: 'BATCH-2024-001',
      manufactureDate: new Date('2024-01-20'),
      expiryDate: new Date('2024-07-20'),
      supplierLot: '',
      createdAt: new Date(),
    }
  ]);

  const [transactions] = useState<InventoryTransaction[]>([
    {
      id: '1',
      itemId: '1',
      warehouseId: '1',
      lotSerialId: '1',
      trxType: 'RECEIPT',
      qty: 5000,
      unitCost: 2.50,
      referenceType: 'GOODS_RECEIPT',
      referenceId: '1',
      notes: 'Received from Premium Malt Suppliers',
      transactionDate: new Date('2024-01-25'),
      createdBy: 'user1',
      createdAt: new Date(),
    },
    {
      id: '2',
      itemId: '1',
      warehouseId: '1',
      lotSerialId: '1',
      trxType: 'PRODUCTION_CONSUME',
      qty: -1500,
      referenceType: 'PRODUCTION_ORDER',
      referenceId: '1',
      notes: 'Consumed in BATCH-2024-001',
      transactionDate: new Date('2024-01-26'),
      createdBy: 'user2',
      createdAt: new Date(),
    }
  ]);

  const [qcTests] = useState<QCTest[]>([
    {
      id: '1',
      lotSerialId: '1',
      testType: 'INCOMING_INSPECTION',
      testDate: new Date('2024-01-25'),
      status: 'COMPLETED',
      testedBy: 'QC001',
      notes: 'All parameters passed',
      createdAt: new Date(),
      companyId: '1',
      batchNo: 'LOT-2024-001',
      itemId: '1',
      priority: 'HIGH'
    }
  ]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let foundData = null;
      
      if (searchType === 'lot') {
        const lot = lots.find(l => l.lotNo.toLowerCase().includes(searchTerm.toLowerCase()));
        if (lot) {
          const item = items.find(i => i.id === lot.itemId);
          const lotTransactions = transactions.filter(t => t.lotSerialId === lot.id);
          const lotTests = qcTests.filter(t => t.lotSerialId === lot.id);
          
          foundData = {
            type: 'lot',
            lot,
            item,
            transactions: lotTransactions,
            qcTests: lotTests,
            upstreamLots: getUpstreamLots(lot.id),
            downstreamLots: getDownstreamLots(lot.id)
          };
        }
      } else if (searchType === 'item') {
        const item = items.find(i => 
          i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (item) {
          const itemLots = lots.filter(l => l.itemId === item.id);
          const itemTransactions = transactions.filter(t => t.itemId === item.id);
          
          foundData = {
            type: 'item',
            item,
            lots: itemLots,
            transactions: itemTransactions,
            totalQtyProduced: itemTransactions.filter(t => t.trxType === 'PRODUCTION_YIELD').reduce((sum, t) => sum + t.qty, 0),
            totalQtyConsumed: itemTransactions.filter(t => t.trxType === 'PRODUCTION_CONSUME').reduce((sum, t) => sum + Math.abs(t.qty), 0)
          };
        }
      }
      
      setTraceabilityData(foundData);
      setLoading(false);
    }, 1000);
  };

  const getUpstreamLots = (lotId: string) => {
    // Mock upstream traceability - in real app, this would trace back through production orders
    return [
      { lotNo: 'LOT-2024-001', itemCode: 'MALT-PILSNER', relationship: 'Raw Material' },
      { lotNo: 'LOT-2024-002', itemCode: 'HOPS-HALLERTAU', relationship: 'Raw Material' }
    ];
  };

  const getDownstreamLots = (lotId: string) => {
    // Mock downstream traceability - in real app, this would trace forward through production
    return [
      { lotNo: 'BATCH-2024-001', itemCode: 'BEER-PILSNER-500ML', relationship: 'Finished Good' }
    ];
  };

  const handleReset = () => {
    setTraceabilityData(null);
    setSearchTerm('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lot Traceability</h1>
        <p className="text-gray-600">Track materials and products through the supply chain for recalls and compliance</p>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search & Trace</h2>
        <div className="grid grid-cols-4 gap-4 items-end">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Term
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lot number, item code, or batch number..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'lot' | 'item' | 'batch')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lot">Lot/Serial Number</option>
              <option value="item">Item Code</option>
              <option value="batch">Batch Number</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Trace'}
            </button>
          </div>
        </div>
      </div>

      {/* Traceability Results */}
      {traceabilityData && (
        <div className="space-y-6">
          {/* Reset Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Traceability Results</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
            >
              New Search
            </button>
          </div>

          {traceabilityData.type === 'lot' && <LotTraceabilityView data={traceabilityData} />}
          {traceabilityData.type === 'item' && <ItemTraceabilityView data={traceabilityData} />}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-lg mb-2">🔍</div>
            <div className="font-medium text-sm">Recall Simulation</div>
            <div className="text-xs text-gray-600">Simulate product recall scenarios</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-lg mb-2">📊</div>
            <div className="font-medium text-sm">Batch Report</div>
            <div className="text-xs text-gray-600">Generate batch traceability report</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="text-lg mb-2">📋</div>
            <div className="font-medium text-sm">Compliance Check</div>
            <div className="text-xs text-gray-600">Verify regulatory compliance</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Lot Traceability View Component
const LotTraceabilityView: React.FC<{ data: any }> = ({ data }) => {
  const { lot, item, transactions, qcTests, upstreamLots, downstreamLots } = data;

  return (
    <div className="space-y-6">
      {/* Lot Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Lot Information</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Basic Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Lot Number:</span> {lot.lotNo}</div>
              <div><span className="font-medium">Item:</span> {item?.itemCode}</div>
              <div><span className="font-medium">Description:</span> {item?.description}</div>
              <div><span className="font-medium">Manufacture Date:</span> {lot.manufactureDate?.toLocaleDateString()}</div>
              <div><span className="font-medium">Expiry Date:</span> {lot.expiryDate?.toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Supplier Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Supplier Lot:</span> {lot.supplierLot || 'N/A'}</div>
              <div><span className="font-medium">Current Stock:</span> 3,500 KG</div>
              <div><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Quality Status</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">QC Tests:</span> {qcTests.length} completed</div>
              <div><span className="font-medium">Last Test:</span> {qcTests[0]?.testDate.toLocaleDateString() || 'None'}</div>
              <div><span className="font-medium">Status:</span> <span className="text-green-600">Passed</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Traceability Flow */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Traceability Flow</h3>
        
        {/* Upstream (Where did it come from?) */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-3">⬆️ Upstream Traceability (Raw Materials)</h4>
          <div className="bg-blue-50 p-4 rounded-lg">
            {upstreamLots.length > 0 ? (
              <div className="space-y-2">
                {upstreamLots.map((upstream: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium text-sm">{upstream.lotNo}</span>
                      <span className="text-xs text-gray-600 ml-2">({upstream.itemCode})</span>
                    </div>
                    <span className="text-xs text-gray-500">{upstream.relationship}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No upstream materials found (raw material lot)</p>
            )}
          </div>
        </div>

        {/* Current Lot */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-3">📍 Current Lot</h4>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between p-3 bg-white rounded border-2 border-yellow-300">
              <div>
                <span className="font-bold text-lg text-yellow-800">{lot.lotNo}</span>
                <span className="text-sm text-gray-600 ml-2">({item?.itemCode})</span>
              </div>
              <span className="text-sm font-medium text-yellow-700">CURRENT LOT</span>
            </div>
          </div>
        </div>

        {/* Downstream (Where did it go?) */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-3">⬇️ Downstream Traceability (Finished Products)</h4>
          <div className="bg-green-50 p-4 rounded-lg">
            {downstreamLots.length > 0 ? (
              <div className="space-y-2">
                {downstreamLots.map((downstream: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium text-sm">{downstream.lotNo}</span>
                      <span className="text-xs text-gray-600 ml-2">({downstream.itemCode})</span>
                    </div>
                    <span className="text-xs text-gray-500">{downstream.relationship}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No downstream products found yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction: InventoryTransaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {transaction.transactionDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.trxType === 'RECEIPT' ? 'bg-green-100 text-green-800' :
                      transaction.trxType === 'ISSUE' ? 'bg-red-100 text-red-800' :
                      transaction.trxType === 'PRODUCTION_CONSUME' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.trxType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className={transaction.qty < 0 ? 'text-red-600' : 'text-green-600'}>
                      {transaction.qty > 0 ? '+' : ''}{transaction.qty.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {transaction.referenceType} #{transaction.referenceId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {transaction.notes}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {transaction.createdBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QC Test History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quality Control History</h3>
        <div className="space-y-3">
          {qcTests.map((test: QCTest) => (
            <div key={test.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">{test.testType.replace('_', ' ')}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  test.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.status}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Tested: {test.testDate.toLocaleDateString()} by {test.testedBy}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {test.notes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Item Traceability View Component
const ItemTraceabilityView: React.FC<{ data: any }> = ({ data }) => {
  const { item, lots, transactions, totalQtyProduced, totalQtyConsumed } = data;

  return (
    <div className="space-y-6">
      {/* Item Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Item Summary</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Item Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Item Code:</span> {item.itemCode}</div>
              <div><span className="font-medium">Description:</span> {item.description}</div>
              <div><span className="font-medium">Base UOM:</span> {item.baseUOM}</div>
              <div><span className="font-medium">Lot Tracked:</span> {item.isLotTracked ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Production Summary</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Total Produced:</span> {totalQtyProduced.toLocaleString()}</div>
              <div><span className="font-medium">Total Consumed:</span> {totalQtyConsumed.toLocaleString()}</div>
              <div><span className="font-medium">Active Lots:</span> {lots.length}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Quality Status</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">QC Tests:</span> {transactions.length} total</div>
              <div><span className="font-medium">Last Activity:</span> {transactions[0]?.transactionDate.toLocaleDateString() || 'None'}</div>
              <div><span className="font-medium">Status:</span> <span className="text-green-600">Good</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Lots */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Active Lots</h3>
        <div className="grid grid-cols-2 gap-4">
          {lots.map((lot: any) => (
            <div key={lot.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-sm mb-2">{lot.lotNo}</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Manufactured: {lot.manufactureDate?.toLocaleDateString()}</div>
                <div>Expires: {lot.expiryDate?.toLocaleDateString()}</div>
                <div>Supplier Lot: {lot.supplierLot || 'N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraceabilityPage;