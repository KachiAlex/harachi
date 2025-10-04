import { create } from 'zustand';
import { UserContext, Company, Country, Branch, Warehouse, Item, ItemClass } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { getAuth } from 'firebase/auth';

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
  switchTenant: (tenantId: string) => Promise<void>;
  switchCountry: (countryId: string) => Promise<void>;
  switchBranch: (branchId: string) => Promise<void>;
  
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
  switchTenant: async (tenantId: string) => {
    const { setLoading, setError, setUserContext } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      const mockContext: UserContext = {
        tenantId: tenantId,
        tenantName: tenantId === '1' ? 'Bogo Food & Beverage' : 'Other Company',
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
      
    } catch (error) {
      setError('Failed to switch tenant');
      console.error('Error switching tenant:', error);
    } finally {
      setLoading(false);
    }
  },
  
  switchCountry: async (countryId: string) => {
    const { setLoading, setError, userContext, setUserContext, availableCountries } = get();
    
    if (!userContext) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const country = availableCountries.find(c => c.id === countryId);
      if (!country) {
        throw new Error('Country not found');
      }
      
      const updatedContext: UserContext = {
        ...userContext,
        countryId: country.id,
        countryName: country.name,
        countryCode: (country as any).countryCode,
        currencyCode: (country as any).currencyCode,
        branchId: undefined, // Reset branch when switching country
        branchName: undefined,
        defaultWarehouseId: undefined,
      };
      
      setUserContext(updatedContext);
      
    } catch (error) {
      setError('Failed to switch country');
      console.error('Error switching country:', error);
    } finally {
      setLoading(false);
    }
  },
  
  switchBranch: async (branchId: string) => {
    const { setLoading, setError, userContext, setUserContext, availableBranches } = get();
    
    if (!userContext) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const branch = availableBranches.find(b => b.id === branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }
      
      const updatedContext: UserContext = {
        ...userContext,
        branchId: branch.id,
        branchName: branch.name,
        defaultWarehouseId: undefined, // Reset warehouse when switching branch
      };
      
      setUserContext(updatedContext);
      
    } catch (error) {
      setError('Failed to switch branch');
      console.error('Error switching branch:', error);
    } finally {
      setLoading(false);
    }
  },
  
  // Initialize application (no mock data, wait for auth; real loads to be implemented)
  initializeApp: async () => {
    const { setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      const auth = getAuth();
      if (!auth.currentUser) {
        setError('User not authenticated yet');
        return;
      }
      // TODO: implement company-scoped loads here once endpoints/collections are finalized
    } catch (error) {
      setError('Failed to initialize application');
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  },
}));
