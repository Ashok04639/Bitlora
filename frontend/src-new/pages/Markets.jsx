import { Search, Star } from "lucide-react";
import CoinLogo from "../components/CoinLogo";
import { useMemo, useState } from "react";

const markets = [
  {
    pair: "BTC/USDT",
    name: "Bitcoin",
    coinClass: "btc",
    price: "66,842.10",
    change: "+2.84%",
    high: "68,120.00",
    low: "64,910.40",
    volume: "1.82B",
  },
  {
    pair: "ETH/USDT",
    name: "Ethereum",
    coinClass: "eth",
    price: "3,482.76",
    change: "+1.92%",
    high: "3,566.20",
    low: "3,401.18",
    volume: "946.30M",
  },
  {
    pair: "SOL/USDT",
    name: "Solana",
    coinClass: "sol",
    price: "184.52",
    change: "+4.16%",
    high: "191.80",
    low: "176.42",
    volume: "512.74M",
  },
  {
    pair: "BNB/USDT",
    name: "BNB",
    coinClass: "bnb",
    price: "612.38",
    change: "+0.87%",
    high: "621.44",
    low: "601.20",
    volume: "284.16M",
  },
  {
    pair: "ICP/USDT",
    name: "Internet Computer",
    coinClass: "icp",
    price: "4.92",
    change: "+2.18%",
    high: "5.06",
    low: "4.71",
    volume: "92.14M",
  },
  {
    pair: "ADA/USDT",
    name: "Cardano",
    coinClass: "ada",
    price: "0.4518",
    change: "+1.13%",
    high: "0.4632",
    low: "0.4410",
    volume: "126.84M",
  },
  {
    pair: "SHIB/USDT",
    name: "Shiba Inu",
    coinClass: "shib",
    price: "0.000013",
    change: "+3.08%",
    high: "0.000014",
    low: "0.000012",
    volume: "74.62M",
  },
  {
    pair: "XRP/USDT",
    name: "XRP",
    coinClass: "xrp",
    price: "0.5824",
    change: "-0.64%",
    high: "0.5948",
    low: "0.5712",
    volume: "198.52M",
  },
  {
    pair: "DOGE/USDT",
    name: "Dogecoin",
    coinClass: "doge",
    price: "0.1426",
    change: "+2.31%",
    high: "0.1478",
    low: "0.1372",
    volume: "164.27M",
  },
  {
    pair: "AVAX/USDT",
    name: "Avalanche",
    coinClass: "avax",
    price: "28.64",
    change: "-0.28%",
    high: "29.72",
    low: "27.91",
    volume: "82.45M",
  },
];

const marketTabs = ["All", "USDT", "BTC", "ETH", "SOL"];

export default function Markets() {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());

  const filteredMarkets = useMemo(() => {
    let result = markets;

    if (activeTab === "Favorites") {
      result = result.filter((market) => favorites.has(market.pair));
    }

    if (activeTab === "USDT") {
      result = result.filter((market) => market.pair.endsWith("/USDT"));
    }

    if (activeTab === "BTC") {
      result = result.filter((market) => market.pair.startsWith("BTC/"));
    }

    if (activeTab === "ETH") {
      result = result.filter((market) => market.pair.startsWith("ETH/"));
    }

    if (activeTab === "SOL") {
      result = result.filter((market) => market.pair.startsWith("SOL/"));
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
          <h1>Explore markets</h1>
          <p>Track demo prices, market ranges and 24-hour activity.</p>
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
