import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Eye, Edit, X, User, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  orderDate: string;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  items: any[];
}

const Sales: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    orderDate: new Date().toISOString().split('T')[0],
    items: [] as any[],
    notes: ''
  });

  const loadOrders = useCallback(async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getSalesOrders(user.companyId);
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load sales orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateOrder = async () => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    try {
      await apiService.createSalesOrder({
        ...formData,
        companyId: user?.companyId,
        branchId: 'default'
      });
      toast.success('Sales order created successfully');
      setShowForm(false);
      loadOrders();
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  const draftOrders = orders.filter(o => o.status === 'draft').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Manage sales orders and customer transactions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Sales Order</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Draft Orders</p>
              <p className="text-xl font-semibold">{draftOrders}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Confirmed Orders</p>
              <p className="text-xl font-semibold">{confirmedOrders}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Completed Orders</p>
              <p className="text-xl font-semibold">{completedOrders}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-semibold">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No sales orders yet</h3>
            <p className="mb-4">Create your first sales order to get started.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4 inline mr-2" />
              Create First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName || order.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4 inline" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create Sales Order</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="input w-full"
                  placeholder="Enter customer ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input w-full"
                  rows={3}
                  placeholder="Order notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateOrder} className="btn-primary">
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Order Details: {viewingOrder.orderNumber}</h2>
              <button onClick={() => setViewingOrder(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{viewingOrder.customerName || viewingOrder.customerId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(viewingOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    viewingOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                    viewingOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">₦{viewingOrder.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {viewingOrder.items && viewingOrder.items.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewingOrder.items.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm">{item.itemName || item.itemId}</td>
                            <td className="px-4 py-2 text-sm">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm">₦{item.unitPrice?.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm">₦{(item.quantity * item.unitPrice)?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingOrder(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
