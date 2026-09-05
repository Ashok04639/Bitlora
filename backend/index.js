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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Bitlora API running on port ${PORT}`);
});