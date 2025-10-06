import { positionsManager } from "../core";
import { ITrade, Ticker } from "../types";
import Decimal from "decimal.js";

export async function setupRoutes(app) {
  app.post("api/trade", validateTrade, (req, res) => {
    try {
      const { ticker, side, qty, price } = req.body as any;
      const trade: ITrade = { ticker, side, qty, price, timestamp: +new Date() };
      positionsManager.addTrade(trade);
      res.json({ success: true });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message ?? "Internal server error" });
    }
  });

  app.get("api/portfolio", (req, res) => {
    try {
      const portfolio = positionsManager.getPortfolio();
      res.json(portfolio);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message ?? "Internal server error" });
    }
  });

  app.get("api/pnl", (req, res) => {
    try {
      const pnl = positionsManager.getPnL();
      res.json(pnl);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message ?? "Internal server error" });
    }
  });
}

const validateTrade = (req: any, res: any, next: any) => {
  const { ticker, side, qty, price, timestamp } = req.body as any;

  if (!Object.values(Ticker).includes(ticker)) {
    return res.status(400).json({ error: "Invalid ticker" });
  }

  if (!Object.values(["buy", "sell"]).includes(side)) {
    return res.status(400).json({ error: "Invalid side" });
  }

  if (
    Decimal(qty).isNaN() ||
    Decimal(price).isNaN() ||
    isNaN(Number(timestamp))
  ) {
    return res
      .status(400)
      .json({ error: "Invalid quantity, price, or timestamp" });
  }

  next();
};
