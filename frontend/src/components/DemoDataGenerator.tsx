import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Wand2, Package, Users, ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DemoDataGeneratorProps {
  companyId: string;
  onComplete?: () => void;
}

const DemoDataGenerator: React.FC<DemoDataGeneratorProps> = ({ companyId, onComplete }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sampleInventoryItems = [
    { sku: 'MALT-001', name: 'Premium Malt', category: 'Raw Materials', uomId: 'kg', quantityOnHand: 500, reorderLevel: 100 },
    { sku: 'HOPS-001', name: 'Cascade Hops', category: 'Raw Materials', uomId: 'kg', quantityOnHand: 50, reorderLevel: 20 },
    { sku: 'YEAST-001', name: 'Ale Yeast', category: 'Raw Materials', uomId: 'kg', quantityOnHand: 10, reorderLevel: 5 },
    { sku: 'BOTTLE-001', name: 'Glass Bottles 330ml', category: 'Packaging', uomId: 'pcs', quantityOnHand: 1000, reorderLevel: 500 },
    { sku: 'CAP-001', name: 'Bottle Caps', category: 'Packaging', uomId: 'pcs', quantityOnHand: 2000, reorderLevel: 1000 },
    { sku: 'LABEL-001', name: 'Product Labels', category: 'Packaging', uomId: 'pcs', quantityOnHand: 800, reorderLevel: 300 },
    { sku: 'BEER-LAGER', name: 'Premium Lager', category: 'Finished Goods', uomId: 'L', quantityOnHand: 200, reorderLevel: 50 },
    { sku: 'BEER-IPA', name: 'Craft IPA', category: 'Finished Goods', uomId: 'L', quantityOnHand: 150, reorderLevel: 40 },
    { sku: 'BEER-STOUT', name: 'Dark Stout', category: 'Finished Goods', uomId: 'L', quantityOnHand: 80, reorderLevel: 30 },
    { sku: 'WATER-001', name: 'Purified Water', category: 'Raw Materials', uomId: 'L', quantityOnHand: 5000, reorderLevel: 1000 },
  ];

  const sampleCustomers = [
    { name: 'ABC Distributors', email: 'contact@abcdist.com', phone: '+1234567890', address: '123 Main St, City' },
    { name: 'XYZ Retailers', email: 'sales@xyzretail.com', phone: '+1234567891', address: '456 Market Ave, Town' },
    { name: 'Premium Bars Ltd', email: 'orders@premiumbars.com', phone: '+1234567892', address: '789 Bar Street, Downtown' },
    { name: 'Local Restaurant Group', email: 'purchasing@localrestaurants.com', phone: '+1234567893', address: '321 Food Lane, Suburb' },
    { name: 'Wholesale Beverages Inc', email: 'info@wholesalebev.com', phone: '+1234567894', address: '654 Trade Blvd, Industrial Park' },
  ];

  const sampleVendors = [
    { name: 'Malt Suppliers Co', email: 'sales@maltsuppliers.com', phone: '+9876543210', address: '111 Supply Road, Farm District' },
    { name: 'Hop Growers Association', email: 'orders@hopgrowers.com', phone: '+9876543211', address: '222 Green Valley, Rural Area' },
    { name: 'Packaging Solutions Ltd', email: 'service@packagingsolutions.com', phone: '+9876543212', address: '333 Industrial Ave, Factory Zone' },
    { name: 'Yeast Cultures Inc', email: 'info@yeastcultures.com', phone: '+9876543213', address: '444 Lab Street, Science Park' },
    { name: 'Equipment & Supplies', email: 'support@equipmentsupply.com', phone: '+9876543214', address: '555 Warehouse Rd, Storage Area' },
  ];

  const generateDemoData = async () => {
    setGenerating(true);
    setProgress([]);
    setError(null);
    setSuccess(false);

    try {
      // Generate Inventory Items
      setProgress(prev => [...prev, 'Creating inventory items...']);
      for (const item of sampleInventoryItems) {
        try {
          await apiService.createInventoryItem(companyId, {
            ...item,
            companyId,
            isActive: true
          });
        } catch (err) {
          console.warn(`Failed to create item ${item.sku}:`, err);
        }
      }
      setProgress(prev => [...prev, `✓ Created ${sampleInventoryItems.length} inventory items`]);

      // Generate Customers
      setProgress(prev => [...prev, 'Creating customers...']);
      for (const customer of sampleCustomers) {
        try {
          await apiService.createCustomerFirestore(companyId, customer);
        } catch (err) {
          console.warn(`Failed to create customer ${customer.name}:`, err);
        }
      }
      setProgress(prev => [...prev, `✓ Created ${sampleCustomers.length} customers`]);

      // Generate Vendors
      setProgress(prev => [...prev, 'Creating vendors...']);
      for (const vendor of sampleVendors) {
        try {
          await apiService.createVendorFirestore(companyId, vendor);
        } catch (err) {
          console.warn(`Failed to create vendor ${vendor.name}:`, err);
        }
      }
      setProgress(prev => [...prev, `✓ Created ${sampleVendors.length} vendors`]);

      setProgress(prev => [...prev, '✓ Demo data generation complete!']);
      setSuccess(true);
      toast.success('Demo data generated successfully!');
      
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to generate demo data';
      setError(errorMsg);
      toast.error(errorMsg);
      setProgress(prev => [...prev, `✗ Error: ${errorMsg}`]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
            <Wand2 className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generate Demo Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Populate your system with sample data to explore features. This will create:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Package className="h-4 w-4 text-blue-600" />
              <span>{sampleInventoryItems.length} Inventory Items</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-green-600" />
              <span>{sampleCustomers.length} Customers</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
              <span>{sampleVendors.length} Vendors</span>
            </div>
          </div>

          {progress.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="space-y-1">
                {progress.map((msg, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    {msg.startsWith('✓') ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : msg.startsWith('✗') ? (
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 mt-0.5">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                    <span className={msg.startsWith('✗') ? 'text-red-600' : 'text-gray-700'}>
                      {msg.replace(/^[✓✗]\s*/, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Success!</p>
                <p className="text-sm text-green-700">Demo data has been generated successfully.</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={generateDemoData}
              disabled={generating || success}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Generated</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Generate Demo Data</span>
                </>
              )}
            </button>

            {success && onComplete && (
              <button
                onClick={onComplete}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Note: This is for testing purposes only. You can delete the generated data anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoDataGenerator;

