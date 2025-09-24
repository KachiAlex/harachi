import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Download, Save, X, FolderTree, Package } from 'lucide-react';
import { ItemClass } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import RightRail from '../layout/RightRail';

const ItemClassesPage: React.FC = () => {
  const { userContext, setRightRailOpen } = useAppStore();
  const [itemClasses, setItemClasses] = useState<ItemClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<ItemClass | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2']));
  const [editingClass, setEditingClass] = useState<Partial<ItemClass> | null>(null);
  const [showNewClassForm, setShowNewClassForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  const mockItemClasses: ItemClass[] = [
    {
      id: '1',
      companyId: '1',
      code: 'RAW',
      name: 'Raw Materials',
      description: 'Raw materials for brewing',
      postingClass: 'RAW_MATERIALS',
      defaultWarehouseId: '1',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
      children: [
        {
          id: '4',
          companyId: '1',
          parentId: '1',
          code: 'GRAINS',
          name: 'Grains',
          description: 'Grains & Malts',
          postingClass: 'RAW_MATERIALS',
          defaultWarehouseId: '1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
        },
        {
          id: '5',
          companyId: '1',
          parentId: '1',
          code: 'HOPS',
          name: 'Hops',
          description: 'Hops for flavoring',
          postingClass: 'RAW_MATERIALS',
          defaultWarehouseId: '1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
        },
        {
          id: '6',
          companyId: '1',
          parentId: '1',
          code: 'YEAST',
          name: 'Yeast',
          description: 'Brewing yeast',
          postingClass: 'RAW_MATERIALS',
          defaultWarehouseId: '1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
        },
      ]
    },
    {
      id: '2',
      companyId: '1',
      code: 'PACK',
      name: 'Packaging',
      description: 'Packaging materials',
      postingClass: 'PACKAGING',
      defaultWarehouseId: '2',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
      children: [
        {
          id: '7',
          companyId: '1',
          parentId: '2',
          code: 'BOTTLES',
          name: 'Bottles',
          description: 'Glass bottles',
          postingClass: 'PACKAGING',
          defaultWarehouseId: '2',
          createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
        },
        {
          id: '8',
          companyId: '1',
          parentId: '2',
          code: 'CANS',
          name: 'Cans',
          description: 'Aluminum cans',
          postingClass: 'PACKAGING',
          defaultWarehouseId: '2',
          createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
        },
      ]
    },
    {
      id: '3',
      companyId: '1',
      code: 'FG',
      name: 'Finished Goods',
      description: 'Finished beer products',
      postingClass: 'FINISHED_GOODS',
      defaultWarehouseId: '3',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
      children: [
        {
          id: '9',
          companyId: '1',
          parentId: '3',
          code: 'BEER',
          name: 'Beer',
          description: 'Beer products',
          postingClass: 'FINISHED_GOODS',
          defaultWarehouseId: '3',
          createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      createdBy: 'system',
      updatedBy: 'system',
        },
      ]
    },
  ];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setItemClasses(mockItemClasses);
      setExpandedNodes(new Set(['1', '2'])); // Expand first two nodes by default
      setSelectedClass(mockItemClasses[0]); // Select first class by default
      setLoading(false);
    }, 500);
  }, []);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectClass = (itemClass: ItemClass) => {
    setSelectedClass(itemClass);
    setEditingClass(null);
    setShowNewClassForm(false);
  };

  const startEditing = () => {
    if (selectedClass) {
      setEditingClass({ ...selectedClass });
    }
  };

  const cancelEditing = () => {
    setEditingClass(null);
  };

  const saveClass = () => {
    if (editingClass && selectedClass) {
      // TODO: Save to API
      console.log('Saving class:', editingClass);
      
      // Update local state
      const updatedClass = { ...selectedClass, ...editingClass };
      setSelectedClass(updatedClass);
      setEditingClass(null);
      
      // TODO: Update itemClasses array
    }
  };

  const startNewClass = () => {
    setShowNewClassForm(true);
    setEditingClass({
      companyId: userContext?.tenantId || '1',
      parentId: selectedClass?.id,
      code: '',
      name: '',
      description: '',
      postingClass: selectedClass?.postingClass || 'RAW_MATERIALS',
      defaultWarehouseId: selectedClass?.defaultWarehouseId,
    });
  };

  const renderTreeNode = (itemClass: ItemClass, level: number = 0) => {
    const hasChildren = itemClass.children && itemClass.children.length > 0;
    const isExpanded = expandedNodes.has(itemClass.id);
    const isSelected = selectedClass?.id === itemClass.id;

    const getIcon = (code: string) => {
      const iconMap: { [key: string]: string } = {
        'RAW': '📁',
        'GRAINS': '🌾',
        'HOPS': '🌿',
        'YEAST': '🦠',
        'PACK': '📁',
        'BOTTLES': '🍾',
        'CANS': '🥫',
        'FG': '📁',
        'BEER': '🍺',
      };
      return iconMap[code] || '📦';
    };

    return (
      <div key={itemClass.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onClick={() => selectClass(itemClass)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNode(itemClass.id);
            }}
            className="w-4 h-4 flex items-center justify-center"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )
            ) : null}
          </button>
          
          <span className="text-base">{getIcon(itemClass.code)}</span>
          <span className="font-medium text-gray-900">{itemClass.description}</span>
          <span className="text-sm text-gray-500 ml-auto">({itemClass.code})</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {itemClass.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading item classes...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      
      {/* Left Panel - Tree View */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        
        {/* Tree Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              Item Classes
            </h2>
            <div className="flex gap-2">
              <button className="btn btn-secondary text-sm px-3 py-1">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button 
                onClick={startNewClass}
                className="btn btn-primary text-sm px-3 py-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Class
              </button>
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {itemClasses.map((itemClass) => renderTreeNode(itemClass))}
          </div>
        </div>
      </div>

      {/* Right Panel - Detail View */}
      <div className="flex-1 flex flex-col">
        
        {/* Detail Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {showNewClassForm ? 'New Item Class' : selectedClass?.description || 'Select an Item Class'}
              </h3>
              {selectedClass && !showNewClassForm && (
                <p className="text-sm text-gray-500 mt-1">
                  Code: {selectedClass.code} • ID: {selectedClass.id}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedClass && !editingClass && !showNewClassForm && (
                <>
                  <button
                    onClick={() => setRightRailOpen(true)}
                    className="btn btn-ghost"
                  >
                    📝 Notes
                  </button>
                  <button
                    onClick={startEditing}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                </>
              )}
              {(editingClass || showNewClassForm) && (
                <>
                  <button
                    onClick={cancelEditing}
                    className="btn btn-secondary"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={saveClass}
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedClass || showNewClassForm ? (
            <div className="max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Code *
                    </label>
                    {editingClass || showNewClassForm ? (
                      <input
                        type="text"
                        value={editingClass?.code || ''}
                        onChange={(e) => setEditingClass(prev => prev ? { ...prev, code: e.target.value } : null)}
                        className="input"
                        placeholder="Enter class code"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 py-2">
                        {selectedClass?.code}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    {editingClass || showNewClassForm ? (
                      <input
                        type="text"
                        value={editingClass?.description || ''}
                        onChange={(e) => setEditingClass(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="input"
                        placeholder="Enter description"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 py-2">
                        {selectedClass?.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Class
                    </label>
                    {editingClass || showNewClassForm ? (
                      <select
                        value={editingClass?.parentId || ''}
                        onChange={(e) => setEditingClass(prev => prev ? { ...prev, parentId: e.target.value || undefined } : null)}
                        className="select"
                      >
                        <option value="">Root Level</option>
                        {itemClasses.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.description} ({cls.code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900 py-2">
                        {selectedClass?.parentId ? 
                          itemClasses.find(c => c.id === selectedClass.parentId)?.description || 'Unknown' :
                          'Root Level'
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Configuration
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posting Class
                    </label>
                    {editingClass || showNewClassForm ? (
                      <select
                        value={editingClass?.postingClass || ''}
                        onChange={(e) => setEditingClass(prev => prev ? { ...prev, postingClass: e.target.value } : null)}
                        className="select"
                      >
                        <option value="RAW_MATERIALS">Raw Materials</option>
                        <option value="PACKAGING">Packaging</option>
                        <option value="FINISHED_GOODS">Finished Goods</option>
                        <option value="WORK_IN_PROCESS">Work in Process</option>
                        <option value="EXPENSE">Expense</option>
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900 py-2">
                        {selectedClass?.postingClass?.replace('_', ' ')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Warehouse
                    </label>
                    {editingClass || showNewClassForm ? (
                      <select
                        value={editingClass?.defaultWarehouseId || ''}
                        onChange={(e) => setEditingClass(prev => prev ? { ...prev, defaultWarehouseId: e.target.value || undefined } : null)}
                        className="select"
                      >
                        <option value="">Select warehouse</option>
                        <option value="1">Munich - Raw Materials</option>
                        <option value="2">Munich - Packaging</option>
                        <option value="3">Munich - Finished Goods</option>
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900 py-2">
                        {selectedClass?.defaultWarehouseId ? `Warehouse ${selectedClass.defaultWarehouseId}` : 'Not set'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Child Classes */}
              {selectedClass?.children && selectedClass.children.length > 0 && !editingClass && !showNewClassForm && (
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Child Classes ({selectedClass.children.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedClass.children.map((child) => (
                      <div
                        key={child.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectClass(child)}
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">{child.description}</div>
                            <div className="text-sm text-gray-500">{child.code}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FolderTree className="w-16 h-16 mb-4" />
              <p className="text-lg">Select an item class to view details</p>
              <p className="text-sm">Choose from the tree on the left to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Rail */}
      <RightRail recordType="Item Class" recordId={selectedClass?.id} />
    </div>
  );
};

export default ItemClassesPage;
