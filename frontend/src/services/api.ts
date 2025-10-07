import axios, { AxiosInstance } from 'axios';
import { Company, Country, Branch, Role, Warehouse, ChartOfAccount, TaxRule, UnitOfMeasure, InventoryItem, LicenseType } from '../types';
import { License } from '../types/license';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://us-central1-harachi.cloudfunctions.net/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Companies
  async getCompanies(harachiId?: string) {
    const ref = collection(db, 'companies');
    const q = harachiId ? query(ref, where('harachiId', '==', harachiId)) : ref;
    const snapshot = await getDocs(q as any);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Company[];
  }

  // Item Master
  async getItems(companyId: string, branchId?: string) {
    const params = branchId ? { branchId } : {};
    const response = await this.api.get('/item-master', { 
      params: { companyId, ...params },
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async getItem(itemId: string) {
    const response = await this.api.get(`/item-master/${itemId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async createItem(itemData: any) {
    const response = await this.api.post('/item-master', itemData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async updateItem(itemId: string, itemData: any) {
    const response = await this.api.put(`/item-master/${itemId}`, itemData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async deleteItem(itemId: string) {
    const response = await this.api.delete(`/item-master/${itemId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async getItemUoms(itemId: string) {
    const response = await this.api.get(`/item-master/${itemId}/uoms`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async convertItemUom(itemId: string, fromUomId: string, toUomId: string, quantity: number) {
    const response = await this.api.post(`/item-master/${itemId}/convert`, {
      fromUomId,
      toUomId,
      quantity
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  async getLowStockAlerts(companyId: string, branchId?: string) {
    const params = branchId ? { branchId } : {};
    const response = await this.api.get('/item-master/alerts/low-stock', {
      params: { companyId, ...params },
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.data;
  }

  // Licenses
  async createLicense(companyId: string, licenseData: Partial<License>) {
    const licenseRef = await addDoc(collection(db, 'companies', companyId, 'licenses'), {
      companyId,
      type: licenseData.type || 'basic',
      status: 'active',
      seats: licenseData.seats || 5,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...licenseData
    });
    return licenseRef.id;
  }

  async getCompanyLicense(companyId: string): Promise<License | null> {
    const licensesSnapshot = await getDocs(collection(db, 'companies', companyId, 'licenses'));
    if (licensesSnapshot.empty) return null;
    
    const license = licensesSnapshot.docs[0];
    return { id: license.id, ...license.data() } as License;
  }

  async generateLicense(companyId: string, licenseTypeId: string) {
    const licenseTypes = this.getLicenseTypes();
    const licenseType = licenseTypes.find(lt => lt.id === licenseTypeId);
    
    if (!licenseType) {
      throw new Error('Invalid license type');
    }

    const licenseCode = `LIC-${companyId}-${Date.now()}`;
    const issuedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + licenseType.duration);
    
    const gracePeriodEnds = new Date(expiresAt);
    gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 3);
    
    const ref = await addDoc(collection(db, `companies/${companyId}/licenses`), {
      licenseTypeId: licenseType.id,
      code: licenseCode,
      issuedAt,
      expiresAt,
      gracePeriodEnds,
      status: 'active',
      years: Math.floor(licenseType.duration / 365),
      months: Math.floor((licenseType.duration % 365) / 30),
      days: licenseType.duration % 30,
      totalDuration: licenseType.duration,
      isTrial: licenseType.isTrial,
      notificationsSent: {
        expiry30: false,
        expiry14: false,
        expiry7: false,
        expiry3: false,
        expired: false,
        gracePeriod: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
    
    return { 
      id: ref.id, 
      code: licenseCode, 
      issuedAt, 
      expiresAt, 
      gracePeriodEnds,
      licenseType: licenseType,
      years: Math.floor(licenseType.duration / 365),
      months: Math.floor((licenseType.duration % 365) / 30),
      days: licenseType.duration % 30,
      totalDuration: licenseType.duration,
      isTrial: licenseType.isTrial
    };
  }

  async getActiveLicense(companyId: string) {
    const snapshot = await getDocs(collection(db, `companies/${companyId}/licenses`));
    const licenses = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as any[];
    const now = Date.now();
    return licenses.find(l => l.status === 'active' && new Date(l.expiresAt).getTime() > now) || null;
  }

  async validateLicense(companyId: string): Promise<{
    isValid: boolean;
    status: 'active' | 'expired' | 'grace' | 'blocked' | 'none';
    license?: any;
    message?: string;
    daysUntilExpiry?: number;
    daysInGracePeriod?: number;
  }> {
    try {
      const license = await this.getActiveLicense(companyId);
      
      if (!license) {
        return {
          isValid: false,
          status: 'none',
          message: 'No active license found'
        };
      }

      const now = new Date();
      const expiresAt = new Date(license.expiresAt);
      const gracePeriodEnds = new Date(license.gracePeriodEnds || expiresAt);
    
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysInGracePeriod = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // License is still active
    if (now < expiresAt) {
      return {
        isValid: true,
        status: 'active',
        license,
        daysUntilExpiry
      };
    }

    // License expired but in grace period
    if (now < gracePeriodEnds) {
      return {
        isValid: false,
        status: 'grace',
        license,
        message: `License expired. Grace period ends in ${daysInGracePeriod} days.`,
        daysInGracePeriod
      };
    }

      // License blocked (expired and grace period ended)
      return {
        isValid: false,
        status: 'blocked',
        license,
        message: 'Access denied. License expired. Please renew your license.'
      };
    } catch (error) {
      console.warn('Error validating license:', error);
      return {
        isValid: false,
        status: 'none',
        message: 'Error validating license'
      };
    }
  }

  async checkLicenseNotifications(companyId: string) {
    const license = await this.getActiveLicense(companyId);
    if (!license) return [];

    const now = new Date();
    const expiresAt = new Date(license.expiresAt);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const notifications = [];
    
    // Check if notifications should be sent
    if (daysUntilExpiry <= 30 && !license.notificationsSent?.expiry30) {
      notifications.push({
        type: 'expiry30',
        message: `Your license expires in ${daysUntilExpiry} days. Consider renewing soon.`,
        severity: 'warning'
      });
    }
    
    if (daysUntilExpiry <= 14 && !license.notificationsSent?.expiry14) {
      notifications.push({
        type: 'expiry14',
        message: `Your license expires in ${daysUntilExpiry} days. Please renew to avoid service interruption.`,
        severity: 'warning'
      });
    }
    
    if (daysUntilExpiry <= 7 && !license.notificationsSent?.expiry7) {
      notifications.push({
        type: 'expiry7',
        message: `Your license expires in ${daysUntilExpiry} days. Renewal required soon.`,
        severity: 'error'
      });
    }
    
    if (daysUntilExpiry <= 3 && !license.notificationsSent?.expiry3) {
      notifications.push({
        type: 'expiry3',
        message: `Your license expires in ${daysUntilExpiry} days. Immediate renewal recommended.`,
        severity: 'error'
      });
    }

    if (daysUntilExpiry <= 0 && !license.notificationsSent?.expired) {
      notifications.push({
        type: 'expired',
        message: `Your license has expired. You have 3 days grace period before access is blocked.`,
        severity: 'error'
      });
    }

    return notifications;
  }

  async revokeLicense(companyId: string, licenseId: string) {
    await updateDoc(doc(db, `companies/${companyId}/licenses`, licenseId), {
      status: 'revoked',
      revokedAt: new Date()
    } as any);
    return { success: true };
  }

  async renewLicense(companyId: string, licenseId: string, years: number = 1) {
    const licenseDoc = await getDoc(doc(db, `companies/${companyId}/licenses`, licenseId));
    if (!licenseDoc.exists()) {
      throw new Error('License not found');
    }
    
    const licenseData = licenseDoc.data();
    const newExpiresAt = new Date(licenseData.expiresAt);
    newExpiresAt.setFullYear(newExpiresAt.getFullYear() + years);
    
    await updateDoc(doc(db, `companies/${companyId}/licenses`, licenseId), {
      expiresAt: newExpiresAt,
      years: licenseData.years + years,
      renewedAt: new Date(),
      status: 'active'
    } as any);
    
    return { success: true, newExpiresAt };
  }
  async createCompany(companyData: Partial<Company> & { 
    name: string; 
    code: string; 
    adminUsername: string; 
    adminPassword: string; 
    harachiId?: string 
  }) {
    // Create the company
    const companyRef = collection(db, 'companies');
    const companyDoc = await addDoc(companyRef, {
      name: companyData.name,
      code: companyData.code,
      harachiId: companyData.harachiId || 'default',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create admin user for the company
    const userRef = collection(db, 'users');
    await addDoc(userRef, {
      username: companyData.adminUsername,
      password: companyData.adminPassword, // In production, this should be hashed
      companyId: companyDoc.id,
      roles: ['Company Admin'],
      isActive: true,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await getDoc(doc(db, 'companies', companyDoc.id));
    return { id: companyDoc.id, ...(created.data() as any) } as Company;
  }

  async getCompanyById(id: string) {
    const snap = await getDoc(doc(db, 'companies', id));
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Company) : null;
  }

  async getCompanyByCode(code: string) {
    const companies = await this.getCompanies();
    return companies.find(company => company.code === code) || null;
  }

  async updateCompany(id: string, companyData: Partial<Company>) {
    await updateDoc(doc(db, 'companies', id), { ...companyData, updatedAt: new Date() } as any);
    const snap = await getDoc(doc(db, 'companies', id));
    return { id: snap.id, ...(snap.data() as any) } as Company;
  }

  async updateCompanyWithAdmin(id: string, companyData: Partial<Company> & { 
    adminUsername?: string; 
    adminPassword?: string; 
  }) {
    // Update company information
    const { adminUsername, adminPassword, ...companyUpdateData } = companyData;
    await updateDoc(doc(db, 'companies', id), { 
      ...companyUpdateData, 
      updatedAt: new Date() 
    } as any);

    // Update admin user if credentials are provided
    if (adminUsername || adminPassword) {
      const adminUser = await this.getCompanyAdmin(id);
      if (adminUser) {
        const updateData: any = { updatedAt: new Date() };
        if (adminUsername) updateData.username = adminUsername;
        if (adminPassword) updateData.password = adminPassword; // In production, this should be hashed
        
        await updateDoc(doc(db, 'users', adminUser.id), updateData);
      }
    }

    const snap = await getDoc(doc(db, 'companies', id));
    return { id: snap.id, ...(snap.data() as any) } as Company;
  }

  async deleteCompany(id: string) {
    await deleteDoc(doc(db, 'companies', id));
    return { success: true } as any;
  }

  // Generate portal link for company
  generatePortalLink(companyCode: string): string {
    return `${window.location.origin}/company/${companyCode}`;
  }

  // Predefined license types
  getLicenseTypes(): LicenseType[] {
    return [
      {
        id: 'trial-3d',
        name: '3-Day Trial',
        duration: 3,
        description: '3-day trial license for evaluation',
        isActive: true,
        isTrial: true,
        price: 0
      },
      {
        id: 'trial-7d',
        name: '7-Day Trial',
        duration: 7,
        description: '7-day trial license for evaluation',
        isActive: true,
        isTrial: true,
        price: 0
      },
      {
        id: 'trial-14d',
        name: '14-Day Trial',
        duration: 14,
        description: '14-day trial license for evaluation',
        isActive: true,
        isTrial: true,
        price: 0
      },
      {
        id: 'trial-1m',
        name: '1-Month Trial',
        duration: 30,
        description: '1-month trial license for evaluation',
        isActive: true,
        isTrial: true,
        price: 0
      },
      {
        id: 'standard-3m',
        name: '3-Month License',
        duration: 90,
        description: '3-month standard license',
        isActive: true,
        isTrial: false,
        price: 299
      },
      {
        id: 'standard-1y',
        name: '1-Year License',
        duration: 365,
        description: '1-year standard license',
        isActive: true,
        isTrial: false,
        price: 999
      }
    ];
  }

  // Get company admin user
  async getCompanyAdmin(companyId: string) {
    const q = query(
      collection(db, 'users'),
      where('companyId', '==', companyId),
      where('isAdmin', '==', true)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const adminDoc = snapshot.docs[0];
      return { id: adminDoc.id, ...adminDoc.data() };
    }
    return null;
  }

  // Countries
  async getCountries(companyId: string): Promise<Country[]> {
    const q = query(collection(db, 'companies', companyId, 'countries'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
  }

  async createCountry(companyId: string, countryData: Omit<Country, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'countries'), {
      ...countryData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Branches
  async getBranches(companyId: string): Promise<Branch[]> {
    const q = query(collection(db, 'companies', companyId, 'branches'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
  }

  async createBranch(companyId: string, branchData: Omit<Branch, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'branches'), {
      ...branchData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async deleteBranch(companyId: string, branchId: string): Promise<void> {
    await deleteDoc(doc(db, 'companies', companyId, 'branches', branchId));
  }

  async updateBranch(companyId: string, branchId: string, updates: Partial<Branch>): Promise<void> {
    await updateDoc(doc(db, 'companies', companyId, 'branches', branchId), {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Users
  async getUsers(companyId: string) {
    // Load users directly from Firestore instead of Cloud Functions endpoint
    // to avoid 404s and network issues when the endpoint is not available.
    const q = query(collection(db, 'users'), where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  }

  async createUser(companyId: string, userData: any) {
    const response = await this.api.post(`/companies/${companyId}/users`, userData);
    return response.data;
  }

  // Simple Firestore-backed user management for setup wizard
  async createCompanyUser(companyId: string, data: { name: string; email: string; username: string; role: string; password?: string; }): Promise<string> {
    const [firstName, ...rest] = (data.name || '').trim().split(/\s+/);
    const lastName = rest.join(' ');
    const docRef = await addDoc(collection(db, 'users'), {
      email: data.email,
      username: data.username,
      firstName: firstName || '',
      lastName: lastName || '',
      companyId,
      roles: [data.role],
      isActive: true,
      isAdmin: data.role === 'Company Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    return docRef.id;
  }

  async deleteCompanyUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId));
  }

  // Roles
  async getRoles(companyId: string) {
    const response = await this.api.get(`/companies/${companyId}/roles`);
    return response.data;
  }

  async createRole(companyId: string, roleData: Partial<Role>) {
    const response = await this.api.post(`/companies/${companyId}/roles`, roleData);
    return response.data;
  }

  // Warehouses
  async getWarehouses(companyId: string): Promise<Warehouse[]> {
    const q = query(collection(db, 'companies', companyId, 'warehouses'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
  }

  async createWarehouse(companyId: string, warehouseData: Omit<Warehouse, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'warehouses'), {
      ...warehouseData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Chart of Accounts
  async getChartOfAccounts(companyId: string): Promise<ChartOfAccount[]> {
    const q = query(collection(db, 'companies', companyId, 'chartOfAccounts'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChartOfAccount));
  }

  async createChartOfAccount(companyId: string, accountData: Omit<ChartOfAccount, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'chartOfAccounts'), {
      ...accountData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Tax Rules
  async getTaxRules(companyId: string): Promise<TaxRule[]> {
    const q = query(collection(db, 'companies', companyId, 'taxRules'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxRule));
  }

  async createTaxRule(companyId: string, taxRuleData: Omit<TaxRule, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'taxRules'), {
      ...taxRuleData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Units of Measure
  async getUoms(companyId: string): Promise<UnitOfMeasure[]> {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'uoms'));
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as UnitOfMeasure));
  }

  async createUom(companyId: string, data: Omit<UnitOfMeasure, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'uoms'), {
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async updateUom(companyId: string, id: string, data: Partial<UnitOfMeasure>): Promise<void> {
    await updateDoc(doc(db, 'companies', companyId, 'uoms', id), {
      ...data,
      updatedAt: new Date(),
    } as any);
  }

  async deleteUom(companyId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, 'companies', companyId, 'uoms', id));
  }

  // Inventory Items
  async getInventory(companyId: string): Promise<InventoryItem[]> {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'inventory'));
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) } as InventoryItem));
  }

  async createInventoryItem(companyId: string, data: Omit<InventoryItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'inventory'), {
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async updateInventoryItem(companyId: string, id: string, data: Partial<InventoryItem>) {
    await updateDoc(doc(db, 'companies', companyId, 'inventory', id), {
      ...data,
      updatedAt: new Date(),
    } as any);
  }

  async deleteInventoryItem(companyId: string, id: string) {
    await deleteDoc(doc(db, 'companies', companyId, 'inventory', id));
  }

  // Customers
  async getCustomers(companyId: string): Promise<any[]> {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'customers'));
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async createCustomer(companyId: string, data: any): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'customers'), {
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  // Vendors
  async getVendors(companyId: string): Promise<any[]> {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'vendors'));
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async createVendor(companyId: string, data: any): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies', companyId, 'vendors'), {
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async deleteCountry(companyId: string, countryId: string): Promise<void> {
    await deleteDoc(doc(db, 'companies', companyId, 'countries', countryId));
  }

  async updateCountry(companyId: string, countryId: string, updates: Partial<Country>): Promise<void> {
    await updateDoc(doc(db, 'companies', companyId, 'countries', countryId), {
      ...updates,
      updatedAt: new Date()
    });
  }
}

export const apiService = new ApiService();
