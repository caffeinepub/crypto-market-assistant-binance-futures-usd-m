/**
 * Order book depth utilities for parsing, aggregating, and analyzing depth data
 */

export interface DepthLevel {
  price: number;
  size: number;
  total: number;
  isWall: boolean;
}

export interface DepthMetrics {
  midPrice: number;
  spread: number;
  imbalance: number;
}

/**
 * Parse raw Binance depth JSON into typed bid/ask levels with strict numeric validation
 */
export function parseDepthData(rawData: any): {
  bids: DepthLevel[];
  asks: DepthLevel[];
  isEmpty: boolean;
} {
  // Validate input structure
  if (!rawData || typeof rawData !== 'object') {
    return { bids: [], asks: [], isEmpty: true };
  }
  
  const rawBids = rawData.bids || [];
  const rawAsks = rawData.asks || [];
  
  // Check if depth data is empty
  if (!Array.isArray(rawBids) || !Array.isArray(rawAsks) || (rawBids.length === 0 && rawAsks.length === 0)) {
    return { bids: [], asks: [], isEmpty: true };
  }
  
  // Parse and validate bids
  const bids: DepthLevel[] = [];
  let bidTotal = 0;
  
  for (const [priceStr, sizeStr] of rawBids) {
    const price = parseFloat(priceStr);
    const size = parseFloat(sizeStr);
    
    // Validate numeric fields
    if (!isFinite(price) || !isFinite(size) || price <= 0 || size <= 0) {
      continue; // Skip invalid levels
    }
    
    bidTotal += size;
    bids.push({
      price,
      size,
      total: bidTotal,
      isWall: false, // Will be computed later
    });
  }
  
  // Parse and validate asks
  const asks: DepthLevel[] = [];
  let askTotal = 0;
  
  for (const [priceStr, sizeStr] of rawAsks) {
    const price = parseFloat(priceStr);
    const size = parseFloat(sizeStr);
    
    // Validate numeric fields
    if (!isFinite(price) || !isFinite(size) || price <= 0 || size <= 0) {
      continue; // Skip invalid levels
    }
    
    askTotal += size;
    asks.push({
      price,
      size,
      total: askTotal,
      isWall: false, // Will be computed later
    });
  }
  
  return {
    bids,
    asks,
    isEmpty: bids.length === 0 && asks.length === 0,
  };
}

/**
 * Aggregate raw depth into price buckets (configurable step in USD)
 * and compute deterministic 'wall' flag for levels
 */
export function aggregateDepth(
  levels: DepthLevel[],
  step: number,
  side: 'bid' | 'ask'
): DepthLevel[] {
  if (levels.length === 0) return [];
  
  // Group levels by price bucket
  const buckets = new Map<number, number>();
  
  for (const level of levels) {
    const bucket = side === 'bid'
      ? Math.floor(level.price / step) * step
      : Math.ceil(level.price / step) * step;
    
    const currentSize = buckets.get(bucket) || 0;
    buckets.set(bucket, currentSize + level.size);
  }
  
  // Convert buckets to sorted array
  const aggregated: DepthLevel[] = [];
  let total = 0;
  
  const sortedBuckets = Array.from(buckets.entries()).sort((a, b) => 
    side === 'bid' ? b[0] - a[0] : a[0] - b[0]
  );
  
  for (const [price, size] of sortedBuckets) {
    total += size;
    aggregated.push({
      price,
      size,
      total,
      isWall: false, // Will be computed next
    });
  }
  
  // Compute wall flags based on size compared to median
  if (aggregated.length > 0) {
    const sizes = aggregated.map(l => l.size).sort((a, b) => a - b);
    const medianSize = sizes[Math.floor(sizes.length / 2)];
    const wallThreshold = medianSize * 2.5; // 2.5x median is considered a wall
    
    for (const level of aggregated) {
      level.isWall = level.size >= wallThreshold;
    }
  }
  
  return aggregated;
}

/**
 * Compute derived depth metrics: mid price, spread, and imbalance
 */
export function computeMetrics(
  bids: DepthLevel[],
  asks: DepthLevel[]
): DepthMetrics | null {
  // Check if we have sufficient data
  if (bids.length === 0 || asks.length === 0) {
    return null;
  }
  
  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  
  // Validate best bid/ask
  if (!isFinite(bestBid) || !isFinite(bestAsk) || bestBid <= 0 || bestAsk <= 0) {
    return null;
  }
  
  const midPrice = (bestBid + bestAsk) / 2;
  const spread = bestAsk - bestBid;
  
  // Compute imbalance using top N levels (same N for both sides)
  const topN = Math.min(10, bids.length, asks.length);
  
  let bidVolume = 0;
  let askVolume = 0;
  
  for (let i = 0; i < topN; i++) {
    bidVolume += bids[i].size;
    askVolume += asks[i].size;
  }
  
  const totalVolume = bidVolume + askVolume;
  const imbalance = totalVolume > 0 ? (bidVolume - askVolume) / totalVolume : 0;
  
  return {
    midPrice,
    spread,
    imbalance,
  };
}
