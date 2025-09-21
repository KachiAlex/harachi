import React, { useState } from 'react';
import { Item, ItemClass, UOMConversion, LotSerial } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const ItemsPage: React.FC = () => {
  const { items, itemClasses } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Filter items based on search and class
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || item.itemClassId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
  };

  const handleNewItem = () => {
    setSelectedItem({
      id: '',
      itemCode: '',
      description: '',
      itemClassId: '',
      postingClassId: '',
      baseUOM: 'EA',
      weightUOM: 'KG',
      volumeUOM: 'L',
      isActive: true,
      isSerialized: false,
      isLotTracked: false,
      isPurchasable: true,
      isSellable: true,
      isManufactured: false,
      defaultWarehouse: '',
      reorderPoint: 0,
      reorderQty: 0,
      standardCost: 0,
      lastCost: 0,
      averageCost: 0,
      companyId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '',
      updatedBy: ''
    });
  };

  return (
    <div className="flex h-full">
      {/* Items List Panel */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items Master</h2>
            <button
              onClick={handleNewItem}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + New Item
            </button>
          </div>
          
          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {itemClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemSelect(item)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedItem?.id === item.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.itemCode}</div>
                  <div className="text-xs text-gray-600 truncate">{item.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {item.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Panel */}
      <div className="flex-1 bg-white">
        {selectedItem ? (
          <ItemMasterForm item={selectedItem} onSave={setSelectedItem} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <div className="text-lg font-medium">Select an item to view details</div>
              <div className="text-sm">Choose an item from the list or create a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Item Master Form Component
interface ItemMasterFormProps {
  item: Item;
  onSave: (item: Item) => void;
}

const ItemMasterForm: React.FC<ItemMasterFormProps> = ({ item, onSave }) => {
  const { itemClasses, warehouses } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Item>(item);
  const [uomConversions, setUomConversions] = useState<UOMConversion[]>([]);

  const handleInputChange = (field: keyof Item, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'uom', label: 'UOM Conversions', icon: '📏' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'attributes', label: 'Attributes', icon: '🏷️' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{formData.itemCode || 'New Item'}</h2>
            <p className="text-sm text-gray-600">{formData.description || 'Item description'}</p>
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
        {activeTab === 'general' && <GeneralTab formData={formData} onChange={handleInputChange} itemClasses={itemClasses} warehouses={warehouses} />}
        {activeTab === 'uom' && <UOMTab formData={formData} uomConversions={uomConversions} onUomChange={setUomConversions} />}
        {activeTab === 'pricing' && <PricingTab formData={formData} onChange={handleInputChange} />}
        {activeTab === 'inventory' && <InventoryTab formData={formData} onChange={handleInputChange} />}
        {activeTab === 'attributes' && <AttributesTab formData={formData} onChange={handleInputChange} />}
      </div>
    </div>
  );
};

// General Tab Component
interface GeneralTabProps {
  formData: Item;
  onChange: (field: keyof Item, value: any) => void;
  itemClasses: ItemClass[];
  warehouses: any[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, onChange, itemClasses, warehouses }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Code *
            </label>
            <input
              type="text"
              value={formData.itemCode}
              onChange={(e) => onChange('itemCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Class *
            </label>
            <select
              value={formData.itemClassId}
              onChange={(e) => onChange('itemClassId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Item Class</option>
              {itemClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posting Class
            </label>
            <select
              value={formData.postingClassId}
              onChange={(e) => onChange('postingClassId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Posting Class</option>
              {itemClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* UOM Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Unit of Measure</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base UOM *
            </label>
            <select
              value={formData.baseUOM}
              onChange={(e) => onChange('baseUOM', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EA">Each (EA)</option>
              <option value="KG">Kilogram (KG)</option>
              <option value="L">Liter (L)</option>
              <option value="M">Meter (M)</option>
              <option value="M2">Square Meter (M2)</option>
              <option value="M3">Cubic Meter (M3)</option>
              <option value="BOX">Box</option>
              <option value="CASE">Case</option>
              <option value="PALLET">Pallet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight UOM
            </label>
            <select
              value={formData.weightUOM}
              onChange={(e) => onChange('weightUOM', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="KG">Kilogram (KG)</option>
              <option value="G">Gram (G)</option>
              <option value="LB">Pound (LB)</option>
              <option value="OZ">Ounce (OZ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume UOM
            </label>
            <select
              value={formData.volumeUOM}
              onChange={(e) => onChange('volumeUOM', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Liter (L)</option>
              <option value="ML">Milliliter (ML)</option>
              <option value="GAL">Gallon (GAL)</option>
              <option value="PT">Pint (PT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Item Properties */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Item Properties</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => onChange('isActive', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isSerialized}
                onChange={(e) => onChange('isSerialized', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Serialized</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isLotTracked}
                onChange={(e) => onChange('isLotTracked', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Lot Tracked</span>
            </label>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPurchasable}
                onChange={(e) => onChange('isPurchasable', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Purchasable</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isSellable}
                onChange={(e) => onChange('isSellable', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Sellable</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isManufactured}
                onChange={(e) => onChange('isManufactured', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Manufactured</span>
            </label>
          </div>
        </div>
      </div>

      {/* Default Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Default Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Warehouse
            </label>
            <select
              value={formData.defaultWarehouse}
              onChange={(e) => onChange('defaultWarehouse', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reorder Point
            </label>
            <input
              type="number"
              value={formData.reorderPoint}
              onChange={(e) => onChange('reorderPoint', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reorder Quantity
            </label>
            <input
              type="number"
              value={formData.reorderQty}
              onChange={(e) => onChange('reorderQty', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// UOM Conversions Tab Component
interface UOMTabProps {
  formData: Item;
  uomConversions: UOMConversion[];
  onUomChange: (conversions: UOMConversion[]) => void;
}

const UOMTab: React.FC<UOMTabProps> = ({ formData, uomConversions, onUomChange }) => {
  const [newConversion, setNewConversion] = useState({
    fromUOM: formData.baseUOM,
    toUOM: '',
    conversionFactor: 1
  });

  const handleAddConversion = () => {
    if (newConversion.toUOM && newConversion.conversionFactor > 0) {
      const conversion: UOMConversion = {
        id: Date.now().toString(),
        itemId: formData.id,
        fromUOM: newConversion.fromUOM,
        toUOM: newConversion.toUOM,
        conversionFactor: newConversion.conversionFactor,
        companyId: formData.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '',
        updatedBy: ''
      };
      onUomChange([...uomConversions, conversion]);
      setNewConversion({ fromUOM: formData.baseUOM, toUOM: '', conversionFactor: 1 });
    }
  };

  const handleRemoveConversion = (id: string) => {
    onUomChange(uomConversions.filter(conv => conv.id !== id));
  };

  const uomOptions = ['EA', 'KG', 'L', 'M', 'M2', 'M3', 'BOX', 'CASE', 'PALLET', 'G', 'LB', 'OZ', 'ML', 'GAL', 'PT'];

  return (
    <div className="space-y-6">
      {/* Add New Conversion */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Add UOM Conversion</h3>
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From UOM
            </label>
            <select
              value={newConversion.fromUOM}
              onChange={(e) => setNewConversion(prev => ({ ...prev, fromUOM: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uomOptions.map(uom => (
                <option key={uom} value={uom}>{uom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To UOM
            </label>
            <select
              value={newConversion.toUOM}
              onChange={(e) => setNewConversion(prev => ({ ...prev, toUOM: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select UOM</option>
              {uomOptions.filter(uom => uom !== newConversion.fromUOM).map(uom => (
                <option key={uom} value={uom}>{uom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conversion Factor
            </label>
            <input
              type="number"
              step="0.0001"
              value={newConversion.conversionFactor}
              onChange={(e) => setNewConversion(prev => ({ ...prev, conversionFactor: parseFloat(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0000"
            />
          </div>
          <div>
            <button
              onClick={handleAddConversion}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Add Conversion
            </button>
          </div>
        </div>
      </div>

      {/* UOM Conversions Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-md font-semibold">UOM Conversions</h3>
          <p className="text-sm text-gray-600">Define conversion factors between different units of measure</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Factor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uomConversions.map(conversion => (
                <tr key={conversion.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {conversion.fromUOM}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {conversion.toUOM}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {conversion.conversionFactor.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => handleRemoveConversion(conversion.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {uomConversions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No UOM conversions defined. Add conversions to enable unit flexibility.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Placeholder tab components
const PricingTab: React.FC<{ formData: Item; onChange: (field: keyof Item, value: any) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Pricing Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standard Cost</label>
          <input
            type="number"
            step="0.01"
            value={formData.standardCost}
            onChange={(e) => onChange('standardCost', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Cost</label>
          <input
            type="number"
            step="0.01"
            value={formData.lastCost}
            onChange={(e) => onChange('lastCost', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

const InventoryTab: React.FC<{ formData: Item; onChange: (field: keyof Item, value: any) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Inventory Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
          <input
            type="number"
            value={formData.reorderPoint}
            onChange={(e) => onChange('reorderPoint', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity</label>
          <input
            type="number"
            value={formData.reorderQty}
            onChange={(e) => onChange('reorderQty', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
);

const AttributesTab: React.FC<{ formData: Item; onChange: (field: keyof Item, value: any) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Item Attributes</h3>
      <p className="text-sm text-gray-600">Additional attributes and custom fields will be available here.</p>
    </div>
  </div>
);

export default ItemsPage;