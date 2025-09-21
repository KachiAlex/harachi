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
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Transaction,
  runTransaction
} from 'firebase/firestore';
import { db } from './config';
import { 
  Company, 
  Country, 
  Branch, 
  Warehouse, 
  Item, 
  ItemClass, 
  PurchaseOrder, 
  POLine, 
  GoodsReceipt, 
  GRLine,
  Recipe,
  RecipeLine,
  ProductionOrder,
  BatchAttributes
} from '../types';

// Generic Firestore operations
export class FirestoreService<T> {
  constructor(private collectionName: string) {}

  // Create
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Read single document
  async getById(id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID:`, error);
      throw error;
    }
  }

  // Read multiple documents
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update
  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener
  onSnapshot(callback: (data: T[]) => void, constraints: QueryConstraint[] = []) {
    const q = query(collection(db, this.collectionName), ...constraints);
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(data);
    });
  }

  // Paginated query
  async getPaginated(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot,
    constraints: QueryConstraint[] = []
  ): Promise<{ data: T[], lastDoc: DocumentSnapshot | null }> {
    try {
      const queryConstraints = [
        ...constraints,
        limit(pageSize)
      ];

      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, this.collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));

      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { data, lastDoc: lastDocument };
    } catch (error) {
      console.error(`Error getting paginated ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// Specific service instances
export const companiesService = new FirestoreService<Company>('companies');
export const countriesService = new FirestoreService<Country>('countries');
export const branchesService = new FirestoreService<Branch>('branches');
export const warehousesService = new FirestoreService<Warehouse>('warehouses');
export const itemClassesService = new FirestoreService<ItemClass>('itemClasses');
export const itemsService = new FirestoreService<Item>('items');
export const purchaseOrdersService = new FirestoreService<PurchaseOrder>('purchaseOrders');
export const poLinesService = new FirestoreService<POLine>('poLines');
export const goodsReceiptsService = new FirestoreService<GoodsReceipt>('goodsReceipts');
export const grLinesService = new FirestoreService<GRLine>('grLines');
export const recipesService = new FirestoreService<Recipe>('recipes');
export const recipeLinesService = new FirestoreService<RecipeLine>('recipeLines');
export const productionOrdersService = new FirestoreService<ProductionOrder>('productionOrders');
export const batchAttributesService = new FirestoreService<BatchAttributes>('batchAttributes');

// Complex operations that require transactions
export const createPurchaseOrderWithLines = async (
  po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>,
  lines: Omit<POLine, 'id' | 'poId' | 'createdAt' | 'updatedAt'>[]
): Promise<string> => {
  return runTransaction(db, async (transaction: Transaction) => {
    // Create PO
    const poRef = doc(collection(db, 'purchaseOrders'));
    const poData = {
      ...po,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    transaction.set(poRef, poData);

    // Create PO lines
    lines.forEach((line, index) => {
      const lineRef = doc(collection(db, 'poLines'));
      const lineData = {
        ...line,
        poId: poRef.id,
        lineNumber: index + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      transaction.set(lineRef, lineData);
    });

    return poRef.id;
  });
};

export const createGoodsReceiptWithLines = async (
  gr: Omit<GoodsReceipt, 'id' | 'createdAt' | 'updatedAt'>,
  lines: Omit<GRLine, 'id' | 'grId' | 'createdAt' | 'updatedAt'>[]
): Promise<string> => {
  return runTransaction(db, async (transaction: Transaction) => {
    // Create GR
    const grRef = doc(collection(db, 'goodsReceipts'));
    const grData = {
      ...gr,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    transaction.set(grRef, grData);

    // Create GR lines
    lines.forEach((line) => {
      const lineRef = doc(collection(db, 'grLines'));
      const lineData = {
        ...line,
        grId: grRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      transaction.set(lineRef, lineData);
    });

    return grRef.id;
  });
};

export const createRecipeWithLines = async (
  recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>,
  lines: Omit<RecipeLine, 'id' | 'recipeId' | 'createdAt' | 'updatedAt'>[]
): Promise<string> => {
  return runTransaction(db, async (transaction: Transaction) => {
    // Create Recipe
    const recipeRef = doc(collection(db, 'recipes'));
    const recipeData = {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    transaction.set(recipeRef, recipeData);

    // Create Recipe lines
    lines.forEach((line, index) => {
      const lineRef = doc(collection(db, 'recipeLines'));
      const lineData = {
        ...line,
        recipeId: recipeRef.id,
        lineNumber: index + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      transaction.set(lineRef, lineData);
    });

    return recipeRef.id;
  });
};

// Batch operations
export const batchUpdate = async (updates: { collection: string; id: string; data: any }[]): Promise<void> => {
  const batch = writeBatch(db);

  updates.forEach(({ collection: collectionName, id, data }) => {
    const docRef = doc(db, collectionName, id);
    batch.update(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
};

export const batchDelete = async (deletions: { collection: string; id: string }[]): Promise<void> => {
  const batch = writeBatch(db);

  deletions.forEach(({ collection: collectionName, id }) => {
    const docRef = doc(db, collectionName, id);
    batch.delete(docRef);
  });

  await batch.commit();
};

// Query helpers
export const getItemsByClass = async (itemClassId: string): Promise<Item[]> => {
  return itemsService.getAll([
    where('itemClassId', '==', itemClassId),
    where('isActive', '==', true),
    orderBy('itemCode')
  ]);
};

export const getPOsBySupplier = async (supplierId: string): Promise<PurchaseOrder[]> => {
  return purchaseOrdersService.getAll([
    where('supplierId', '==', supplierId),
    orderBy('orderDate', 'desc')
  ]);
};

export const getActiveProductionOrders = async (companyId: string): Promise<ProductionOrder[]> => {
  return productionOrdersService.getAll([
    where('companyId', '==', companyId),
    where('status', 'in', ['PLANNED', 'RELEASED', 'IN_PROGRESS']),
    orderBy('plannedStartDate', 'asc')
  ]);
};

export const getBranchesByCountry = async (countryId: string): Promise<Branch[]> => {
  return branchesService.getAll([
    where('countryId', '==', countryId),
    where('active', '==', true),
    orderBy('name')
  ]);
};

export const getWarehousesByBranch = async (branchId: string): Promise<Warehouse[]> => {
  return warehousesService.getAll([
    where('branchId', '==', branchId),
    where('active', '==', true),
    orderBy('name')
  ]);
};
