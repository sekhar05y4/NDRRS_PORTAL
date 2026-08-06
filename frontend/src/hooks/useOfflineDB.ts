import { useState, useEffect } from 'react';

const DB_NAME = 'rapidaid_v2_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_beacons';

export function useOfflineDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: any) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e: any) => {
      const database = e.target.result;
      setDb(database);
      refreshOfflineCount(database);
    };

    request.onerror = (e) => {
      console.error("Failed to compile IndexedDB schemas:", e);
    };
  }, []);

  const refreshOfflineCount = (databaseInstance = db) => {
    if (!databaseInstance) return;
    const transaction = databaseInstance.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();
    
    request.onsuccess = (e: any) => {
      setOfflineCount(e.target.result);
    };
  };

  const saveOfflineBeacon = (beacon: any): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Offline Database not initialized");
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(beacon);

      request.onsuccess = () => {
        refreshOfflineCount();
        resolve(true);
      };
      request.onerror = (e) => reject(e);
    });
  };

  const getOfflineBeacons = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        resolve([]);
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = (e) => reject(e);
    });
  };

  const clearOfflineBeacons = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        resolve(false);
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        setOfflineCount(0);
        resolve(true);
      };
      request.onerror = (e) => reject(e);
    });
  };

  return {
    offlineCount,
    saveOfflineBeacon,
    getOfflineBeacons,
    clearOfflineBeacons,
    refreshOfflineCount: () => refreshOfflineCount()
  };
}
