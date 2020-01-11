# Backtesting stuff

## Backtest

-  Takes list of stocks (or ids)
-  Takes strategy (Signals)
-  (Portfolio with allocation rules, current positions, etc)
-  Start/end

## Strategy

-  Different types of strategies (rules)
-  Called with stock and generates all signals one stock at a time

## Signal

-  Stock
-  Date
-  Side (Buy/Sell)
-  Type (Enter/Exit)
-  Price
-  Gets called for every bar - returns Signal/null
