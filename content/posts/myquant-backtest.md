---
title: "myquant — Browser-Based Quantitative Backtesting Tool"
date: 2026-03-06
tags: ["Quantitative", "Trading", "Backtest", "Tools"]
---

A backtesting tool that runs entirely in the browser — no installation required, just open and use.

## Core Features

- **GJR-GARCH(1,1) + Student-t Data Generation** — Generates simulated market data with realistic statistical properties (fat tails, volatility clustering, leverage effect)
- **8 Market Presets** — Steady Bull, Choppy, Bull-to-Bear, V-Shaped Recovery, Black Swan, Earnings Season, Breakout, High Volatility
- **Multi-Timeframe Support** — Daily / 4H / 1H / 15min / 5min / 1min
- **Full Backtest Engine** — Market / Limit / Stop / Stop-Limit orders, supports both long and short trading
- **Strategy Editor** — Syntax highlighting, autocomplete, syntax check, with built-in strategy templates
- **Visualization** — Candlestick chart (with buy/sell signal markers), equity curve, drawdown curve
- **Save/Load Strategies** — Save current strategy locally, load from local files

## Data Generation Algorithm

Uses a GJR-GARCH(1,1) model with Student-t distribution to generate price series, reproducing the stylized facts of financial time series summarized by Cont (2001):

| Feature | Implementation |
|---------|---------------|
| Fat Tails | Student-t (df=5) instead of Normal distribution |
| Volatility Clustering | Autoregressive structure of GARCH conditional variance |
| Leverage Effect | GJR asymmetric term (γ=0.04) |
| Volume-Price Relationship | Conditional variance drives volume + higher volume on down moves |
| Volume Autocorrelation | EMA smoothing (autocorr=0.4) |
| Intraday J-Curve | High open volume → midday lull → highest volume at close |

## Strategy API

```javascript
class MyStrategy extends Strategy {
  onStrategyStart() { /* initialize */ }
  onBar(bar) {
    // bar: { datetime, open, high, low, close, volume }
    // this.bars — historical bar array
    // this.position — current position
    // this.portfolio — account info
    this.buy(100, 'buy signal');
    this.sellLimit(100, targetPrice, 'take profit');
    this.setStop(stopLevel, StopType.TRAILING, StopMode.PERCENT);
    this.log('message');
  }
}
```

## Try It

**[Open myquant](/tools/myquant-backtest.html)**

All computation runs entirely in your browser — no data is sent to any server.

