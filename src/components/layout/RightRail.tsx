import React, { useState } from 'react';
import { X, FileText, Paperclip, Activity, Plus, Save } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface RightRailProps {
  recordType?: string;
  recordId?: string | number;
}

const RightRail: React.FC<RightRailProps> = ({ recordType, recordId }) => {
  const { rightRailOpen, setRightRailOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<'notes' | 'files' | 'activities'>('notes');
  const [noteText, setNoteText] = useState('');

  const tabs = [
    { id: 'notes' as const, label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'files' as const, label: 'Files', icon: <Paperclip className="w-4 h-4" /> },
    { id: 'activities' as const, label: 'Activities', icon: <Activity className="w-4 h-4" /> },
  ];

  const handleSaveNote = () => {
    // TODO: Save note to backend
    console.log('Saving note:', noteText);
    setNoteText('');
  };

  const mockActivities = [
    {
      id: 1,
      type: 'QC Test Completed',
      description: 'Gravity test passed for Batch LG-2024-001',
      user: 'John Doe',
      timestamp: '2024-12-15T14:30:00Z',
    },
    {
      id: 2,
      type: 'Batch Started',
      description: 'Production started for Pilsner Classic',
      user: 'Jane Smith',
      timestamp: '2024-12-10T08:00:00Z',
    },
    {
      id: 3,
      type: 'Item Updated',
      description: 'SKU description modified',
      user: 'Admin User',
      timestamp: '2024-12-09T16:45:00Z',
    },
  ];

  const mockFiles = [
    {
      id: 1,
      name: 'Certificate_Analysis.pdf',
      size: '2.1 MB',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-12-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Batch_Photo.jpg',
      size: '1.5 MB',
      uploadedBy: 'Jane Smith',
      uploadedAt: '2024-12-14T15:20:00Z',
    },
  ];

  if (!rightRailOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 z-30 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {recordType && recordId ? `${recordType} Details` : 'Record Details'}
        </h2>
        <button
          onClick={() => setRightRailOpen(false)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Note
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add notes about this record..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="mt-3 w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </button>
            </div>

            {/* Existing Notes */}
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-900 mb-1">
                  Quality check completed successfully. All parameters within acceptable range.
                </div>
                <div className="text-xs text-gray-500">
                  John Doe • Dec 15, 2024 at 2:30 PM
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-900 mb-1">
                  Batch transferred to conditioning tank. Expected completion in 7 days.
                </div>
                <div className="text-xs text-gray-500">
                  Jane Smith • Dec 10, 2024 at 4:15 PM
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="p-4">
            
            {/* Upload Area */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Drag files here or click to upload
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Attached Files</h3>
              
              {mockFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {file.size} • {file.uploadedBy}
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="p-4">
            
            {/* Add Activity Button */}
            <button className="w-full mb-6 btn btn-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </button>

            {/* Activity Timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
              
              {mockActivities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {index < mockActivities.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.type}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightRail;
