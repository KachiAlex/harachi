import React, { useState } from 'react';
import { GoodsReceipt, GRLine, PurchaseOrder, POLine, Item, Supplier } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const GoodsReceiptsPage: React.FC = () => {
  const { items, warehouses } = useAppStore();
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Mock data for demo
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      companyId: '1',
      supplierId: '1',
      poNumber: 'PO-2024-001',
      orderDate: new Date('2024-01-15'),
      expectedDeliveryDate: new Date('2024-01-25'),
      status: 'APPROVED',
      totalAmount: 125000,
      currencyCode: 'NGN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [suppliers] = useState<Supplier[]>([
    {
      id: '1',
      companyId: '1',
      supplierCode: 'SUP-001',
      name: 'Premium Malt Suppliers Ltd',
      contactName: 'John Smith',
      email: 'john@premiummalt.com',
      phone: '+234-1-234-5678',
      address: {
        streetAddress: '123 Malt Street',
        city: 'Lagos',
        stateProvince: 'Lagos State',
        postalCode: '100001',
        countryCode: 'NG'
      },
      paymentTerms: 'NET_30',
      currencyCode: 'NGN',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [goodsReceipts] = useState<GoodsReceipt[]>([
    {
      id: '1',
      companyId: '1',
      poId: '1',
      grNumber: 'GR-2024-001',
      receiptDate: new Date('2024-01-25'),
      warehouseId: '1',
      supplierId: '1',
      status: 'COMPLETED',
      totalQty: 5100,
      notes: 'All items received in good condition',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      companyId: '1',
      poId: '1',
      grNumber: 'GR-2024-002',
      receiptDate: new Date('2024-01-26'),
      warehouseId: '1',
      supplierId: '1',
      status: 'DRAFT',
      totalQty: 0,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [grLines] = useState<GRLine[]>([
    {
      id: '1',
      grId: '1',
      poLineId: '1',
      itemId: '1',
      qtyReceived: 5000,
      qtyAccepted: 5000,
      qtyRejected: 0,
      unitCost: 2.50,
      uom: 'KG',
      lotNumber: 'LOT-2024-001',
      expiryDate: new Date('2025-01-25'),
      item: items.find(i => i.id === '1')!
    },
    {
      id: '2',
      grId: '1',
      poLineId: '2',
      itemId: '2',
      qtyReceived: 100,
      qtyAccepted: 100,
      qtyRejected: 0,
      unitCost: 25.00,
      uom: 'KG',
      lotNumber: 'LOT-2024-002',
      expiryDate: new Date('2026-01-25'),
      item: items.find(i => i.id === '2')!
    }
  ]);

  const filteredReceipts = goodsReceipts.filter(receipt => {
    const matchesSearch = receipt.grNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReceiptSelect = (receipt: GoodsReceipt) => {
    setSelectedReceipt(receipt);
  };

  const handleNewReceipt = () => {
    setSelectedReceipt({
      id: '',
      companyId: '1',
      poId: '',
      grNumber: '',
      receiptDate: new Date(),
      warehouseId: '1',
      supplierId: '',
      status: 'DRAFT',
      totalQty: 0,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'RECEIVED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Receipts List Panel */}
      <div className="w-1/2 border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Goods Receipts</h2>
            <button
              onClick={handleNewReceipt}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + New Receipt
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search GR numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="RECEIVED">Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Receipts List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {filteredReceipts.map(receipt => {
            const po = purchaseOrders.find(p => p.id === receipt.poId);
            const supplier = suppliers.find(s => s.id === receipt.supplierId);
            const warehouse = warehouses.find(w => w.id === receipt.warehouseId);

            return (
              <div
                key={receipt.id}
                onClick={() => handleReceiptSelect(receipt)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedReceipt?.id === receipt.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{receipt.grNumber}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  PO: {po?.poNumber || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Supplier: {supplier?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Warehouse: {warehouse?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Received: {receipt.receiptDate.toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  Total Qty: {receipt.totalQty.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipt Detail Panel */}
      <div className="flex-1 bg-white">
        {selectedReceipt ? (
          <GoodsReceiptDetail 
            receipt={selectedReceipt}
            purchaseOrder={purchaseOrders.find(p => p.id === selectedReceipt.poId)!}
            supplier={suppliers.find(s => s.id === selectedReceipt.supplierId)!}
            grLines={grLines.filter(line => line.grId === selectedReceipt.id)}
            onSave={setSelectedReceipt}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📥</div>
              <div className="text-lg font-medium">Select a goods receipt to view details</div>
              <div className="text-sm">Choose a receipt from the list or create a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Goods Receipt Detail Component
interface GoodsReceiptDetailProps {
  receipt: GoodsReceipt;
  purchaseOrder: PurchaseOrder;
  supplier: Supplier;
  grLines: GRLine[];
  onSave: (receipt: GoodsReceipt) => void;
}

const GoodsReceiptDetail: React.FC<GoodsReceiptDetailProps> = ({ receipt, purchaseOrder, supplier, grLines, onSave }) => {
  const { items, warehouses } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<GoodsReceipt>(receipt);
  const [lines, setLines] = useState<GRLine[]>(grLines);

  const handleInputChange = (field: keyof GoodsReceipt, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleLineChange = (lineId: string, field: keyof GRLine, value: any) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        return updatedLine;
      }
      return line;
    }));
    
    // Recalculate total quantity
    const updatedLines = lines.map(line => {
      if (line.id === lineId) {
        return { ...line, [field]: value };
      }
      return line;
    });
    
    const totalQty = updatedLines.reduce((sum, line) => sum + line.qtyReceived, 0);
    setFormData(prev => ({ ...prev, totalQty }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'lines', label: 'Lines', icon: '📦' },
    { id: 'quality', label: 'Quality', icon: '🔬' },
    { id: 'inventory', label: 'Inventory Impact', icon: '📊' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{formData.grNumber || 'New Goods Receipt'}</h2>
            <p className="text-sm text-gray-600">
              {purchaseOrder?.poNumber || 'No PO'} - {supplier?.name || 'No supplier'} - Total Qty: {formData.totalQty.toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Save
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'general' && <GeneralTab formData={formData} onChange={handleInputChange} purchaseOrder={purchaseOrder} supplier={supplier} warehouses={warehouses} />}
        {activeTab === 'lines' && <LinesTab lines={lines} onLineChange={handleLineChange} items={items} />}
        {activeTab === 'quality' && <QualityTab />}
        {activeTab === 'inventory' && <InventoryTab />}
      </div>
    </div>
  );
};

// General Tab Component
interface GeneralTabProps {
  formData: GoodsReceipt;
  onChange: (field: keyof GoodsReceipt, value: any) => void;
  purchaseOrder: PurchaseOrder;
  supplier: Supplier;
  warehouses: any[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, onChange, purchaseOrder, supplier, warehouses }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Goods Receipt Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GR Number *
            </label>
            <input
              type="text"
              value={formData.grNumber}
              onChange={(e) => onChange('grNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter GR number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="RECEIVED">Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Date *
            </label>
            <input
              type="date"
              value={formData.receiptDate.toISOString().split('T')[0]}
              onChange={(e) => onChange('receiptDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse *
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => onChange('warehouseId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Quantity
            </label>
            <input
              type="number"
              value={formData.totalQty}
              onChange={(e) => onChange('totalQty', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter receipt notes..."
            />
          </div>
        </div>
      </div>

      {/* Purchase Order Information */}
      {purchaseOrder && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-4">Purchase Order Information</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">PO Number:</span>
              <span className="ml-2">{purchaseOrder.poNumber}</span>
            </div>
            <div>
              <span className="font-medium">Order Date:</span>
              <span className="ml-2">{purchaseOrder.orderDate.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Expected Delivery:</span>
              <span className="ml-2">{purchaseOrder.expectedDeliveryDate?.toLocaleDateString() || 'Not set'}</span>
            </div>
            <div>
              <span className="font-medium">Total Amount:</span>
              <span className="ml-2">{purchaseOrder.currencyCode} {purchaseOrder.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2">{purchaseOrder.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Information */}
      {supplier && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-4">Supplier Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span>
              <span className="ml-2">{supplier.name}</span>
            </div>
            <div>
              <span className="font-medium">Code:</span>
              <span className="ml-2">{supplier.supplierCode}</span>
            </div>
            <div>
              <span className="font-medium">Contact:</span>
              <span className="ml-2">{supplier.contactName}</span>
            </div>
            <div>
              <span className="font-medium">Phone:</span>
              <span className="ml-2">{supplier.phone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Lines Tab Component
interface LinesTabProps {
  lines: GRLine[];
  onLineChange: (lineId: string, field: keyof GRLine, value: any) => void;
  items: Item[];
}

const LinesTab: React.FC<LinesTabProps> = ({ lines, onLineChange, items }) => {
  return (
    <div className="space-y-6">
      {/* Lines Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Goods Receipt Lines</h3>
        <div className="text-sm text-gray-600">
          Total Lines: {lines.length}
        </div>
      </div>

      {/* Lines Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Received
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Accepted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Rejected
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lot Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lines.map(line => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.item?.itemCode || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.item?.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      step="0.01"
                      value={line.qtyReceived}
                      onChange={(e) => onLineChange(line.id, 'qtyReceived', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      step="0.01"
                      value={line.qtyAccepted}
                      onChange={(e) => onLineChange(line.id, 'qtyAccepted', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      step="0.01"
                      value={line.qtyRejected}
                      onChange={(e) => onLineChange(line.id, 'qtyRejected', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.uom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={line.lotNumber || ''}
                      onChange={(e) => onLineChange(line.id, 'lotNumber', e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="LOT-001"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="date"
                      value={line.expiryDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => onLineChange(line.id, 'expiryDate', new Date(e.target.value))}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No lines available. Select a purchase order to load receipt lines.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Summary */}
      {lines.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3">Receipt Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Received:</span>
              <span className="ml-2">{lines.reduce((sum, line) => sum + line.qtyReceived, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Total Accepted:</span>
              <span className="ml-2">{lines.reduce((sum, line) => sum + line.qtyAccepted, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Total Rejected:</span>
              <span className="ml-2">{lines.reduce((sum, line) => sum + line.qtyRejected, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder tab components
const QualityTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Quality Inspection</h3>
      <p className="text-sm text-gray-600">Quality inspection results and rejected items will be displayed here.</p>
    </div>
  </div>
);

const InventoryTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Inventory Impact</h3>
      <p className="text-sm text-gray-600">Stock balance updates and inventory transactions will be displayed here.</p>
    </div>
  </div>
);

export default GoodsReceiptsPage;