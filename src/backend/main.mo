import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import DirectionType "DirectionType";
import MarketData "MarketData";
import UserPreferences "UserPreferences";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type UserProfile = {
    name : Text;
    email : ?Text;
    notificationsEnabled : Bool;
  };

  let persistentMarketData = Map.empty<Text, MarketData.MarketData>();
  let persistentUserPreferences = Map.empty<Principal, UserPreferences.UserPreferences>();
  let userProfiles = Map.empty<Principal, UserProfile>();
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

  // User Profile Management - Required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Market Data Functions - Public read access, admin write access
  public query func fetchAssetData(symbol : Text) : async ?MarketData.MarketData {
    // Public read access - no auth required
    switch (persistentMarketData.get(symbol)) {
      case (?cachedData) {
        ?cachedData;
      };
      case (null) {
        null;
      };
    };
  };

  public shared ({ caller }) func recordAssetData(data : MarketData.MarketData) : async () {
    // Admin-only: Protects data integrity
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record asset data");
    };
    persistentMarketData.add(data.symbol, data);
  };

  public query func fetchAssetList() : async [Text] {
    // Public read access - no auth required
    let assetList = Map.empty<Text, ()>();
    for (data in persistentMarketData.values()) {
      assetList.add(data.symbol, ());
    };
    assetList.keys().toArray();
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    // Transform function for HTTP outcalls - no auth required (system function)
    OutCall.transform(input);
  };

  public query func fetchBinanceFuturesAssets() : async ?UnifiedSnapshot {
    // Public read access - no auth required
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

  public query func filterAssetsByDirection(direction : DirectionType.DirectionType) : async [MarketData.MarketData] {
    // Public read access - no auth required
    let filtered = List.empty<MarketData.MarketData>();
    for ((symbol, data) in persistentMarketData.entries()) {
      if (data.direction == direction) {
        filtered.add(data);
      };
    };
    filtered.toArray();
  };

  // User Preferences Management - User must own preferences
  public shared ({ caller }) func setUserPreferences(input : UserPreferences.UserPreferencesInput) : async UserPreferences.UserPreferences {
    // Users can only set their own preferences, admins can set any
    if (caller != input.user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only set your own preferences");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set preferences");
    };
    
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
    // Users can only view their own preferences, admins can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own preferences");
    };
    persistentUserPreferences.get(user);
  };

  public shared ({ caller }) func getUserPreferencesWithPreferences(user : Principal) : async ?UserPreferences.UserPreferences {
    // Users can only view their own preferences, admins can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own preferences");
    };
    persistentUserPreferences.get(user);
  };

  // Configuration Management - Admin only
  public shared ({ caller }) func configurePollingIntervals(coinsInterval : Nat, binanceInterval : Nat) : async () {
    // Admin-only: System configuration
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure polling intervals");
    };
    refreshIntervalCoins := coinsInterval.toInt() * 1_000_000_000;
    refreshIntervalBinance := binanceInterval.toInt() * 1_000_000_000;
  };

  // External API Calls - User access required to prevent abuse
  public shared ({ caller }) func getCoinGeckoBTC() : async Text {
    // Requires user permission to prevent anonymous abuse
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch external data");
    };
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func getBinanceTradesBTCUSDT() : async Text {
    // Requires user permission to prevent anonymous abuse
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch external data");
    };
    let url = "https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=50";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func getBinanceSpotTickerBTCUSDT() : async Text {
    // Requires user permission to prevent anonymous abuse
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch external data");
    };
    let url = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
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
    binanceSpotTicker : MarketSourceResult;
    binanceSpotDepth : MarketSourceResult;
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

  public shared ({ caller }) func getBinanceSpotDepthBTCUSDT() : async Text {
    // Requires user permission to prevent anonymous abuse
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch external data");
    };
    let url = "https://api.binance.com/api/v3/depth?symbol=BTCUSDT";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func getCryptoMarketSnapshot() : async MarketSnapshot {
    // Requires user permission to prevent anonymous abuse of multiple API calls
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch market snapshots");
    };
    
    let coinGeckoRes = await callWithFallback(getCoinGeckoBTC, "");
    let binanceTradesRes = await callWithFallback(getBinanceTradesBTCUSDT, "");
    let binanceSpotTickerRes = await callWithFallback(getBinanceSpotTickerBTCUSDT, "");
    let binanceSpotDepthRes = await callWithFallback(getBinanceSpotDepthBTCUSDT, "");

    {
      coingeckoBTC = makeSourceResult(coinGeckoRes, if (coinGeckoRes == "") { ?"CoinGecko call failed" } else { null });
      binanceTrades = makeSourceResult(binanceTradesRes, if (binanceTradesRes == "") { ?"Binance trades call failed" } else { null });
      binanceSpotTicker = makeSourceResult(binanceSpotTickerRes, if (binanceSpotTickerRes == "") { ?"Binance spot ticker call failed" } else { null });
      binanceSpotDepth = makeSourceResult(binanceSpotDepthRes, if (binanceSpotDepthRes == "") { ?"Binance spot depth call failed" } else { null });
    };
  };
};
