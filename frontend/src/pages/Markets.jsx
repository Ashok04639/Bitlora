import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const FALLBACK_PAIRS = [
  "BTC/USDT",
  "ETH/USDT",
  "BNB/USDT",
  "SOL/USDT",
  "XRP/USDT",
];

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";

  const numeric = Number(String(value).replace(/[$,]/g, ""));
  if (!Number.isFinite(numeric)) return String(value);

  return `$${numeric.toLocaleString("en-US", {
    minimumFractionDigits: numeric >= 1 ? 2 : 4,
    maximumFractionDigits: numeric >= 1 ? 2 : 6,
  })}`;
}

function formatChange(value) {
  if (value === null || value === undefined || value === "") return "—";

  const text = String(value).trim();
  const numeric = Number(text.replace("%", "").replace("+", ""));

  if (!Number.isFinite(numeric)) return text;

  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(2)}%`;
}

function formatVolume(value) {
  if (value === null || value === undefined || value === "") return "—";

  const numeric = Number(String(value).replace(/[$,]/g, ""));
  if (!Number.isFinite(numeric)) return String(value);

  return numeric.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function getChangeValue(value) {
  const numeric = Number(String(value ?? "").replace("%", "").replace("+", ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export default function Markets() {
  const [marketsData, setMarketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadMarkets = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.markets();

        if (!mounted) return;

        if (data.success && Array.isArray(data.markets)) {
          setMarketsData(data.markets);
        } else {
          setMarketsData([]);
          setError("Market data is currently unavailable.");
        }
      } catch {
        if (!mounted) return;

        setMarketsData([]);
        setError("Unable to connect to the market service.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMarkets();

    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (marketsData.length > 0) {
      return marketsData.map((market) => ({
        pair: market.pair || market.symbol || "—",
        price: market.price,
        change: market.change ?? market.change24h ?? market.priceChangePercent,
        volume:
          market.volume ??
          market.volume24h ??
          market.quoteVolume ??
          market.volumeUSDT,
      }));
    }

    if (loading) return [];

    return FALLBACK_PAIRS.map((pair) => ({
      pair,
      price: null,
      change: null,
      volume: null,
    }));
  }, [marketsData, loading]);

  return (
    <section className="page-section markets-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MARKETS</span>
          <h1>Markets</h1>
        </div>

        <span>
          {loading ? "Loading live market data…" : "Spot market overview"}
        </span>
      </div>

      <div className="table-card">
        <div className="table-head">
          <span>Pair</span>
          <span>Last Price</span>
          <span>24h Change</span>
          <span>24h Volume</span>
        </div>

        {loading ? (
          <div className="market-state">
            Loading market data…
          </div>
        ) : error ? (
          <div className="market-state market-state-error">
            {error}
          </div>
        ) : (
          rows.map((market) => {
            const changeValue = getChangeValue(market.change);

            return (
              <div className="table-row" key={market.pair}>
                <strong>{market.pair}</strong>

                <span>{formatPrice(market.price)}</span>

                <span
                  className={
                    changeValue > 0
                      ? "positive"
                      : changeValue < 0
                        ? "negative"
                        : "neutral"
                  }
                >
                  {formatChange(market.change)}
                </span>

                <span>{formatVolume(market.volume)}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
