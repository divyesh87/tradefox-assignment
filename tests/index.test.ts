import { PositionsManager } from "../src/core";
import { Ticker } from "../src/types";
import Decimal from "decimal.js";

describe("Portfolio PnL Test Case", () => {
  let positionsManager: PositionsManager;

  beforeEach(() => {
    // Create a fresh instance for each test
    positionsManager = new PositionsManager();
  });

  it("should calculate average entry price correctly for multiple buys", () => {
    // Define custom prices for this test
    const customPrices = {
      [Ticker.BTC]: new Decimal(45000), // BTC at 45,000
      [Ticker.ETH]: new Decimal(3500), // ETH at default price
      [Ticker.SOL]: new Decimal(180), // SOL at default price
    };

    // Buy 1 BTC @ 40,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "40000",
      timestamp: Date.now() / 1000,
    });

    // Buy 1 BTC @ 42,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "42000",
      timestamp: Date.now() / 1000,
    });

    const portfolio = positionsManager.getPortfolio(customPrices);
    const btcPosition = portfolio[Ticker.BTC];

    // Total cost: (1 * 40,000) + (1 * 42,000) = 82,000
    // Total quantity: 2
    // Average: 82,000 / 2 = 41,000
    expect(btcPosition.qty.toString()).toBe("2");
    expect(btcPosition.avg.toString()).toBe("41000");

    // With BTC at 45,000, unrealized PnL should be: (45,000 - 41,000) * 2 = 8,000
    expect(btcPosition.unrealizedPnL?.toString()).toBe("8000");
  });

  it("should calculate realized PnL correctly when selling", () => {
    // Define custom prices for this test
    const customPrices = {
      [Ticker.BTC]: new Decimal(46000), // BTC at 46,000
      [Ticker.ETH]: new Decimal(3500), // ETH at default price
      [Ticker.SOL]: new Decimal(180), // SOL at default price
    };

    // Buy 1 BTC @ 40,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "40000",
      timestamp: Date.now() / 1000,
    });

    // Buy 1 BTC @ 42,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "42000",
      timestamp: Date.now() / 1000,
    });

    // Sell 1 BTC @ 43,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "sell",
      qty: "1",
      price: "43000",
      timestamp: Date.now() / 1000,
    });

    const portfolio = positionsManager.getPortfolio(customPrices);
    const btcPosition = portfolio[Ticker.BTC];

    // Realized PnL: (43,000 - 41,000) * 1 = 2,000
    expect(btcPosition.realizedPnL.toString()).toBe("2000");

    // With BTC at 46,000, unrealized PnL should be: (46,000 - 41,000) * 1 = 5,000
    expect(btcPosition.unrealizedPnL?.toString()).toBe("5000");
  });

  it("should handle the complete BTC trading scenario", () => {
    // Define custom prices for this test
    const customPrices = {
      [Ticker.BTC]: new Decimal(44000), // BTC at 44,000 for unrealized PnL calculation
      [Ticker.ETH]: new Decimal(3500), // ETH at default price
      [Ticker.SOL]: new Decimal(180), // SOL at default price
    };

    // Step 1: Add trade → Buy 1 BTC @ 40,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "40000",
      timestamp: Date.now() / 1000,
    });

    // Step 2: Add trade → Buy 1 BTC @ 42,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "42000",
      timestamp: Date.now() / 1000,
    });

    // Check portfolio after 2 buys: 2 BTC, avg entry = 41,000
    const portfolioAfterBuys = positionsManager.getPortfolio(customPrices);
    expect(portfolioAfterBuys[Ticker.BTC]).toBeDefined();
    expect(portfolioAfterBuys[Ticker.BTC].qty.toString()).toBe("2");
    expect(portfolioAfterBuys[Ticker.BTC].avg.toString()).toBe("41000");
    expect(portfolioAfterBuys[Ticker.BTC].realizedPnL.toString()).toBe("0");

    // Step 3: Add trade → Sell 1 BTC @ 43,000
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "sell",
      qty: "1",
      price: "43000",
      timestamp: Date.now() / 1000,
    });

    // Check realized PnL = +2,000 (43,000 - 41,000 = 2,000)
    const pnlAfterSell = positionsManager.getPnL(customPrices);
    expect(pnlAfterSell.realizedPnL.toString()).toBe("2000");

    // Check portfolio: 1 BTC, avg entry = 41,000
    const portfolioAfterSell = positionsManager.getPortfolio(customPrices);
    expect(portfolioAfterSell[Ticker.BTC]).toBeDefined();
    expect(portfolioAfterSell[Ticker.BTC].qty.toString()).toBe("1");
    expect(portfolioAfterSell[Ticker.BTC].avg.toString()).toBe("41000");
    expect(portfolioAfterSell[Ticker.BTC].realizedPnL.toString()).toBe("2000");

    // Step 4: Check Unrealized PnL (if BTC = 44,000) = +3,000
    // With BTC at 44,000: (44,000 - 41,000) * 1 = 3,000
    const currentUnrealizedPnL = portfolioAfterSell[Ticker.BTC].unrealizedPnL;
    expect(currentUnrealizedPnL?.toString()).toBe("3000"); // (44000 - 41000) * 1

    // Verify the total PnL calculation
    const totalPnL = positionsManager.getPnL(customPrices);
    expect(totalPnL.realizedPnL.toString()).toBe("2000");
    expect(totalPnL.unrealizedPnL.toString()).toBe("3000");
  });

  it("should handle multiple tickers with different custom prices", () => {
    // Define custom prices for this test
    const customPrices = {
      [Ticker.BTC]: new Decimal(50000), // BTC at 50,000
      [Ticker.ETH]: new Decimal(4000), // ETH at 4,000
      [Ticker.SOL]: new Decimal(200), // SOL at 200
    };

    // BTC trades
    positionsManager.addTrade({
      ticker: Ticker.BTC,
      side: "buy",
      qty: "1",
      price: "40000",
      timestamp: Date.now() / 1000,
    });

    // ETH trades
    positionsManager.addTrade({
      ticker: Ticker.ETH,
      side: "buy",
      qty: "2",
      price: "3000",
      timestamp: Date.now() / 1000,
    });

    // SOL trades
    positionsManager.addTrade({
      ticker: Ticker.SOL,
      side: "buy",
      qty: "10",
      price: "150",
      timestamp: Date.now() / 1000,
    });

    const portfolio = positionsManager.getPortfolio(customPrices);
    const pnl = positionsManager.getPnL(customPrices);

    // BTC: 1 BTC @ 40,000, current price 50,000
    // Unrealized PnL: (50,000 - 40,000) * 1 = 10,000
    expect(portfolio[Ticker.BTC].unrealizedPnL?.toString()).toBe("10000");

    // ETH: 2 ETH @ 3,000, current price 4,000
    // Unrealized PnL: (4,000 - 3,000) * 2 = 2,000
    expect(portfolio[Ticker.ETH].unrealizedPnL?.toString()).toBe("2000");

    // SOL: 10 SOL @ 150, current price 200
    // Unrealized PnL: (200 - 150) * 10 = 500
    expect(portfolio[Ticker.SOL].unrealizedPnL?.toString()).toBe("500");

    // Total unrealized PnL: 10,000 + 2,000 + 500 = 12,500
    expect(pnl.unrealizedPnL.toString()).toBe("12500");
    expect(pnl.realizedPnL.toString()).toBe("0");
  });
});
