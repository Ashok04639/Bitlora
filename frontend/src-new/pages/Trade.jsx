import { useState } from "react";
import { markets } from "../data/marketData";
import { getUniqueCoins, getTotalCoins } from "../utils/totalCoins";
import {
  BarChart3,
  ChevronDown,
  Check,
  Settings2,
  RefreshCw,
} from "lucide-react";

const pairs = getUniqueCoins(markets).map((market) => market.pair);


const timeframes = ["1S", "1M", "5M", "15M", "30M", "1H", "4H", "1D", "1M"];

const candleSets = {
  "BTC/USDT": [
    [66.10, 66.48, 65.82, 66.32],
    [66.32, 66.90, 66.02, 66.72],
    [66.72, 67.18, 66.40, 66.58],
    [66.58, 67.02, 66.18, 66.88],
    [66.88, 67.42, 66.55, 67.26],
    [67.26, 67.74, 66.84, 67.48],
    [67.48, 68.04, 67.12, 67.82],
    [67.82, 68.22, 67.34, 67.66],
    [67.66, 67.96, 67.02, 67.24],
    [67.24, 67.78, 66.92, 67.58],
    [67.58, 68.16, 67.30, 67.92],
    [67.92, 68.42, 67.62, 68.14],
  ],
  "ETH/USDT": [
    [3.32, 3.38, 3.28, 3.35],
    [3.35, 3.44, 3.31, 3.40],
    [3.40, 3.48, 3.36, 3.45],
    [3.45, 3.51, 3.39, 3.42],
    [3.42, 3.56, 3.40, 3.52],
    [3.52, 3.60, 3.47, 3.57],
    [3.57, 3.63, 3.51, 3.54],
    [3.54, 3.59, 3.46, 3.50],
    [3.50, 3.58, 3.44, 3.55],
    [3.55, 3.62, 3.50, 3.59],
    [3.59, 3.66, 3.54, 3.62],
    [3.62, 3.70, 3.58, 3.67],
  ],
  "SOL/USDT": [
    [176.2, 179.4, 174.8, 178.1],
    [178.1, 181.6, 176.5, 180.4],
    [180.4, 184.2, 178.9, 182.7],
    [182.7, 186.0, 180.8, 184.5],
    [184.5, 188.4, 182.2, 187.1],
    [187.1, 190.2, 184.3, 186.4],
    [186.4, 189.0, 183.6, 185.2],
    [185.2, 188.8, 182.9, 187.5],
    [187.5, 191.4, 185.6, 189.2],
    [189.2, 192.6, 187.4, 190.8],
    [190.8, 194.1, 188.9, 192.4],
    [192.4, 195.6, 190.8, 194.2],
  ],
  "BNB/USDT": [
    [598.2, 604.8, 594.6, 601.4],
    [601.4, 608.2, 598.7, 605.6],
    [605.6, 612.4, 602.8, 609.7],
    [609.7, 616.2, 606.1, 613.5],
    [613.5, 620.4, 610.2, 617.8],
    [617.8, 623.1, 614.0, 619.2],
    [619.2, 624.0, 615.6, 617.1],
    [617.1, 621.8, 612.8, 614.9],
    [614.9, 620.2, 611.5, 618.4],
    [618.4, 625.0, 616.1, 622.6],
    [622.6, 628.4, 619.8, 625.9],
    [625.9, 631.2, 622.4, 628.7],
  ],
  "ICP/USDT": [
    [4.62, 4.74, 4.56, 4.68],
    [4.68, 4.82, 4.61, 4.76],
    [4.76, 4.91, 4.70, 4.84],
    [4.84, 4.98, 4.77, 4.92],
    [4.92, 5.06, 4.84, 5.01],
    [5.01, 5.12, 4.92, 5.05],
    [5.05, 5.14, 4.96, 5.00],
    [5.00, 5.10, 4.91, 4.96],
    [4.96, 5.08, 4.90, 5.03],
    [5.03, 5.16, 4.98, 5.10],
    [5.10, 5.22, 5.04, 5.17],
    [5.17, 5.28, 5.10, 5.22],
  ],
  "ADA/USDT": [
    [0.426, 0.438, 0.419, 0.432],
    [0.432, 0.444, 0.426, 0.439],
    [0.439, 0.452, 0.432, 0.447],
    [0.447, 0.461, 0.441, 0.455],
    [0.455, 0.468, 0.449, 0.462],
    [0.462, 0.475, 0.456, 0.468],
    [0.468, 0.479, 0.459, 0.464],
    [0.464, 0.472, 0.452, 0.458],
    [0.458, 0.470, 0.451, 0.466],
    [0.466, 0.481, 0.459, 0.475],
    [0.475, 0.488, 0.468, 0.482],
    [0.482, 0.495, 0.476, 0.489],
  ],
  "SHIB/USDT": [
    [0.0000121, 0.0000125, 0.0000119, 0.0000123],
    [0.0000123, 0.0000127, 0.0000121, 0.0000126],
    [0.0000126, 0.0000130, 0.0000124, 0.0000128],
    [0.0000128, 0.0000133, 0.0000126, 0.0000131],
    [0.0000131, 0.0000135, 0.0000129, 0.0000133],
    [0.0000133, 0.0000137, 0.0000130, 0.0000132],
    [0.0000132, 0.0000136, 0.0000129, 0.0000130],
    [0.0000130, 0.0000134, 0.0000127, 0.0000129],
    [0.0000129, 0.0000134, 0.0000128, 0.0000132],
    [0.0000132, 0.0000137, 0.0000130, 0.0000135],
    [0.0000135, 0.0000139, 0.0000132, 0.0000137],
    [0.0000137, 0.0000141, 0.0000134, 0.0000139],
  ],
  "XRP/USDT": [
    [0.552, 0.566, 0.544, 0.559],
    [0.559, 0.574, 0.551, 0.568],
    [0.568, 0.583, 0.560, 0.576],
    [0.576, 0.592, 0.569, 0.586],
    [0.586, 0.601, 0.578, 0.594],
    [0.594, 0.608, 0.585, 0.600],
    [0.600, 0.612, 0.589, 0.596],
    [0.596, 0.606, 0.580, 0.588],
    [0.588, 0.603, 0.579, 0.597],
    [0.597, 0.614, 0.589, 0.608],
    [0.608, 0.623, 0.600, 0.616],
    [0.616, 0.631, 0.609, 0.624],
  ],
  "DOGE/USDT": [
    [0.136, 0.140, 0.133, 0.138],
    [0.138, 0.143, 0.135, 0.141],
    [0.141, 0.146, 0.138, 0.144],
    [0.144, 0.149, 0.141, 0.147],
    [0.147, 0.152, 0.144, 0.150],
    [0.150, 0.154, 0.147, 0.149],
    [0.149, 0.153, 0.145, 0.147],
    [0.147, 0.151, 0.143, 0.146],
    [0.146, 0.151, 0.144, 0.149],
    [0.149, 0.154, 0.147, 0.152],
    [0.152, 0.157, 0.149, 0.155],
    [0.155, 0.160, 0.152, 0.158],
  ],
  "AVAX/USDT": [
    [27.4, 28.0, 27.0, 27.8],
    [27.8, 28.5, 27.5, 28.2],
    [28.2, 29.0, 27.9, 28.7],
    [28.7, 29.5, 28.3, 29.2],
    [29.2, 30.0, 28.8, 29.7],
    [29.7, 30.4, 29.1, 30.1],
    [30.1, 30.7, 29.5, 29.8],
    [29.8, 30.3, 29.2, 29.5],
    [29.5, 30.1, 29.1, 29.9],
    [29.9, 30.6, 29.5, 30.4],
    [30.4, 31.0, 30.0, 30.7],
    [30.7, 31.4, 30.3, 31.1],
  ],
};

