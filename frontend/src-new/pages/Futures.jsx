import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, ChevronDown, X } from "lucide-react";

const demoPrice = 66842.10;

const initialPositions = [];

export default function Futures({ isLoggedIn }) {
  const [side, setSide] = useState("Long");
  const [orderType, setOrderType] = useState("Limit");
  const [price, setPrice] = useState(String(demoPrice));
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [positions, setPositions] = useState(initialPositions);
  const [message, setMessage] = useState("");

  const positionValue = useMemo(() => {
    const p = Number(price) || 0;
    const a = Number(amount) || 0;
    return p * a;
  }, [price, amount]);

  function submitOrder(event) {
    event.preventDefault();

    const numericAmount = Number(amount);
    const numericPrice = Number(price);

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (orderType === "Limit" && (!numericPrice || numericPrice <= 0)) {
      setMessage("Enter a valid limit price.");
      return;
    }

    const entryPrice = orderType === "Market" ? demoPrice : numericPrice;

    setPositions((current) => [
      ...current,
      {
        id: Date.now(),
        side,
        entryPrice,
        amount: numericAmount,
        leverage,
        pnl: 0,
      },
    ]);

    setAmount("");
    setMessage(
      `Demo ${side.toLowerCase()} ${orderType.toLowerCase()} order opened.`
    );
  }

  function closePosition(id) {
    setPositions((current) => current.filter((position) => position.id !== id));
    setMessage("Demo position closed.");
  }

  return (
    <section className="futures-page">
      <div className="futures-heading">
        <div>
          <span className="section-kicker">DERIVATIVES</span>
          <h1>Futures</h1>
          <p>Trade perpetual contracts with a simple demo environment.</p>
        </div>

        <div className="futures-risk">
          <span>Risk level</span>
          <strong>LOW</strong>
        </div>
      </div>

      <div className="futures-market-bar">
        <div className="futures-pair">
          <div className="pair-icon">₿</div>
          <div>
            <strong>BTC/USDT</strong>
            <span>Perpetual</span>
          </div>
        </div>

        <div className="futures-stat">
          <span>Mark Price</span>
          <strong>${demoPrice.toLocaleString()}</strong>
        </div>

        <div className="futures-stat">
          <span>24h Change</span>
          <strong className="positive">+2.84%</strong>
        </div>

        <div className="futures-stat">
          <span>Index Price</span>
          <strong>$66,835.70</strong>
        </div>

        <div className="futures-stat">
          <span>Funding</span>
          <strong>0.0100%</strong>
        </div>
      </div>

      <div className="futures-layout">
        <div className="futures-chart-card">
          <div className="futures-card-header">
            <div>
              <strong>BTC/USDT Perpetual</strong>
              <span>Demo chart</span>
            </div>

            <div className="futures-chart-actions">
              {["1m", "5m", "15m", "1H", "4H", "1D"].map((timeframe) => (
                <button
                  key={timeframe}
                  type="button"
                  className={timeframe === "5m" ? "active" : ""}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>

          <div className="futures-chart">
            <div className="chart-grid">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg
              className="demo-chart-line"
              viewBox="0 0 900 360"
              preserveAspectRatio="none"
              aria-label="Demo futures chart"
            >
              <defs>
                <linearGradient id="futuresFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopOpacity="0.28" />
                  <stop offset="100%" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M0 290 L65 260 L110 274 L160 218 L205 232 L250 190 L300 205 L345 150 L390 175 L435 125 L480 142 L525 110 L570 132 L615 90 L665 108 L710 68 L760 92 L810 55 L860 74 L900 35 L900 360 L0 360 Z"
                fill="url(#futuresFill)"
              />

              <path
                d="M0 290 L65 260 L110 274 L160 218 L205 232 L250 190 L300 205 L345 150 L390 175 L435 125 L480 142 L525 110 L570 132 L615 90 L665 108 L710 68 L760 92 L810 55 L860 74 L900 35"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="chart-price-label">${demoPrice.toLocaleString()}</div>
          </div>
        </div>

        <aside className="futures-order-card">
          <div className="order-card-heading">
            <div>
              <span>Order</span>
              <strong>BTC/USDT</strong>
            </div>

            <BarChart3 size={19} strokeWidth={1.8} />
          </div>

          <div className="futures-mode-row">
            <span>Margin Mode</span>
            <button type="button">
              Cross
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="futures-mode-row">
            <span>Position Mode</span>
            <button type="button">
              One-Way
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="futures-tabs">
            <button
              type="button"
              className={side === "Long" ? "active long" : ""}
              onClick={() => setSide("Long")}
            >
              Long
            </button>
            <button
              type="button"
              className={side === "Short" ? "active short" : ""}
              onClick={() => setSide("Short")}
            >
              Short
            </button>
          </div>

          <div className="futures-order-types">
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

          <form onSubmit={submitOrder} className="futures-form">
            {orderType === "Limit" && (
              <label className="futures-field">
                <span>Price</span>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.00"
                  />
                  <em>USDT</em>
                </div>
              </label>
            )}

            <label className="futures-field">
              <span>Amount</span>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.0000"
                />
                <em>BTC</em>
              </div>
            </label>

            <div className="leverage-field">
              <div>
                <span>Leverage</span>
                <strong>{leverage}x</strong>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={leverage}
                onChange={(event) => setLeverage(Number(event.target.value))}
              />
              <div className="leverage-scale">
                <span>1x</span>
                <span>10x</span>
                <span>25x</span>
                <span>50x</span>
              </div>
            </div>

            <div className="futures-order-summary">
              <span>Order Value</span>
              <strong>
                ${positionValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            {isLoggedIn && (
<div className="futures-balance-row">
              <span>Available Margin</span>
              <strong>1,000.00 USDT</strong>
            </div>
)}

            <button
              className={`futures-submit ${side.toLowerCase()}`}
              type="submit"
            >
              {side === "Long" ? <ArrowUp size={17} /> : <ArrowDown size={17} />}
              {side} {orderType}
            </button>

            {message && <p className="futures-message">{message}</p>}
          </form>
        </aside>
      </div>

      <section className="positions-card">
        <div className="positions-header">
          <div>
            <span className="section-kicker">ACCOUNT</span>
            <h2>Open Positions</h2>
          </div>
          <span className="position-count">{positions.length} Active</span>
        </div>

        {positions.length === 0 ? (
          <div className="empty-positions">
            <div className="empty-icon">+</div>
            <strong>No open positions</strong>
            <span>Your demo positions will appear here after an order.</span>
          </div>
        ) : (
          <div className="positions-table-wrap">
            <table className="positions-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Side</th>
                  <th>Entry Price</th>
                  <th>Amount</th>
                  <th>Leverage</th>
                  <th>Unrealized PNL</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.id}>
                    <td>
                      <strong>BTC/USDT</strong>
                      <span>Perpetual</span>
                    </td>
                    <td>
                      <span
                        className={`position-side ${position.side.toLowerCase()}`}
                      >
                        {position.side}
                      </span>
                    </td>
                    <td>${position.entryPrice.toLocaleString()}</td>
                    <td>{position.amount} BTC</td>
                    <td>{position.leverage}x</td>
                    <td className="neutral-pnl">0.00 USDT</td>
                    <td>
                      <button
                        className="close-position"
                        type="button"
                        onClick={() => closePosition(position.id)}
                        aria-label="Close position"
                      >
                        <X size={16} />
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isLoggedIn && (
<div className="futures-info-grid">
        <div>
          <span>Available Balance</span>
          <strong>1,000.00 USDT</strong>
        </div>
        <div>
          <span>Used Margin</span>
          <strong>0.00 USDT</strong>
        </div>
        <div>
          <span>Maintenance Margin</span>
          <strong>0.00 USDT</strong>
        </div>
        <div>
          <span>Unrealized PNL</span>
          <strong>0.00 USDT</strong>
        </div>
      </div>
)}
    </section>
  );
}
