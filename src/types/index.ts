import Decimal from "decimal.js";

export type ITrade = {
  id?: string;
  ticker: Ticker;
  side: "buy" | "sell";
  qty: string;
  price: string;
  timestamp: number; // in seconds
};

export interface IPosition {
  qty: Decimal;
  avg: Decimal;
  realizedPnL: Decimal; // accumulated realized PnL
  unrealizedPnL?: Decimal; // accumulated unrealized PnL
}

export enum Ticker {
  BTC = "BTC",
  ETH = "ETH",
  SOL = "SOL",
}
