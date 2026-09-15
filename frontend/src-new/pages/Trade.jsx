import { useMemo, useState } from "react";
import { BarChart3, ChevronDown, Clock3, RefreshCw } from "lucide-react";

const timeframes = ["1S", "1M", "5M", "15M", "30M", "1H", "4H", "1D", "1M"];

const candles = [
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
];

const asks = [
  ["68,021.40", "0.184"],
  ["67,982.10", "0.236"],
  ["67,914.80", "0.412"],
  ["67,862.50", "0.158"],
  ["67,804.20", "0.327"],
];

const bids = [
  ["67,756.80", "0.291"],
  ["67,704.60", "0.384"],
  ["67,648.30", "0.176"],
  ["67,592.90", "0.428"],
  ["67,536.10", "0.215"],
];

export default function Trade({ isLoggedIn }) {
  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [timeframe, setTimeframe] = useState("1M");
  const [price, setPrice] = useState("66842.10");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const total = useMemo(() => {
    const p = Number(price) || 0;
    const a = Number(amount) || 0;
    return (p * a).toFixed(2);
  }, [price, amount]);

  const submitOrder = () => {
    if (!amount || Number(amount) <= 0) {
      setMessage("Enter an amount to place a demo order.");
      return;
    }

    setMessage(
      `${side} ${orderType} demo order placed for ${amount} BTC.`
    );
    setAmount("");
  };

  return (
    <section className="trade">
      <div className="trade-topbar">
        <div className="trade-pair">
          <strong>BTC/USDT</strong>
          <span>Spot</span>
        </div>

        <div className="trade-price">
          <strong>$66,842.10</strong>
          <span>+2.84%</span>
        </div>

        <div className="trade-stats">
          <div><span>24h High</span><strong>$68,120.00</strong></div>
          <div><span>24h Low</span><strong>$64,910.40</strong></div>
          <div><span>24h Volume</span><strong>$1.82B</strong></div>
        </div>
      </div>

      <div className="trade-chart-card">
        <div className="trade-chart-header">
          <div className="trade-chart-title">
            <BarChart3 size={17} />
            <span>BTC/USDT</span>
            <span className="trade-demo-label">DEMO CHART</span>
          </div>

          <div className="trade-timeframes">
            {timeframes.map((item) => (
              <button
                key={item}
                type="button"
                className={timeframe === item ? "active" : ""}
                onClick={() => setTimeframe(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="trade-chart">
          <div className="trade-y-axis">
            <span>68.5k</span>
            <span>68.0k</span>
            <span>67.5k</span>
            <span>67.0k</span>
            <span>66.5k</span>
            <span>66.0k</span>
          </div>

          <div className="trade-candle-area">
            <div className="trade-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <i key={`h-${index}`} />
              ))}
              {Array.from({ length: 12 }).map((_, index) => (
                <b key={`v-${index}`} />
              ))}
            </div>

            <div className="trade-candles">
              {candles.map(([open, high, low, close], index) => {
                const top = 100 - ((high - 66) / 2.5) * 100;
                const bottom = 100 - ((low - 66) / 2.5) * 100;
                const bodyTop = 100 - ((Math.max(open, close) - 66) / 2.5) * 100;
                const bodyBottom = 100 - ((Math.min(open, close) - 66) / 2.5) * 100;
                const rising = close >= open;

                return (
                  <div className="trade-candle" key={index}>
                    <span
                      className="trade-wick"
                      style={{ top: `${top}%`, height: `${Math.max(4, bottom - top)}%` }}
                    />
                    <span
                      className={`trade-body ${rising ? "up" : "down"}`}
                      style={{
                        top: `${bodyTop}%`,
                        height: `${Math.max(2, bodyBottom - bodyTop)}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="trade-current-price">$66,842.10</div>
          </div>
        </div>
      </div>

      <div className="trade-workspace">
        <div className="trade-order-card">
          <div className="trade-card-title">
            <div>
              <span>Execution</span>
              <strong>{side} BTC</strong>
            </div>
            {isLoggedIn && (
                <span className="trade-balance">Available 1,000 USDT</span>
              )}
          </div>

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

          <div className="trade-order-types">
            {["Limit", "Market"].map((type) => (
              <button
                key={type}
                type="button"
                className={orderType === type ? "active" : ""}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {orderType === "Limit" && (
            <label className="trade-field">
              <span>Price</span>
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
            <span>Amount</span>
            <div>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
              <em>BTC</em>
            </div>
          </label>

          <div className="trade-percent">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      setMessage("Log in to use your available balance.");
                      return;
                    }

                    setAmount(
                      ((1000 * percent) / 100 / (Number(price) || 66842.1)).toFixed(6)
                    );
                  }}
                >
                  {percent}%
                </button>
              ))}
            </div>

            <div className="trade-total">
            <span>Total</span>
            <strong>{total} USDT</strong>
          </div>

          <button
            type="button"
            className={`trade-submit ${side.toLowerCase()}`}
            onClick={submitOrder}
          >
            {side} BTC
          </button>

          {message && <p className="trade-message">{message}</p>}
        </div>

        <div className="trade-book-card">
          <div className="trade-card-title">
            <div>
              <span>Order Book</span>
              <strong>BTC/USDT</strong>
            </div>
            <button type="button" className="trade-refresh" aria-label="Refresh demo order book">
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="trade-book-head">
            <span>Price (USDT)</span>
            <span>Amount (BTC)</span>
          </div>

          <div className="trade-orders asks">
            {asks.map(([bookPrice, bookAmount]) => (
              <div key={bookPrice}>
                <span>{bookPrice}</span>
                <span>{bookAmount}</span>
              </div>
            ))}
          </div>

          <div className="trade-mid-price">
            <strong>$66,842.10</strong>
            <span>Last price</span>
          </div>

          <div className="trade-orders bids">
            {bids.map(([bookPrice, bookAmount]) => (
              <div key={bookPrice}>
                <span>{bookPrice}</span>
                <span>{bookAmount}</span>
              </div>
            ))}
          </div>

          <div className="trade-book-footer">
            <Clock3 size={14} />
            Demo market depth
          </div>
        </div>
      </div>
    </section>
  );
}
