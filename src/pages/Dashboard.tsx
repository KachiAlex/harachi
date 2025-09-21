import React from 'react';
import { 
  Factory, 
  Package, 
  AlertTriangle, 
  TestTube, 
  TrendingUp, 
  TrendingDown,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color = 'primary' }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className={`text-${color}-600`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      {change && (
        <div className={`flex items-center gap-1 text-sm ${
          change.type === 'increase' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change.type === 'increase' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{change.type === 'increase' ? '+' : ''}{change.value}% {change.period}</span>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { userContext, businessDate } = useAppStore();

  const quickActions = [
    { id: 'new-batch', label: 'Start New Batch', icon: <Plus className="w-4 h-4" />, color: 'primary' },
    { id: 'goods-receipt', label: 'Record Goods Receipt', icon: <Package className="w-4 h-4" />, color: 'blue' },
    { id: 'qc-test', label: 'Log QC Test', icon: <TestTube className="w-4 h-4" />, color: 'green' },
    { id: 'stock-check', label: 'Stock Count', icon: <FileText className="w-4 h-4" />, color: 'purple' },
    { id: 'material-issue', label: 'Issue Materials', icon: <Package className="w-4 h-4" />, color: 'orange' },
    { id: 'batch-complete', label: 'Complete Batch', icon: <CheckCircle className="w-4 h-4" />, color: 'green' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'Batch Completed',
      description: 'Batch LG-2024-045 completed • Lager Premium • 1,200L • Tank A3',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'Goods Receipt Processed',
      description: 'Malt shipment • PO-2024-156 • 2,500kg',
      icon: <Package className="w-4 h-4" />,
      color: 'blue',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'QC Test Completed',
      description: 'Batch LG-2024-044 • Gravity test • PASSED',
      icon: <TestTube className="w-4 h-4" />,
      color: 'green',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'Low Stock Alert',
      description: 'Cascade Hops • 15kg remaining • Reorder needed',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'red',
      time: '8 hours ago',
    },
    {
      id: 5,
      type: 'Production Started',
      description: 'Batch LG-2024-046 • IPA Hoppy • Tank B1',
      icon: <Factory className="w-4 h-4" />,
      color: 'blue',
      time: 'Yesterday',
    },
  ];

  const urgentTasks = [
    {
      id: 1,
      title: 'QC Test Due',
      description: 'Batch LG-2024-043 • Final gravity',
      dueTime: '2:00 PM today',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Stock Reorder',
      description: 'Cascade Hops • Below minimum',
      action: 'Create PO',
      priority: 'medium',
    },
  ];

  const scheduledTasks = [
    { id: 1, title: 'Tank cleaning - A2', time: '3:00 PM - 5:00 PM' },
    { id: 2, title: 'Shift handover', time: '5:45 PM' },
    { id: 3, title: 'Weekly inventory count', time: 'Tomorrow 8:00 AM' },
  ];

  const handleQuickAction = (actionId: string) => {
    console.log('Quick action:', actionId);
    // TODO: Implement quick actions
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {userContext?.branchName || 'Brewery Operations'} • {userContext?.tenantName} • Business Date: {format(new Date(businessDate), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Production"
          value="2,400 L"
          change={{ value: 12, type: 'increase', period: 'vs yesterday' }}
          icon={<Factory className="w-5 h-5" />}
          color="primary"
        />
        <MetricCard
          title="Active Batches"
          value="3"
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Stock Alerts"
          value="5"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
        <MetricCard
          title="QC Tests Pending"
          value="7"
          icon={<TestTube className="w-5 h-5" />}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-${activity.color}-100 text-${activity.color}-600 flex-shrink-0`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {activity.type}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Priority */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Priority</h3>
          
          {/* Urgent Tasks */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Urgent Tasks
            </h4>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg ${
                    task.priority === 'high' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    task.priority === 'high' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {task.description}
                  </div>
                  <div className={`text-xs mt-2 ${
                    task.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {task.dueTime || task.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Tasks */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Scheduled
            </h4>
            <div className="space-y-3">
              {scheduledTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">System Status</div>
              <div className="text-xs text-gray-500">All systems operational</div>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">API Status</div>
              <div className="text-xs text-gray-500">Response time: 45ms</div>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">Data Sync</div>
              <div className="text-xs text-gray-500">Last sync: 5 min ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
