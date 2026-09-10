const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const db = require("./database");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const MARKETS = [
  { pair: "BTC/USDT", price: 66842.10, change: "+2.41%" },
  { pair: "ETH/USDT", price: 3224.50, change: "+1.82%" },
  { pair: "BNB/USDT", price: 648.30, change: "-0.74%" },
  { pair: "SOL/USDT", price: 182.45, change: "+3.16%" },
  { pair: "DOGE/USDT", price: 0.1742, change: "+2.87%" },
  { pair: "SHIB/USDT", price: 0.00001284, change: "+1.94%" },
  { pair: "ADA/USDT", price: 0.8215, change: "+1.27%" },
  { pair: "XRP/USDT", price: 2.74, change: "+2.08%" },
  { pair: "TRX/USDT", price: 0.3438, change: "+0.92%" },
  { pair: "AVAX/USDT", price: 28.64, change: "-1.12%" },
  { pair: "LINK/USDT", price: 18.42, change: "+2.35%" },
  { pair: "DOT/USDT", price: 4.76, change: "+1.08%" },
  { pair: "ICP/USDT", price: 5.91, change: "+1.76%" },
  { pair: "LTC/USDT", price: 68.25, change: "+0.64%" },
  { pair: "TON/USDT", price: 3.18, change: "-0.58%" },
  { pair: "BTC/USDC", price: 66842.10, change: "+2.41%" },
  { pair: "ETH/USDC", price: 3224.50, change: "+1.82%" },
  { pair: "SOL/USDC", price: 182.45, change: "+3.16%" },
  { pair: "BNB/USDC", price: 648.30, change: "-0.74%" },
  { pair: "XRP/USDC", price: 2.74, change: "+2.08%" },
  { pair: "ADA/USDC", price: 0.8215, change: "+1.27%" },
  { pair: "ETH/BTC", price: 0.04824, change: "-0.61%" },
  { pair: "BNB/BTC", price: 0.00969, change: "-1.12%" },
  { pair: "SOL/BTC", price: 0.00273, change: "+0.74%" },
  { pair: "LTC/BTC", price: 0.00102, change: "+0.31%" },
  { pair: "LINK/BTC", price: 0.000276, change: "+1.08%" },
  { pair: "BTC/ETH", price: 20.72, change: "+0.62%" },
  { pair: "BNB/ETH", price: 0.2010, change: "-0.34%" },
  { pair: "SOL/ETH", price: 0.05657, change: "+1.21%" },
  { pair: "LINK/ETH", price: 0.00571, change: "+0.47%" }
];

function getMarketPrice(pair) {
  const market = MARKETS.find((item) => item.pair === pair);
  return market ? Number(market.price) : 0;
}

