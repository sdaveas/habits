/**
 * IndexedDB wrapper for encrypted blob caching
 */

import { STORAGE_KEYS } from '../constants/STORAGE_KEYS';
import type { VaultBlob } from '../types/VaultTypes';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initIndexedDB(): Promise<IDBDatabase> {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_KEYS.DB_NAME, STORAGE_KEYS.DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      if (db) {
        resolve(db);
      } else {
        reject(new Error('Failed to get database'));
      }
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORAGE_KEYS.STORES.ENCRYPTED_BLOBS)) {
        database.createObjectStore(STORAGE_KEYS.STORES.ENCRYPTED_BLOBS, {
          keyPath: 'vault_id',
        });
      }
      
      if (!database.objectStoreNames.contains(STORAGE_KEYS.STORES.SYNC_QUEUE)) {
        database.createObjectStore(STORAGE_KEYS.STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      // Add encryption keys store for session persistence
      if (!database.objectStoreNames.contains(STORAGE_KEYS.STORES.ENCRYPTION_KEYS)) {
        database.createObjectStore(STORAGE_KEYS.STORES.ENCRYPTION_KEYS, {
          keyPath: 'id',
        });
      }
    };
  });
}

/**
 * Store encrypted blob in IndexedDB
 */
export async function storeEncryptedBlob(blob: VaultBlob): Promise<void> {
  const database = await initIndexedDB();
  const transaction = database.transaction(
    [STORAGE_KEYS.STORES.ENCRYPTED_BLOBS],
    'readwrite'
  );
  const store = transaction.objectStore(STORAGE_KEYS.STORES.ENCRYPTED_BLOBS);
  
  return new Promise((resolve, reject) => {
    const request = store.put(blob);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to store encrypted blob'));
  });
}

/**
 * Get encrypted blob from IndexedDB
 */
export async function getEncryptedBlob(vaultId: string): Promise<VaultBlob | null> {
  const database = await initIndexedDB();
  const transaction = database.transaction(
    [STORAGE_KEYS.STORES.ENCRYPTED_BLOBS],
    'readonly'
  );
  const store = transaction.objectStore(STORAGE_KEYS.STORES.ENCRYPTED_BLOBS);
  
  return new Promise((resolve, reject) => {
    const request = store.get(vaultId);
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => {
      reject(new Error('Failed to get encrypted blob'));
    };
  });
}

/**
 * Clear all encrypted blobs from IndexedDB
 */
export async function clearEncryptedBlobs(): Promise<void> {
  const database = await initIndexedDB();
  const transaction = database.transaction(
    [STORAGE_KEYS.STORES.ENCRYPTED_BLOBS],
    'readwrite'
  );
  const store = transaction.objectStore(STORAGE_KEYS.STORES.ENCRYPTED_BLOBS);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear encrypted blobs'));
  });
}

/**
 * Store encryption key in IndexedDB (for session persistence)
 */
export async function storeEncryptionKey(key: CryptoKey): Promise<void> {
  const database = await initIndexedDB();
  const transaction = database.transaction(
    [STORAGE_KEYS.STORES.ENCRYPTION_KEYS],
    'readwrite'
  );
  const store = transaction.objectStore(STORAGE_KEYS.STORES.ENCRYPTION_KEYS);
  
  return new Promise((resolve, reject) => {
    const request = store.put({ id: 'current', key });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to store encryption key'));
  });
}

/**
 * Get encryption key from IndexedDB
 */
export async function getEncryptionKey(): Promise<CryptoKey | null> {
  const database = await initIndexedDB();
  const transaction = database.transaction(
    [STORAGE_KEYS.STORES.ENCRYPTION_KEYS],
    'readonly'
  );
  const store = transaction.objectStore(STORAGE_KEYS.STORES.ENCRYPTION_KEYS);
  
  return new Promise((resolve, reject) => {
    const request = store.get('current');
    request.onsuccess = () => {
      const result = request.result;
      resolve(result?.key || null);
    };
    request.onerror = () => {
      reject(new Error('Failed to get encryption key'));
    };
  });
}

/**
 * Clear encryption key from IndexedDB
 */
export async function clearEncryptionKey(): Promise<void> {
  const database = await initIndexedDB();
  const transaction = database.transaction(
    [STORAGE_KEYS.STORES.ENCRYPTION_KEYS],
    'readwrite'
  );
  const store = transaction.objectStore(STORAGE_KEYS.STORES.ENCRYPTION_KEYS);
  
  return new Promise((resolve, reject) => {
    const request = store.delete('current');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear encryption key'));
  });
}

