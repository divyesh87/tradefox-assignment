import { PRICES } from "../constants";
import { IPosition, ITrade } from "../types";
import Decimal from "decimal.js";

export class PositionsManager {
  public trades: ITrade[] = [];
  private portfolio: Record<string, IPosition> = {};

  public addTrade(trade: ITrade): void {
    const { ticker, side, qty, price, timestamp } = trade;
    const p = new Decimal(price);
    const q = new Decimal(qty);

    this.trades.push({
      id: crypto.randomUUID(),
      ...trade,
    });

    if (!this.portfolio[ticker]) {
      this.portfolio[ticker] = {
        qty: new Decimal(0),
        avg: new Decimal(0),
        realizedPnL: new Decimal(0),
      };
    }

    const pos = this.portfolio[ticker];

    if (side === "buy") {
      const totalCost = pos.avg.times(pos.qty).plus(p.times(q));
      pos.qty = pos.qty.plus(q);
      pos.avg = totalCost.div(pos.qty);
    } else if (side === "sell") {
      if (q.greaterThan(pos.qty)) {
        throw new Error(`Cannot sell more ${ticker} than you hold`);
      }

      const realized = p.minus(pos.avg).times(q);
      pos.realizedPnL = pos.realizedPnL.plus(realized);
      pos.qty = pos.qty.minus(q);

      if (pos.qty.eq(0)) {
        pos.avg = new Decimal(0);
      }
    }
  }

  public getPortfolio(prices = PRICES) {
    const result: Record<string, IPosition> = {};

    for (const [symbol, pos] of Object.entries(this.portfolio)) {
      const latest = prices[symbol] ?? new Decimal(0);
      const unrealized = latest.minus(pos.avg).times(pos.qty);

      if (pos.qty.eq(0)) {
        continue;
      }

      result[symbol] = {
        qty: pos.qty,
        avg: pos.avg,
        unrealizedPnL: unrealized,
        realizedPnL: pos.realizedPnL,
      };
    }

    return result;
  }

  public getPnL(prices = PRICES) {
    let totalRealized = new Decimal(0);
    let totalUnrealized = new Decimal(0);

    for (const [symbol, pos] of Object.entries(this.portfolio)) {
      const latest = prices[symbol] ?? new Decimal(0);

      totalRealized = totalRealized.plus(pos.realizedPnL);
      totalUnrealized = totalUnrealized.plus(
        latest.minus(pos.avg).times(pos.qty)
      );
    }

    return {
      realizedPnL: totalRealized,
      unrealizedPnL: totalUnrealized,
    };
  }
}

// export a singleton instance (since its a single user app)
export const positionsManager = new PositionsManager();
