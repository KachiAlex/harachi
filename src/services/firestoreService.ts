import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Tenant, 
  TenantCountry, 
  TenantBranch, 
  Company, 
  Country, 
  Branch, 
  Warehouse,
  ItemClass,
  Item
} from '../types';

// Generic CRUD operations
export class FirestoreService {
  // Tenants
  static async getTenants(): Promise<Tenant[]> {
    const snapshot = await getDocs(collection(db, 'tenants'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
  }

  static async getTenant(id: string): Promise<Tenant | null> {
    const docRef = doc(db, 'tenants', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Tenant : null;
  }

  static async createTenant(tenant: Omit<Tenant, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'tenants'), tenant);
    return docRef.id;
  }

  static async updateTenant(id: string, updates: Partial<Tenant>): Promise<void> {
    const docRef = doc(db, 'tenants', id);
    await updateDoc(docRef, updates);
  }

  // Companies
  static async getCompanies(): Promise<Company[]> {
    const snapshot = await getDocs(collection(db, 'companies'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
  }

  static async getCompany(id: string): Promise<Company | null> {
    const docRef = doc(db, 'companies', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Company : null;
  }

  // Countries
  static async getCountriesByCompany(companyId: string): Promise<Country[]> {
    const q = query(
      collection(db, 'countries'),
      where('companyId', '==', companyId),
      where('active', '==', true),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
  }

  static async getCountries(): Promise<Country[]> {
    const snapshot = await getDocs(collection(db, 'countries'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
  }

  static async createCountry(country: Omit<Country, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'countries'), country as any);
    return docRef.id;
  }

  static async updateCountry(id: string, updates: Partial<Country>): Promise<void> {
    const docRef = doc(db, 'countries', id);
    await updateDoc(docRef, updates as any);
  }

  static async deleteCountry(id: string): Promise<void> {
    const docRef = doc(db, 'countries', id);
    await deleteDoc(docRef);
  }

  // Branches
  static async getBranchesByCountry(countryId: string): Promise<Branch[]> {
    const q = query(
      collection(db, 'branches'),
      where('countryId', '==', countryId),
      where('active', '==', true),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
  }

  static async getBranches(): Promise<Branch[]> {
    const snapshot = await getDocs(collection(db, 'branches'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
  }

  static async createBranch(branch: Omit<Branch, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'branches'), branch as any);
    return docRef.id;
  }

  static async updateBranch(id: string, updates: Partial<Branch>): Promise<void> {
    const docRef = doc(db, 'branches', id);
    await updateDoc(docRef, updates as any);
  }

  static async deleteBranch(id: string): Promise<void> {
    const docRef = doc(db, 'branches', id);
    await deleteDoc(docRef);
  }

  // Warehouses
  static async getWarehousesByBranch(branchId: string): Promise<Warehouse[]> {
    const q = query(
      collection(db, 'warehouses'),
      where('branchId', '==', branchId),
      where('active', '==', true),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
  }

  static async getWarehouses(): Promise<Warehouse[]> {
    const snapshot = await getDocs(collection(db, 'warehouses'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
  }

  // Item Classes
  static async getItemClassesByCompany(companyId: string): Promise<ItemClass[]> {
    const q = query(
      collection(db, 'itemClasses'),
      where('companyId', '==', companyId),
      orderBy('code')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemClass));
  }

  // Items
  static async getItemsByCompany(companyId: string): Promise<Item[]> {
    const q = query(
      collection(db, 'items'),
      where('companyId', '==', companyId),
      where('isActive', '==', true),
      orderBy('itemCode')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
  }

  // Real-time subscriptions
  static subscribeToTenants(callback: (tenants: Tenant[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
      callback(tenants);
    });
  }

  static subscribeToCompanies(callback: (companies: Company[]) => void): Unsubscribe {
    return onSnapshot(collection(db, 'companies'), (snapshot) => {
      const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
      callback(companies);
    });
  }

  static subscribeToCountries(companyId: string, callback: (countries: Country[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'countries'),
      where('companyId', '==', companyId),
      where('active', '==', true)
    );
    return onSnapshot(q, (snapshot) => {
      const countries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
      callback(countries);
    });
  }

  static subscribeToBranches(countryId: string, callback: (branches: Branch[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'branches'),
      where('countryId', '==', countryId),
      where('active', '==', true)
    );
    return onSnapshot(q, (snapshot) => {
      const branches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
      callback(branches);
    });
  }

  // Roles
  static async getRoles(tenantId?: string) {
    const qry = tenantId
      ? query(collection(db, 'roles'), where('tenantId', '==', tenantId))
      : collection(db, 'roles');
    const snapshot = await getDocs(qry);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async createRole(role: any) {
    const ref = await addDoc(collection(db, 'roles'), role);
    return ref.id;
  }

  static async updateRole(id: string, updates: any) {
    const ref = doc(db, 'roles', id);
    await updateDoc(ref, updates);
  }

  static async deleteRole(id: string) {
    const ref = doc(db, 'roles', id);
    await deleteDoc(ref);
  }

  // Users (profiles)
  static async getUsers(tenantId?: string) {
    const qry = tenantId
      ? query(collection(db, 'users'), where('tenantId', '==', tenantId))
      : collection(db, 'users');
    const snapshot = await getDocs(qry);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async createUser(profile: any) {
    const ref = await addDoc(collection(db, 'users'), profile);
    return ref.id;
  }

  static async updateUser(id: string, updates: any) {
    const ref = doc(db, 'users', id);
    await updateDoc(ref, updates);
  }

  static async deleteUser(id: string) {
    const ref = doc(db, 'users', id);
    await deleteDoc(ref);
  }
}
