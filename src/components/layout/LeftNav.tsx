import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  BarChart3, 
  Factory, 
  Beaker, 
  ShoppingCart, 
  PackageCheck, 
  TestTube, 
  Search, 
  Truck, 
  Globe, 
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  children?: NavItem[];
}

const LeftNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, userContext } = useAppStore();

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: '/',
        },
      ],
    },
    {
      title: 'Inventory',
      items: [
        {
          id: 'item-classes',
          label: 'Item Classes',
          icon: <FolderTree className="w-4 h-4" />,
          path: '/inventory/item-classes',
        },
        {
          id: 'items',
          label: 'Items',
          icon: <Package className="w-4 h-4" />,
          path: '/inventory/items',
        },
        {
          id: 'stock-balances',
          label: 'Stock Balances',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/inventory/stock-balances',
          badge: '5',
        },
      ],
    },
    {
      title: 'Production',
      items: [
        {
          id: 'recipes',
          label: 'Recipes',
          icon: <Beaker className="w-4 h-4" />,
          path: '/production/recipes',
        },
        {
          id: 'production-orders',
          label: 'Production Orders',
          icon: <Factory className="w-4 h-4" />,
          path: '/production/orders',
          badge: '3',
        },
        {
          id: 'batches',
          label: 'Batches',
          icon: <Package className="w-4 h-4" />,
          path: '/production/batches',
        },
      ],
    },
    {
      title: 'Procurement',
      items: [
        {
          id: 'purchase-orders',
          label: 'Purchase Orders',
          icon: <ShoppingCart className="w-4 h-4" />,
          path: '/procurement/purchase-orders',
        },
        {
          id: 'goods-receipts',
          label: 'Goods Receipts',
          icon: <PackageCheck className="w-4 h-4" />,
          path: '/procurement/goods-receipts',
        },
      ],
    },
    {
      title: 'Quality',
      items: [
        {
          id: 'qc-tests',
          label: 'QC Tests',
          icon: <TestTube className="w-4 h-4" />,
          path: '/quality/qc-tests',
          badge: '7',
        },
        {
          id: 'traceability',
          label: 'Traceability',
          icon: <Search className="w-4 h-4" />,
          path: '/quality/traceability',
        },
      ],
    },
  ];

  // Add multi-country section only for enterprise tenants
  if (userContext?.tenantId && userContext?.permissions?.includes('global:read')) {
    navSections.push({
      title: 'Multi-Country',
      items: [
        {
          id: 'inter-country-transfers',
          label: 'Inter-Country Transfers',
          icon: <Truck className="w-4 h-4" />,
          path: '/multi-country/transfers',
        },
        {
          id: 'global-reports',
          label: 'Global Reports',
          icon: <Globe className="w-4 h-4" />,
          path: '/multi-country/reports',
        },
      ],
    });
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Collapse Toggle */}
      <div className="flex justify-end p-2 border-b border-gray-100">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        
        {/* Favorites Section (only when expanded) */}
        {!sidebarCollapsed && (
          <div className="px-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Star className="w-3 h-3" />
              Favorites
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => handleNavClick('/inventory/items')}
                className={`nav-item w-full ${isActive('/inventory/items') ? 'active' : ''}`}
              >
                <Package className="w-4 h-4" />
                <span>Items</span>
              </button>
              <button
                onClick={() => handleNavClick('/production/orders')}
                className={`nav-item w-full ${isActive('/production/orders') ? 'active' : ''}`}
              >
                <Factory className="w-4 h-4" />
                <span>Production Orders</span>
                <span className="ml-auto bg-primary-100 text-primary-800 text-xs px-1.5 py-0.5 rounded">3</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation Sections */}
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="px-3">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path)}
                    className={`nav-item w-full ${isActive(item.path) ? 'active' : ''} ${
                      sidebarCollapsed ? 'justify-center px-3 py-3' : ''
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Context Info at Bottom (only when expanded) */}
        {!sidebarCollapsed && userContext && (
          <div className="px-3 mt-8 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="font-medium">{userContext.tenantName}</div>
              {userContext.countryName && (
                <div>{userContext.countryName}</div>
              )}
              {userContext.branchName && (
                <div>{userContext.branchName}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftNav;
