// IndexedDB storage for monitored trades

export interface MonitoredTrade {
  id: string;
  symbol: string;
  leverage: number;
  direction: 'long' | 'short';
  entryPrice: number;
  entryTimestamp: number;
}

const DB_NAME = 'TradeMonitoringDB';
const DB_VERSION = 1;
const TRADES_STORE = 'trades';

let dbInstance: IDBDatabase | null = null;

export async function initTradeDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(TRADES_STORE)) {
        const store = db.createObjectStore(TRADES_STORE, { keyPath: 'id' });
        store.createIndex('symbol', 'symbol', { unique: false });
        store.createIndex('entryTimestamp', 'entryTimestamp', { unique: false });
      }
    };
  });
}

export async function addTrade(trade: Omit<MonitoredTrade, 'id'>): Promise<string> {
  const db = await initTradeDB();
  const id = `${trade.symbol}-${Date.now()}`;
  const fullTrade: MonitoredTrade = { ...trade, id };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TRADES_STORE], 'readwrite');
    const store = transaction.objectStore(TRADES_STORE);
    const request = store.add(fullTrade);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function removeTrade(id: string): Promise<void> {
  const db = await initTradeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TRADES_STORE], 'readwrite');
    const store = transaction.objectStore(TRADES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTrades(): Promise<MonitoredTrade[]> {
  const db = await initTradeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TRADES_STORE], 'readonly');
    const store = transaction.objectStore(TRADES_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getTradeById(id: string): Promise<MonitoredTrade | null> {
  const db = await initTradeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TRADES_STORE], 'readonly');
    const store = transaction.objectStore(TRADES_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
