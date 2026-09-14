import { useMemo, useState } from "react";

const FUTURES_PAIRS = ["BTC/USDT", "ETH/USDT", "BNB/USDT"];

export default function Futures() {
  const [futuresPair, setFuturesPair] = useState("BTC/USDT");
  const [futuresMarketPrice] = useState(66842.1);
  const [futuresAvailableMargin] = useState(1000);

  const [futuresMarginMode] = useState("Cross");
  const [futuresLeverage, setFuturesLeverage] = useState(10);
  const [futuresPositionMode] = useState("One-Way");

  const [futuresSide, setFuturesSide] = useState("Long");
  const [futuresOrderType, setFuturesOrderType] = useState("Limit");

  const [futuresPrice, setFuturesPrice] = useState("");
  const [futuresAmount, setFuturesAmount] = useState("");
  const [futuresAmountUnit] = useState("USDT");

  const [futuresNotional, setFuturesNotional] = useState(0);
  const [futuresInitialMargin, setFuturesInitialMargin] = useState(0);
  const [futuresLiquidationPrice, setFuturesLiquidationPrice] = useState(0);
  const [futuresMarginUsage, setFuturesMarginUsage] = useState(0);

  const [futuresMessage, setFuturesMessage] = useState("");
  const [futuresTab, setFuturesTab] = useState("Positions");
  const [futuresPositions, setFuturesPositions] = useState([]);

  const effectivePrice = useMemo(() => {
    const entered = Number(futuresPrice);

    if (futuresOrderType === "Market") {
      return futuresMarketPrice;
    }

    return entered > 0 ? entered : futuresMarketPrice;
  }, [futuresOrderType, futuresPrice, futuresMarketPrice]);

  const placeFuturesOrder = () => {
    const amount = Number(futuresAmount || 0);
    const price = Number(
      futuresPrice || futuresMarketPrice || 0
    );

    if (!amount || amount <= 0) {
      setFuturesMessage("Enter a valid order size.");
      return;
    }

    if (!price || price <= 0) {
      setFuturesMessage("Enter a valid price.");
      return;
    }

    const notional =
      futuresAmountUnit === "Asset"
        ? amount * price
        : amount;

    const leverage = Number(futuresLeverage || 1);
    const initialMargin = notional / leverage;

    setFuturesNotional(notional);
    setFuturesInitialMargin(initialMargin);

    const usage =
      futuresAvailableMargin > 0
        ? Math.min(
            100,
            (initialMargin / futuresAvailableMargin) * 100
          )
        : 0;

    setFuturesMarginUsage(usage);

    const liquidationPrice =
      futuresSide === "Long"
        ? Math.max(
            0,
            futuresMarketPrice * (1 - 0.9 / leverage)
          )
        : futuresMarketPrice * (1 + 0.9 / leverage);

    setFuturesLiquidationPrice(liquidationPrice);

    const newPosition = {
      id: Date.now(),
      pair: futuresPair,
      side: futuresSide,
      leverage,
      size: amount,
      entry: price,
      mark: futuresMarketPrice,
      liquidationPrice,
      pnl: 0,
      roi: 0,
    };

    setFuturesPositions((prev) => [...prev, newPosition]);

    setFuturesMessage(
      `${futuresSide} order prepared successfully (${futuresOrderType}).`
    );
  };

  const closeFuturesPosition = (positionId) => {
    setFuturesPositions((prev) =>
      prev.filter((position) => position.id !== positionId)
    );

    setFuturesMessage("Futures position closed.");
  };

  return (
    <section className="page-section futures-page">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">PERPETUAL FUTURES</span>
          <h1>{futuresPair}</h1>
        </div>

        <div className="futures-header-meta">
          <strong>{futuresMarginMode}</strong>
          <span>{futuresLeverage}x</span>
          <span className="futures-main-price">
            ${futuresMarketPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <div className="futures-layout">
        <div className="futures-chart panel">
          <div className="panel-title">
            <div className="futures-pair-control">
              <select
                value={futuresPair}
                onChange={(event) =>
                  setFuturesPair(event.target.value)
                }
                aria-label="Futures pair"
              >
                {FUTURES_PAIRS.map((pair) => (
                  <option key={pair}>{pair}</option>
                ))}
              </select>

              <span>Perpetual</span>
            </div>

            <span className="futures-chart-price">
              ${futuresMarketPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="chart-placeholder futures-chart-placeholder">
            <span>Futures Chart</span>
            <small>Live chart integration ready</small>
          </div>
        </div>

        <div className="futures-order panel">
          <div className="panel-title">
            <span>Open Position</span>
            <span className="futures-margin-label">
              Available ${futuresAvailableMargin.toFixed(2)}
            </span>
          </div>

          <div className="panel-tabs futures-side-tabs">
            <button
              type="button"
              className={futuresSide === "Long" ? "selected" : ""}
              onClick={() => setFuturesSide("Long")}
            >
              Long
            </button>

            <button
              type="button"
              className={futuresSide === "Short" ? "selected" : ""}
              onClick={() => setFuturesSide("Short")}
            >
              Short
            </button>
          </div>

          <div className="order-type-tabs">
            {["Limit", "Market"].map((type) => (
              <button
                type="button"
                key={type}
                className={
                  futuresOrderType === type ? "selected" : ""
                }
                onClick={() => setFuturesOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {futuresOrderType === "Limit" && (
            <label className="order-field">
              <span>Price (USDT)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={futuresPrice}
                onChange={(event) =>
                  setFuturesPrice(event.target.value)
                }
                placeholder={futuresMarketPrice.toFixed(2)}
              />
            </label>
          )}

          <label className="order-field">
            <span>Amount ({futuresAmountUnit})</span>
            <input
              type="number"
              min="0"
              step="any"
              value={futuresAmount}
              onChange={(event) =>
                setFuturesAmount(event.target.value)
              }
              placeholder="0.00"
            />
          </label>

          <div className="futures-leverage-row">
            <span>Leverage</span>

            <select
              value={futuresLeverage}
              onChange={(event) =>
                setFuturesLeverage(Number(event.target.value))
              }
              aria-label="Futures leverage"
            >
              {[1, 2, 3, 5, 10, 20, 25, 50, 75, 100].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}x
                  </option>
                )
              )}
            </select>
          </div>

          <div className="futures-order-summary">
            <div>
              <span>Order Value</span>
              <strong>
                ${futuresNotional.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Initial Margin</span>
              <strong>
                ${futuresInitialMargin.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Est. Liquidation</span>
              <strong>
                {futuresLiquidationPrice > 0
                  ? `$${futuresLiquidationPrice.toFixed(2)}`
                  : "—"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className={
              futuresSide === "Long"
                ? "submit-buy"
                : "submit-sell"
            }
            onClick={placeFuturesOrder}
          >
            {futuresSide === "Long"
              ? "Open Long"
              : "Open Short"}
          </button>

          {futuresMessage && (
            <div className="trade-message">
              {futuresMessage}
            </div>
          )}
        </div>
      </div>

      <div className="futures-account panel">
        <div className="futures-account-grid">
          <div>
            <span>Margin Mode</span>
            <strong>{futuresMarginMode}</strong>
          </div>

          <div>
            <span>Position Mode</span>
            <strong>{futuresPositionMode}</strong>
          </div>

          <div>
            <span>Available Margin</span>
            <strong>
              ${futuresAvailableMargin.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Margin Usage</span>
            <strong>
              {futuresMarginUsage.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      <div className="positions panel">
        <div className="panel-tabs futures-data-tabs">
          {["Positions", "Orders"].map((tab) => (
            <button
              type="button"
              key={tab}
              className={futuresTab === tab ? "selected" : ""}
              onClick={() => setFuturesTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {futuresTab === "Positions" && (
          futuresPositions.length === 0 ? (
            <div className="empty-state">
              No open positions
            </div>
          ) : (
            <div className="futures-position-list">
              {futuresPositions.map((position) => (
                <div
                  className="futures-position-row"
                  key={position.id}
                >
                  <div>
                    <strong>{position.pair}</strong>
                    <span
                      className={
                        position.side === "Long"
                          ? "positive"
                          : "negative"
                      }
                    >
                      {position.side} · {position.leverage}x
                    </span>
                  </div>

                  <div>
                    <span>Size</span>
                    <strong>
                      {position.size} USDT
                    </strong>
                  </div>

                  <div>
                    <span>Entry</span>
                    <strong>
                      ${position.entry.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Mark</span>
                    <strong>
                      ${position.mark.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Liquidation</span>
                    <strong>
                      ${position.liquidationPrice.toFixed(2)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      closeFuturesPosition(position.id)
                    }
                  >
                    Close
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {futuresTab === "Orders" && (
          <div className="empty-state">
            No futures orders
          </div>
        )}
      </div>

      <div className="futures-risk-note">
        Futures order calculations are simulated locally. Existing
        futures behavior is preserved without changing backend services.
      </div>
    </section>
  );
}
