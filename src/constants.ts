import { Ticker } from "./types";
import Decimal from "decimal.js";

export const config = {
  server: {
    port: process.env.PORT || 3000,
  },
};

export const PRICES = {
  [Ticker.BTC]: new Decimal(44000),
  [Ticker.ETH]: new Decimal(3500),
  [Ticker.SOL]: new Decimal(180),
};
