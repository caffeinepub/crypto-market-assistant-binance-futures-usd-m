import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MarketData {
    direction: DirectionType;
    volume: number;
    price: number;
    symbol: string;
}
export interface UnifiedSnapshot {
    marketData: Array<MarketData>;
    timestamp: bigint;
}
export interface UserPreferences {
    theme: Theme;
    language: string;
    favourites: Array<MarketData>;
    enableAlerts: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface UserPreferencesInput {
    theme: Theme;
    user: Principal;
    language: string;
    favourites: Array<MarketData>;
    enableAlerts: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MarketSourceResult {
    ok: boolean;
    body: string;
    errorMessage?: string;
}
export interface MarketSnapshot {
    binanceSpotTicker: MarketSourceResult;
    binanceTrades: MarketSourceResult;
    binanceSpotDepth: MarketSourceResult;
    coingeckoBTC: MarketSourceResult;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum DirectionType {
    up = "up",
    down = "down"
}
export enum Theme {
    darkNeon = "darkNeon",
    cyberGlow = "cyberGlow"
}
export interface backendInterface {
    configurePollingIntervals(coinsInterval: bigint, binanceInterval: bigint): Promise<void>;
    fetchAssetData(symbol: string): Promise<MarketData | null>;
    fetchAssetList(): Promise<Array<string>>;
    fetchBinanceFuturesAssets(): Promise<UnifiedSnapshot | null>;
    filterAssetsByDirection(direction: DirectionType): Promise<Array<MarketData>>;
    getBinanceSpotDepthBTCUSDT(): Promise<string>;
    getBinanceSpotTickerBTCUSDT(): Promise<string>;
    getBinanceTradesBTCUSDT(): Promise<string>;
    getCoinGeckoBTC(): Promise<string>;
    getCryptoMarketSnapshot(): Promise<MarketSnapshot>;
    getUserPreferences(user: Principal): Promise<UserPreferences | null>;
    getUserPreferencesWithPreferences(user: Principal): Promise<UserPreferences | null>;
    recordAssetData(data: MarketData): Promise<void>;
    setUserPreferences(input: UserPreferencesInput): Promise<UserPreferences>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
