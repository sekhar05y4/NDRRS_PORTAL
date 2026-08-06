import Dexie, { type Table } from 'dexie';
import { useState, useEffect } from 'react';

export interface OfflineSOS {
  id: string;
  lat: number;
  lon: number;
  type: string;
  priority: string;
  item_requested: string;
  details: string;
  status: string;
  timestamp: string;
  offline_flag?: number;
  people_count?: number;
  children?: number;
  elderly?: number;
  disabled?: number;
  pregnant?: number;
}

class DexieSOSDatabase extends Dexie {
  offline_beacons!: Table<OfflineSOS>;

  constructor() {
    super('rapidaid_v2_dexie_db');
    this.version(1).stores({
      offline_beacons: 'id, type, priority, status'
    });
  }
}

const offlineDb = new DexieSOSDatabase();

export function useDexieDB() {
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    refreshCount();
  }, []);

  const refreshCount = async () => {
    const count = await offlineDb.offline_beacons.count();
    setOfflineCount(count);
  };

  const saveOfflineSOS = async (beacon: OfflineSOS) => {
    await offlineDb.offline_beacons.put(beacon);
    await refreshCount();
    return true;
  };

  const getOfflineSOSList = async () => {
    return await offlineDb.offline_beacons.toArray();
  };

  const clearOfflineSOSList = async () => {
    await offlineDb.offline_beacons.clear();
    await refreshCount();
    return true;
  };

  return {
    offlineCount,
    saveOfflineSOS,
    getOfflineSOSList,
    clearOfflineSOSList,
    refreshCount
  };
}
