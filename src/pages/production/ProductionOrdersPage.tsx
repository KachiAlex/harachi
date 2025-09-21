import React, { useState } from 'react';
import { ProductionOrder, Recipe, Item, BatchAttributes } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const ProductionOrdersPage: React.FC = () => {
  const { items, warehouses } = useAppStore();
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [recipes] = useState<Recipe[]>([
    {
      id: '1',
      companyId: '1',
      itemId: '4', // Pilsner Beer
      recipeCode: 'REC-PILSNER-001',
      description: 'Classic Pilsner Recipe',
      batchSize: 1000,
      batchUom: 'L',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [productionOrders] = useState<ProductionOrder[]>([
    {
      id: '1',
      companyId: '1',
      recipeId: '1',
      batchNo: 'BATCH-2024-001',
      plannedQty: 1000,
      actualQty: 950,
      status: 'COMPLETED',
      plannedStartDate: new Date('2024-01-15'),
      actualStartDate: new Date('2024-01-15'),
      plannedEndDate: new Date('2024-01-20'),
      actualEndDate: new Date('2024-01-19'),
      warehouseId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      companyId: '1',
      recipeId: '1',
      batchNo: 'BATCH-2024-002',
      plannedQty: 1000,
      status: 'IN_PROGRESS',
      plannedStartDate: new Date('2024-01-22'),
      actualStartDate: new Date('2024-01-22'),
      plannedEndDate: new Date('2024-01-27'),
      warehouseId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      companyId: '1',
      recipeId: '1',
      batchNo: 'BATCH-2024-003',
      plannedQty: 1000,
      status: 'PLANNED',
      plannedStartDate: new Date('2024-01-29'),
      plannedEndDate: new Date('2024-02-03'),
      warehouseId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [batchAttributes] = useState<BatchAttributes[]>([
    {
      id: '1',
      productionOrderId: '1',
      brewDate: new Date('2024-01-15'),
      tankId: 'TANK-001',
      abv: 5.2,
      og: 1.048,
      fg: 1.010,
      fermentationDays: 14,
      notes: 'Excellent batch with perfect fermentation'
    }
  ]);

  const filteredOrders = productionOrders.filter(order => {
    const matchesSearch = order.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOrderSelect = (order: ProductionOrder) => {
    setSelectedOrder(order);
  };

  const handleNewOrder = () => {
    setSelectedOrder({
      id: '',
      companyId: '1',
      recipeId: '',
      batchNo: '',
      plannedQty: 1000,
      status: 'PLANNED',
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      warehouseId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'RELEASED': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
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
            <h2 className="text-lg font-semibold">Production Orders</h2>
            <button
              onClick={handleNewOrder}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + New Order
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search batch numbers..."
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
              <option value="PLANNED">Planned</option>
              <option value="RELEASED">Released</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {filteredOrders.map(order => {
            const recipe = recipes.find(r => r.id === order.recipeId);
            return (
              <div
                key={order.id}
                onClick={() => handleOrderSelect(order)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{order.batchNo}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  Recipe: {recipe?.recipeCode || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Planned: {order.plannedQty}L | Actual: {order.actualQty || 0}L
                </div>
                <div className="text-xs text-gray-500">
                  Start: {order.plannedStartDate.toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Detail Panel */}
      <div className="flex-1 bg-white">
        {selectedOrder ? (
          <ProductionOrderDetail 
            order={selectedOrder}
            recipe={recipes.find(r => r.id === selectedOrder.recipeId)!}
            batchAttributes={batchAttributes.find(ba => ba.productionOrderId === selectedOrder.id)}
            onSave={setSelectedOrder}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🏭</div>
              <div className="text-lg font-medium">Select a production order to view details</div>
              <div className="text-sm">Choose an order from the list or create a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Production Order Detail Component
interface ProductionOrderDetailProps {
  order: ProductionOrder;
  recipe: Recipe;
  batchAttributes?: BatchAttributes;
  onSave: (order: ProductionOrder) => void;
}

const ProductionOrderDetail: React.FC<ProductionOrderDetailProps> = ({ order, recipe, batchAttributes, onSave }) => {
  const { warehouses } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<ProductionOrder>(order);
  const [batchData, setBatchData] = useState<BatchAttributes | undefined>(batchAttributes);

  const handleInputChange = (field: keyof ProductionOrder, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBatchChange = (field: keyof BatchAttributes, value: any) => {
    if (!batchData) {
      setBatchData({
        id: '',
        productionOrderId: formData.id,
        [field]: value
      } as BatchAttributes);
    } else {
      setBatchData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'materials', label: 'Materials', icon: '📦' },
    { id: 'batch', label: 'Batch Data', icon: '🍺' },
    { id: 'quality', label: 'Quality', icon: '🔬' },
    { id: 'costing', label: 'Costing', icon: '💰' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{formData.batchNo || 'New Production Order'}</h2>
            <p className="text-sm text-gray-600">{recipe.recipeCode} - {recipe.description}</p>
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
        {activeTab === 'general' && <GeneralTab formData={formData} onChange={handleInputChange} recipe={recipe} warehouses={warehouses} />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'batch' && <BatchTab batchData={batchData} onChange={handleBatchChange} />}
        {activeTab === 'quality' && <QualityTab />}
        {activeTab === 'costing' && <CostingTab />}
      </div>
    </div>
  );
};

// General Tab Component
interface GeneralTabProps {
  formData: ProductionOrder;
  onChange: (field: keyof ProductionOrder, value: any) => void;
  recipe: Recipe;
  warehouses: any[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, onChange, recipe, warehouses }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Production Order Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number *
            </label>
            <input
              type="text"
              value={formData.batchNo}
              onChange={(e) => onChange('batchNo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch number"
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
              <option value="PLANNED">Planned</option>
              <option value="RELEASED">Released</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned Quantity *
            </label>
            <input
              type="number"
              value={formData.plannedQty}
              onChange={(e) => onChange('plannedQty', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Quantity
            </label>
            <input
              type="number"
              value={formData.actualQty || 0}
              onChange={(e) => onChange('actualQty', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned Start Date *
            </label>
            <input
              type="date"
              value={formData.plannedStartDate.toISOString().split('T')[0]}
              onChange={(e) => onChange('plannedStartDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned End Date
            </label>
            <input
              type="date"
              value={formData.plannedEndDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => onChange('plannedEndDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse *
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => onChange('warehouseId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Recipe Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Recipe Code:</span>
            <span className="ml-2">{recipe.recipeCode}</span>
          </div>
          <div>
            <span className="font-medium">Description:</span>
            <span className="ml-2">{recipe.description}</span>
          </div>
          <div>
            <span className="font-medium">Batch Size:</span>
            <span className="ml-2">{recipe.batchSize} {recipe.batchUom}</span>
          </div>
        </div>
      </div>

      {/* Production Progress */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Production Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Yield Efficiency:</span>
            <span className="ml-2">
              {formData.actualQty && formData.plannedQty 
                ? ((formData.actualQty / formData.plannedQty) * 100).toFixed(1)
                : '0'
              }%
            </span>
          </div>
          <div>
            <span className="font-medium">Days in Production:</span>
            <span className="ml-2">
              {formData.actualStartDate 
                ? Math.ceil((Date.now() - formData.actualStartDate.getTime()) / (1000 * 60 * 60 * 24))
                : '0'
              }
            </span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className="ml-2">{formData.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder tab components
const MaterialsTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Material Consumption</h3>
      <p className="text-sm text-gray-600">Material consumption tracking will be displayed here.</p>
    </div>
  </div>
);

const BatchTab: React.FC<{ batchData?: BatchAttributes; onChange: (field: keyof BatchAttributes, value: any) => void }> = ({ batchData, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Batch Attributes</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brew Date</label>
          <input
            type="date"
            value={batchData?.brewDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => onChange('brewDate', new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tank ID</label>
          <input
            type="text"
            value={batchData?.tankId || ''}
            onChange={(e) => onChange('tankId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="TANK-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
          <input
            type="number"
            step="0.1"
            value={batchData?.abv || ''}
            onChange={(e) => onChange('abv', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5.2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Gravity</label>
          <input
            type="number"
            step="0.001"
            value={batchData?.og || ''}
            onChange={(e) => onChange('og', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1.048"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Final Gravity</label>
          <input
            type="number"
            step="0.001"
            value={batchData?.fg || ''}
            onChange={(e) => onChange('fg', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1.010"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fermentation Days</label>
          <input
            type="number"
            value={batchData?.fermentationDays || ''}
            onChange={(e) => onChange('fermentationDays', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="14"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={batchData?.notes || ''}
            onChange={(e) => onChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter batch notes..."
          />
        </div>
      </div>
    </div>
  </div>
);

const QualityTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Quality Control</h3>
      <p className="text-sm text-gray-600">Quality control tests and results will be displayed here.</p>
    </div>
  </div>
);

const CostingTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Production Costing</h3>
      <p className="text-sm text-gray-600">Production cost analysis will be displayed here.</p>
    </div>
  </div>
);

export default ProductionOrdersPage;