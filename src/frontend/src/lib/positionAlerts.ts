const ALERT_THRESHOLD_KEY = "position_alert_threshold";
const DEFAULT_THRESHOLD = 5;

export function getAlertThreshold(): number {
  const stored = localStorage.getItem(ALERT_THRESHOLD_KEY);
  if (stored) {
    const val = Number.parseFloat(stored);
    if (!Number.isNaN(val) && val > 0) return val;
  }
  return DEFAULT_THRESHOLD;
}

export function setAlertThreshold(threshold: number): void {
  localStorage.setItem(ALERT_THRESHOLD_KEY, threshold.toString());
}

export interface PositionData {
  symbol: string;
  positionSide: string;
  entryPrice: number;
  markPrice: number;
  unRealizedProfit: number;
  liquidationPrice: number;
  leverage: number;
  positionAmt: number;
  pnlPercent: number;
}

export function shouldShowPnLAlert(
  position: PositionData,
  threshold?: number,
): boolean {
  const t = threshold ?? getAlertThreshold();
  return Math.abs(position.pnlPercent) >= t;
}

export function computePnLPercent(position: {
  entryPrice: number;
  markPrice: number;
  positionSide: string;
  positionAmt: number;
}): number {
  if (position.entryPrice === 0) return 0;
  const isLong = position.positionAmt > 0 || position.positionSide === "LONG";
  if (isLong) {
    return (
      ((position.markPrice - position.entryPrice) / position.entryPrice) * 100
    );
  }
  return (
    ((position.entryPrice - position.markPrice) / position.entryPrice) * 100
  );
}
