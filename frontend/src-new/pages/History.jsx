import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpFromLine,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import "./../styles/wallet.css";

const transactionIcons = {
  Deposit: ArrowDownToLine,
  Trade: BarChart3,
  Transfer: ArrowLeftRight,
  Withdrawal: ArrowUpFromLine,
};

export default function History({ onNavigate, transactions }) {
  return (
    <section className="wallet-page wallet-flow-page">
      <button
        type="button"
        className="wallet-back-button"
        onClick={() => onNavigate("Wallet")}
      >
        <ArrowLeft size={16} />
        Wallet
      </button>

      <section className="wallet-flow-card wallet-history-page-card">
        <div className="wallet-flow-heading">
          <div className="wallet-flow-icon">
            <BarChart3 size={19} />
          </div>

          <div>
            <span className="wallet-page-kicker">ACTIVITY</span>
            <h1>Transaction History</h1>
            <p>Review your recent wallet activity.</p>
          </div>
        </div>

        <div className="wallet-history-page-list">
          {transactions.map((item, index) => {
            const Icon = transactionIcons[item.type] || BarChart3;

            return (
              <div className="wallet-history-page-row" key={`${item.type}-${index}`}>
                <div className="wallet-history-page-icon">
                  <Icon size={17} />
                </div>

                <div className="wallet-history-page-main">
                  <strong>{item.type}</strong>
                  <span>
                    {item.asset} · {item.date}
                  </span>
                </div>

                <div className="wallet-history-page-value">
                  <strong>{item.amount}</strong>
                  <span className={item.status.toLowerCase()}>
                    <CheckCircle2 size={12} />
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
