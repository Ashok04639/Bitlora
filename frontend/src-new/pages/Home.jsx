import CoinLogo from "../components/CoinLogo";
import logo from "../assets/bitlora-auth-logo-transparent.png";
import bLogo from "../assets/bitlora-b-mark.png";

import { markets } from "../data/marketData";
import { getTotalCoins, getUniqueCoins } from "../utils/totalCoins";


function login() {
  window.dispatchEvent(new CustomEvent("bitlora:login"));
}

function signUp() {
  window.dispatchEvent(new CustomEvent("bitlora:signup"));
}

function PublicHomeHero() {
  return (
    <div className="home-mockup-hero">
      <div className="home-mockup-hero-content">
        <div className="home-mockup-hero-copy">
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
        </div>

        <div className="home-mockup-art home-mockup-public-art" style={{ transform: "translateX(20px) scale(0.85)" }} aria-hidden="true">
          <div className="home-mockup-glow" />
          <div className="home-mockup-orbit home-mockup-orbit-one" />
          <div className="home-mockup-orbit home-mockup-orbit-two" />
          <div className="home-mockup-core">
            <img className="home-mockup-logo-crop" src={bLogo} alt="Bitlora B mark" />
          </div>
        </div>
      </div>

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
          onClick={signUp}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

function LoggedInHomeHero() {
  return (
    <div className="home-mockup-logged-in-hero">
      <div className="home-mockup-art" aria-hidden="true">
        <div className="home-mockup-glow" />
        <div className="home-mockup-orbit home-mockup-orbit-one" />
        <div className="home-mockup-orbit home-mockup-orbit-two" />
        <div className="home-mockup-core">
          <img src={logo} alt="Bitlora" />
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
    </div>
  );
}

function HomeSurface({ onNavigate, walletBalances, hero }) {
  const totalCoins = getTotalCoins(markets);
  const uniqueCoins = getUniqueCoins(markets);
  return (
    <section className="home home-mockup">
      {hero}

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
          <h2>Top Markets <span>Total Coins: {totalCoins}</span></h2>
          <button
            type="button"
            onClick={() => onNavigate?.("Markets")}
          >
            View All
          </button>
        </div>

        <div className="home-mockup-market-list">
          {uniqueCoins.map((market) => (
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

function PublicHome({ onNavigate }) {
  return (
    <HomeSurface
      onNavigate={onNavigate}
      hero={<PublicHomeHero />}
    />
  );
}

function LoggedInHome({ onNavigate, walletBalances }) {
  return (
    <HomeSurface
      onNavigate={onNavigate}
      walletBalances={walletBalances}
    />
  );
}

export default function Home({ onNavigate, isLoggedIn, walletBalances }) {
  if (isLoggedIn) {
    return (
      <LoggedInHome
        onNavigate={onNavigate}
        walletBalances={walletBalances}
      />
    );
  }

  return <PublicHome onNavigate={onNavigate} />;
}
