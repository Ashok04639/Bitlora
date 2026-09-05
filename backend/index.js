const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bitlora Exchange API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Bitlora Exchange API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/balance", (req, res) => {
  res.json({
    success: true,
    currency: "USDT",
    balance: 12458.8,
    change24h: 4.82,
    btcEquivalent: 0.186,
  });
});

app.get("/api/assets", (req, res) => {
  res.json({
    success: true,
    assets: [
      {
        icon: "₿",
        name: "Bitcoin",
        symbol: "BTC",
        amount: "0.0024 BTC",
        value: "$158.42",
      },
      {
        icon: "Ξ",
        name: "Ethereum",
        symbol: "ETH",
        amount: "0.041 ETH",
        value: "$132.18",
      },
      {
        icon: "◆",
        name: "BNB",
        symbol: "BNB",
        amount: "0.18 BNB",
        value: "$116.70",
      },
    ],
  });
});

app.get("/api/markets", (req, res) => {
  res.json({
    success: true,
    markets: [
      { pair: "BTC/USDT", price: "$66,842.10", change: "+2.41%" },
      { pair: "ETH/USDT", price: "$3,224.50", change: "+1.82%" },
      { pair: "BNB/USDT", price: "$648.30", change: "-0.74%" },
      { pair: "SOL/USDT", price: "$182.45", change: "+3.16%" },
      { pair: "DOGE/USDT", price: "$0.1742", change: "+2.87%" },
      { pair: "SHIB/USDT", price: "$0.00001284", change: "+1.94%" },
      { pair: "ADA/USDT", price: "$0.8215", change: "+1.27%" },
      { pair: "XRP/USDT", price: "$2.74", change: "+2.08%" },
      { pair: "TRX/USDT", price: "$0.3438", change: "+0.92%" },
      { pair: "AVAX/USDT", price: "$28.64", change: "-1.12%" },
      { pair: "LINK/USDT", price: "$18.42", change: "+2.35%" },
      { pair: "DOT/USDT", price: "$4.76", change: "+1.08%" },
      { pair: "ICP/USDT", price: "$5.91", change: "+1.76%" },
      { pair: "LTC/USDT", price: "$68.25", change: "+0.64%" },
      { pair: "TON/USDT", price: "$3.18", change: "-0.58%" },
      { pair: "BTC/USDC", price: "$66,842.10", change: "+2.41%" },
      { pair: "ETH/USDC", price: "$3,224.50", change: "+1.82%" },
      { pair: "SOL/USDC", price: "$182.45", change: "+3.16%" },
      { pair: "BNB/USDC", price: "$648.30", change: "-0.74%" },
      { pair: "XRP/USDC", price: "$2.74", change: "+2.08%" },
      { pair: "ADA/USDC", price: "$0.8215", change: "+1.27%" },
      { pair: "ETH/BTC", price: "0.04824", change: "-0.61%" },
      { pair: "BNB/BTC", price: "0.00969", change: "-1.12%" },
      { pair: "SOL/BTC", price: "0.00273", change: "+0.74%" },
      { pair: "LTC/BTC", price: "0.00102", change: "+0.31%" },
      { pair: "LINK/BTC", price: "0.000276", change: "+1.08%" },
      { pair: "BTC/ETH", price: "20.72", change: "+0.62%" },
      { pair: "BNB/ETH", price: "0.2010", change: "-0.34%" },
      { pair: "SOL/ETH", price: "0.05657", change: "+1.21%" },
      { pair: "LINK/ETH", price: "0.00571", change: "+0.47%" }
    ],
  });
});

app.get("/api/transactions", (req, res) => {
  res.json({
    success: true,
    transactions: [
      {
        type: "Deposit",
        asset: "Bitcoin",
        amount: "+$500.00",
        direction: "in"
      },
      {
        type: "Trade",
        asset: "BTC/USDT",
        amount: "-$120.00",
        direction: "out"
      }
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Bitlora API running on port ${PORT}`);
});
