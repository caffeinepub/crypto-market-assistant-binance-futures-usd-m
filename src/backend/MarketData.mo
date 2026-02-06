import DirectionType "DirectionType";

module {
  public type MarketData = {
    symbol : Text;
    price : Float;
    volume : Float;
    direction : DirectionType.DirectionType;
  };
};
