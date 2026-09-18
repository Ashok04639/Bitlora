import { Search, Star } from "lucide-react";
import CoinLogo from "../components/CoinLogo";
import { useEffect, useMemo, useState } from "react";

import { markets, marketTabs } from "../data/marketData";
import { getTotalCoins, getUniqueCoins } from "../utils/totalCoins";


function MarketsSurface() {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora-market-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const totalCoins = getTotalCoins(markets);

  useEffect(() => {
    localStorage.setItem(
      "bitlora-market-favorites",
      JSON.stringify([...favorites])
    );
  }, [favorites]);

  const filteredMarkets = useMemo(() => {
    let result = markets;

    if (activeTab === "Favorites") {
      result = result.filter((market) => favorites.has(market.pair));
    } else if (activeTab === "USDT") {
      result = result.filter((market) => market.pair.endsWith("/USDT"));
    } else if (activeTab === "USDC") {
      result = result.filter((market) => market.pair.endsWith("/USDC"));
    } else if (activeTab === "BTC") {
      result = result.filter((market) => market.pair.startsWith("BTC/"));
    } else if (activeTab === "ETH") {
      result = result.filter((market) => market.pair.startsWith("ETH/"));
    } else if (activeTab === "SOL") {
      result = result.filter((market) => market.pair.startsWith("SOL/"));
    } else {
      result = getUniqueCoins(markets);
    }

    if (query.trim()) {
      const search = query.trim().toLowerCase();
      result = result.filter((market) =>
        market.pair.toLowerCase().includes(search) ||
        market.name.toLowerCase().includes(search)
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
          <h1>Live Crypto Prices &amp; 24 Hours Market Activity</h1>
        </div>

        <span className="markets-demo-badge">DEMO DATA</span>
      </div>

      <div className="markets-toolbar">
        <div className="markets-tabs">
          <button
            type="button"
            className={`markets-tab${activeTab === "Favorites" ? " active" : ""}`}
            onClick={() => setActiveTab("Favorites")}
          >
            <Star
                    size={14}
                    strokeWidth={2.2}
                    fill={activeTab === "Favorites" ? "#f5c451" : "none"}
                  />
            Favorites
          </button>

          {marketTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`markets-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
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
                        <Star
                          size={15}
                          strokeWidth={2.2}
                          fill={favorites.has(market.pair) ? "#f5c451" : "none"}
                        />
                      </button>
                      <CoinLogo
                        coin={market.coinClass}
                        name={market.name}
                      />
                      <div className="market-name-copy">
                        <strong>{market.pair}</strong>
                        <span>{market.name}</span>
                      </div>
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

function PublicMarkets() {
  return <MarketsSurface />;
}

function LoggedInMarkets() {
  return <MarketsSurface />;
}

export default function Markets({ isLoggedIn }) {
  if (isLoggedIn) {
    return <LoggedInMarkets />;
  }

  return <PublicMarkets />;
}

