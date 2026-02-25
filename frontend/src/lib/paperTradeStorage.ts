// IndexedDB storage for AI paper trades
const DB_NAME = 'aiPaperTradingDB';
const DB_VERSION = 1;
const OPEN_TRADES_STORE = 'openTrades';
const HISTORY_STORE = 'tradeHistory';

export type TradingModality = 'scalping' | 'swing' | 'breakout' | 'reversal' | 'smc' | 'fvg';

export interface PaperTrade {
  id: string;
  symbol: string;
  modality: TradingModality;
  direction: 'Long' | 'Short';
  entryPrice: number;
  currentPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  slLevel: number;
  capital: number;
  leverage: number;
  exposure: number;
  pnlPercent: number;
  pnlUsd: number;
  openedAt: number;
  status: 'open';
}

export interface ClosedPaperTrade {
  id: string;
  symbol: string;
  modality: TradingModality;
  direction: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  slLevel: number;
  capital: number;
  leverage: number;
  exposure: number;
  pnlPercent: number;
  pnlUsd: number;
  tpHit: 'TP1' | 'TP2' | 'TP3' | 'none';
  slHit: boolean;
  exitReason: 'TP1' | 'TP2' | 'TP3' | 'SL';
  openedAt: number;
  closedAt: number;
}

export interface TradeHistorySummary {
  totalTrades: number;
  winRate: number;
  averagePnlPercent: number;
  totalPnlUsd: number;
  modalityBreakdown: {
    modality: TradingModality;
    trades: number;
    winRate: number;
    avgPnl: number;
  }[];
}

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(OPEN_TRADES_STORE)) {
        const openStore = db.createObjectStore(OPEN_TRADES_STORE, { keyPath: 'id' });
        openStore.createIndex('modality', 'modality', { unique: false });
      }

      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        historyStore.createIndex('modality', 'modality', { unique: false });
        historyStore.createIndex('closedAt', 'closedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function addOpenTrade(trade: PaperTrade): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPEN_TRADES_STORE, 'readwrite');
    const store = tx.objectStore(OPEN_TRADES_STORE);
    const req = store.put(trade);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateTradePrice(id: string, currentPrice: number, pnlPercent: number, pnlUsd: number): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPEN_TRADES_STORE, 'readwrite');
    const store = tx.objectStore(OPEN_TRADES_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const trade = getReq.result as PaperTrade | undefined;
      if (!trade) { resolve(); return; }
      const updated = { ...trade, currentPrice, pnlPercent, pnlUsd };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function closeTradeAndArchive(
  id: string,
  exitPrice: number,
  exitReason: 'TP1' | 'TP2' | 'TP3' | 'SL'
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([OPEN_TRADES_STORE, HISTORY_STORE], 'readwrite');
    const openStore = tx.objectStore(OPEN_TRADES_STORE);
    const historyStore = tx.objectStore(HISTORY_STORE);

    const getReq = openStore.get(id);
    getReq.onsuccess = () => {
      const trade = getReq.result as PaperTrade | undefined;
      if (!trade) { resolve(); return; }

      const priceDiff = exitPrice - trade.entryPrice;
      const pnlPercent = trade.direction === 'Long'
        ? (priceDiff / trade.entryPrice) * 100 * trade.leverage
        : (-priceDiff / trade.entryPrice) * 100 * trade.leverage;
      const pnlUsd = (pnlPercent / 100) * trade.capital;

      const closed: ClosedPaperTrade = {
        id: trade.id,
        symbol: trade.symbol,
        modality: trade.modality,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice,
        tp1: trade.tp1,
        tp2: trade.tp2,
        tp3: trade.tp3,
        slLevel: trade.slLevel,
        capital: trade.capital,
        leverage: trade.leverage,
        exposure: trade.exposure,
        pnlPercent,
        pnlUsd,
        tpHit: exitReason === 'SL' ? 'none' : exitReason,
        slHit: exitReason === 'SL',
        exitReason,
        openedAt: trade.openedAt,
        closedAt: Date.now(),
      };

      openStore.delete(id);
      historyStore.put(closed);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function getAllOpenTrades(): Promise<PaperTrade[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPEN_TRADES_STORE, 'readonly');
    const store = tx.objectStore(OPEN_TRADES_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as PaperTrade[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllClosedTrades(): Promise<ClosedPaperTrade[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const store = tx.objectStore(HISTORY_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as ClosedPaperTrade[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getOpenTradeByModality(modality: TradingModality): Promise<PaperTrade | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPEN_TRADES_STORE, 'readonly');
    const store = tx.objectStore(OPEN_TRADES_STORE);
    const index = store.index('modality');
    const req = index.getAll(modality);
    req.onsuccess = () => {
      const results = req.result as PaperTrade[];
      resolve(results.length > 0 ? results[0] : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllHistory(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllOpenTrades(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPEN_TRADES_STORE, 'readwrite');
    const store = tx.objectStore(OPEN_TRADES_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getTradeHistorySummary(): Promise<TradeHistorySummary> {
  const trades = await getAllClosedTrades();
  const modalities: TradingModality[] = ['scalping', 'swing', 'breakout', 'reversal', 'smc', 'fvg'];

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.pnlPercent > 0).length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const averagePnlPercent = totalTrades > 0
    ? trades.reduce((sum, t) => sum + t.pnlPercent, 0) / totalTrades
    : 0;
  const totalPnlUsd = trades.reduce((sum, t) => sum + t.pnlUsd, 0);

  const modalityBreakdown = modalities.map(modality => {
    const mTrades = trades.filter(t => t.modality === modality);
    const mWins = mTrades.filter(t => t.pnlPercent > 0).length;
    return {
      modality,
      trades: mTrades.length,
      winRate: mTrades.length > 0 ? (mWins / mTrades.length) * 100 : 0,
      avgPnl: mTrades.length > 0
        ? mTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / mTrades.length
        : 0,
    };
  });

  return { totalTrades, winRate, averagePnlPercent, totalPnlUsd, modalityBreakdown };
}
