## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Add Trade
**POST** `/api/trades`

```json
{
  "ticker": "BTC",
  "side": "buy",
  "qty": "1.5",
  "price": "40000"
}
```

### Get Portfolio
**GET** `/api/portfolio`

Returns current holdings with average entry prices and unrealized PnL.

### Get PnL Summary
**GET** `/api/pnl`

Returns total realized and unrealized PnL across all positions.

## Technical Approach

### Weighted Average Method

The service uses a **weighted average** approach for calculating entry prices, which is the industry standard for portfolio management. When you buy more of an asset at different prices, the system calculates the new average entry price as:

```
New Average = (Previous Total Cost + New Trade Cost) / Total Quantity
```

### Decimal.js for Financial Precision

All monetary calculations use `Decimal.js` instead of JavaScript's native `Number` type. This prevents floating-point precision errors that can occur with financial calculations.

### Production-Ready Improvements

For a production exchange, several enhancements would be implemented:

#### 1. **Cent-Based Pricing**
Instead of storing prices as dollars (e.g., $40,000), production exchanges store prices in cents (e.g., 4,000,000 cents). This eliminates decimal places entirely:

```typescript
// Current approach
const price = new Decimal("40000.50"); // $40,000.50

// Production approach
const priceInCents = 4000050; // 4,000,050 cents = $40,000.50
```

## Test Coverage

The test suite covers:

- **Weighted average calculations** for multiple buys
- **Realized PnL** when selling positions  
- **Unrealized PnL** with custom price scenarios
- **Multi-asset portfolios** with different tickers
- **Edge cases** like zero quantities and price variations

Run tests with custom prices to verify calculations:

```bash
npm test
```

## Architecture

```
src/
├── core/           # Business logic (PositionsManager)
├── routes/         # API endpoints
├── types/          # TypeScript interfaces
├── constants.ts    # Configuration and default prices
└── index.ts        # Express server setup

tests/
└── index.test.ts   # Comprehensive test suite
```

## Assumptions & Design Decisions

1. **Single User**: Designed for one user per service instance
2. **Weighted Average**: Chosen over FIFO for simplicity and industry standard
3. **In-Memory Storage**: No database for demo purposes
4. **Hardcoded Prices**: Current market prices are static for testing
5. **Decimal Precision**: All calculations use Decimal.js for accuracy
6. **RESTful Design**: Simple HTTP endpoints for easy integration


