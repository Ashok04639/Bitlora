import { ShieldCheck, Network, Zap, WalletCards } from "lucide-react";

function PublicWallet({ onLogin }) {
  return (
    <section className="wallet-access">
      <div className="wallet-access-icon" aria-hidden="true">
        <WalletCards size={30} strokeWidth={1.8} />
      </div>

      <span className="wallet-access-kicker">WALLET</span>

      <h1>Wallet Access</h1>

      <p>
        Please log in to view your balance, deposit, withdraw and manage your
        assets.
      </p>

      <div className="wallet-access-actions">
        <button type="button" className="wallet-access-login" onClick={onLogin}>
          Log In
        </button>

        <button
          type="button"
          className="wallet-access-signup"
          onClick={onLogin}
        >
          Sign Up
        </button>
      </div>

      <div className="wallet-security-card">
        <div>
          <ShieldCheck size={18} />
          <span>Secure Transfers</span>
        </div>

        <div>
          <Network size={18} />
          <span>Multiple Networks</span>
        </div>

        <div>
          <Zap size={18} />
          <span>Fast &amp; Reliable</span>
        </div>
      </div>
    </section>
  );
}

function LoggedInWallet() {
  return (
    <section className="wallet-page">
      <header className="wallet-page-header">
        <div>
          <span className="wallet-page-kicker">WALLET</span>
          <h1>Wallet</h1>
          <p>Manage your assets, transfers and wallet activity.</p>
        </div>
      </header>

      <section className="wallet-overview-card">
        <div className="wallet-overview-icon" aria-hidden="true">
          <WalletCards size={24} />
        </div>

        <div>
          <span>Wallet Overview</span>
          <strong>Your wallet is ready</strong>
          <p>Account balances and assets will appear here.</p>
        </div>
      </section>

      <div className="wallet-feature-grid">
        <section className="wallet-feature-card">
          <span>ASSETS</span>
          <strong>Your Assets</strong>
          <p>View and manage supported wallet assets.</p>
        </section>

        <section className="wallet-feature-card">
          <span>TRANSFERS</span>
          <strong>Deposit &amp; Withdraw</strong>
          <p>Manage deposits and withdrawals across supported networks.</p>
        </section>

        <section className="wallet-feature-card">
          <span>ACTIVITY</span>
          <strong>Wallet History</strong>
          <p>Your wallet activity will appear here.</p>
        </section>
      </div>
    </section>
  );
}

export default function Wallet({ isLoggedIn }) {
  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent("bitlora:login"));
  };

  if (!isLoggedIn) {
    return <PublicWallet onLogin={handleLogin} />;
  }

  return <LoggedInWallet />;
}
