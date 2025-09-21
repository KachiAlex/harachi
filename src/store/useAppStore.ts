import { create } from 'zustand';
import { UserContext, Company, Country, Branch, Warehouse, Item, ItemClass } from '../types';

interface AppState {
  // Context Management
  userContext: UserContext | null;
  availableCompanies: Company[];
  availableCountries: Country[];
  availableBranches: Branch[];
  availableWarehouses: Warehouse[];
  
  // Data
  companies: Company[];
  countries: Country[];
  branches: Branch[];
  warehouses: Warehouse[];
  itemClasses: ItemClass[];
  items: Item[];
  
  // Current Context
  currentCompany: Company | null;
  currentCountry: Country | null;
  currentBranch: Branch | null;
  
  // UI State
  sidebarCollapsed: boolean;
  rightRailOpen: boolean;
  currentPage: string;
  loading: boolean;
  error: string | null;
  
  // Business Date
  businessDate: string;
  
  // Actions
  setUserContext: (context: UserContext) => void;
  setAvailableCompanies: (companies: Company[]) => void;
  setAvailableCountries: (countries: Country[]) => void;
  setAvailableBranches: (branches: Branch[]) => void;
  setAvailableWarehouses: (warehouses: Warehouse[]) => void;
  setCompanies: (companies: Company[]) => void;
  setCountries: (countries: Country[]) => void;
  setBranches: (branches: Branch[]) => void;
  setWarehouses: (warehouses: Warehouse[]) => void;
  setItemClasses: (itemClasses: ItemClass[]) => void;
  setItems: (items: Item[]) => void;
  setCurrentCompany: (company: Company | null) => void;
  setCurrentCountry: (country: Country | null) => void;
  setCurrentBranch: (branch: Branch | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setRightRailOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBusinessDate: (date: string) => void;
  
  // Context switching
  switchTenant: (tenantId: number) => Promise<void>;
  switchCountry: (countryId: number) => Promise<void>;
  switchBranch: (branchId: number) => Promise<void>;
  
  // Initialization
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  userContext: null,
  availableCompanies: [],
  availableCountries: [],
  availableBranches: [],
  availableWarehouses: [],
  companies: [],
  countries: [],
  branches: [],
  warehouses: [],
  itemClasses: [],
  items: [],
  currentCompany: null,
  currentCountry: null,
  currentBranch: null,
  sidebarCollapsed: false,
  rightRailOpen: false,
  currentPage: 'dashboard',
  loading: false,
  error: null,
  businessDate: new Date().toISOString().split('T')[0],
  
  // Basic setters
  setUserContext: (context) => set({ userContext: context }),
  setAvailableCompanies: (companies) => set({ availableCompanies: companies }),
  setAvailableCountries: (countries) => set({ availableCountries: countries }),
  setAvailableBranches: (branches) => set({ availableBranches: branches }),
  setAvailableWarehouses: (warehouses) => set({ availableWarehouses: warehouses }),
  setCompanies: (companies) => set({ companies }),
  setCountries: (countries) => set({ countries }),
  setBranches: (branches) => set({ branches }),
  setWarehouses: (warehouses) => set({ warehouses }),
  setItemClasses: (itemClasses) => set({ itemClasses }),
  setItems: (items) => set({ items }),
  setCurrentCompany: (company) => set({ currentCompany: company }),
  setCurrentCountry: (country) => set({ currentCountry: country }),
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setRightRailOpen: (open) => set({ rightRailOpen: open }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setBusinessDate: (date) => set({ businessDate: date }),
  
  // Context switching actions
  switchTenant: async (tenantId: number) => {
    const { setLoading, setError, setUserContext } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: API call to switch tenant context
      // const response = await api.put('/context', { tenant_id: tenantId });
      
      // Mock response for now
      const mockContext: UserContext = {
        tenantId: tenantId,
        tenantName: tenantId === 1 ? 'Global Brewing Co.' : 'Craft Collective Ltd.',
        countryId: undefined,
        countryName: undefined,
        countryCode: undefined,
        currencyCode: undefined,
        branchId: undefined,
        branchName: undefined,
        defaultWarehouseId: undefined,
        permissions: ['inventory:read', 'production:read', 'quality:read'],
        businessDate: get().businessDate,
      };
      
      setUserContext(mockContext);
      
      // Load available countries for new tenant
      // await loadCountriesForTenant(tenantId);
      
    } catch (error) {
      setError('Failed to switch tenant');
      console.error('Error switching tenant:', error);
    } finally {
      setLoading(false);
    }
  },
  
  switchCountry: async (countryId: number) => {
    const { setLoading, setError, userContext, setUserContext, availableCountries } = get();
    
    if (!userContext) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const country = availableCountries.find(c => c.id === countryId);
      if (!country) {
        throw new Error('Country not found');
      }
      
      // TODO: API call to switch country context
      // const response = await api.put('/context', { 
      //   tenant_id: userContext.tenantId,
      //   country_id: countryId 
      // });
      
      const updatedContext: UserContext = {
        ...userContext,
        countryId: country.id,
        countryName: country.name,
        countryCode: country.countryCode,
        currencyCode: country.currencyCode,
        branchId: undefined, // Reset branch when switching country
        branchName: undefined,
        defaultWarehouseId: undefined,
      };
      
      setUserContext(updatedContext);
      
      // Load branches for new country
      // await loadBranchesForCountry(countryId);
      
    } catch (error) {
      setError('Failed to switch country');
      console.error('Error switching country:', error);
    } finally {
      setLoading(false);
    }
  },
  
