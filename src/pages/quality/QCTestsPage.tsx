import React, { useState } from 'react';
import { QCTest, QCResult, LotSerial, Item, BatchAttributes } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const QCTestsPage: React.FC = () => {
  const { items } = useAppStore();
  const [selectedTest, setSelectedTest] = useState<QCTest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('');

  // Mock data for QC tests
  const [qcTests] = useState<QCTest[]>([
    {
      id: '1',
      lotSerialId: '1',
      testType: 'INCOMING_INSPECTION',
      testDate: new Date('2024-01-25'),
      status: 'COMPLETED',
      testedBy: 'QC001',
      notes: 'All parameters within acceptable range',
      createdAt: new Date(),
      companyId: '1',
      batchNo: 'LOT-2024-001',
      itemId: '1',
      priority: 'HIGH'
    },
    {
      id: '2',
      lotSerialId: '2',
      testType: 'IN_PROCESS',
      testDate: new Date('2024-01-26'),
      status: 'IN_PROGRESS',
      testedBy: 'QC002',
      notes: 'Fermentation monitoring - Day 7',
      createdAt: new Date(),
      companyId: '1',
      batchNo: 'BATCH-2024-002',
      itemId: '4',
      priority: 'MEDIUM'
    },
    {
      id: '3',
      lotSerialId: '3',
      testType: 'FINAL_PRODUCT',
      testDate: new Date('2024-01-27'),
      status: 'PENDING',
      testedBy: 'QC001',
      notes: 'Ready for final quality assessment',
      createdAt: new Date(),
      companyId: '1',
      batchNo: 'BATCH-2024-001',
      itemId: '4',
      priority: 'HIGH'
    }
  ]);

  const [qcResults] = useState<QCResult[]>([
    {
      id: '1',
      qcTestId: '1',
      parameter: 'Moisture Content',
      expectedValue: '4.0-4.5%',
      actualValue: '4.2%',
      result: 'PASS',
      notes: 'Within specification'
    },
    {
      id: '2',
      qcTestId: '1',
      parameter: 'Protein Content',
      expectedValue: '10.5-12.0%',
      actualValue: '11.2%',
      result: 'PASS',
      notes: 'Good protein level'
    },
    {
      id: '3',
      qcTestId: '2',
      parameter: 'Specific Gravity',
      expectedValue: '1.010-1.015',
      actualValue: '1.012',
      result: 'PASS',
      notes: 'Fermentation progressing normally'
    },
    {
      id: '4',
      qcTestId: '2',
      parameter: 'Temperature',
      expectedValue: '18-22°C',
      actualValue: '20°C',
      result: 'PASS',
      notes: 'Optimal fermentation temperature'
    }
  ]);

  const filteredTests = qcTests.filter(test => {
    const matchesSearch = test.batchNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || test.status === statusFilter;
    const matchesType = !testTypeFilter || test.testType === testTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleTestSelect = (test: QCTest) => {
    setSelectedTest(test);
  };

  const handleNewTest = () => {
    setSelectedTest({
      id: '',
      lotSerialId: '',
      testType: 'INCOMING_INSPECTION',
      testDate: new Date(),
      status: 'PENDING',
      testedBy: '',
      notes: '',
      createdAt: new Date(),
      companyId: '1',
      batchNo: '',
      itemId: '',
      priority: 'MEDIUM'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate test statistics
  const totalTests = qcTests.length;
  const pendingTests = qcTests.filter(t => t.status === 'PENDING').length;
  const completedTests = qcTests.filter(t => t.status === 'COMPLETED').length;
  const failedTests = qcTests.filter(t => t.status === 'FAILED').length;
  const passRate = totalTests > 0 ? ((completedTests / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="flex h-full">
      {/* QC Dashboard & Tests List Panel */}
      <div className="w-1/2 border-r border-gray-200 bg-white">
        {/* QC Dashboard */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Quality Control Dashboard</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{pendingTests}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{completedTests}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{passRate}%</div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>
        </div>

        {/* Tests List Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold">QC Tests</h3>
            <button
              onClick={handleNewTest}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + New Test
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search batch/lot numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={testTypeFilter}
                onChange={(e) => setTestTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="INCOMING_INSPECTION">Incoming</option>
                <option value="IN_PROCESS">In Process</option>
                <option value="FINAL_PRODUCT">Final Product</option>
                <option value="STABILITY">Stability</option>
                <option value="MICROBIOLOGICAL">Microbiological</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 350px)' }}>
          {filteredTests.map(test => {
            const item = items.find(i => i.id === test.itemId);
            const testResults = qcResults.filter(r => r.qcTestId === test.id);
            const passedResults = testResults.filter(r => r.result === 'PASS').length;
            const totalResults = testResults.length;
            const testPassRate = totalResults > 0 ? ((passedResults / totalResults) * 100).toFixed(0) : '0';

            return (
              <div
                key={test.id}
                onClick={() => handleTestSelect(test)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedTest?.id === test.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{test.batchNo}</div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(test.priority)}`}>
                      {test.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  Type: {test.testType.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-500">
                  Item: {item?.itemCode || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Tested: {test.testDate.toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  Results: {testPassRate}% pass rate ({passedResults}/{totalResults})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Detail Panel */}
      <div className="flex-1 bg-white">
        {selectedTest ? (
          <QCTestDetail 
            test={selectedTest}
            results={qcResults.filter(r => r.qcTestId === selectedTest.id)}
            onSave={setSelectedTest}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🔬</div>
              <div className="text-lg font-medium">Select a QC test to view details</div>
              <div className="text-sm">Choose a test from the list or create a new one</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// QC Test Detail Component
interface QCTestDetailProps {
  test: QCTest;
  results: QCResult[];
  onSave: (test: QCTest) => void;
}

const QCTestDetail: React.FC<QCTestDetailProps> = ({ test, results, onSave }) => {
  const { items } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<QCTest>(test);
  const [testResults, setTestResults] = useState<QCResult[]>(results);

  const handleInputChange = (field: keyof QCTest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleAddResult = () => {
    const newResult: QCResult = {
      id: Date.now().toString(),
      qcTestId: formData.id,
      parameter: '',
      expectedValue: '',
      actualValue: '',
      result: 'PASS',
      notes: ''
    };
    setTestResults([...testResults, newResult]);
  };

  const handleResultChange = (resultId: string, field: keyof QCResult, value: any) => {
    setTestResults(prev => prev.map(result => {
      if (result.id === resultId) {
        return { ...result, [field]: value };
      }
      return result;
    }));
  };

  const handleRemoveResult = (resultId: string) => {
    setTestResults(prev => prev.filter(result => result.id !== resultId));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'parameters', label: 'Test Parameters', icon: '🔬' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'attachments', label: 'Attachments', icon: '📎' }
  ];

  const item = items.find(i => i.id === formData.itemId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{formData.batchNo || 'New QC Test'}</h2>
            <p className="text-sm text-gray-600">
              {formData.testType.replace('_', ' ')} - {item?.itemCode || 'Unknown Item'}
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
        {activeTab === 'general' && <GeneralTab formData={formData} onChange={handleInputChange} items={items} />}
        {activeTab === 'parameters' && <ParametersTab testType={formData.testType} />}
        {activeTab === 'results' && <ResultsTab results={testResults} onResultChange={handleResultChange} onAddResult={handleAddResult} onRemoveResult={handleRemoveResult} />}
        {activeTab === 'attachments' && <AttachmentsTab />}
      </div>
    </div>
  );
};

// General Tab Component
interface GeneralTabProps {
  formData: QCTest;
  onChange: (field: keyof QCTest, value: any) => void;
  items: Item[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({ formData, onChange, items }) => {
  return (
    <div className="space-y-6">
      {/* Test Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Test Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch/Lot Number *
            </label>
            <input
              type="text"
              value={formData.batchNo}
              onChange={(e) => onChange('batchNo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch/lot number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Type *
            </label>
            <select
              value={formData.testType}
              onChange={(e) => onChange('testType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INCOMING_INSPECTION">Incoming Inspection</option>
              <option value="IN_PROCESS">In Process</option>
              <option value="FINAL_PRODUCT">Final Product</option>
              <option value="STABILITY">Stability</option>
              <option value="MICROBIOLOGICAL">Microbiological</option>
              <option value="SENSORY">Sensory</option>
              <option value="CHEMICAL">Chemical</option>
              <option value="PHYSICAL">Physical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item *
            </label>
            <select
              value={formData.itemId}
              onChange={(e) => onChange('itemId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => onChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Date *
            </label>
            <input
              type="date"
              value={formData.testDate.toISOString().split('T')[0]}
              onChange={(e) => onChange('testDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tested By
            </label>
            <input
              type="text"
              value={formData.testedBy}
              onChange={(e) => onChange('testedBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="QC Technician ID"
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
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
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
              placeholder="Enter test notes and observations..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Parameters Tab Component
const ParametersTab: React.FC<{ testType: string }> = ({ testType }) => {
  const getTestParameters = (type: string) => {
    const parameters: Record<string, string[]> = {
      INCOMING_INSPECTION: [
        'Visual Inspection', 'Moisture Content', 'Protein Content', 'Extract Potential',
        'Color Analysis', 'Foreign Matter', 'Damaged Kernels', 'Germination Rate'
      ],
      IN_PROCESS: [
        'Temperature', 'pH Level', 'Specific Gravity', 'Dissolved Oxygen',
        'Cell Count', 'Viability', 'Alcohol Content', 'Bitterness (IBU)'
      ],
      FINAL_PRODUCT: [
        'Alcohol by Volume (ABV)', 'Original Gravity', 'Final Gravity', 'pH Level',
        'Color (SRM)', 'Bitterness (IBU)', 'Clarity', 'Foam Stability',
        'Microbiological Count', 'Sensory Evaluation'
      ],
      MICROBIOLOGICAL: [
        'Total Plate Count', 'Yeast Count', 'Wild Yeast', 'Bacteria Count',
        'Lactobacillus', 'Pediococcus', 'Acetobacter', 'Enterobacteria'
      ],
      STABILITY: [
        'Shelf Life', 'Temperature Stability', 'Light Stability', 'Oxidation Resistance',
        'Protein Stability', 'Foam Retention', 'Flavor Stability'
      ]
    };
    
    return parameters[type] || [];
  };

  const parameters = getTestParameters(testType);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-4">Standard Test Parameters</h3>
        <p className="text-sm text-gray-600 mb-4">
          Standard parameters for {testType.replace('_', ' ').toLowerCase()} testing:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {parameters.map((param, index) => (
            <div key={index} className="flex items-center p-2 bg-white rounded border">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm">{param}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Results Tab Component
interface ResultsTabProps {
  results: QCResult[];
  onResultChange: (resultId: string, field: keyof QCResult, value: any) => void;
  onAddResult: () => void;
  onRemoveResult: (resultId: string) => void;
}

const ResultsTab: React.FC<ResultsTabProps> = ({ results, onResultChange, onAddResult, onRemoveResult }) => {
  return (
    <div className="space-y-6">
      {/* Add Result Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Test Results</h3>
        <button
          onClick={onAddResult}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Add Parameter
        </button>
      </div>

      {/* Results Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map(result => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={result.parameter}
                      onChange={(e) => onResultChange(result.id, 'parameter', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Parameter name"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={result.expectedValue}
                      onChange={(e) => onResultChange(result.id, 'expectedValue', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Expected range"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={result.actualValue}
                      onChange={(e) => onResultChange(result.id, 'actualValue', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Actual value"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <select
                      value={result.result}
                      onChange={(e) => onResultChange(result.id, 'result', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="PASS">Pass</option>
                      <option value="FAIL">Fail</option>
                      <option value="WARNING">Warning</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={result.notes}
                      onChange={(e) => onResultChange(result.id, 'notes', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Notes"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => onRemoveResult(result.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No test results added. Click "Add Parameter" to start recording test results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Summary */}
      {results.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3">Test Summary</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Parameters:</span>
              <span className="ml-2">{results.length}</span>
            </div>
            <div>
              <span className="font-medium">Passed:</span>
              <span className="ml-2 text-green-600">{results.filter(r => r.result === 'PASS').length}</span>
            </div>
            <div>
              <span className="font-medium">Failed:</span>
              <span className="ml-2 text-red-600">{results.filter(r => r.result === 'FAIL').length}</span>
            </div>
            <div>
              <span className="font-medium">Warnings:</span>
              <span className="ml-2 text-yellow-600">{results.filter(r => r.result === 'WARNING').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder tab components
const AttachmentsTab: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-4">Test Attachments</h3>
      <p className="text-sm text-gray-600">Upload test certificates, lab reports, and supporting documents.</p>
      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">📎</div>
        <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
      </div>
    </div>
  </div>
);

export default QCTestsPage;