import { useEffect, useState } from "react";
import { markets } from "../data/marketData";

import {
  ChevronDown,
  CandlestickChart,
  TrendingUp,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";


const tabs = ["Positions", "Open Orders", "Order History"];
const timeframes = ["1S", "1M", "5M", "15M", "30M", "1H", "4H", "1D", "1M"];

function applyFuturesPositionFill(
  current,
  {
    pair,
    baseAsset,
    quoteAsset,
    side,
    size,
    fillPrice,
    leverage,
    marginMode,
    marginDelta,
    timestamp,
  }
) {
  const positions = Array.isArray(current)
    ? current
    : [];

  const existingIndex = positions.findIndex(
    (position) =>
      position.pair === pair &&
      position.status === "Open"
  );

  if (existingIndex === -1) {
    return [
      {
        id: `${pair}-${timestamp}`,
        pair,
        baseAsset,
        quoteAsset,
        side,
        size,
        entryPrice: fillPrice,
        leverage,
        marginMode,
        initialMargin: marginDelta,
        openedAt: timestamp,
        updatedAt: timestamp,
        status: "Open",
      },
      ...positions,
    ];
  }

  const existing = positions[existingIndex];
  const existingSize = Number(existing.size);
  const nextSize = existingSize + size;

  return positions.map((position, index) =>
    index === existingIndex
      ? {
          ...existing,
          size: nextSize,
          entryPrice:
            (
              Number(existing.entryPrice) *
                existingSize +
              fillPrice * size
            ) / nextSize,
          initialMargin:
            Number(existing.initialMargin) +
            marginDelta,
          updatedAt: timestamp,
        }
      : position
  );
}

function shouldFillFuturesLimitOrder(order, marketPrice) {
  const limitPrice = Number(order?.price);
  const currentPrice = Number(marketPrice);

  if (
    order?.status !== "Open" ||
    order?.type !== "Limit" ||
    !Number.isFinite(limitPrice) ||
    limitPrice <= 0 ||
    !Number.isFinite(currentPrice) ||
    currentPrice <= 0
  ) {
    return false;
  }

  if (order.side === "Long") {
    return currentPrice <= limitPrice;
  }

  if (order.side === "Short") {
    return currentPrice >= limitPrice;
  }

  return false;
}

function DemoChart({ price }) {
  const candles = [
    [42, 116, 48, 94, "up"],
    [67, 101, 58, 80, "down"],
    [91, 91, 74, 65, "up"],
    [116, 76, 103, 54, "up"],
    [141, 64, 126, 48, "down"],
    [166, 74, 151, 56, "up"],
    [191, 57, 178, 38, "up"],
    [216, 48, 203, 29, "down"],
    [241, 57, 228, 35, "up"],
    [266, 42, 253, 24, "up"],
    [291, 31, 278, 18, "up"],
    [316, 25, 303, 13, "down"],
    [341, 34, 328, 20, "up"],
  ];

  return (
    <div className="futures-chart-panel">
      <div className="futures-chart-toolbar">
        <div className="futures-chart-label">
          <span>Price Chart</span>
          <small>Demo market view</small>
        </div>

        <div className="futures-timeframes">
          {timeframes.map((frame, index) => (
            <button
              key={frame}
              type="button"
              className={index === 1 ? "active" : ""}
            >
              {frame}
            </button>
          ))}
        </div>
      </div>

      <div className="futures-chart">
        <div className="futures-chart-price-axis">
          <span>67,200</span>
          <span>67,000</span>
          <span>66,842.10</span>
          <span>66,400</span>
          <span>66,000</span>
        </div>

        <svg
          viewBox="0 0 390 150"
          preserveAspectRatio="none"
          className="futures-candles"
          aria-label={`${price} futures candlestick chart`}
        >
          <defs>
            <linearGradient id="futureGridFade" x1="0" x2="1">
              <stop offset="0" stopColor="#172337" stopOpacity=".8" />
              <stop offset="1" stopColor="#0b111b" stopOpacity=".25" />
            </linearGradient>
          </defs>

          {[24, 54, 84, 114].map((y) => (
            <line
              key={y}
              x1="0"
              x2="390"
              y1={y}
              y2={y}
              stroke="#253247"
              strokeOpacity=".42"
              strokeDasharray="3 5"
            />
          ))}

          <rect
            x="0"
            y="0"
            width="390"
            height="150"
            fill="url(#futureGridFade)"
            opacity=".28"
          />

          {candles.map(([x, high, low, openClose, direction], index) => {
            const bodyTop = Math.min(openClose, high - 15);
            const bodyBottom = Math.max(openClose + 14, low + 10);

            return (
              <g key={index}>
                <line
                  x1={x}
                  x2={x}
                  y1={high}
                  y2={low}
                  stroke={direction === "up" ? "#22c55e" : "#ef4444"}
                  strokeWidth="1.4"
                />
                <rect
                  x={x - 4}
                  y={bodyTop}
                  width="8"
                  height={Math.max(9, bodyBottom - bodyTop)}
                  rx="1.5"
                  fill={direction === "up" ? "#22c55e" : "#ef4444"}
                  opacity=".9"
                />
              </g>
            );
          })}

          <line
            x1="0"
            x2="390"
            y1="58"
            y2="58"
            stroke="#22c55e"
            strokeOpacity=".6"
            strokeDasharray="4 4"
          />
        </svg>

        <div className="futures-chart-current-price">
          <span>{price}</span>
        </div>

        <div className="futures-chart-volume">
          {[18, 29, 15, 34, 22, 39, 28, 46, 24, 38, 31, 48, 35, 52].map(
            (height, index) => (
              <i
                key={index}
                style={{ height: `${height}%` }}
                className={index % 3 === 1 ? "red" : ""}
              />
            ),
          )}
        </div>

        <div className="futures-chart-times">
          <span>12:00</span>
          <span>12:30</span>
          <span>13:00</span>
          <span>13:30</span>
        </div>
      </div>
    </div>
  );
}

function OrderBook({ market }) {
  const [bookView, setBookView] = useState("both");

  const showAsks = bookView !== "bids";
  const showBids = bookView !== "asks";

  const marketPrice = Number(market.price);
  const marketLow = Number(market.low);
  const marketHigh = Number(market.high);
  const [, quoteAsset = "USDT"] = market.pair.split("/");

  const sourcePrecision = String(market.price).includes(".")
    ? String(market.price).split(".")[1].length
    : 0;

  const pricePrecision =
    marketPrice < 0.0001
      ? Math.max(8, sourcePrecision)
      : marketPrice < 0.01
        ? Math.max(6, sourcePrecision)
        : marketPrice < 1
          ? Math.max(4, sourcePrecision)
          : Math.max(2, sourcePrecision);

  const tickSize = 10 ** -pricePrecision;

  const marketRange =
    Number.isFinite(marketLow) &&
    Number.isFinite(marketHigh) &&
    marketHigh > marketLow
      ? marketHigh - marketLow
      : marketPrice * 0.04;

  const priceStep = Math.max(
    marketRange / 500,
    marketPrice * 0.0001,
    tickSize,
    Number.EPSILON
  );

  const baseDepth = Math.max(
    0.00000001,
    1000 / Math.max(marketPrice, Number.EPSILON)
  );

  const formatPrice = (value) =>
    Number(value).toLocaleString("en-US", {
      minimumFractionDigits: pricePrecision,
      maximumFractionDigits: pricePrecision,
    });

  const formatAmount = (value) =>
    Number(value).toLocaleString("en-US", {
      minimumSignificantDigits: 1,
      maximumSignificantDigits: 8,
    });

  const asks = Array.from({ length: 5 }, (_, index) => [
    marketPrice + priceStep * (5 - index),
    baseDepth * (0.9 + index * 0.23),
  ]);

  const bids = Array.from({ length: 5 }, (_, index) => [
    Math.max(
      Number.EPSILON,
      marketPrice - priceStep * (index + 1)
    ),
    baseDepth * (1.05 + index * 0.21),
  ]);

  return (
    <section className="futures-orderbook-panel">
      <div className="futures-panel-heading">
        <div>
          <strong>Order Book</strong>
          <span>Market depth</span>
        </div>

        <div className="futures-book-toggle">
          <button
            type="button"
            className={bookView === "both" ? "active" : ""}
            aria-label="Show both sides"
            aria-pressed={bookView === "both"}
            onClick={() => setBookView("both")}
          >
            ●
          </button>

          <button
            type="button"
            className={bookView === "asks" ? "active" : ""}
            aria-label="Show asks"
            aria-pressed={bookView === "asks"}
            onClick={() => setBookView("asks")}
          >
            ▲
          </button>

          <button
            type="button"
            className={bookView === "bids" ? "active" : ""}
            aria-label="Show bids"
            aria-pressed={bookView === "bids"}
            onClick={() => setBookView("bids")}
          >
            ▼
          </button>
        </div>
      </div>

      <div className="futures-book-head">
        <span>Price ({quoteAsset})</span>
        <span>Amount</span>
      </div>

      {showAsks && (
        <div className="futures-book-rows asks">
          {asks.map(([rowPrice, amount]) => (
            <div key={rowPrice}>
              <span>{formatPrice(rowPrice)}</span>
              <small>{formatAmount(amount)}</small>
            </div>
          ))}
        </div>
      )}

      <div className="futures-book-mid">
        <strong>{formatPrice(marketPrice)}</strong>
        <span>Mark Price</span>
      </div>

      {showBids && (
        <div className="futures-book-rows bids">
          {bids.map(([rowPrice, amount]) => (
            <div key={rowPrice}>
              <span>{formatPrice(rowPrice)}</span>
              <small>{formatAmount(amount)}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FuturesOrderPanel({
  market,
  pair,
  setPair,
  pairMenuOpen,
  setPairMenuOpen,
  markets,
  chartOpen,
  setChartOpen,
  isLoggedIn,
  availableMargin,
  marginMode,
  setMarginMode,
  leverage,
  setLeverage,
  futuresPositions,
  setFuturesPositions,
  futuresOrders,
  setFuturesOrders,
}) {
  const [side, setSide] = useState("Long");
  const [orderType, setOrderType] = useState("Limit");
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const [marginMenuOpen, setMarginMenuOpen] = useState(false);
  const [leverageMenuOpen, setLeverageMenuOpen] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const [baseAsset, quoteAsset = "USDT"] =
    market.pair.split("/");

  const marketPrice = Number(
    String(market.price ?? "").replace(/[$,]/g, "")
  );

  const numericPrice =
    orderType === "Market"
      ? marketPrice
      : Number(price);

  const numericSize = Number(size);

  const orderValue =
    Number.isFinite(numericPrice) &&
    numericPrice > 0 &&
    Number.isFinite(numericSize) &&
    numericSize > 0
      ? numericPrice * numericSize
      : 0;

  const requiredMargin =
    orderValue > 0 && leverage > 0
      ? orderValue / leverage
      : 0;

  const maxNotional =
    availableMargin > 0
      ? availableMargin * leverage
      : 0;

  const currentPosition = (
    Array.isArray(futuresPositions)
      ? futuresPositions
      : []
  ).find(
    (position) =>
      position.pair === market.pair &&
      position.status === "Open"
  );

  const placeOrder = () => {
    if (
      !isLoggedIn ||
      (orderType === "Market" && (typeof setFuturesPositions !== "function" || typeof setFuturesOrders !== "function")) ||
      (orderType === "Limit" && typeof setFuturesOrders !== "function")
    ) {
      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !Number.isFinite(numericSize) ||
      numericSize <= 0
    ) {
      setOrderMessage(
        orderType === "Limit"
          ? "Enter a valid limit price and position size."
          : "Enter a valid position size."
      );
      return;
    }

    if (
      currentPosition &&
      currentPosition.side !== side
    ) {
      setOrderMessage(
        `Close or reduce the existing ${currentPosition.side} position before opening ${side}.`
      );
      return;
    }

    if (
      currentPosition &&
      (
        Number(currentPosition.leverage) !== leverage ||
        currentPosition.marginMode !== marginMode
      )
    ) {
      setOrderMessage(
        `Existing position uses ${currentPosition.marginMode} margin at ${currentPosition.leverage}x leverage.`
      );
      return;
    }

    if (
      !Number.isFinite(requiredMargin) ||
      requiredMargin <= 0 ||
      requiredMargin >
        availableMargin + Number.EPSILON
    ) {
      setOrderMessage(
        `Insufficient available ${quoteAsset} margin.`
      );
      return;
    }

    const now = Date.now();

    if (orderType === "Limit") {
      setFuturesOrders((current) => {
        const orders = Array.isArray(current)
          ? current
          : [];

        return [
          {
            id: `${market.pair}-limit-${now}`,
            pair: market.pair,
            baseAsset,
            quoteAsset,
            side,
            type: "Limit",
            price: numericPrice,
            size: numericSize,
            leverage,
            marginMode,
            reservedMargin: requiredMargin,
            createdAt: now,
            updatedAt: now,
            status: "Open",
          },
          ...orders,
        ];
      });

      setSize("");
      setOrderMessage(`${side} limit order placed.`);
      return;
    }

    setFuturesPositions((current) =>
      applyFuturesPositionFill(current, {
        pair: market.pair,
        baseAsset,
        quoteAsset,
        side,
        size: numericSize,
        fillPrice: marketPrice,
        leverage,
        marginMode,
        marginDelta: requiredMargin,
        timestamp: now,
      })
    );

    setFuturesOrders((current) => {
      const orders = Array.isArray(current)
        ? current
        : [];

      return [
        {
          id: `${market.pair}-market-${now}`,
          pair: market.pair,
          baseAsset,
          quoteAsset,
          side,
          type: "Market",
          price: marketPrice,
          size: numericSize,
          leverage,
          marginMode,
          reservedMargin: requiredMargin,
          createdAt: now,
          filledAt: now,
          updatedAt: now,
          status: "Filled",
        },
        ...orders,
      ];
    });

    setSize("");

    setOrderMessage(
      currentPosition
        ? `${side} position increased at market price.`
        : `${side} position opened at market price.`
    );
  };

  const applyPercentage = (percentage) => {
    if (
      !isLoggedIn ||
      availableMargin <= 0 ||
      !Number.isFinite(marketPrice) ||
      marketPrice <= 0
    ) {
      return;
    }

    const sizingPrice =
      orderType === "Limit" &&
      Number.isFinite(Number(price)) &&
      Number(price) > 0
        ? Number(price)
        : marketPrice;

    const nextNotional =
      maxNotional * (percentage / 100);

    const nextSize = nextNotional / sizingPrice;

    setSize(
      Number.isFinite(nextSize) && nextSize > 0
        ? nextSize.toFixed(6)
        : ""
    );
  };

  const handleLogin = () => {
    window.dispatchEvent(
      new CustomEvent("bitlora:login")
    );
  };

  return (
    <section className="futures-order-panel">
      <div className="futures-pair-wrap">
        <button
          type="button"
          className="futures-pair-trigger"
          onClick={() =>
            setPairMenuOpen((open) => !open)
          }
          aria-expanded={pairMenuOpen}
        >
          <span>
            <strong>{market.pair}</strong>
            <em>Perpetual</em>
          </span>

          <span
            className="futures-pair-chart-icon"
            role="button"
            tabIndex={0}
            aria-label={
              chartOpen
                ? "Hide candlestick chart"
                : "Show candlestick chart"
            }
            onClick={(event) => {
              event.stopPropagation();
              setChartOpen((open) => !open);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                event.stopPropagation();
                setChartOpen((open) => !open);
              }
            }}
          >
            <CandlestickChart
              size={22}
              strokeWidth={2}
            />
          </span>

          <ChevronDown size={15} />
        </button>

        {pairMenuOpen && (
          <div className="futures-inline-dropdown">
            {markets.map((item) => (
              <button
                key={item.pair}
                type="button"
                className={
                  item.pair === pair ? "active" : ""
                }
                onClick={() => {
                  setPair(item.pair);
                  setPairMenuOpen(false);
                  setPrice("");
                  setSize("");
                }}
              >
                <span>
                  <strong>{item.pair}</strong>
                  <small>{item.change}</small>
                </span>
                <small>{item.price}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="futures-side-switch">
        <button
          type="button"
          className={
            side === "Long"
              ? "long active"
              : "long"
          }
          onClick={() => setSide("Long")}
        >
          Long
        </button>

        <button
          type="button"
          className={
            side === "Short"
              ? "short active"
              : "short"
          }
          onClick={() => setSide("Short")}
        >
          Short
        </button>
      </div>

      <div className="futures-order-type-wrap">
        <button
          type="button"
          className="futures-order-type"
          disabled={!isLoggedIn}
          onClick={() =>
            setOrderMenuOpen((open) => !open)
          }
        >
          <span>{orderType} Order</span>
          <ChevronDown size={14} />
        </button>

        {isLoggedIn && orderMenuOpen && (
          <div className="futures-order-type-menu">
            {["Limit", "Market"].map((type) => (
              <button
                key={type}
                type="button"
                className={
                  orderType === type ? "active" : ""
                }
                onClick={() => {
                  setOrderType(type);
                  setOrderMenuOpen(false);
                }}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="futures-order-type-wrap">
        <button
          type="button"
          className="futures-order-type"
          disabled={!isLoggedIn}
          onClick={() =>
            setMarginMenuOpen((open) => !open)
          }
        >
          <span>Margin · {marginMode}</span>
          <ChevronDown size={14} />
        </button>

        {isLoggedIn && marginMenuOpen && (
          <div className="futures-order-type-menu">
            {["Cross", "Isolated"].map((mode) => (
              <button
                key={mode}
                type="button"
                className={
                  marginMode === mode ? "active" : ""
                }
                onClick={() => {
                  setMarginMode(mode);
                  setMarginMenuOpen(false);
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="futures-order-type-wrap">
        <button
          type="button"
          className="futures-order-type"
          disabled={!isLoggedIn}
          onClick={() =>
            setLeverageMenuOpen((open) => !open)
          }
        >
          <span>Leverage · {leverage}x</span>
          <ChevronDown size={14} />
        </button>

        {isLoggedIn && leverageMenuOpen && (
          <div className="futures-order-type-menu">
            {[1, 2, 5, 10, 20].map((value) => (
              <button
                key={value}
                type="button"
                className={
                  leverage === value ? "active" : ""
                }
                onClick={() => {
                  setLeverage(value);
                  setLeverageMenuOpen(false);
                }}
              >
                {value}x
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="futures-order-type-wrap">
        <button
          type="button"
          className="futures-order-type"
          disabled={!isLoggedIn}
          aria-pressed={reduceOnly}
          onClick={() =>
            setReduceOnly((enabled) => !enabled)
          }
        >
          <span>
            Reduce Only · {reduceOnly ? "On" : "Off"}
          </span>
        </button>
      </div>

      <label className="futures-field">
        <span>Price</span>
        <div>
          <input
            type="text"
            inputMode="decimal"
            value={
              orderType === "Market"
                ? String(market.price)
                : price
            }
            disabled={
              !isLoggedIn ||
              orderType === "Market"
            }
            onChange={(event) =>
              setPrice(event.target.value)
            }
            placeholder="—"
            aria-label="Futures price"
          />
          <small>USDT</small>
        </div>
      </label>

      <label className="futures-field">
        <span>Size</span>
        <div>
          <input
            type="text"
            inputMode="decimal"
            value={size}
            disabled={!isLoggedIn}
            onChange={(event) =>
              setSize(event.target.value)
            }
            placeholder="—"
            aria-label="Futures size"
          />
          <small>
            {baseAsset}
          </small>
        </div>
      </label>

      <div className="futures-percentages">
        {[25, 50, 75, 100].map((value) => (
          <button
            type="button"
            key={value}
            disabled={
              !isLoggedIn ||
              availableMargin <= 0
            }
            onClick={() =>
              applyPercentage(value)
            }
          >
            {value}%
          </button>
        ))}
      </div>

      <div className="futures-order-preview">
        <div>
          <span>Available Margin</span>
          <strong>
            {isLoggedIn
              ? `${availableMargin.toFixed(2)} USDT`
              : "Login required"}
          </strong>
        </div>

        <div>
          <span>Order Value</span>
          <strong>
            {orderValue > 0
              ? `${orderValue.toFixed(2)} USDT`
              : "—"}
          </strong>
        </div>

        <div>
          <span>Required Margin</span>
          <strong>
            {requiredMargin > 0
              ? `${requiredMargin.toFixed(2)} USDT`
              : "—"}
          </strong>
        </div>

        <div>
          <span>Max Notional</span>
          <strong>
            {isLoggedIn
              ? `${maxNotional.toFixed(2)} USDT`
              : "Login required"}
          </strong>
        </div>
      </div>

      {isLoggedIn ? (
        <>
          <button
            type="button"
            className="futures-login-trade"
            disabled={
              !Number.isFinite(numericSize) ||
              numericSize <= 0 ||
              !Number.isFinite(requiredMargin) ||
              requiredMargin <= 0 ||
              requiredMargin >
                availableMargin + Number.EPSILON
            }
              onClick={placeOrder}
          >
            Place {side}
          </button>

          {orderMessage && (
            <p className="futures-order-note">
              {orderMessage}
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          className="futures-login-trade"
          onClick={handleLogin}
        >
          <LockKeyhole size={15} />
          Login to Trade
        </button>
      )}
    </section>
  );
}

function FuturesSurface({
  onNavigate,
  isLoggedIn,
  walletBalances,
  setWalletBalances,
  futuresPositions = [],
  setFuturesPositions,
  futuresOrders = [],
  setFuturesOrders,
}) {
  const futuresMarkets = markets.filter(
    (item) => item.pair.endsWith("/USDT")
  );
  const [pair, setPair] = useState("BTC/USDT");
  const [pairMenuOpen, setPairMenuOpen] =
    useState(false);
  const [chartOpen, setChartOpen] =
    useState(false);
  const [activeTab, setActiveTab] =
    useState("Positions");
  const [marginMode, setMarginMode] =
    useState("Cross");
  const [leverage, setLeverage] =
    useState(10);
  const [reduceSizes, setReduceSizes] = useState({});

  const market =
    futuresMarkets.find(
      (item) => item.pair === pair
    ) || futuresMarkets[0];

  const [, quoteAsset = "USDT"] =
    market.pair.split("/");

  const rawWalletBalance = Number(
    walletBalances?.["Futures Wallet"]?.[quoteAsset] ?? 0
  );

  const walletBalance =
    Number.isFinite(rawWalletBalance) &&
    rawWalletBalance > 0
      ? rawWalletBalance
      : 0;

  const openPositions = (
    Array.isArray(futuresPositions)
      ? futuresPositions
      : []
  ).filter(
    (position) => position.status === "Open"
  );

  const selectedPosition = openPositions.find(
    (position) => position.pair === market.pair
  );

  const lockedMargin = openPositions
    .filter(
      (position) =>
        position.quoteAsset === quoteAsset
    )
    .reduce(
      (total, position) =>
        total +
        Math.max(
          0,
          Number(position.initialMargin) || 0
        ),
      0
    );

  const reservedOrderMargin = (
    Array.isArray(futuresOrders)
      ? futuresOrders
      : []
  )
    .filter(
      (order) =>
        order.status === "Open" &&
        order.quoteAsset === quoteAsset
    )
    .reduce(
      (total, order) =>
        total +
        Math.max(
          0,
          Number(order.reservedMargin) || 0
        ),
      0
    );

  const availableMargin = Math.max(
    0,
    walletBalance -
      lockedMargin -
      reservedOrderMargin
  );

  const openOrderRows = (
    Array.isArray(futuresOrders)
      ? futuresOrders
      : []
  ).filter((order) => order.status === "Open");

  const historyOrderRows = (
    Array.isArray(futuresOrders)
      ? futuresOrders
      : []
  ).filter((order) => order.status !== "Open");

  useEffect(() => {
    if (
      !isLoggedIn ||
      typeof setFuturesPositions !== "function" ||
      typeof setFuturesOrders !== "function"
    ) {
      return;
    }

    const orders = Array.isArray(futuresOrders)
      ? futuresOrders
      : [];
    const positions = Array.isArray(futuresPositions)
      ? futuresPositions
      : [];

    let nextPositions = positions;
    const fills = new Map();
    const filledAt = Date.now();

    const openLimitOrders = orders
      .filter(
        (order) =>
          order.status === "Open" &&
          order.type === "Limit"
      )
      .sort(
        (a, b) =>
          Number(a.createdAt || 0) -
          Number(b.createdAt || 0)
      );

    for (const order of openLimitOrders) {
      const orderMarket = markets.find(
        (item) => item.pair === order.pair
      );
      const triggerPrice = Number(
        String(orderMarket?.price ?? "").replace(
          /[$,]/g,
          ""
        )
      );

      if (!shouldFillFuturesLimitOrder(order, triggerPrice)) {
        continue;
      }

      const fillPrice = Number(order.price);

      const existingPosition = nextPositions.find(
        (position) =>
          position.pair === order.pair &&
          position.status === "Open"
      );

      if (
        existingPosition &&
        (
          existingPosition.side !== order.side ||
          Number(existingPosition.leverage) !==
            Number(order.leverage) ||
          existingPosition.marginMode !== order.marginMode
        )
      ) {
        continue;
      }

      const orderSize = Number(order.size);
      const marginDelta = Number(order.reservedMargin);

      if (
        !Number.isFinite(orderSize) ||
        orderSize <= 0 ||
        !Number.isFinite(marginDelta) ||
        marginDelta <= 0
      ) {
        continue;
      }

      nextPositions = applyFuturesPositionFill(
        nextPositions,
        {
          pair: order.pair,
          baseAsset: order.baseAsset,
          quoteAsset: order.quoteAsset,
          side: order.side,
          size: orderSize,
          fillPrice,
          leverage: Number(order.leverage),
          marginMode: order.marginMode,
          marginDelta,
          timestamp: filledAt,
        }
      );

      fills.set(order.id, fillPrice);
    }

    if (fills.size === 0) {
      return;
    }

    setFuturesPositions(nextPositions);

    setFuturesOrders((current) =>
      (Array.isArray(current) ? current : []).map(
        (order) => {
          const fillPrice = fills.get(order.id);

          return fillPrice !== undefined &&
            order.status === "Open"
            ? {
                ...order,
                status: "Filled",
                filledPrice: fillPrice,
                filledAt,
                updatedAt: filledAt,
              }
            : order;
        }
      )
    );
  }, [
    isLoggedIn,
    futuresOrders,
    futuresPositions,
    setFuturesOrders,
    setFuturesPositions,
  ]);

  const positionRows = openPositions.map((position) => {
    const positionMarket = futuresMarkets.find(
      (item) => item.pair === position.pair
    );

    const rawMarkPrice = Number(
      String(
        positionMarket?.price ??
        position.entryPrice ??
        ""
      ).replace(/[$,]/g, "")
    );

    const entryPrice =
      Number(position.entryPrice) || 0;

    const markPrice =
      Number.isFinite(rawMarkPrice) &&
      rawMarkPrice > 0
        ? rawMarkPrice
        : entryPrice;

    const positionSize =
      Number(position.size) || 0;

    const direction =
      position.side === "Short" ? -1 : 1;

    const unrealizedPnl =
      (markPrice - entryPrice) *
      positionSize *
      direction;

    return {
      ...position,
      markPrice,
      unrealizedPnl,
    };
  });

  const reducePosition = (
    position,
    requestedSize
  ) => {
    if (
      !isLoggedIn ||
      typeof setWalletBalances !== "function" ||
      typeof setFuturesPositions !== "function"
    ) {
      return;
    }

    const positionSize = Number(position.size);
    const reduceSize = Number(requestedSize);
    const entryPrice = Number(position.entryPrice);
    const exitPrice = Number(position.markPrice);

    if (
      !Number.isFinite(positionSize) ||
      positionSize <= 0 ||
      !Number.isFinite(reduceSize) ||
      reduceSize <= 0 ||
      reduceSize > positionSize ||
      !Number.isFinite(entryPrice) ||
      entryPrice <= 0 ||
      !Number.isFinite(exitPrice) ||
      exitPrice <= 0
    ) {
      return;
    }

    const direction =
      position.side === "Short" ? -1 : 1;

    const realizedPnlDelta =
      (exitPrice - entryPrice) *
      reduceSize *
      direction;

    const currentRealizedPnl =
      Number(position.realizedPnl) || 0;

    const nextRealizedPnl =
      currentRealizedPnl + realizedPnlDelta;

    const initialMargin =
      Math.max(
        0,
        Number(position.initialMargin) || 0
      );

    const remainingSize =
      positionSize - reduceSize;

    const remainingMargin =
      remainingSize > 0
        ? initialMargin *
          (remainingSize / positionSize)
        : 0;

    const updatedAt = Date.now();
    const positionKey =
      position.id ?? position.pair;
    const positionQuoteAsset =
      position.quoteAsset ?? "USDT";

    setWalletBalances((current) => {
      const currentFutures =
        current?.["Futures Wallet"] ?? {};

      const currentQuoteBalance = Number(
        currentFutures[positionQuoteAsset] ?? 0
      );

      return {
        ...current,
        "Futures Wallet": {
          ...currentFutures,
          [positionQuoteAsset]:
            currentQuoteBalance +
            realizedPnlDelta,
        },
      };
    });

    setFuturesPositions((current) =>
      (Array.isArray(current) ? current : []).map(
        (currentPosition) => {
          const currentKey =
            currentPosition.id ??
            currentPosition.pair;

          if (
            currentPosition.status !== "Open" ||
            currentKey !== positionKey
          ) {
            return currentPosition;
          }

          if (remainingSize <= Number.EPSILON) {
            return {
              ...currentPosition,
              status: "Closed",
              exitPrice,
              realizedPnl: nextRealizedPnl,
              closedAt: updatedAt,
              updatedAt,
            };
          }

          return {
            ...currentPosition,
            size: remainingSize,
            initialMargin: remainingMargin,
            realizedPnl: nextRealizedPnl,
            updatedAt,
          };
        }
      )
    );
  };

  const closePosition = (position) => {
    reducePosition(
      position,
      Number(position.size)
    );
  };

  const cancelOrder = (order) => {
    if (
      !isLoggedIn ||
      typeof setFuturesOrders !== "function" ||
      !order?.id
    ) {
      return;
    }

    const updatedAt = Date.now();

    setFuturesOrders((current) =>
      (Array.isArray(current) ? current : []).map(
        (currentOrder) =>
          currentOrder.id === order.id &&
          currentOrder.status === "Open"
            ? {
                ...currentOrder,
                status: "Cancelled",
                cancelledAt: updatedAt,
                updatedAt,
              }
            : currentOrder
      )
    );
  };

  return (
    <section className="futures-page">
      <div className="futures-market-head">
      </div>

      <div className="futures-stats">
        <div className="futures-stat-card public">
          <span>Mark Price</span>
          <strong>{market.price}</strong>
          <small>USDT</small>
        </div>

        <div className="futures-stat-card">
          <span>Available Margin</span>
          <strong>
            {isLoggedIn
              ? availableMargin.toFixed(2)
              : "—"}
          </strong>
          <small>
            {isLoggedIn
              ? quoteAsset
              : "Login required"}
          </small>
        </div>

        <div className="futures-stat-card">
          <span>Risk Level</span>
          <strong>
            {isLoggedIn
              ? selectedPosition
                ? "Position open"
                : "No position"
              : "—"}
          </strong>
          <small>
            {isLoggedIn
              ? marginMode
              : "Login required"}
          </small>
        </div>

        <div className="futures-stat-card">
          <span>Leverage</span>
          <strong>
            {isLoggedIn
              ? `${leverage}x`
              : "—"}
          </strong>
          <small>
            {isLoggedIn
              ? marginMode
              : "Login required"}
          </small>
        </div>
      </div>

      {chartOpen && (
        <DemoChart price={market.price} />
      )}

      <div className="futures-trading-workspace">
        <FuturesOrderPanel
          market={market}
          pair={pair}
          setPair={setPair}
          pairMenuOpen={pairMenuOpen}
          setPairMenuOpen={setPairMenuOpen}
          markets={futuresMarkets}
          chartOpen={chartOpen}
          setChartOpen={setChartOpen}
          isLoggedIn={isLoggedIn}
          availableMargin={availableMargin}
          marginMode={marginMode}
          setMarginMode={setMarginMode}
          leverage={leverage}
          setLeverage={setLeverage}
          futuresPositions={futuresPositions}
          setFuturesPositions={setFuturesPositions}
          futuresOrders={futuresOrders}
          setFuturesOrders={setFuturesOrders}
        />

        <OrderBook market={market} />
      </div>

      <section className="futures-positions-card">
        <div
          className="futures-tabs"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={
                activeTab === tab
              }
              className={
                activeTab === tab
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(tab)
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Positions" &&
        isLoggedIn &&
        positionRows.length > 0 ? (
          <div
            className="futures-position-list"
            role="table"
            aria-label="Open futures positions"
          >
            <div
              className="futures-position-grid futures-position-table-head"
              role="row"
            >
              <span role="columnheader">Contract</span>
              <span role="columnheader">Side</span>
              <span role="columnheader">Size</span>
              <span role="columnheader">Entry</span>
              <span role="columnheader">Mark</span>
              <span role="columnheader">Leverage</span>
              <span role="columnheader">Margin</span>
              <span role="columnheader">uPnL</span>
              <span role="columnheader">Action</span>
            </div>

            <div className="futures-position-rows">
              {positionRows.map((position) => (
                <div
                  key={position.id ?? position.pair}
                  className="futures-position-grid futures-position-row"
                  role="row"
                >
                  <strong role="cell">
                    {position.pair}
                  </strong>

                  <span
                    role="cell"
                    className={`futures-position-side ${
                      position.side === "Short"
                        ? "short"
                        : "long"
                    }`}
                  >
                    {position.side}
                  </span>

                  <span role="cell">
                    {Number(position.size).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 8,
                      }
                    )}{" "}
                    {position.baseAsset}
                  </span>

                  <span role="cell">
                    {Number(
                      position.entryPrice
                    ).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 8,
                      }
                    )}
                  </span>

                  <span role="cell">
                    {position.markPrice.toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 8,
                      }
                    )}
                  </span>

                  <span role="cell">
                    {position.leverage}x
                  </span>

                  <span role="cell">
                    {Number(
                      position.initialMargin
                    ).toFixed(2)}{" "}
                    {position.quoteAsset}
                  </span>

                  <span
                    role="cell"
                    className={`futures-position-pnl ${
                      position.unrealizedPnl >= 0
                        ? "gain"
                        : "loss"
                    }`}
                  >
                    {position.unrealizedPnl >= 0
                      ? "+"
                      : ""}
                    {position.unrealizedPnl.toFixed(2)}{" "}
                    {position.quoteAsset}
                  </span>
                  <span
                    role="cell"
                    className="futures-position-action"
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      className="futures-position-reduce-input"
                      value={
                        reduceSizes[
                          position.id ?? position.pair
                        ] ?? ""
                      }
                      onChange={(event) =>
                        setReduceSizes((current) => ({
                          ...current,
                          [position.id ?? position.pair]:
                            event.target.value,
                        }))
                      }
                      placeholder="Size"
                      aria-label={`Reduce ${position.pair} size`}
                    />
                    <button
                      type="button"
                      className="futures-position-reduce"
                      disabled={
                        !Number.isFinite(
                          Number(
                            reduceSizes[
                              position.id ?? position.pair
                            ]
                          )
                        ) ||
                        Number(
                          reduceSizes[
                            position.id ?? position.pair
                          ]
                        ) <= 0 ||
                        Number(
                          reduceSizes[
                            position.id ?? position.pair
                          ]
                        ) >= Number(position.size)
                      }
                      onClick={() => {
                        reducePosition(
                          position,
                          Number(
                            reduceSizes[
                              position.id ?? position.pair
                            ]
                          )
                        );

                        setReduceSizes((current) => ({
                          ...current,
                          [position.id ?? position.pair]: "",
                        }));
                      }}
                    >
                      Reduce
                    </button>
                    <button
                      type="button"
                      className="futures-position-close"
                      onClick={() =>
                        closePosition(position)
                      }
                    >
                      Close
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "Open Orders" &&
        isLoggedIn &&
        openOrderRows.length > 0 ? (
          <div
            className="futures-position-list"
            role="table"
            aria-label="Open futures orders"
          >
            <div
              className="futures-position-grid futures-position-table-head"
              role="row"
            >
              <span role="columnheader">Contract</span>
              <span role="columnheader">Side</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Size</span>
              <span role="columnheader">Leverage</span>
              <span role="columnheader">Margin</span>
              <span role="columnheader">Mode</span>
              <span role="columnheader">Created / Action</span>
            </div>

            <div className="futures-position-rows">
              {openOrderRows.map((order) => (
                <div
                  key={order.id}
                  className="futures-position-grid futures-position-row"
                  role="row"
                >
                  <strong role="cell">{order.pair}</strong>
                  <span
                    role="cell"
                    className={`futures-position-side ${
                      order.side === "Short" ? "short" : "long"
                    }`}
                  >
                    {order.side}
                  </span>
                  <span role="cell">{order.type}</span>
                  <span role="cell">
                    {Number(order.price).toLocaleString(
                      "en-US",
                      { maximumFractionDigits: 8 }
                    )}
                  </span>
                  <span role="cell">
                    {Number(order.size).toLocaleString(
                      "en-US",
                      { maximumFractionDigits: 8 }
                    )}{" "}{order.baseAsset}
                  </span>
                  <span role="cell">{order.leverage}x</span>
                  <span role="cell">
                    {Number(order.reservedMargin).toFixed(2)}{" "}
                    {order.quoteAsset}
                  </span>
                  <span role="cell">{order.marginMode}</span>
                  <span
                    role="cell"
                    className="futures-position-action"
                  >
                    <span>
                      {Number.isFinite(Number(order.createdAt))
                        ? new Date(
                            Number(order.createdAt)
                          ).toLocaleString("en-US")
                        : "—"}
                    </span>
                    <button
                      type="button"
                      className="futures-position-close"
                      onClick={() => cancelOrder(order)}
                    >
                      Cancel
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "Order History" &&
        isLoggedIn &&
        historyOrderRows.length > 0 ? (
          <div
            className="futures-position-list"
            role="table"
            aria-label="Futures order history"
          >
            <div
              className="futures-position-grid futures-position-table-head"
              role="row"
            >
              <span role="columnheader">Contract</span>
              <span role="columnheader">Side</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Size</span>
              <span role="columnheader">Leverage</span>
              <span role="columnheader">Margin</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Updated</span>
            </div>

            <div className="futures-position-rows">
              {historyOrderRows.map((order) => (
                <div
                  key={order.id}
                  className="futures-position-grid futures-position-row"
                  role="row"
                >
                  <strong role="cell">{order.pair}</strong>
                  <span
                    role="cell"
                    className={`futures-position-side ${
                      order.side === "Short" ? "short" : "long"
                    }`}
                  >
                    {order.side}
                  </span>
                  <span role="cell">{order.type}</span>
                  <span role="cell">
                    {Number(order.price).toLocaleString(
                      "en-US",
                      { maximumFractionDigits: 8 }
                    )}
                  </span>
                  <span role="cell">
                    {Number(order.size).toLocaleString(
                      "en-US",
                      { maximumFractionDigits: 8 }
                    )}{" "}{order.baseAsset}
                  </span>
                  <span role="cell">{order.leverage}x</span>
                  <span role="cell">
                    {Number(order.reservedMargin).toFixed(2)}{" "}
                    {order.quoteAsset}
                  </span>
                  <span role="cell">{order.status}</span>
                  <span role="cell">
                    {Number.isFinite(Number(order.updatedAt))
                      ? new Date(
                          Number(order.updatedAt)
                        ).toLocaleString("en-US")
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="futures-empty-state">
            <div className="futures-empty-icon">
              <TrendingUp size={20} />
            </div>

            <strong>
              {activeTab === "Positions"
                ? "No positions yet"
                : activeTab === "Open Orders"
                  ? "No open orders"
                  : "No order history"}
            </strong>

            <span>
              {!isLoggedIn
                ? activeTab === "Positions"
                  ? "Log in to view and manage your futures positions."
                  : activeTab === "Open Orders"
                    ? "Log in to view your active futures orders."
                    : "Log in to view your completed futures orders."
                : activeTab === "Positions"
                  ? "Your futures positions will appear here after you start trading."
                  : activeTab === "Open Orders"
                    ? "You have no active futures orders."
                    : "Your completed futures orders will appear here."}
            </span>

            {activeTab === "Positions" &&
              !isLoggedIn && (
                <button
                  type="button"
                  className="futures-trade-now"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent(
                        "bitlora:login"
                      )
                    )
                  }
                >
                  Login to Trade
                  <ArrowRight size={15} />
                </button>
              )}
          </div>
        )}
      </section>
    </section>
  );
}

function PublicFutures({ onNavigate }) {
  return (
    <FuturesSurface
      onNavigate={onNavigate}
      isLoggedIn={false}
    />
  );
}

function LoggedInFutures({
  onNavigate,
  walletBalances,
  setWalletBalances,
  futuresPositions,
  setFuturesPositions,
  futuresOrders,
  setFuturesOrders,
}) {
  return (
    <FuturesSurface
      onNavigate={onNavigate}
      isLoggedIn
      walletBalances={walletBalances}
      setWalletBalances={setWalletBalances}
      futuresPositions={futuresPositions}
      setFuturesPositions={setFuturesPositions}
      futuresOrders={futuresOrders}
      setFuturesOrders={setFuturesOrders}
    />
  );
}

export default function Futures({
  onNavigate,
  isLoggedIn,
  walletBalances,
  setWalletBalances,
  futuresPositions,
  setFuturesPositions,
  futuresOrders,
  setFuturesOrders,
}) {
  if (isLoggedIn) {
    return (
      <LoggedInFutures
        onNavigate={onNavigate}
        walletBalances={walletBalances}
        setWalletBalances={setWalletBalances}
        futuresPositions={futuresPositions}
        setFuturesPositions={setFuturesPositions}
        futuresOrders={futuresOrders}
        setFuturesOrders={setFuturesOrders}
      />
    );
  }

  return (
    <PublicFutures
      onNavigate={onNavigate}
    />
  );
}
