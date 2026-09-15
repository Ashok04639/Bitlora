import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

const markets = [
  { pair: "BTC/USDT", price: "66,842.10", change: "+2.84%", high: "68,120.00", low: "64,910.40", volume: "1.82B" },
  { pair: "ETH/USDT", price: "3,482.76", change: "+1.92%", high: "3,566.20", low: "3,401.18", volume: "946.30M" },
  { pair: "SOL/USDT", price: "184.52", change: "+4.16%", high: "191.80", low: "176.42", volume: "512.74M" },
  { pair: "BNB/USDT", price: "612.38", change: "+0.87%", high: "621.44", low: "601.20", volume: "284.16M" },
  { pair: "XRP/USDT", price: "0.5824", change: "-0.64%", high: "0.5948", low: "0.5712", volume: "198.52M" },
  { pair: "ADA/USDT", price: "0.4518", change: "+1.13%", high: "0.4632", low: "0.4410", volume: "126.84M" },
  { pair: "DOGE/USDT", price: "0.1426", change: "+2.31%", high: "0.1478", low: "0.1372", volume: "164.27M" },
  { pair: "AVAX/USDT", price: "28.64", change: "-0.28%", high: "29.72", low: "27.91", volume: "82.45M" },
];

const tabs = ["Favorites", "Spot"];

export default function Markets() {
  const [activeTab, setActiveTab] = useState("Spot");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());

  const filteredMarkets = useMemo(() => {
    let result = markets;

    if (activeTab === "Favorites") {
      result = result.filter((market) => favorites.has(market.pair));
    }

    if (query.trim()) {
      const search = query.trim().toLowerCase();
      result = result.filter((market) =>
        market.pair.toLowerCase().includes(search)
      );
    }

    return result;
  }, [activeTab, query, favorites]);

  const toggleFavorite = (pair) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(pair)) next.delete(pair);
      else next.add(pair);
      return next;
    });
  };

  return (
    <section className="markets">
      <div className="markets-heading">
        <div>
          <span className="markets-eyebrow">MARKETS</span>
          <h1>Explore markets</h1>
          <p>Track demo prices, market ranges and 24-hour activity.</p>
        </div>

        <span className="markets-demo-badge">DEMO DATA</span>
      </div>

      <div className="markets-toolbar">
        <div className="markets-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`markets-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Favorites" && <Star size={14} />}
              {tab}
            </button>
          ))}
        </div>

        <label className="markets-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search markets"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search markets"
          />
        </label>
      </div>

      <div className="markets-table-wrap">
        <table className="markets-table">
          <thead>
            <tr>
              <th>Market</th>
              <th>Last Price</th>
              <th>24h Change</th>
              <th>24h High</th>
              <th>24h Low</th>
              <th>24h Volume</th>
            </tr>
          </thead>

          <tbody>
            {filteredMarkets.map((market) => {
              const positive = market.change.startsWith("+");

              return (
                <tr key={market.pair}>
                  <td>
                    <div className="market-name">
                      <button
                        type="button"
                        className={`market-star${favorites.has(market.pair) ? " selected" : ""}`}
                        onClick={() => toggleFavorite(market.pair)}
                        aria-label={`Favorite ${market.pair}`}
                      >
                        <Star size={15} />
                      </button>
                      <strong>{market.pair}</strong>
                      <span>Spot</span>
                    </div>
                  </td>
                  <td className="market-price">${market.price}</td>
                  <td className={positive ? "positive" : "negative"}>
                    {market.change}
                  </td>
                  <td>${market.high}</td>
                  <td>${market.low}</td>
                  <td>${market.volume}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMarkets.length === 0 && (
          <div className="markets-empty">
            No markets match your search.
          </div>
        )}
      </div>
    </section>
  );
}
