import CoinLogo from "../components/CoinLogo";

const markets = [
  {
    pair: "BTC/USDT",
    name: "Bitcoin",
    price: "66,842.10",
    change: "+2.34%",
    coinClass: "btc",
  },
  {
    pair: "ETH/USDT",
    name: "Ethereum",
    price: "3,482.76",
    change: "+1.87%",
    coinClass: "eth",
  },
  {
    pair: "SOL/USDT",
    name: "Solana",
    price: "184.52",
    change: "+3.21%",
    coinClass: "sol",
  },
  {
    pair: "BNB/USDT",
    name: "BNB",
    price: "586.32",
    change: "+1.42%",
    coinClass: "bnb",
  },
  {
    pair: "ICP/USDT",
    name: "Internet Computer",
    price: "4.92",
    change: "+2.18%",
    coinClass: "icp",
  },
  {
    pair: "ADA/USDT",
    name: "Cardano",
    price: "0.842",
    change: "+1.76%",
    coinClass: "ada",
  },
  {
    pair: "SHIB/USDT",
    name: "Shiba Inu",
    price: "0.000013",
    change: "+3.08%",
    coinClass: "shib",
  },
];

function login() {
  window.dispatchEvent(new CustomEvent("bitlora:login"));
}

export default function Home({ onNavigate }) {
  return (
    <section className="home home-mockup">
      <div className="home-mockup-hero">
        <div className="home-mockup-art" aria-hidden="true">
          <div className="home-mockup-glow" />
          <div className="home-mockup-orbit home-mockup-orbit-one" />
          <div className="home-mockup-orbit home-mockup-orbit-two" />
          <div className="home-mockup-core">
            <span>B</span>
          </div>
        </div>

        <h1>
          Trade Smarter
          <br />
          <span>Grow Faster</span>
        </h1>

        <p>
          Next Generation Crypto Exchange
          <br />
          <span>Secure · Fast · Global</span>
        </p>

        <div className="home-mockup-auth">
          <button
            type="button"
            className="home-mockup-login"
            onClick={login}
          >
            Log In
          </button>

          <button
            type="button"
            className="home-mockup-signup"
            onClick={login}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="home-mockup-ticker" aria-label="Market ticker">
        {markets.slice(0, 3).map((market) => (
          <div className="home-mockup-ticker-card" key={market.pair}>
            <span>{market.pair}</span>
            <strong>{market.price}</strong>
            <b>{market.change}</b>
          </div>
        ))}
      </div>

      <div className="home-mockup-markets">
        <div className="home-mockup-section-head">
          <h2>Top Markets</h2>
          <button
            type="button"
            onClick={() => onNavigate?.("Markets")}
          >
            View All
          </button>
        </div>

        <div className="home-mockup-market-list">
          {markets.map((market) => (
            <div className="home-mockup-market-row" key={market.pair}>
              <div className="home-mockup-market-left">
                <CoinLogo
                  coin={market.coinClass}
                  name={market.name}
                />

                <div>
                  <strong>{market.pair}</strong>
                  <small>{market.name}</small>
                </div>
              </div>

              <div className="home-mockup-market-right">
                <strong>{market.price}</strong>
                <span>{market.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