function splitPair(pair) {
  const parts = String(pair || "").split("/");
  return {
    base: parts[0],
    quote: parts[1]
  };
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function createOrderId(prefix = "BL") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function getBalance(userId, currency) {
  return db.prepare(
    "SELECT * FROM balances WHERE user_id = ? AND currency = ?"
  ).get(userId, currency);
}

function ensureBalance(userId, currency) {
  let balance = getBalance(userId, currency);

  if (!balance) {
    db.prepare(
      "INSERT INTO balances (user_id, currency, available, locked) VALUES (?, ?, 0, 0)"
    ).run(userId, currency);

    balance = getBalance(userId, currency);
  }

  return balance;
}

function moveAvailableToLocked(userId, currency, amount) {
  const balance = ensureBalance(userId, currency);

  if (Number(balance.available) < amount) {
    return false;
  }

  db.prepare(`
    UPDATE balances
    SET available = available - ?,
        locked = locked + ?
    WHERE user_id = ? AND currency = ?
  `).run(amount, amount, userId, currency);

  return true;
}

function unlockBalance(userId, currency, amount) {
  db.prepare(`
    UPDATE balances
    SET available = available + ?,
        locked = MAX(0, locked - ?)
    WHERE user_id = ? AND currency = ?
  `).run(amount, amount, userId, currency);
}

function executeOrder(order, executionPrice) {
  const { base, quote } = splitPair(order.pair);
  const amount = Number(order.remaining_amount);
  const price = Number(executionPrice);
  const total = amount * price;

  const transaction = db.transaction(() => {
    const current = db.prepare(
      "SELECT * FROM orders WHERE id = ?"
    ).get(order.id);

    if (!current || current.status !== "Open") {
      return false;
    }

    if (current.side === "Buy") {
      const quoteBalance = ensureBalance(current.user_id, quote);

      if (Number(quoteBalance.locked) + 1e-12 < total) {
        db.prepare(
          "UPDATE orders SET status = 'Rejected' WHERE id = ?"
        ).run(current.id);
        return false;
      }

      const reservedQuote = Number(current.price) * amount;
      const spentQuote = total;
      const refundQuote = Math.max(0, reservedQuote - spentQuote);

      db.prepare(`
        UPDATE balances
        SET locked = MAX(0, locked - ?),
            available = available + ?
        WHERE user_id = ? AND currency = ?
      `).run(
        reservedQuote,
        refundQuote,
        current.user_id,
        quote
      );

      db.prepare(`
        INSERT INTO balances (user_id, currency, available, locked)
        VALUES (?, ?, ?, 0)
        ON CONFLICT(user_id, currency)
        DO UPDATE SET available = balances.available + excluded.available
      `).run(current.user_id, base, amount);
    } else {
      const baseBalance = ensureBalance(current.user_id, base);

      if (Number(baseBalance.locked) + 1e-12 < amount) {
        db.prepare(
          "UPDATE orders SET status = 'Rejected' WHERE id = ?"
        ).run(current.id);
        return false;
      }

      db.prepare(`
        UPDATE balances
        SET locked = MAX(0, locked - ?)
        WHERE user_id = ? AND currency = ?
      `).run(amount, current.user_id, base);

      db.prepare(`
        INSERT INTO balances (user_id, currency, available, locked)
        VALUES (?, ?, ?, 0)
        ON CONFLICT(user_id, currency)
        DO UPDATE SET available = balances.available + excluded.available
      `).run(current.user_id, quote, total);
    }

    db.prepare(`
      UPDATE orders
      SET remaining_amount = 0,
          total = ?,
          price = ?,
          status = 'Filled'
      WHERE id = ?
    `).run(total, price, current.id);

    console.log(
      "Standalone order filled:",
      current.id,
      current.side,
      current.pair,
      amount,
      price
    );

    return true;
  });

  try {
    return transaction();
  } catch (error) {
    console.error("Order execution error:", error.message);
    return false;
  }
}

function cancelLinkedOco(orderId) {
  const order = db.prepare(
    "SELECT * FROM orders WHERE id = ?"
  ).get(orderId);

  if (!order || !order.oco_group_id) {
    return;
  }

  const linked = db.prepare(`
    SELECT * FROM orders
    WHERE oco_group_id = ?
      AND id != ?
      AND status = 'Open'
  `).all(order.oco_group_id, orderId);

  for (const item of linked) {
    const { base, quote } = splitPair(item.pair);
    const currency = item.side === "Buy" ? quote : base;
    const lockedAmount =
      item.side === "Buy"
        ? Number(item.price) * Number(item.remaining_amount)
        : Number(item.remaining_amount);

    unlockBalance(item.user_id, currency, lockedAmount);

    db.prepare(`
      UPDATE orders
      SET status = 'Canceled',
          remaining_amount = 0
      WHERE id = ?
    `).run(item.id);
  }
}

function processConditionalOrders() {
  const orders = db.prepare(`
    SELECT * FROM orders
    WHERE status = 'Open'
      AND type IN ('Stop-Limit', 'Stop-Market', 'OCO')
      AND trigger_price IS NOT NULL
  `).all();

  for (const order of orders) {
    const marketPrice = getMarketPrice(order.pair);
    const trigger = Number(order.trigger_price);

    if (!Number.isFinite(marketPrice) || !Number.isFinite(trigger)) {
      continue;
    }

    let triggered = false;

    if (order.side === "Buy") {
      triggered = marketPrice >= trigger;
    } else {
      triggered = marketPrice <= trigger;
    }

    if (!triggered) {
      continue;
    }

    if (order.type === "Stop-Market") {
      if (executeOrder(order, marketPrice)) {
        cancelLinkedOco(order.id);
      }
      continue;
    }

    if (order.type === "Stop-Limit" || order.type === "OCO") {
      const executionPrice =
        Number(order.stop_limit_price || order.price || marketPrice);

      if (executeOrder(order, executionPrice)) {
        cancelLinkedOco(order.id);
      }
    }
  }
}

function processLimitMatching() {
  const openOrders = db.prepare(`
    SELECT * FROM orders
    WHERE status = 'Open'
      AND type = 'Limit'
    ORDER BY created_at ASC
  `).all();

  for (const buy of openOrders.filter((o) => o.side === "Buy")) {
    const sell = openOrders.find(
      (o) =>
        o.side === "Sell" &&
        o.pair === buy.pair &&
        Number(o.price) <= Number(buy.price) &&
        o.status === "Open"
    );

    if (!sell) {
      continue;
    }

    const amount = Math.min(
      Number(buy.remaining_amount),
      Number(sell.remaining_amount)
    );

    const price = Number(sell.price);

    const buyTotal = amount * price;

    try {
      db.transaction(() => {
        const buyCurrent = db.prepare(
          "SELECT * FROM orders WHERE id = ?"
        ).get(buy.id);

        const sellCurrent = db.prepare(
          "SELECT * FROM orders WHERE id = ?"
        ).get(sell.id);

        if (
          !buyCurrent ||
          !sellCurrent ||
          buyCurrent.status !== "Open" ||
          sellCurrent.status !== "Open"
        ) {
          return;
        }

        const { base, quote } = splitPair(buy.pair);

        db.prepare(`
          UPDATE balances
          SET locked = MAX(0, locked - ?)
          WHERE user_id = ? AND currency = ?
        `).run(buyTotal, buy.user_id, quote);

        db.prepare(`
          UPDATE balances
          SET locked = MAX(0, locked - ?)
          WHERE user_id = ? AND currency = ?
        `).run(amount, sell.user_id, base);

        db.prepare(`
          INSERT INTO balances (user_id, currency, available, locked)
          VALUES (?, ?, ?, 0)
          ON CONFLICT(user_id, currency)
          DO UPDATE SET available = balances.available + excluded.available
        `).run(buy.user_id, base, amount);

        db.prepare(`
          INSERT INTO balances (user_id, currency, available, locked)
          VALUES (?, ?, ?, 0)
          ON CONFLICT(user_id, currency)
          DO UPDATE SET available = balances.available + excluded.available
        `).run(sell.user_id, quote, buyTotal);

        const buyRemaining =
          Number(buyCurrent.remaining_amount) - amount;

        const sellRemaining =
          Number(sellCurrent.remaining_amount) - amount;

        db.prepare(`
          UPDATE orders
          SET remaining_amount = ?,
              status = ?
          WHERE id = ?
        `).run(
          buyRemaining,
          buyRemaining <= 1e-12 ? "Filled" : "Open",
          buy.id
        );

        db.prepare(`
          UPDATE orders
          SET remaining_amount = ?,
              status = ?
          WHERE id = ?
        `).run(
          sellRemaining,
          sellRemaining <= 1e-12 ? "Filled" : "Open",
          sell.id
        );

        db.prepare(`
          INSERT INTO trades
          (buy_order_id, sell_order_id, pair, price, amount, total)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          buy.id,
          sell.id,
          buy.pair,
          price,
          amount,
          buyTotal
        );
      })();

      const buyFilled = buyRemaining <= 1e-12;
        const sellFilled = sellRemaining <= 1e-12;

        if (buyFilled) {
          cancelLinkedOco(buy.id);
        }

        if (sellFilled) {
          cancelLinkedOco(sell.id);
        }
    } catch (error) {
      console.error("Limit matching error:", error.message);
    }
  }
}

setInterval(() => {
  try {
    processConditionalOrders();
    processLimitMatching();
  } catch (error) {
    console.error("Order engine error:", error.message);
  }
}, 1500);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bitlora Exchange API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Bitlora Exchange API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/balance", (req, res) => {
  const userId = Number(req.query.userId || 1);

  const balances = db.prepare(`
    SELECT currency, available, locked
    FROM balances
    WHERE user_id = ?
    ORDER BY currency
  `).all(userId);

  const assets = balances.map((item) => {
    const available = Number(item.available) || 0;
    const locked = Number(item.locked) || 0;
    const total = available + locked;

    const price =
      item.currency === "USDT"
        ? 1
        : getMarketPrice(`${item.currency}/USDT`);

    return {
      currency: item.currency,
      available,
      locked,
      total,
      price,
      value: total * price
    };
  });

  const totalBalance = assets.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const availableTotal = assets.reduce(
    (sum, item) => sum + (item.available * item.price),
    0
  );

  const lockedTotal = assets.reduce(
    (sum, item) => sum + (item.locked * item.price),
    0
  );

  const usdt = assets.find((item) => item.currency === "USDT") || {
    available: 0,
    locked: 0
  };

  const btcPrice = getMarketPrice("BTC/USDT");
  const btcEquivalent = btcPrice > 0
    ? totalBalance / btcPrice
    : 0;

  res.json({
    success: true,
    currency: "USDT",
    balance: usdt.available,
    locked: usdt.locked,
    totalBalance,
    availableTotal,
    lockedTotal,
    btcEquivalent,
    change24h: 0
  });
});

app.get("/api/assets", (req, res) => {
  const userId = Number(req.query.userId || 1);

  const balances = db.prepare(`
    SELECT currency, available, locked
    FROM balances
    WHERE user_id = ?
    ORDER BY currency
  `).all(userId);

  const assets = balances.map((item) => {
    const price =
      getMarketPrice(`${item.currency}/USDT`) ||
      (item.currency === "USDT" ? 1 : 0);

    return {
      icon:
        item.currency === "BTC" ? "₿" :
        item.currency === "ETH" ? "Ξ" :
        item.currency === "BNB" ? "◆" : "●",
      name: item.currency === "USDT" ? "Tether" : item.currency,
      symbol: item.currency,
      amount: Number(item.available),
      locked: Number(item.locked),
      value: (Number(item.available) + Number(item.locked)) * price
    };
  });

  res.json({
    success: true,
    assets
  });
});

app.get("/api/markets", (req, res) => {
  res.json({
    success: true,
    markets: MARKETS.map((item) => ({
      pair: item.pair,
      price: `$${item.price.toLocaleString("en-US", {
        maximumFractionDigits: 8
      })}`,
      change: item.change
    }))
  });
});

app.get("/api/transactions", (req, res) => {
  const userId = Number(req.query.userId || 1);

  const rows = db.prepare(`
    SELECT type, currency, amount, status, created_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(userId);

  res.json({
    success: true,
    transactions: rows.map((item) => ({
      type: item.type,
      asset: item.currency,
      amount: `${item.type === "Deposit" ? "+" : "-"}$${Number(item.amount).toFixed(2)}`,
      direction: item.type === "Deposit" ? "in" : "out",
      status: item.status,
      time: item.created_at
    }))
  });
});

app.get("/api/orders", (req, res) => {
  const userId = Number(req.query.userId || 1);

  const orders = db.prepare(`
    SELECT *
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).all(userId);

  res.json({
    success: true,
    orders: orders.map((order) => ({
      ...order,
      price: Number(order.price),
      amount: Number(order.amount),
      remaining_amount: Number(order.remaining_amount),
      total: Number(order.total),
      trigger_price:
        order.trigger_price == null ? null : Number(order.trigger_price),
      take_profit_price:
        order.take_profit_price == null ? null : Number(order.take_profit_price),
      stop_loss_price:
        order.stop_loss_price == null ? null : Number(order.stop_loss_price),
      stop_limit_price:
        order.stop_limit_price == null ? null : Number(order.stop_limit_price),
      time: order.created_at
    }))
  });
});

app.post("/api/orders", (req, res) => {
  const {
    userId = 1,
    pair,
    side,
    type = "Limit",
    price,
    amount,
    triggerPrice,
    takeProfitPrice,
    stopLossPrice,
    stopLimitPrice
  } = req.body;

  const user = Number(userId);
  const normalizedSide = side === "Sell" ? "Sell" : "Buy";

  const allowedTypes = [
    "Limit",
    "Market",
    "Stop-Limit",
    "Stop-Market",
    "OCO"
  ];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported order type."
    });
  }

  const { base, quote } = splitPair(pair);
  const marketPrice = getMarketPrice(pair);

  if (!base || !quote || !marketPrice) {
    return res.status(400).json({
      success: false,
      message: "Invalid or unsupported trading pair."
    });
  }

  const orderAmount = safeNumber(amount);

  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid amount greater than 0."
    });
  }

  const orderPrice =
    type === "Market"
      ? marketPrice
      : safeNumber(price);

  if (
    ["Limit", "Stop-Limit", "OCO"].includes(type) &&
    (!Number.isFinite(orderPrice) || orderPrice <= 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid order price."
    });
  }

  const trigger =
    triggerPrice == null || triggerPrice === ""
      ? null
      : safeNumber(triggerPrice);

  const stopLimit =
    stopLimitPrice == null || stopLimitPrice === ""
      ? null
      : safeNumber(stopLimitPrice);

  const takeProfit =
    takeProfitPrice == null || takeProfitPrice === ""
      ? null
      : safeNumber(takeProfitPrice);

  const stopLoss =
    stopLossPrice == null || stopLossPrice === ""
      ? null
      : safeNumber(stopLossPrice);

  if (["Stop-Limit", "Stop-Market"].includes(type)) {
    if (!Number.isFinite(trigger) || trigger <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid trigger price."
      });
    }
  }

  if (type === "Stop-Limit") {
    if (!Number.isFinite(stopLimit) || stopLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid stop-limit price."
      });
    }
  }

  if (type === "OCO") {
    if (
      !Number.isFinite(takeProfit) ||
      takeProfit <= 0 ||
      !Number.isFinite(trigger) ||
      trigger <= 0 ||
      !Number.isFinite(stopLimit) ||
      stopLimit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "OCO requires take-profit, stop trigger and stop-limit prices."
      });
    }

    if (normalizedSide === "Sell") {
      if (!(takeProfit > marketPrice && trigger < marketPrice)) {
        return res.status(400).json({
          success: false,
          message: "Sell OCO requires TP above market and stop trigger below market."
        });
      }
    } else {
      if (!(takeProfit < marketPrice && trigger > marketPrice)) {
        return res.status(400).json({
          success: false,
          message: "Buy OCO requires TP below market and stop trigger above market."
        });
      }
    }
  }

  const requiredCurrency = normalizedSide === "Buy" ? quote : base;
  const requiredAmount =
    normalizedSide === "Buy"
      ? orderAmount * orderPrice
      : orderAmount;

  const balance = ensureBalance(user, requiredCurrency);

  if (Number(balance.available) < requiredAmount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient ${requiredCurrency} balance.`
    });
  }

  try {
    if (type === "OCO") {
      const ocoGroupId = createOrderId("OCO");

      if (!moveAvailableToLocked(
        user,
        requiredCurrency,
        requiredAmount
      )) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${requiredCurrency} balance.`
        });
      }

      const tpId = createOrderId("TP");
      const slId = createOrderId("SL");

      db.transaction(() => {
        db.prepare(`
          INSERT INTO orders (
            id, user_id, pair, side, type, price,
            amount, remaining_amount, total, status,
            trigger_price, take_profit_price,
            stop_loss_price, stop_limit_price,
            oco_group_id
          )
          VALUES (?, ?, ?, ?, 'Limit', ?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?)
        `).run(
          tpId,
          user,
          pair,
          normalizedSide,
          takeProfit,
          orderAmount,
          orderAmount,
          orderAmount * takeProfit,
          null,
          takeProfit,
          stopLoss,
          stopLimit,
          ocoGroupId
        );

        db.prepare(`
          INSERT INTO orders (
            id, user_id, pair, side, type, price,
            amount, remaining_amount, total, status,
            trigger_price, take_profit_price,
            stop_loss_price, stop_limit_price,
            oco_group_id
          )
          VALUES (?, ?, ?, ?, 'Stop-Limit', ?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?)
        `).run(
          slId,
          user,
          pair,
          normalizedSide,
          stopLimit,
          orderAmount,
          orderAmount,
          orderAmount * stopLimit,
          trigger,
          takeProfit,
          stopLoss,
          stopLimit,
          ocoGroupId
        );
      })();

      return res.json({
        success: true,
        message: "OCO order placed successfully.",
        order: {
          id: ocoGroupId,
          type: "OCO",
          pair,
          side: normalizedSide,
          amount: orderAmount
        }
      });
    }

    const orderId = createOrderId();

    if (type === "Market") {
      if (normalizedSide === "Buy") {
        if (!moveAvailableToLocked(
          user,
          quote,
          orderAmount * marketPrice
        )) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${quote} balance.`
          });
        }
      } else {
        if (!moveAvailableToLocked(
          user,
          base,
          orderAmount
        )) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${base} balance.`
          });
        }
      }

      db.prepare(`
        INSERT INTO orders (
          id, user_id, pair, side, type, price,
          amount, remaining_amount, total, status
        )
        VALUES (?, ?, ?, ?, 'Market', ?, ?, ?, ?, 'Open')
      `).run(
        orderId,
        user,
        pair,
        normalizedSide,
        marketPrice,
        orderAmount,
        orderAmount,
        orderAmount * marketPrice
      );

      const order = db.prepare(
        "SELECT * FROM orders WHERE id = ?"
      ).get(orderId);

      const executed = executeOrder(order, marketPrice);

      if (!executed) {
        return res.status(400).json({
          success: false,
          message: "Market order could not be executed."
        });
      }

      const balance = ensureBalance(user, quote);

      return res.json({
        success: true,
        message: "Market order executed successfully.",
        order: {
          ...db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId),
          price: marketPrice
        },
        balance: {
          balance: Number(balance.available),
          locked: Number(balance.locked)
        }
      });
    }

    if (!moveAvailableToLocked(
      user,
      requiredCurrency,
      requiredAmount
    )) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${requiredCurrency} balance.`
      });
    }

    db.prepare(`
      INSERT INTO orders (
        id, user_id, pair, side, type, price,
        amount, remaining_amount, total, status,
        trigger_price, take_profit_price,
        stop_loss_price, stop_limit_price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?, ?)
    `).run(
      orderId,
      user,
      pair,
      normalizedSide,
      type,
      orderPrice,
      orderAmount,
      orderAmount,
      orderAmount * orderPrice,
      trigger,
      takeProfit,
      stopLoss,
      stopLimit
    );

    processConditionalOrders();
    processLimitMatching();

    return res.json({
      success: true,
      message: `${type} order placed successfully.`,
      order: db.prepare(
        "SELECT * FROM orders WHERE id = ?"
      ).get(orderId)
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place order."
    });
  }
});

