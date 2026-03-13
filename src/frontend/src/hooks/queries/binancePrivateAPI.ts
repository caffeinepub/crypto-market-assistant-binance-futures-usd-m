import { buildSignedUrl } from "../../lib/binanceAuth";
import type { PositionData } from "../../lib/positionAlerts";
import { computePnLPercent } from "../../lib/positionAlerts";

const FUTURES_BASE = "https://fapi.binance.com";

export interface AccountBalance {
  totalWalletBalance: number;
  availableBalance: number;
  totalUnrealizedProfit: number;
  totalMarginBalance: number;
}

export interface BinanceApiError {
  code: number;
  msg: string;
  httpStatus?: number;
}

async function signedFetch<T>(
  endpoint: string,
  apiKey: string,
  secretKey: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = await buildSignedUrl(
    `${FUTURES_BASE}${endpoint}`,
    params,
    secretKey,
  );
  const res = await fetch(url, {
    headers: {
      "X-MBX-APIKEY": apiKey,
    },
  });

  if (!res.ok) {
    let errorBody: { code?: number; msg?: string } = {};
    try {
      errorBody = await res.json();
    } catch {
      // ignore
    }
    const err: BinanceApiError = {
      code: errorBody.code ?? res.status,
      msg: errorBody.msg ?? res.statusText,
      httpStatus: res.status,
    };
    throw err;
  }

  return res.json() as Promise<T>;
}

interface RawAccountData {
  totalWalletBalance: string;
  availableBalance: string;
  totalUnrealizedProfit: string;
  totalMarginBalance: string;
}

export async function fetchAccountBalance(
  apiKey: string,
  secretKey: string,
): Promise<AccountBalance> {
  const data = await signedFetch<RawAccountData>(
    "/fapi/v2/account",
    apiKey,
    secretKey,
  );
  return {
    totalWalletBalance: Number.parseFloat(data.totalWalletBalance),
    availableBalance: Number.parseFloat(data.availableBalance),
    totalUnrealizedProfit: Number.parseFloat(data.totalUnrealizedProfit),
    totalMarginBalance: Number.parseFloat(data.totalMarginBalance),
  };
}

interface RawPositionRisk {
  symbol: string;
  positionSide: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  liquidationPrice: string;
  leverage: string;
  positionAmt: string;
}

export async function fetchOpenPositions(
  apiKey: string,
  secretKey: string,
): Promise<PositionData[]> {
  const data = await signedFetch<RawPositionRisk[]>(
    "/fapi/v2/positionRisk",
    apiKey,
    secretKey,
  );

  return data
    .filter((p) => Number.parseFloat(p.positionAmt) !== 0)
    .map((p) => {
      const positionAmt = Number.parseFloat(p.positionAmt);
      const entryPrice = Number.parseFloat(p.entryPrice);
      const markPrice = Number.parseFloat(p.markPrice);
      const pnlPercent = computePnLPercent({
        entryPrice,
        markPrice,
        positionSide: p.positionSide,
        positionAmt,
      });
      return {
        symbol: p.symbol,
        positionSide: p.positionSide,
        entryPrice,
        markPrice,
        unRealizedProfit: Number.parseFloat(p.unRealizedProfit),
        liquidationPrice: Number.parseFloat(p.liquidationPrice),
        leverage: Number.parseFloat(p.leverage),
        positionAmt,
        pnlPercent,
      };
    });
}
