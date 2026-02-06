import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";

import OutCall "http-outcalls/outcall";
import DirectionType "DirectionType";
import MarketData "MarketData";
import UserPreferences "UserPreferences";
import Nat "mo:core/Nat";


actor {
  type UnifiedSnapshot = {
    marketData : [MarketData.MarketData];
    timestamp : Int;
  };

  type SnapshotCache = {
    snapshot : UnifiedSnapshot;
    lastUpdated : Int;
  };

  public type CryptoMarketData = {
    symbol : Text;
    price : Float;
    direction : DirectionType.DirectionType;
    provider : Text;
  };

  let persistentMarketData = Map.empty<Text, MarketData.MarketData>();
  let persistentUserPreferences = Map.empty<Principal, UserPreferences.UserPreferences>();
  var lastSnapshotCache : ?SnapshotCache = null;

  var refreshIntervalCoins : Int = 600_000_000_000;
  var refreshIntervalBinance : Int = 60_000_000_000;

  func transformAndUpdateCache(apiResults : [MarketData.MarketData], timestamp : Int) : UnifiedSnapshot {
    let snapshot : UnifiedSnapshot = {
      marketData = apiResults;
      timestamp;
    };
    let newCache : SnapshotCache = {
      snapshot;
      lastUpdated = timestamp;
    };
    lastSnapshotCache := ?newCache;
    snapshot;
  };

  func isMarketDataStale(lastUpdated : Int, refreshInterval : Int) : Bool {
    let currentTime = Time.now();
    currentTime - lastUpdated > refreshInterval;
  };

  public func fetchAssetData(symbol : Text) : async ?MarketData.MarketData {
    switch (persistentMarketData.get(symbol)) {
      case (?cachedData) {
        ?cachedData;
      };
      case (null) {
        null;
      };
    };
  };

  public func recordAssetData(data : MarketData.MarketData) : async () {
    persistentMarketData.add(data.symbol, data);
  };

  public func fetchAssetList() : async [Text] {
    let assetList = Map.empty<Text, ()>();
    for (data in persistentMarketData.values()) {
      assetList.add(data.symbol, ());
    };
    assetList.keys().toArray();
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func fetchBinanceFuturesAssets() : async ?UnifiedSnapshot {
    if (true) {
      return null;
    };

    let currentTime = Time.now();
    let stale = switch (lastSnapshotCache) {
      case (?cache) { isMarketDataStale(cache.lastUpdated, refreshIntervalBinance) };
      case (_) { true };
    };

    if (stale) {
      let fakeApiResults : [MarketData.MarketData] = [
        {
          symbol = "BTCUSDT";
          price = 60000.0;
          volume = 1000000.0;
          direction = #up;
        },
        {
          symbol = "ETHUSDT";
          price = 4500.0;
          volume = 500000.0;
          direction = #down;
        },
      ];
      ?transformAndUpdateCache(fakeApiResults, currentTime);
    } else {
      switch (lastSnapshotCache) {
        case (?cache) { ?cache.snapshot };
        case (null) {
          ?{
            marketData = [];
            timestamp = currentTime;
          };
        };
      };
    };
  };

  public func filterAssetsByDirection(direction : DirectionType.DirectionType) : async [MarketData.MarketData] {
    let filtered = List.empty<MarketData.MarketData>();
    for ((symbol, data) in persistentMarketData.entries()) {
      if (data.direction == direction) {
        filtered.add(data);
      };
    };
    filtered.toArray();
  };

  public func setUserPreferences(input : UserPreferences.UserPreferencesInput) : async UserPreferences.UserPreferences {
    let prefs : UserPreferences.UserPreferences = {
      favourites = input.favourites;
      theme = input.theme;
      enableAlerts = input.enableAlerts;
      language = input.language;
    };
    persistentUserPreferences.add(input.user, prefs);
    prefs;
  };

  public query ({ caller }) func getUserPreferences(user : Principal) : async ?UserPreferences.UserPreferences {
    persistentUserPreferences.get(user);
  };

  public func getUserPreferencesWithPreferences(user : Principal) : async ?UserPreferences.UserPreferences {
    persistentUserPreferences.get(user);
  };

  public shared ({ caller }) func configurePollingIntervals(coinsInterval : Nat, binanceInterval : Nat) : async () {
    refreshIntervalCoins := coinsInterval.toInt() * 1_000_000_000;
    refreshIntervalBinance := binanceInterval.toInt() * 1_000_000_000;
  };

  public shared ({ caller }) func getCoinGeckoBTC() : async Text {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func getBinanceTradesBTCUSDT() : async Text {
    let url = "https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=50";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public type MarketSourceResult = {
    ok : Bool;
    body : Text;
    errorMessage : ?Text;
  };

  public type MarketSnapshot = {
    coingeckoBTC : MarketSourceResult;
    binanceTrades : MarketSourceResult;
  };

  func callWithFallback(f : shared () -> async Text, fallback : Text) : async Text {
    try {
      await f();
    } catch (_e : Error) {
      fallback;
    };
  };

  func staticFallback(data : Text) : async Text {
    data;
  };

  func makeSourceResult(body : Text, errorMsg : ?Text) : MarketSourceResult {
    {
      ok = errorMsg == null;
      body;
      errorMessage = errorMsg;
    };
  };

  public shared ({ caller }) func getCryptoMarketSnapshot() : async MarketSnapshot {
    let coinGeckoRes = await callWithFallback(getCoinGeckoBTC, "");
    let binanceRes = await callWithFallback(getBinanceTradesBTCUSDT, "");

    {
      coingeckoBTC = makeSourceResult(coinGeckoRes, if (coinGeckoRes == "") { ? "CoinGecko call failed" } else { null });
      binanceTrades = makeSourceResult(binanceRes, if (binanceRes == "") { ? "Binance call failed" } else { null });
    };
  };
};