app.post("/api/orders/:id/cancel", (req, res) => {
  const orderId = req.params.id;
  const userId = Number(req.body.userId || req.query.userId || 1);

  const order = db.prepare(`
    SELECT *
    FROM orders
    WHERE id = ? AND user_id = ?
  `).get(orderId, userId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found."
    });
  }

  if (order.status !== "Open") {
    return res.status(400).json({
      success: false,
      message: "Only open orders can be canceled."
    });
  }

  const { base, quote } = splitPair(order.pair);

  const currency = order.side === "Buy" ? quote : base;

  const lockedAmount =
    order.side === "Buy"
      ? Number(order.price) * Number(order.remaining_amount)
      : Number(order.remaining_amount);

  try {
    db.transaction(() => {
      unlockBalance(
        userId,
        currency,
        lockedAmount
      );

      db.prepare(`
        UPDATE orders
        SET status = 'Canceled',
            remaining_amount = 0
        WHERE id = ?
      `).run(orderId);
    })();

    cancelLinkedOco(orderId);

    return res.json({
      success: true,
      message: "Order canceled successfully."
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel order."
    });
  }
});

app.get("/api/trades", (req, res) => {
  const userId = Number(req.query.userId || 1);

  const trades = db.prepare(`
    SELECT
      t.*,
      bo.user_id AS buy_user_id,
      so.user_id AS sell_user_id
    FROM trades t
    LEFT JOIN orders bo ON bo.id = t.buy_order_id
    LEFT JOIN orders so ON so.id = t.sell_order_id
    WHERE bo.user_id = ? OR so.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT 100
  `).all(userId, userId);

  res.json({
    success: true,
    trades
  });
});

app.listen(PORT, () => {
  console.log(`Bitlora API running on port ${PORT}`);
});
