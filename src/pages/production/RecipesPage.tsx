import React, { useState } from 'react';
import { Recipe, RecipeLine, Item } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const RecipesPage: React.FC = () => {
  const { items } = useAppStore();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const [recipeLines] = useState<RecipeLine[]>([
    {
      id: '1',
      recipeId: '1',
      lineNumber: 1,
      itemId: '1', // Pilsner Malt
      qtyPerBatch: 15.5,
      uom: 'KG',
      item: items.find(i => i.id === '1')!
    },
    {
      id: '2',
      recipeId: '1',
      lineNumber: 2,
      itemId: '2', // Hallertau Hops
      qtyPerBatch: 0.2,
      uom: 'KG',
      item: items.find(i => i.id === '2')!
    },
    {
      id: '3',
      recipeId: '1',
      lineNumber: 3,
      itemId: '3', // Bottle
      qtyPerBatch: 2000,
      uom: 'EA',
      item: items.find(i => i.id === '3')!
    }
  ]);

  const filteredRecipes = recipes.filter(recipe => 
    recipe.recipeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleNewRecipe = () => {
    setSelectedRecipe({
      id: '',
      companyId: '1',
      itemId: '',
      recipeCode: '',
      description: '',
      batchSize: 1000,
      batchUom: 'L',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <div className="flex h-full">
      {/* Recipes List Panel */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recipes</h2>
            <button
              onClick={handleNewRecipe}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + New Recipe
            </button>
          </div>
          
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recipes List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => handleRecipeSelect(recipe)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedRecipe?.id === recipe.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{recipe.recipeCode}</div>
                  <div className="text-xs text-gray-600 truncate">{recipe.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Batch: {recipe.batchSize} {recipe.batchUom}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {recipe.active ? (
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

      {/* Recipe Detail Panel */}
      <div className="flex-1 bg-white">
        {selectedRecipe ? (
          <RecipeEditor 
            recipe={selectedRecipe} 
            recipeLines={recipeLines.filter(line => line.recipeId === selectedRecipe.id)}
            onSave={setSelectedRecipe} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🍺</div>
              <div className="text-lg font-medium">Select a recipe to view details</div>
              <div className="text-sm">Choose a recipe from the list or create a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Recipe Editor Component
interface RecipeEditorProps {
  recipe: Recipe;
  recipeLines: RecipeLine[];
  onSave: (recipe: Recipe) => void;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({ recipe, recipeLines, onSave }) => {
  const { items } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Recipe>(recipe);
  const [lines, setLines] = useState<RecipeLine[]>(recipeLines);

  const handleInputChange = (field: keyof Recipe, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleAddLine = () => {
    const newLine: RecipeLine = {
      id: Date.now().toString(),
      recipeId: formData.id,
      lineNumber: lines.length + 1,
      itemId: '',
      qtyPerBatch: 0,
      uom: 'KG',
      item: {} as Item
    };
    setLines([...lines, newLine]);
  };

  const handleLineChange = (lineId: string, field: keyof RecipeLine, value: any) => {
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value };
        if (field === 'itemId') {
          const selectedItem = items.find(i => i.id === value);
          updatedLine.item = selectedItem || {} as Item;
        }
        return updatedLine;
      }
      return line;
    }));
  };

  const handleRemoveLine = (lineId: string) => {
    setLines(prev => prev.filter(line => line.id !== lineId));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'ingredients', label: 'Ingredients', icon: '🌾' },
    { id: 'instructions', label: 'Instructions', icon: '📝' },
    { id: 'costing', label: 'Costing', icon: '💰' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{formData.recipeCode || 'New Recipe'}</h2>
            <p className="text-sm text-gray-600">{formData.description || 'Recipe description'}</p>
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
        {activeTab === 'general' && <GeneralTab formData={formData} onChange={handleInputChange} items={items} />}
        {activeTab === 'ingredients' && <IngredientsTab lines={lines} onLineChange={handleLineChange} onAddLine={handleAddLine} onRemoveLine={handleRemoveLine} items={items} />}
        {activeTab === 'instructions' && <InstructionsTab />}
        {activeTab === 'costing' && <CostingTab lines={lines} />}
      </div>
    </div>
  );
};

// General Tab Component
interface GeneralTabProps {
  formData: Recipe;
  onChange: (field: keyof Recipe, value: any) => void;
  items: Item[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, onChange, items }) => {
  const finishedGoods = items.filter(item => item.isManufactured);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Code *
            </label>
            <input
              type="text"
              value={formData.recipeCode}
              onChange={(e) => onChange('recipeCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recipe code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
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
              Finished Good *
            </label>
            <select
              value={formData.itemId}
              onChange={(e) => onChange('itemId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Finished Good</option>
              {finishedGoods.map(item => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size *
            </label>
            <input
              type="number"
              value={formData.batchSize}
              onChange={(e) => onChange('batchSize', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch UOM *
            </label>
            <select
              value={formData.batchUom}
              onChange={(e) => onChange('batchUom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Liter (L)</option>
              <option value="KG">Kilogram (KG)</option>
              <option value="EA">Each (EA)</option>
              <option value="GAL">Gallon (GAL)</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => onChange('active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Recipe Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Recipe Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Ingredients:</span>
            <span className="ml-2">0 items</span>
          </div>
          <div>
            <span className="font-medium">Estimated Cost:</span>
            <span className="ml-2">$0.00</span>
          </div>
          <div>
            <span className="font-medium">Yield Efficiency:</span>
            <span className="ml-2">95%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ingredients Tab Component
interface IngredientsTabProps {
  lines: RecipeLine[];
  onLineChange: (lineId: string, field: keyof RecipeLine, value: any) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: string) => void;
  items: Item[];
}

const IngredientsTab: React.FC<IngredientsTabProps> = ({ lines, onLineChange, onAddLine, onRemoveLine, items }) => {
  return (
    <div className="space-y-6">
      {/* Add Line Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Recipe Ingredients</h3>
        <button
          onClick={onAddLine}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Ingredients Grid */}
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
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
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
                      value={line.qtyPerBatch}
                      onChange={(e) => onLineChange(line.id, 'qtyPerBatch', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <select
                      value={line.uom}
                      onChange={(e) => onLineChange(line.id, 'uom', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="KG">KG</option>
                      <option value="L">L</option>
                      <option value="EA">EA</option>
                      <option value="G">G</option>
                      <option value="ML">ML</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    ${line.item?.standardCost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    ${((line.item?.standardCost || 0) * line.qtyPerBatch).toFixed(2)}
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
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No ingredients added. Click "Add Ingredient" to start building your recipe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe Totals */}
      {lines.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Recipe Cost:</div>
              <div className="text-lg font-semibold">
                ${lines.reduce((total, line) => total + ((line.item?.standardCost || 0) * line.qtyPerBatch), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder tab components
const InstructionsTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Brewing Instructions</h3>
      <textarea
        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter detailed brewing instructions, temperatures, timing, and procedures..."
      />
    </div>
  </div>
);

const CostingTab: React.FC<{ lines: RecipeLine[] }> = ({ lines }) => {
  const totalCost = lines.reduce((total, line) => total + ((line.item?.standardCost || 0) * line.qtyPerBatch), 0);
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Cost Analysis</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              {lines.map(line => (
                <div key={line.id} className="flex justify-between text-sm">
                  <span>{line.item?.itemCode || 'Unknown Item'}</span>
                  <span>${((line.item?.standardCost || 0) * line.qtyPerBatch).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between font-medium">
                <span>Total Recipe Cost:</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Cost Metrics</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Cost per Liter:</label>
                <div className="text-lg font-semibold">${(totalCost / 1000).toFixed(4)}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Yield Efficiency:</label>
                <input
                  type="number"
                  defaultValue={95}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600 ml-1">%</span>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Target Margin:</label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600 ml-1">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;