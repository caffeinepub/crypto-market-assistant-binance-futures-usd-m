import Theme "Theme";
import Principal "mo:core/Principal";
import MarketData "MarketData";

module {
  public type UserPreferences = {
    favourites : [MarketData.MarketData];
    theme : Theme.Theme;
    enableAlerts : Bool;
    language : Text;
  };

  // Type for incoming user preferences input including principal
  public type UserPreferencesInput = {
    user : Principal;
    favourites : [MarketData.MarketData];
    theme : Theme.Theme;
    enableAlerts : Bool;
    language : Text;
  };
};
