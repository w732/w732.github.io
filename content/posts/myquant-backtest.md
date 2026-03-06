---
title: "myquant — 浏览器端量化回测工具"
date: 2026-03-06
tags: ["Quantitative", "Trading", "Backtest", "Tools"]
---

一个完全运行在浏览器中的回测工具，无需安装任何依赖，打开即用。

## 核心功能

- **GJR-GARCH(1,1) + Student-t 数据生成** — 生成具有真实统计特征（肥尾、波动率聚集、杠杆效应）的模拟行情
- **8 种市场预设** — 稳定上涨、震荡市、牛转熊、V 型反转、黑天鹅、财报季、突破行情、高波动
- **多周期支持** — 日线 / 4 小时 / 1 小时 / 15 分钟 / 5 分钟 / 1 分钟
- **完整回测引擎** — 市价单 / 限价单 / 止损单 / 止损限价单，支持多空双向交易
- **策略编辑器** — 语法高亮、自动补全、语法检查，内置多个策略模板
- **可视化** — K 线图（含买卖信号标注）、权益曲线、回撤曲线
- **策略保存/加载** — 保存当前策略到本地，从本地文件加载策略

## 数据生成算法

采用 GJR-GARCH(1,1) 模型配合 Student-t 分布生成价格序列，复现了 Cont (2001) 总结的金融时间序列 stylized facts：

| 特征 | 实现方式 |
|------|----------|
| 肥尾分布 | Student-t (df=5) 替代正态分布 |
| 波动率聚集 | GARCH 条件方差的自回归结构 |
| 杠杆效应 | GJR 非对称项 (γ=0.04) |
| 量价关系 | 条件方差驱动成交量 + 下跌放量 |
| 成交量自相关 | EMA 平滑 (autocorr=0.4) |
| 日内 J 形曲线 | 开盘放量 → 午间缩量 → 尾盘放量最大 |

## 策略 API

```javascript
class MyStrategy extends Strategy {
  onStrategyStart() { /* 初始化 */ }
  onBar(bar) {
    // bar: { datetime, open, high, low, close, volume }
    // this.bars — 历史 K 线数组
    // this.position — 当前持仓
    // this.portfolio — 账户信息
    this.buy(100, 'buy signal');
    this.sellLimit(100, targetPrice, 'take profit');
    this.setStop(stopLevel, StopType.TRAILING, StopMode.PERCENT);
    this.log('message');
  }
}
```

## 试试看

**[打开 myquant ](/tools/myquant-backtest.html)**

所有计算完全在浏览器本地运行，不会发送任何数据到服务器。

