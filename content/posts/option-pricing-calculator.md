---
title: "Option Pricing Calculator - Black-Scholes & American Options with Greeks"
date: 2026-01-22
tags: ["Finance", "Options", "Tools", "Quantitative"]
---

I'm sharing an option pricing calculator I built that supports both European and American style options with full Greeks calculation.

## Features

- **Pricing Models**: Black-Scholes for European options, Binomial tree for American options
- **Full Greeks**: Delta, Gamma, Vega, Theta, Rho and more
- **Implied Volatility**: Calculate IV from market price
- **Intraday Precision**: Supports trading hours and current time for precise DTE calculation
- **Trading Days Mode**: Option to use trading days (excludes weekends and holidays) instead of calendar days
- **Dividend Support**: Add discrete dividends with ex-dividend dates
- **Holiday Calendar**: Customizable holiday list for accurate trading day calculation

## How to Use

1. Enter the option parameters (trade date, expiry, spot price, strike, volatility, etc.)
2. Choose between Call/Put and American/European style
3. Configure trading hours and holidays if needed
4. Click "Calculate" to get the option price and Greeks
5. Use the "Implied Vol" tab to calculate implied volatility from a market price

## Try It Out

Click the link below to open the calculator:

**[Open Option Calculator](/tools/option-calculator.html)**

## Technical Notes

- The calculator uses a high-performance pricing engine written in JavaScript
- American options are priced using a binomial tree model with 255 time steps
- Greeks are calculated using finite difference methods
- All calculations run locally in your browser - no data is sent to any server

Useful for options traders, quants, and anyone learning about derivatives pricing.

Enjoy!
