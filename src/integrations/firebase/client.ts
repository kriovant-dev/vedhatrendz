// Firebase client for database operations
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
  QueryConstraint 
} from 'firebase/firestore';
import { db } from './config';

// Generic database operations
export class FirebaseClient {
  // Get all documents from a collection
  static async getAll(collectionName: string) {
    try {
      console.log(`🔍 Firebase: Getting all documents from ${collectionName}`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`✅ Firebase: Found ${data.length} documents in ${collectionName}`);
      return { data, error: null };
    } catch (error) {
      console.error(`❌ Firebase: Error getting all documents from ${collectionName}:`, error);
      return { data: null, error };
    }
  }

  // Get documents with conditions
  static async getWhere(collectionName: string, conditions: Array<{ field: string, operator: any, value: any }>) {
    try {
      const constraints: QueryConstraint[] = conditions.map(condition => 
        where(condition.field, condition.operator, condition.value)
      );
      
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get a single document with conditions
  static async getSingle(collectionName: string, conditions: Array<{ field: string, operator: any, value: any }>) {
    try {
      const result = await this.getWhere(collectionName, conditions);
      if (result.data && result.data.length > 0) {
        return { data: result.data[0], error: null };
      }
      return { data: null, error: new Error('Document not found') };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get document by ID - New method for direct ID lookups
  static async getByDocumentId(collectionName: string, documentId: string) {
    try {
      console.log(`🔍 Firebase: Getting document ${documentId} from ${collectionName}`);
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const result = { id: docSnap.id, ...docSnap.data() };
        console.log(`✅ Firebase: Found document:`, result);
        return { data: result, error: null };
      } else {
        console.log(`❌ Firebase: Document ${documentId} not found in ${collectionName}`);
        return { data: null, error: new Error('Document not found') };
      }
    } catch (error) {
      console.error(`❌ Firebase: Error getting document ${documentId}:`, error);
      return { data: null, error };
    }
  }

  // Update by document ID - New method for direct updates
  static async updateByDocumentId(collectionName: string, documentId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updated_at: new Date().toISOString()
      });
      return { data: { id: documentId, ...data }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete by document ID - New method for direct deletion
  static async deleteByDocumentId(collectionName: string, documentId: string) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Get document by ID
  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      } else {
        return { data: null, error: new Error('Document not found') };
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  // Add a new document
  static async add(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { data: { id: docRef.id, ...data }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update a document
  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updated_at: new Date().toISOString()
      });
      return { data: { id, ...data }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Delete a document
  static async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Query with ordering and limit
  static async getOrderedWithLimit(
    collectionName: string, 
    orderField: string, 
    direction: 'asc' | 'desc' = 'desc', 
    limitCount: number = 10
  ) {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderField, direction),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Create a supabase-like interface for easier migration
export const firebase = {
  from: (table: string) => ({
    select: (fields = '*') => ({
      eq: (field: string, value: any) => ({
        eq: (field2: string, value2: any) => ({
          single: async () => FirebaseClient.getSingle(table, [
            { field, operator: '==', value },
            { field: field2, operator: '==', value: value2 }
          ])
        }),
        single: async () => {
          // Special handling for 'id' field to use document ID lookup
          if (field === 'id') {
            return FirebaseClient.getByDocumentId(table, value);
          }
          return FirebaseClient.getSingle(table, [{ field, operator: '==', value }]);
        },
        execute: async () => FirebaseClient.getWhere(table, [{ field, operator: '==', value }])
      }),
      order: (field: string, options: { ascending?: boolean } = {}) => ({
        execute: async () => FirebaseClient.getOrderedWithLimit(table, field, options.ascending ? 'asc' : 'desc', 1000)
      }),
      limit: (count: number) => ({
        execute: async () => FirebaseClient.getOrderedWithLimit(table, 'created_at', 'desc', count)
      }),
      execute: async () => FirebaseClient.getAll(table)
    }),
    insert: (data: any[] | any) => ({
      execute: async () => {
        if (Array.isArray(data)) {
          // Handle array of data
          const results = await Promise.all(data.map(item => FirebaseClient.add(table, item)));
          return { data: results.map(r => r.data), error: results.find(r => r.error)?.error || null };
        } else {
          return FirebaseClient.add(table, data);
        }
      }
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        execute: async () => {
          // Special handling for 'id' field to use document ID update
          if (field === 'id') {
            return FirebaseClient.updateByDocumentId(table, value, data);
          }
          const result = await FirebaseClient.getSingle(table, [{ field, operator: '==', value }]);
          if (result.data) {
            return FirebaseClient.updateByDocumentId(table, result.data.id, data);
          }
          return { data: null, error: new Error('Document not found for update') };
        }
      }),
      execute: async () => {
        return { data: null, error: new Error('Update requires a condition (use .eq())') };
      }
    }),
    delete: () => ({
      eq: (field: string, value: any) => ({
        execute: async () => {
          // Special handling for 'id' field to use document ID deletion
          if (field === 'id') {
            return FirebaseClient.deleteByDocumentId(table, value);
          }
          const result = await FirebaseClient.getSingle(table, [{ field, operator: '==', value }]);
          if (result.data) {
            return FirebaseClient.deleteByDocumentId(table, result.data.id);
          }
          return { error: new Error('Document not found for deletion') };
        }
      })
    })
  })
};
