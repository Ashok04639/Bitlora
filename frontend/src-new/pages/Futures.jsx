import { useState } from "react";
import { markets } from "../data/marketData";
import { getTotalCoins, getUniqueCoins } from "../utils/totalCoins";
import {
  ChevronDown,
  CandlestickChart,
  TrendingUp,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";


const tabs = ["Positions", "Open Orders", "Order History"];
const timeframes = ["1S", "1M", "5M", "15M", "30M", "1H", "4H", "1D", "1M"];

const orderBookRows = [
  ["66,858.40", "0.42"],
  ["66,854.20", "0.31"],
  ["66,850.10", "0.68"],
  ["66,847.60", "0.24"],
  ["66,845.30", "0.51"],
];

const bidRows = [
  ["66,839.80", "0.28"],
  ["66,836.40", "0.47"],
  ["66,832.10", "0.36"],
  ["66,828.70", "0.62"],
  ["66,824.50", "0.33"],
];

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

function OrderBook({ price }) {
  const [bookView, setBookView] = useState("both");

  const showAsks = bookView !== "bids";
  const showBids = bookView !== "asks";

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
        <span>Price (USDT)</span>
        <span>Amount</span>
      </div>

      {showAsks && (
        <div className="futures-book-rows asks">
          {orderBookRows.map(([rowPrice, amount]) => (
            <div key={rowPrice}>
              <span>{rowPrice}</span>
              <small>{amount}</small>
            </div>
          ))}
        </div>
      )}

      <div className="futures-book-mid">
        <strong>{price}</strong>
        <span>Mark Price</span>
      </div>

      {showBids && (
        <div className="futures-book-rows bids">
          {bidRows.map(([rowPrice, amount]) => (
            <div key={rowPrice}>
              <span>{rowPrice}</span>
              <small>{amount}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FuturesOrderPanel({ market, pair, setPair, pairMenuOpen, setPairMenuOpen, markets, chartOpen, setChartOpen }) {
  const [side, setSide] = useState("Long");
  const [orderType, setOrderType] = useState("Limit");
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);

  return (
    <section className="futures-order-panel">
      <div className="futures-pair-wrap">
          <button
            type="button"
            className="futures-pair-trigger"
            onClick={() => setPairMenuOpen((open) => !open)}
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
              aria-label={chartOpen ? "Hide candlestick chart" : "Show candlestick chart"}
              onClick={(event) => {
                event.stopPropagation();
                setChartOpen((open) => !open);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  setChartOpen((open) => !open);
                }
              }}
            >
              <CandlestickChart size={22} strokeWidth={2} />
            </span>
            <ChevronDown size={15} />
          </button>

          {pairMenuOpen && (
            <div className="futures-inline-dropdown">
              {markets.map((item) => (
                <button
                  key={item.pair}
                  type="button"
                  className={item.pair === pair ? "active" : ""}
                  onClick={() => {
                    setPair(item.pair);
                    setPairMenuOpen(false);
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
          className={side === "Long" ? "long active" : "long"}
          onClick={() => setSide("Long")}
        >
          Long
        </button>
        <button
          type="button"
          className={side === "Short" ? "short active" : "short"}
          onClick={() => setSide("Short")}
        >
          Short
        </button>
      </div>

      <label className="futures-field">
        <span>Price</span>
        <div>
          <input
            type="text"
            inputMode="decimal"
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
            placeholder="—"
            aria-label="Futures size"
          />
          <small>{market.pair.split("/")[0]}</small>
        </div>
      </label>

      <div className="futures-percentages">
        {[25, 50, 75, 100].map((value) => (
          <button type="button" key={value} disabled>
            {value}%
          </button>
        ))}
      </div>

      <button type="button" className="futures-login-trade">
        <LockKeyhole size={15} />
        Login to Trade
      </button>
    </section>
  );
}

export default function Futures({ onNavigate }) {
  const futuresMarkets = getUniqueCoins(markets);
  const [pair, setPair] = useState("BTC/USDT");
  const [pairMenuOpen, setPairMenuOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Positions");

  const market =
    futuresMarkets.find((item) => item.pair === pair) || futuresMarkets[0];

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
          <strong>—</strong>
          <small>Login required</small>
        </div>

        <div className="futures-stat-card">
          <span>Risk Level</span>
          <strong>—</strong>
          <small>Login required</small>
        </div>

        <div className="futures-stat-card">
          <span>Leverage</span>
          <strong>—</strong>
          <small>Login required</small>
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
      />
        <OrderBook price={market.price} />
      </div>

      <section className="futures-positions-card">
        <div className="futures-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

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
            {activeTab === "Positions"
              ? "Your futures positions will appear here after you log in and start trading."
              : activeTab === "Open Orders"
                ? "Your active futures orders will appear here after login."
                : "Your completed futures orders will appear here after login."}
          </span>

          {activeTab === "Positions" && (
            <button
              type="button"
              className="futures-trade-now"
              onClick={() => onNavigate?.("Trade")}
            >
              Explore Trading
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
