// Continuous Learning Engine for adaptive prediction improvement
// Stores learning data in IndexedDB for offline persistence

interface PredictionRecord {
  symbol: string;
  timestamp: number;
  predictedPrice: number;
  actualPrice?: number;
  confidence: number;
  indicators: {
    smc: number;
    volumeDelta: number;
    liquidity: number;
    fvg: number;
  };
  wasCorrect?: boolean;
}

interface AssetLearningStats {
  symbol: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  averageConfidence: number;
  indicatorWeights: {
    smc: number;
    volumeDelta: number;
    liquidity: number;
    fvg: number;
  };
  lastUpdated: number;
  learningLevel: number; // 0-1 scale
}

interface LearningConfig {
  enabled: boolean;
  minPredictionsForLearning: number;
  learningRate: number;
  confidenceThreshold: number;
}

const DB_NAME = 'CryptoLearningDB';
const DB_VERSION = 1;
const PREDICTIONS_STORE = 'predictions';
const STATS_STORE = 'assetStats';
const CONFIG_STORE = 'config';

class LearningEngine {
  private db: IDBDatabase | null = null;
  private defaultWeights = {
    smc: 0.25,
    volumeDelta: 0.25,
    liquidity: 0.25,
    fvg: 0.25,
  };

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(PREDICTIONS_STORE)) {
          const predictionsStore = db.createObjectStore(PREDICTIONS_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          predictionsStore.createIndex('symbol', 'symbol', { unique: false });
          predictionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STATS_STORE)) {
          db.createObjectStore(STATS_STORE, { keyPath: 'symbol' });
        }

        if (!db.objectStoreNames.contains(CONFIG_STORE)) {
          db.createObjectStore(CONFIG_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Reset helper - delete the entire IndexedDB database
   * Closes any open connections first
   */
  async resetDatabase(): Promise<void> {
    // Close the current connection if open
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    // Delete the database
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      
      request.onsuccess = () => {
        console.log('Learning database deleted successfully');
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to delete learning database:', request.error);
        reject(request.error);
      };
      
      request.onblocked = () => {
        console.warn('Database deletion blocked - close all tabs and try again');
        // Still resolve - the database will be deleted when possible
        resolve();
      };
    });
  }

  async getConfig(): Promise<LearningConfig> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CONFIG_STORE], 'readonly');
      const store = transaction.objectStore(CONFIG_STORE);
      const request = store.get('config');

      request.onsuccess = () => {
        resolve(
          request.result?.value || {
            enabled: true,
            minPredictionsForLearning: 10,
            learningRate: 0.1,
            confidenceThreshold: 0.5,
          }
        );
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setConfig(config: LearningConfig): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CONFIG_STORE], 'readwrite');
      const store = transaction.objectStore(CONFIG_STORE);
      const request = store.put({ key: 'config', value: config });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async recordPrediction(record: PredictionRecord): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PREDICTIONS_STORE], 'readwrite');
      const store = transaction.objectStore(PREDICTIONS_STORE);
      const request = store.add(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updatePredictionResult(
    symbol: string,
    timestamp: number,
    actualPrice: number
  ): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PREDICTIONS_STORE], 'readwrite');
      const store = transaction.objectStore(PREDICTIONS_STORE);
      const index = store.index('symbol');
      const request = index.openCursor(IDBKeyRange.only(symbol));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as PredictionRecord;
          // Match predictions within 24 hours
          if (Math.abs(record.timestamp - timestamp) < 24 * 60 * 60 * 1000 && !record.actualPrice) {
            record.actualPrice = actualPrice;
            // Consider prediction correct if within 5% of actual
            const percentDiff = Math.abs((record.predictedPrice - actualPrice) / actualPrice);
            record.wasCorrect = percentDiff < 0.05;
            cursor.update(record);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAssetStats(symbol: string): Promise<AssetLearningStats | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE], 'readonly');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.get(symbol);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAssetStats(): Promise<AssetLearningStats[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE], 'readonly');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAssetStats(symbol: string): Promise<void> {
    if (!this.db) await this.initialize();

    const config = await this.getConfig();
    if (!config.enabled) return;

    // Get all predictions for this asset
    const predictions = await this.getPredictionsForAsset(symbol);
    const completedPredictions = predictions.filter((p) => p.actualPrice !== undefined);

    if (completedPredictions.length < config.minPredictionsForLearning) {
      return; // Not enough data to learn
    }

    const correctPredictions = completedPredictions.filter((p) => p.wasCorrect).length;
    const accuracyRate = correctPredictions / completedPredictions.length;
    const averageConfidence =
      completedPredictions.reduce((sum, p) => sum + p.confidence, 0) / completedPredictions.length;

    // Calculate optimal weights based on performance
    const weights = await this.optimizeWeights(completedPredictions, config.learningRate);

    // Calculate learning level (0-1) based on accuracy and number of predictions
    const learningLevel = Math.min(
      (accuracyRate * 0.7 + Math.min(completedPredictions.length / 100, 1) * 0.3),
      1
    );

    const stats: AssetLearningStats = {
      symbol,
      totalPredictions: completedPredictions.length,
      correctPredictions,
      accuracyRate,
      averageConfidence,
      indicatorWeights: weights,
      lastUpdated: Date.now(),
      learningLevel,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE], 'readwrite');
      const store = transaction.objectStore(STATS_STORE);
      const request = store.put(stats);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getPredictionsForAsset(symbol: string): Promise<PredictionRecord[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PREDICTIONS_STORE], 'readonly');
      const store = transaction.objectStore(PREDICTIONS_STORE);
      const index = store.index('symbol');
      const request = index.getAll(IDBKeyRange.only(symbol));

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async optimizeWeights(
    predictions: PredictionRecord[],
    learningRate: number
  ): Promise<typeof this.defaultWeights> {
    // Simple gradient descent-like optimization
    const weights = { ...this.defaultWeights };
    const correctPredictions = predictions.filter((p) => p.wasCorrect);

    if (correctPredictions.length === 0) return weights;

    // Calculate average indicator values for correct predictions
    const avgCorrect = {
      smc: correctPredictions.reduce((sum, p) => sum + p.indicators.smc, 0) / correctPredictions.length,
      volumeDelta: correctPredictions.reduce((sum, p) => sum + p.indicators.volumeDelta, 0) / correctPredictions.length,
      liquidity: correctPredictions.reduce((sum, p) => sum + p.indicators.liquidity, 0) / correctPredictions.length,
      fvg: correctPredictions.reduce((sum, p) => sum + p.indicators.fvg, 0) / correctPredictions.length,
    };

    // Adjust weights based on indicator performance
    const totalAvg = avgCorrect.smc + avgCorrect.volumeDelta + avgCorrect.liquidity + avgCorrect.fvg;
    if (totalAvg > 0) {
      weights.smc = weights.smc * (1 - learningRate) + (avgCorrect.smc / totalAvg) * learningRate;
      weights.volumeDelta = weights.volumeDelta * (1 - learningRate) + (avgCorrect.volumeDelta / totalAvg) * learningRate;
      weights.liquidity = weights.liquidity * (1 - learningRate) + (avgCorrect.liquidity / totalAvg) * learningRate;
      weights.fvg = weights.fvg * (1 - learningRate) + (avgCorrect.fvg / totalAvg) * learningRate;

      // Normalize weights to sum to 1
      const sum = weights.smc + weights.volumeDelta + weights.liquidity + weights.fvg;
      weights.smc /= sum;
      weights.volumeDelta /= sum;
      weights.liquidity /= sum;
      weights.fvg /= sum;
    }

    return weights;
  }

  async getOptimizedConfidence(symbol: string, baseConfidence: number): Promise<number> {
    const stats = await this.getAssetStats(symbol);
    if (!stats || stats.totalPredictions < 10) {
      return baseConfidence;
    }

    // Adjust confidence based on historical accuracy
    const adjustmentFactor = stats.accuracyRate;
    return Math.min(baseConfidence * (0.5 + adjustmentFactor * 0.5), 1.0);
  }

  async getHighLearningAssets(minLearningLevel: number = 0.6): Promise<string[]> {
    const allStats = await this.getAllAssetStats();
    return allStats
      .filter((stats) => stats.learningLevel >= minLearningLevel)
      .sort((a, b) => b.learningLevel - a.learningLevel)
      .map((stats) => stats.symbol);
  }

  async clearOldPredictions(daysToKeep: number = 30): Promise<void> {
    if (!this.db) await this.initialize();

    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PREDICTIONS_STORE], 'readwrite');
      const store = transaction.objectStore(PREDICTIONS_STORE);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const learningEngine = new LearningEngine();
export type { AssetLearningStats, PredictionRecord, LearningConfig };