  switchBranch: async (branchId: number) => {
    const { setLoading, setError, userContext, setUserContext, availableBranches } = get();
    
    if (!userContext) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const branch = availableBranches.find(b => b.id === branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }
      
      // TODO: API call to switch branch context
      const updatedContext: UserContext = {
        ...userContext,
        branchId: branch.id,
        branchName: branch.name,
        defaultWarehouseId: undefined, // Reset warehouse when switching branch
      };
      
      setUserContext(updatedContext);
      
      // Load warehouses for new branch
      // await loadWarehousesForBranch(branchId);
      
    } catch (error) {
      setError('Failed to switch branch');
      console.error('Error switching branch:', error);
    } finally {
      setLoading(false);
    }
  },
  
  // Initialize application
  initializeApp: async () => {
    const { setLoading, setError, setUserContext, setAvailableCompanies, setAvailableCountries, setCompanies, setCountries, setBranches, setWarehouses, setItemClasses, setItems, setCurrentCompany, setCurrentCountry, setCurrentBranch } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Load user context and available tenants from API
      // const [contextResponse, companiesResponse] = await Promise.all([
      //   api.get('/context'),
      //   api.get('/tenants')
      // ]);
      
      // Mock data for now
      const mockContext: UserContext = {
        tenantId: 1,
        tenantName: 'Bogo Food & Beverage',
        countryId: 1,
        countryName: 'Nigeria',
        countryCode: 'NG',
        currencyCode: 'NGN',
        branchId: 1,
        branchName: 'Lagos Brewery',
        defaultWarehouseId: 1,
        permissions: [
          'inventory:read', 'inventory:write',
          'production:read', 'production:write',
          'quality:read', 'quality:write',
          'procurement:read', 'procurement:write'
        ],
        businessDate: get().businessDate,
      };
      
      const mockCompanies: Company[] = [
        {
          id: 1,
          name: 'Bogo Food & Beverage',
          slug: 'bogo-food-beverage',
          subscriptionTier: 'ENTERPRISE',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        }
      ];
      
      const mockCountries: Country[] = [
        {
          id: 1,
          companyId: 1,
          name: 'Nigeria',
          countryCode: 'NG',
          currencyCode: 'NGN',
          taxSystem: 'VAT',
          timezone: 'Africa/Lagos',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          companyId: 1,
          name: 'Kenya',
          countryCode: 'KE',
          currencyCode: 'KES',
          taxSystem: 'VAT',
          timezone: 'Africa/Nairobi',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 3,
          companyId: 1,
          name: 'Ghana',
          countryCode: 'GH',
          currencyCode: 'GHS',
          taxSystem: 'VAT',
          timezone: 'Africa/Accra',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        }
      ];

      const mockBranches: Branch[] = [
        {
          id: 1,
          countryId: 1,
          name: 'Lagos Brewery',
          branchCode: 'LAG001',
          branchType: 'BREWERY',
          address: {
            streetAddress: '123 Industrial Road',
            city: 'Lagos',
            stateProvince: 'Lagos State',
            postalCode: '100001',
            countryCode: 'NG'
          },
          contactInfo: {
            phone: '+234-1-234-5678',
            email: 'lagos@bogofood.com'
          },
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          countryId: 2,
          name: 'Nairobi Plant',
          branchCode: 'NAI001',
          branchType: 'BREWERY',
          address: {
            streetAddress: '456 Manufacturing Street',
            city: 'Nairobi',
            stateProvince: 'Nairobi',
            postalCode: '00100',
            countryCode: 'KE'
          },
          contactInfo: {
            phone: '+254-20-123-4567',
            email: 'nairobi@bogofood.com'
          },
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        }
      ];

      const mockWarehouses: Warehouse[] = [
        {
          id: 1,
          branchId: 1,
          code: 'LAG-RM-01',
          name: 'Raw Materials Warehouse',
          warehouseType: 'RAW_MATERIALS',
          temperatureControlled: true,
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          branchId: 1,
          code: 'LAG-WIP-01',
          name: 'Work in Process',
          warehouseType: 'WORK_IN_PROCESS',
          temperatureControlled: true,
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 3,
          branchId: 1,
          code: 'LAG-FG-01',
          name: 'Finished Goods Warehouse',
          warehouseType: 'FINISHED_GOODS',
          temperatureControlled: false,
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
        }
      ];

      const mockItemClasses: ItemClass[] = [
        {
          id: '1',
          companyId: '1',
          code: 'RM',
          name: 'Raw Materials',
          description: 'Raw materials for brewing',
          postingClass: 'RM',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
          children: [
            {
              id: '2',
              companyId: '1',
              parentId: '1',
              code: 'RM-GRAIN',
              name: 'Grains',
              description: 'Malt and other grains',
              postingClass: 'RM-GRAIN',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system',
              updatedBy: 'system',
            },
            {
              id: '3',
              companyId: '1',
              parentId: '1',
              code: 'RM-HOPS',
              name: 'Hops',
              description: 'Hops for flavoring',
              postingClass: 'RM-HOPS',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system',
              updatedBy: 'system',
            }
          ]
        },
        {
          id: '4',
          companyId: '1',
          code: 'PKG',
          name: 'Packaging',
          description: 'Packaging materials',
          postingClass: 'PKG',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
          children: [
            {
              id: '5',
              companyId: '1',
              parentId: '4',
              code: 'PKG-BOTTLE',
              name: 'Bottles',
              description: 'Glass bottles',
              postingClass: 'PKG-BOTTLE',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system',
              updatedBy: 'system',
            }
          ]
        },
        {
          id: '6',
          companyId: '1',
          code: 'FG',
          name: 'Finished Goods',
          description: 'Finished beer products',
          postingClass: 'FG',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        }
      ];

      const mockItems: Item[] = [
        {
          id: '1',
          itemCode: 'MALT-PILSNER',
          description: 'Pilsner Malt - German',
          itemClassId: '2',
          postingClassId: 'RM-GRAIN',
          baseUOM: 'KG',
          weightUOM: 'KG',
          volumeUOM: 'L',
          isActive: true,
          isSerialized: false,
          isLotTracked: true,
          isPurchasable: true,
          isSellable: false,
          isManufactured: false,
          defaultWarehouse: '1',
          reorderPoint: 1000,
          reorderQty: 5000,
          standardCost: 2.50,
          lastCost: 2.45,
          averageCost: 2.48,
          companyId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        },
        {
          id: '2',
          itemCode: 'HOPS-HALLERTAU',
          description: 'Hallertau Hops - Noble',
          itemClassId: '3',
          postingClassId: 'RM-HOPS',
          baseUOM: 'KG',
          weightUOM: 'KG',
          volumeUOM: 'L',
          isActive: true,
          isSerialized: false,
          isLotTracked: true,
          isPurchasable: true,
          isSellable: false,
          isManufactured: false,
          defaultWarehouse: '1',
          reorderPoint: 50,
          reorderQty: 200,
          standardCost: 25.00,
          lastCost: 24.50,
          averageCost: 24.75,
          companyId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        },
        {
          id: '3',
          itemCode: 'BOTTLE-500ML',
          description: 'Glass Bottle 500ml Brown',
          itemClassId: '5',
          postingClassId: 'PKG-BOTTLE',
          baseUOM: 'EA',
          weightUOM: 'KG',
          volumeUOM: 'L',
          isActive: true,
          isSerialized: false,
          isLotTracked: false,
          isPurchasable: true,
          isSellable: false,
          isManufactured: false,
          defaultWarehouse: '1',
          reorderPoint: 10000,
          reorderQty: 50000,
          standardCost: 0.15,
          lastCost: 0.14,
          averageCost: 0.145,
          companyId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        },
        {
          id: '4',
          itemCode: 'BEER-PILSNER-500ML',
          description: 'Pilsner Beer 500ml Bottle',
          itemClassId: '6',
          postingClassId: 'FG',
          baseUOM: 'EA',
          weightUOM: 'KG',
          volumeUOM: 'L',
          isActive: true,
          isSerialized: false,
          isLotTracked: true,
          isPurchasable: false,
          isSellable: true,
          isManufactured: true,
          defaultWarehouse: '3',
          reorderPoint: 0,
          reorderQty: 0,
          standardCost: 1.50,
          lastCost: 1.48,
          averageCost: 1.49,
          companyId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        }
      ];
      
      setUserContext(mockContext);
      setAvailableCompanies(mockCompanies);
      setAvailableCountries(mockCountries);
      setCompanies(mockCompanies);
      setCountries(mockCountries);
      setBranches(mockBranches);
      setWarehouses(mockWarehouses);
      setItemClasses(mockItemClasses);
      setItems(mockItems);
      setCurrentCompany(mockCompanies[0]);
      setCurrentCountry(mockCountries[0]);
      setCurrentBranch(mockBranches[0]);
      
    } catch (error) {
      setError('Failed to initialize application');
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  },
}));
