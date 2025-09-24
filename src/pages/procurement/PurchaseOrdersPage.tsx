import React, { useState } from 'react';
import { PurchaseOrder, POLine, Item, Supplier } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const PurchaseOrdersPage: React.FC = () => {
  const { items } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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
    },
    {
      id: '2',
      companyId: '1',
      supplierCode: 'SUP-002',
      name: 'Hop Garden Imports',
      contactName: 'Sarah Johnson',
      email: 'sarah@hopgarden.com',
      phone: '+234-1-234-5679',
      address: {
        streetAddress: '456 Hop Avenue',
        city: 'Lagos',
        stateProvince: 'Lagos State',
        postalCode: '100002',
        countryCode: 'NG'
      },
      paymentTerms: 'NET_15',
      currencyCode: 'USD',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

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
    },
    {
      id: '2',
      companyId: '1',
      supplierId: '2',
      poNumber: 'PO-2024-002',
      orderDate: new Date('2024-01-20'),
      expectedDeliveryDate: new Date('2024-02-05'),
      status: 'SUBMITTED',
      totalAmount: 85000,
      currencyCode: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [poLines] = useState<POLine[]>([
    {
      id: '1',
      poId: '1',
      lineNumber: 1,
      itemId: '1', // Pilsner Malt
      qtyOrdered: 5000,
      qtyReceived: 5000,
      unitCost: 2.50,
      uom: 'KG',
      item: items.find(i => i.id === '1')!
    },
    {
      id: '2',
      poId: '1',
      lineNumber: 2,
      itemId: '2', // Hallertau Hops
      qtyOrdered: 100,
      qtyReceived: 100,
      unitCost: 25.00,
      uom: 'KG',
      item: items.find(i => i.id === '2')!
    },
    {
      id: '3',
      poId: '2',
      lineNumber: 1,
      itemId: '3', // Bottles
      qtyOrdered: 50000,
      qtyReceived: 0,
      unitCost: 0.15,
      uom: 'EA',
      item: items.find(i => i.id === '3')!
    }
  ]);

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOrderSelect = (order: PurchaseOrder) => {
    setSelectedOrder(order);
  };

  const handleNewOrder = () => {
    setSelectedOrder({
      id: '',
      companyId: '1',
      supplierId: '',
      poNumber: '',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'DRAFT',
      totalAmount: 0,
      currencyCode: 'NGN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Orders List Panel */}
      <div className="w-1/2 border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Purchase Orders</h2>
            <button
              onClick={handleNewOrder}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + New PO
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search PO numbers..."
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
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {filteredOrders.map(order => {
            const supplier = suppliers.find(s => s.id === order.supplierId);
            const orderLines = poLines.filter(line => line.poId === order.id);
            const totalReceived = orderLines.reduce((sum, line) => sum + line.qtyReceived, 0);
            const totalOrdered = orderLines.reduce((sum, line) => sum + line.qtyOrdered, 0);
            const completionRate = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

            return (
              <div
                key={order.id}
                onClick={() => handleOrderSelect(order)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{order.poNumber}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  Supplier: {supplier?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Amount: {order.currencyCode} {order.totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Delivery: {order.expectedDeliveryDate?.toLocaleDateString() || 'Not set'}
                </div>
                <div className="text-xs text-gray-500">
                  Progress: {completionRate.toFixed(0)}% received
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Panel */}
      <div className="flex-1 bg-white">
        {selectedOrder ? (
          <PurchaseOrderDetail 
            order={selectedOrder}
            supplier={suppliers.find(s => s.id === selectedOrder.supplierId)!}
            poLines={poLines.filter(line => line.poId === selectedOrder.id)}
            onSave={setSelectedOrder}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <div className="text-lg font-medium">Select a purchase order to view details</div>
              <div className="text-sm">Choose an order from the list or create a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Purchase Order Detail Component
interface PurchaseOrderDetailProps {
  order: PurchaseOrder;
  supplier: Supplier;
  poLines: POLine[];
  onSave: (order: PurchaseOrder) => void;
}

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({ order, supplier, poLines, onSave }) => {
  const { items } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<PurchaseOrder>(order);
  const [lines, setLines] = useState<POLine[]>(poLines);

  const handleInputChange = (field: keyof PurchaseOrder, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleAddLine = () => {
    const newLine: POLine = {
      id: Date.now().toString(),
      poId: formData.id,
      lineNumber: lines.length + 1,
      itemId: '',
      qtyOrdered: 0,
      qtyReceived: 0,
      unitCost: 0,
      uom: 'EA',
      item: {} as Item
    };
    setLines([...lines, newLine]);
  };

  const handleLineChange = (lineId: string, field: keyof POLine, value: any) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        if (field === 'itemId') {
          const selectedItem = items.find(i => i.id === value);
          updatedLine.item = selectedItem || {} as Item;
          updatedLine.uom = selectedItem?.baseUOM || 'EA';
        }
        return updatedLine;
      }
      return line;
    }));
    
    // Recalculate total amount
    const updatedLines = lines.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        if (field === 'itemId') {
          const selectedItem = items.find(i => i.id === value);
          updatedLine.item = selectedItem || {} as Item;
          updatedLine.uom = selectedItem?.baseUOM || 'EA';
        }
        return updatedLine;
      }
      return line;
    });
    
    const totalAmount = updatedLines.reduce((sum, line) => sum + (line.qtyOrdered * line.unitCost), 0);
    setFormData(prev => ({ ...prev, totalAmount }));
  };

  const handleRemoveLine = (lineId: string) => {
    const updatedLines = lines.filter(line => line.id !== lineId);
    setLines(updatedLines);
    
    // Recalculate total amount
    const totalAmount = updatedLines.reduce((sum, line) => sum + (line.qtyOrdered * line.unitCost), 0);
    setFormData(prev => ({ ...prev, totalAmount }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'lines', label: 'Lines', icon: '📦' },
    { id: 'receipts', label: 'Receipts', icon: '📥' },
    { id: 'history', label: 'History', icon: '📊' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{formData.poNumber || 'New Purchase Order'}</h2>
            <p className="text-sm text-gray-600">{supplier?.name || 'No supplier selected'} - {formData.currencyCode} {formData.totalAmount.toLocaleString()}</p>
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
        {activeTab === 'general' && <GeneralTab formData={formData} onChange={handleInputChange} supplier={supplier} />}
        {activeTab === 'lines' && <LinesTab lines={lines} onLineChange={handleLineChange} onAddLine={handleAddLine} onRemoveLine={handleRemoveLine} items={items} currencyCode={formData.currencyCode} />}
        {activeTab === 'receipts' && <ReceiptsTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
};

// General Tab Component
interface GeneralTabProps {
  formData: PurchaseOrder;
  onChange: (field: keyof PurchaseOrder, value: any) => void;
  supplier: Supplier;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, onChange, supplier }) => {
  // Get suppliers from the component scope
  const suppliers = [
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
      paymentTerms: 'NET_30' as const,
      currencyCode: 'NGN',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      companyId: '1',
      supplierCode: 'SUP-002',
      name: 'Hop Garden Imports',
      contactName: 'Sarah Johnson',
      email: 'sarah@hopgarden.com',
      phone: '+234-1-234-5679',
      address: {
        streetAddress: '456 Hop Avenue',
        city: 'Lagos',
        stateProvince: 'Lagos State',
        postalCode: '100002',
        countryCode: 'NG'
      },
      paymentTerms: 'NET_15' as const,
      currencyCode: 'USD',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Purchase Order Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Number *
            </label>
            <input
              type="text"
              value={formData.poNumber}
              onChange={(e) => onChange('poNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter PO number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => onChange('supplierId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
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
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Date *
            </label>
            <input
              type="date"
              value={formData.orderDate.toISOString().split('T')[0]}
              onChange={(e) => onChange('orderDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.expectedDeliveryDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => onChange('expectedDeliveryDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currencyCode}
              onChange={(e) => onChange('currencyCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => onChange('totalAmount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      {supplier && (
        <div className="bg-blue-50 p-4 rounded-lg">
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
              <span className="font-medium">Email:</span>
              <span className="ml-2">{supplier.email}</span>
            </div>
            <div>
              <span className="font-medium">Phone:</span>
              <span className="ml-2">{supplier.phone}</span>
            </div>
            <div>
              <span className="font-medium">Payment Terms:</span>
              <span className="ml-2">{supplier.paymentTerms.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Order Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Lines:</span>
            <span className="ml-2">0 items</span>
          </div>
          <div>
            <span className="font-medium">Total Amount:</span>
            <span className="ml-2">{formData.currencyCode} {formData.totalAmount.toLocaleString()}</span>
          </div>
          <div>
            <span className="font-medium">Days to Delivery:</span>
            <span className="ml-2">
              {formData.expectedDeliveryDate 
                ? Math.ceil((formData.expectedDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 'Not set'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lines Tab Component
interface LinesTabProps {
  lines: POLine[];
  onLineChange: (lineId: string, field: keyof POLine, value: any) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: string) => void;
  items: Item[];
  currencyCode: string;
}

const LinesTab: React.FC<LinesTabProps> = ({ lines, onLineChange, onAddLine, onRemoveLine, items, currencyCode }) => {
  return (
    <div className="space-y-6">
      {/* Add Line Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Purchase Order Lines</h3>
        <button
          onClick={onAddLine}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Add Line
        </button>
      </div>

      {/* Lines Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Ordered
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty Received
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Line Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lines.map(line => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.lineNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <select
                      value={line.itemId}
                      onChange={(e) => onLineChange(line.id, 'itemId', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Item</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.itemCode}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.item?.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      step="0.01"
                      value={line.qtyOrdered}
                      onChange={(e) => onLineChange(line.id, 'qtyOrdered', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
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
                      value={line.unitCost}
                      onChange={(e) => onLineChange(line.id, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.uom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {currencyCode} {(line.qtyOrdered * line.unitCost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => onRemoveLine(line.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No lines added. Click "Add Line" to start building your purchase order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Totals */}
      {lines.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Order Amount:</div>
              <div className="text-lg font-semibold">
                {lines.reduce((total, line) => total + (line.qtyOrdered * line.unitCost), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder tab components
const ReceiptsTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Goods Receipts</h3>
      <p className="text-sm text-gray-600">Goods receipt tracking will be displayed here.</p>
    </div>
  </div>
);

const HistoryTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Order History</h3>
      <p className="text-sm text-gray-600">Purchase order history and changes will be displayed here.</p>
    </div>
  </div>
);

export default PurchaseOrdersPage;