const volume = [38, 52, 44, 66, 58, 82, 72, 49, 61, 76, 88, 63];

const asks = [
  ["66,845.21", "0.2453"],
  ["66,844.12", "0.1821"],
  ["66,843.76", "0.1246"],
  ["66,842.90", "0.0987"],
  ["66,842.10", "0.0723"],
];

const bids = [
  ["66,841.32", "0.0917"],
  ["66,840.76", "0.1364"],
  ["66,839.21", "0.2087"],
  ["66,838.45", "0.3421"],
  ["66,837.60", "0.4892"],
];

export default function Trade({ isLoggedIn }) {
  const [pair, setPair] = useState("BTC/USDT");
  const [pairMenuOpen, setPairMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("1M");

  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);

  const [price, setPrice] = useState("66842.10");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const activeCandles = candleSets[pair] || candleSets["BTC/USDT"];
  const activeLastPrice = {
    "BTC/USDT": "66,842.10",
    "ETH/USDT": "3,482.76",
    "SOL/USDT": "184.52",
    "BNB/USDT": "612.38",
    "ICP/USDT": "4.92",
    "ADA/USDT": "0.4518",
    "SHIB/USDT": "0.000013",
    "XRP/USDT": "0.5824",
    "DOGE/USDT": "0.1426",
    "AVAX/USDT": "28.64",
  }[pair] || "66,842.10";

  const selectPair = (nextPair) => {
    setPair(nextPair);
    setPairMenuOpen(false);
  };

  const submitDemoOrder = () => {
    if (!amount || Number(amount) <= 0) {
      setMessage("Enter an amount to preview a demo order.");
      return;
    }

    setMessage(`${side} ${orderType} demo order ready.`);
  };

  const activeMarket = {
    "BTC/USDT": {
      base: "BTC",
      price: 66842.10,
      change: "+2.84%",
      asks: [
        ["67,120.40", "0.8421"],
        ["67,080.20", "1.2640"],
        ["67,024.80", "0.6248"],
      ],
      bids: [
        ["66,842.10", "0.9184"],
        ["66,790.60", "1.4820"],
        ["66,744.20", "0.7316"],
      ],
    },
    "ETH/USDT": {
      base: "ETH",
      price: 3482.76,
      change: "+1.92%",
      asks: [
        ["3,496.80", "2.1840"],
        ["3,490.40", "1.3260"],
        ["3,486.20", "0.8420"],
      ],
      bids: [
        ["3,482.76", "1.9040"],
        ["3,477.40", "2.1460"],
        ["3,471.80", "1.0840"],
      ],
    },
    "SOL/USDT": {
      base: "SOL",
      price: 184.52,
      change: "+4.16%",
      asks: [
        ["185.10", "18.4200"],
        ["184.86", "24.1800"],
        ["184.70", "11.6400"],
      ],
      bids: [
        ["184.52", "21.8400"],
        ["184.20", "16.9200"],
        ["183.86", "29.4100"],
      ],
    },
    "BNB/USDT": {
      base: "BNB",
      price: 612.38,
      change: "+0.87%",
      asks: [
        ["614.20", "4.8200"],
        ["613.60", "7.1400"],
        ["613.02", "3.9600"],
      ],
      bids: [
        ["612.38", "5.6400"],
        ["611.90", "8.1200"],
        ["611.42", "4.2800"],
      ],
    },
    "ICP/USDT": {
      base: "ICP",
      price: 4.92,
      change: "+2.18%",
      asks: [
        ["4.95", "420.00"],
        ["4.94", "318.00"],
        ["4.93", "274.00"],
      ],
      bids: [
        ["4.92", "386.00"],
        ["4.91", "442.00"],
        ["4.90", "296.00"],
      ],
    },
    "ADA/USDT": {
      base: "ADA",
      price: 0.4518,
      change: "+1.13%",
      asks: [
        ["0.4532", "18420"],
        ["0.4528", "12640"],
        ["0.4524", "9820"],
      ],
      bids: [
        ["0.4518", "16480"],
        ["0.4514", "19320"],
        ["0.4510", "14280"],
      ],
    },
    "SHIB/USDT": {
      base: "SHIB",
      price: 0.000013,
      change: "+3.08%",
      asks: [
        ["0.0000132", "84200000"],
        ["0.0000131", "62400000"],
        ["0.0000130", "51800000"],
      ],
      bids: [
        ["0.0000130", "72400000"],
        ["0.0000129", "91800000"],
        ["0.0000128", "48600000"],
      ],
    },
    "XRP/USDT": {
      base: "XRP",
      price: 0.5824,
      change: "-0.64%",
      asks: [
        ["0.5840", "8420"],
        ["0.5832", "6140"],
        ["0.5828", "4280"],
      ],
      bids: [
        ["0.5824", "7640"],
        ["0.5818", "9280"],
        ["0.5812", "5160"],
      ],
    },
    "DOGE/USDT": {
      base: "DOGE",
      price: 0.1426,
      change: "+2.31%",
      asks: [
        ["0.1432", "28400"],
        ["0.1430", "19400"],
        ["0.1428", "16800"],
      ],
      bids: [
        ["0.1426", "24600"],
        ["0.1422", "31200"],
        ["0.1418", "18400"],
      ],
    },
    "AVAX/USDT": {
      base: "AVAX",
      price: 28.64,
      change: "-0.28%",
      asks: [
        ["28.78", "142.40"],
        ["28.72", "186.20"],
        ["28.68", "94.80"],
      ],
      bids: [
        ["28.64", "164.80"],
        ["28.58", "218.40"],
        ["28.52", "126.60"],
      ],
    },
  }[pair] || {
    base: "BTC",
    price: 66842.10,
    change: "+2.84%",
    asks: [],
    bids: [],
  };

  const formatTradePrice = (value) => {
    if (value >= 1000) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (value >= 1) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    }

    if (value >= 0.01) return value.toFixed(4);
    if (value >= 0.0001) return value.toFixed(6);
    return value.toFixed(8);
  };

  const pairOrderBooks = {
    "BTC/USDT": {
      asks: [
        ["67,120.40", "0.8421"],
        ["67,080.20", "1.2640"],
        ["67,024.80", "0.6248"],
      ],
      bids: [
        ["66,842.10", "0.9184"],
        ["66,790.60", "1.4820"],
        ["66,744.20", "0.7316"],
      ],
    },
    "ETH/USDT": {
      asks: [
        ["3,496.80", "2.1840"],
        ["3,490.40", "1.3260"],
        ["3,486.20", "0.8420"],
      ],
      bids: [
        ["3,482.76", "1.9040"],
        ["3,477.40", "2.1460"],
        ["3,471.80", "1.0840"],
      ],
    },
    "SOL/USDT": {
      asks: [
        ["185.10", "18.4200"],
        ["184.86", "24.1800"],
        ["184.70", "11.6400"],
      ],
      bids: [
        ["184.52", "21.8400"],
        ["184.20", "16.9200"],
        ["183.86", "29.4100"],
      ],
    },
    "BNB/USDT": {
      asks: [
        ["614.20", "4.8200"],
        ["613.60", "7.1400"],
        ["613.02", "3.9600"],
      ],
      bids: [
        ["612.38", "5.6400"],
        ["611.90", "8.1200"],
        ["611.42", "4.2800"],
      ],
    },
    "ICP/USDT": {
      asks: [
        ["4.95", "420.00"],
        ["4.94", "318.00"],
        ["4.93", "274.00"],
      ],
      bids: [
        ["4.92", "386.00"],
        ["4.91", "442.00"],
        ["4.90", "296.00"],
      ],
    },
    "ADA/USDT": {
      asks: [
        ["0.4532", "18420"],
        ["0.4528", "12640"],
        ["0.4524", "9820"],
      ],
      bids: [
        ["0.4518", "16480"],
        ["0.4514", "19320"],
        ["0.4510", "14280"],
      ],
    },
    "SHIB/USDT": {
      asks: [
        ["0.0000132", "84200000"],
        ["0.0000131", "62400000"],
        ["0.0000130", "51800000"],
      ],
      bids: [
        ["0.0000130", "72400000"],
        ["0.0000129", "91800000"],
        ["0.0000128", "48600000"],
      ],
    },
    "XRP/USDT": {
      asks: [
        ["0.5840", "8420"],
        ["0.5832", "6140"],
        ["0.5828", "4280"],
      ],
      bids: [
        ["0.5824", "7640"],
        ["0.5818", "9280"],
        ["0.5812", "5160"],
      ],
    },
    "DOGE/USDT": {
      asks: [
        ["0.1432", "28400"],
        ["0.1430", "19400"],
        ["0.1428", "16800"],
      ],
      bids: [
        ["0.1426", "24600"],
        ["0.1422", "31200"],
        ["0.1418", "18400"],
      ],
    },
    "AVAX/USDT": {
      asks: [
        ["28.78", "142.40"],
        ["28.72", "186.20"],
        ["28.68", "94.80"],
      ],
      bids: [
        ["28.64", "164.80"],
        ["28.58", "218.40"],
        ["28.52", "126.60"],
      ],
    },
  };

  const activeOrderBook =
    pairOrderBooks[pair] || pairOrderBooks["BTC/USDT"];



  return (
    <section className="trade-page">
      <div className="trade-chart-card">
        <div className="trade-chart-toolbar">
          <div className="trade-pair-area">
            <button
              type="button"
              className={`trade-pair-trigger${
                pairMenuOpen ? " open" : ""
              }`}
              onClick={() => setPairMenuOpen((open) => !open)}
              aria-expanded={pairMenuOpen}
            >
              <strong>{pair}</strong>
              <ChevronDown size={14} />
            </button>

            <span className="trade-change">{activeMarket.change}</span>
          </div>

          <button
            type="button"
            className="trade-chart-settings"
            aria-label="Chart controls"
          >
            <Settings2 size={16} />
          </button>
        </div>

        {pairMenuOpen && (
          <div className="trade-inline-dropdown">
            <div className="trade-inline-dropdown-title">
              <span>Asset</span>
              <span>Select pair</span>
            </div>

            {pairs.map((item) => (
              <button
                type="button"
                key={item}
                className={item === pair ? "selected" : ""}
                onClick={() => selectPair(item)}
              >
                <span>{item}</span>
                {item === pair && <Check size={14} />}
              </button>
            ))}
          </div>
        )}

        <div className="trade-timeframe-row">
          {timeframes.map((item) => (
            <button
              type="button"
              key={item}
              className={timeframe === item ? "active" : ""}
              onClick={() => setTimeframe(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="trade-chart-area">
          <div className="trade-price-axis">
            <span>67,200</span>
            <span className="current">66,842.10</span>
            <span>66,400</span>
            <span>66,000</span>
            <span>65,600</span>
          </div>

          <div className="trade-chart-main">
            <div className="trade-chart-grid">
              {Array.from({ length: 5 }).map((_, index) => (
                <i className="horizontal" key={`h-${index}`} />
              ))}

              {Array.from({ length: 7 }).map((_, index) => (
                <i className="vertical" key={`v-${index}`} />
              ))}
            </div>

            <div className="trade-candle-area">
              {activeCandles.map(([open, high, low, close], index) => {
                const min = 65000;
                const max = 69000;
                const range = max - min;

                const top = ((max - high) / range) * 100;
                const bottom = ((max - low) / range) * 100;
                const bodyTop =
                  ((max - Math.max(open, close)) / range) * 100;
                const bodyBottom =
                  ((max - Math.min(open, close)) / range) * 100;

                return (
                  <div className="trade-candle" key={index}>
                    <span
                      className="trade-wick"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(1, bottom - top)}%`,
                      }}
                    />

                    <span
                      className={`trade-candle-body ${
                        close >= open ? "up" : "down"
                      }`}
                      style={{
                        top: `${bodyTop}%`,
                        height: `${Math.max(
                          1.2,
                          bodyBottom - bodyTop
                        )}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="trade-current-price">${formatTradePrice(activeMarket.price)}</div>

            <div className="trade-volume-area">
              {volume.map((height, index) => (
                <span
                  key={index}
                  style={{ height: `${height}%` }}
                  className={index % 3 === 0 ? "down" : "up"}
                />
              ))}
            </div>

            <div className="trade-time-axis">
              <span>12:00</span>
              <span>12:30</span>
              <span>13:00</span>
              <span>13:30</span>
            </div>
          </div>
        </div>
      </div>

      <div className="trade-bottom-grid">
        <div className="trade-order-card">
          <div className="trade-side-tabs">
            <button
              type="button"
              className={side === "Buy" ? "buy active" : "buy"}
              onClick={() => setSide("Buy")}
            >
              Buy
            </button>

            <button
              type="button"
              className={side === "Sell" ? "sell active" : "sell"}
              onClick={() => setSide("Sell")}
            >
              Sell
            </button>
          </div>

          <div className="trade-order-type-wrap">
            <button
              type="button"
              className={`trade-order-type${
                orderTypeOpen ? " open" : ""
              }`}
              onClick={() => setOrderTypeOpen((open) => !open)}
              aria-expanded={orderTypeOpen}
            >
              <span>{orderType}</span>
              <ChevronDown size={13} />
            </button>

            {orderTypeOpen && (
              <div className="trade-order-type-menu">
                {["Limit", "Market"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={type === orderType ? "selected" : ""}
                    onClick={() => {
                      setOrderType(type);
                      setOrderTypeOpen(false);
                    }}
                  >
                    <span>{type}</span>
                    {type === orderType && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {orderType === "Limit" && (
            <label className="trade-field">
              <span>Price (USDT)</span>
              <div>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  inputMode="decimal"
                />
                <em>USDT</em>
              </div>
            </label>
          )}

          <label className="trade-field">
            <span>Amount ({activeMarket.base})</span>
            <div>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.0000"
                inputMode="decimal"
              />
              <em>{activeMarket.base}</em>
            </div>
          </label>

          <div className="trade-percentages">
            {[25, 50, 75, 100].map((percent) => (
              <button
                type="button"
                key={percent}
                onClick={() =>
                  setMessage(`${percent}% demo selection applied.`)
                }
              >
                {percent}%
              </button>
            ))}
          </div>

          {isLoggedIn && (
            <div className="trade-total">
              <span>Total ({side === "Buy" ? "USDT" : activeMarket.base})</span>
              <strong>
                {(
                  (Number(price) || 0) *
                  (Number(amount) || 0)
                ).toFixed(2)}
              </strong>
            </div>
          )}

          <button
            type="button"
            className={`trade-submit ${side.toLowerCase()}`}
            onClick={submitDemoOrder}
          >
            {side} {activeMarket.base}
          </button>

          <p className="trade-demo-note">
            Demo trading only. Sign in later to enable account trading.
          </p>

          {message && <p className="trade-message">{message}</p>}
        </div>

        <div className="trade-book-card">
          <div className="trade-book-heading">
            <strong>Order Book</strong>

            <button
              type="button"
              aria-label="Refresh order book"
              className="trade-book-refresh"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="trade-book-columns">
            <span>Price (USDT)</span>
            <span>Amount ({activeMarket.base})</span>
          </div>

          <div className="trade-book-list asks">
            {activeOrderBook.asks.map(([bookPrice, bookAmount]) => (
              <div key={bookPrice}>
                <span>{bookPrice}</span>
                <span>{bookAmount}</span>
              </div>
            ))}
          </div>

          <div className="trade-book-mid">
            <strong>{formatTradePrice(activeMarket.price)}</strong>
          </div>

          <div className="trade-book-list bids">
            {activeOrderBook.bids.map(([bookPrice, bookAmount], index) => (
              <div
                key={bookPrice}
                className={index === 0 ? "highlight" : ""}
              >
                <span>{bookPrice}</span>
                <span>{bookAmount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>


  );
}
