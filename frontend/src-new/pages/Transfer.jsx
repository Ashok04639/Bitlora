import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import CoinLogo from "../components/CoinLogo";
import { markets } from "../data/marketData";
import "./../styles/wallet.css";

const wallets = ["Spot Wallet", "Futures Wallet"];

const assetSymbols = Array.from(
  new Set(
    markets.flatMap((market) => market.pair.split("/"))
  )
);

export default function Transfer({
  onNavigate,
  walletBalances,
  setWalletBalances,
  transactions,
  setTransactions,
}) {
  const [from, setFrom] = useState("Spot Wallet");
  const [to, setTo] = useState("Futures Wallet");
  const [asset, setAsset] = useState({
    symbol: assetSymbols[0],
  });
  const [amount, setAmount] = useState("");
  const [completed, setCompleted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const selectFrom = (next) => {
    setFrom(next);
    setTo(next === "Spot Wallet" ? "Futures Wallet" : "Spot Wallet");
    setOpenDropdown(null);
  };

  const selectTo = (next) => {
    setTo(next);
    setOpenDropdown(null);
  };

  const selectedBalance =
    walletBalances?.[from]?.[asset.symbol] ?? 0;

  const numericAmount = Number(amount);
  const validationMessage =
    !amount || numericAmount <= 0
      ? ""
      : numericAmount > selectedBalance
        ? `Amount exceeds available ${asset.symbol} balance.`
        : "";

  const selectAsset = (symbol) => {
    setAsset({ symbol });
    setAmount("");
    setOpenDropdown(null);
  };

  const submit = () => {
    if (
      numericAmount <= 0 ||
      numericAmount > selectedBalance ||
      from === to
    ) {
      return;
    }

    setWalletBalances((current) => {
      const next = {
        ...current,
        [from]: {
          ...(current[from] || {}),
          [asset.symbol]:
            (current[from]?.[asset.symbol] ?? 0) - numericAmount,
        },
        [to]: {
          ...(current[to] || {}),
          [asset.symbol]:
            (current[to]?.[asset.symbol] ?? 0) + numericAmount,
        },
      };

      return next;
    });

    setTransactions((current) => [
      {
        type: "Transfer",
        asset: asset.symbol,
        amount: numericAmount.toFixed(4),
        status: "Completed",
        date: "Just now",
      },
      ...(current || []),
    ]);
    setCompleted(true);
  };

  if (completed) {
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

        <section className="wallet-flow-success">
          <div className="wallet-flow-success-icon">
            <CheckCircle2 size={25} />
          </div>

          <span className="wallet-page-kicker">TRANSFER</span>
          <h1>Transfer Completed</h1>
          <p>
            Your demo transfer has been completed successfully.
          </p>

          <div className="wallet-transfer-summary">
            <div>
              <span>From</span>
              <strong>{from}</strong>
            </div>

            <ArrowLeftRight size={17} />

            <div>
              <span>To</span>
              <strong>{to}</strong>
            </div>
          </div>

          <button
            type="button"
            className="wallet-primary-action"
            onClick={() => onNavigate("History")}
          >
            View History
          </button>
        </section>
      </section>
    );
  }

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

      <section className="wallet-flow-card">
        <div className="wallet-flow-heading">
          <div className="wallet-flow-icon">
            <ArrowLeftRight size={19} />
          </div>

          <div>
            <span className="wallet-page-kicker">TRANSFER</span>
            <h1>Transfer Assets</h1>
            <p>Move funds between your Bitlora wallets.</p>
          </div>
        </div>

        <div className="wallet-form-grid">
          <div className="wallet-field">
            <span>From</span>

            <div
              className={`wallet-inline-dropdown${
                openDropdown === "from" ? " is-open" : ""
              }`}
            >
              <button
                type="button"
                className="wallet-inline-trigger"
                onClick={() => toggleDropdown("from")}
                aria-expanded={openDropdown === "from"}
              >
                <span className="wallet-inline-value">
                  <span>
                    <strong>{from}</strong>
                    <small>Source wallet</small>
                  </span>
                </span>
                <ChevronDown size={15} />
              </button>

              {openDropdown === "from" && (
                <div className="wallet-inline-list">
                  {wallets.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`wallet-inline-option${
                        from === item ? " is-selected" : ""
                      }`}
                      onClick={() => selectFrom(item)}
                    >
                      <span>
                        <strong>{item}</strong>
                        <small>Source wallet</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="wallet-field">
            <span>To</span>

            <div
              className={`wallet-inline-dropdown${
                openDropdown === "to" ? " is-open" : ""
              }`}
            >
              <button
                type="button"
                className="wallet-inline-trigger"
                onClick={() => toggleDropdown("to")}
                aria-expanded={openDropdown === "to"}
              >
                <span className="wallet-inline-value">
                  <span>
                    <strong>{to}</strong>
                    <small>Destination wallet</small>
                  </span>
                </span>
                <ChevronDown size={15} />
              </button>

              {openDropdown === "to" && (
                <div className="wallet-inline-list">
                  {wallets
                    .filter((item) => item !== from)
                    .map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`wallet-inline-option${
                          to === item ? " is-selected" : ""
                        }`}
                        onClick={() => selectTo(item)}
                      >
                        <span>
                          <strong>{item}</strong>
                          <small>Destination wallet</small>
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="wallet-field">
            <span>Asset</span>

            <div
              className={`wallet-inline-dropdown${
                openDropdown === "asset" ? " is-open" : ""
              }`}
            >
              <button
                type="button"
                className="wallet-inline-trigger"
                onClick={() => toggleDropdown("asset")}
                aria-expanded={openDropdown === "asset"}
              >
                <span className="wallet-inline-value">
                  <CoinLogo coin={asset.symbol} name={asset.symbol} />
                  <span>
                    <strong>{asset.symbol}</strong>
                    <small>Available {selectedBalance}</small>
                  </span>
                </span>
                <ChevronDown size={15} />
              </button>

              {openDropdown === "asset" && (
                <div className="wallet-inline-list">
                  {assetSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      className={`wallet-inline-option${
                        asset.symbol === symbol ? " is-selected" : ""
                      }`}
                      onClick={() => selectAsset(symbol)}
                    >
                      <CoinLogo coin={symbol} name={symbol} />
                      <span>
                        <strong>{symbol}</strong>
                        <small>
                          Available {walletBalances?.[from]?.[symbol] ?? 0}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <label className="wallet-field">
            <span>Amount</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={`Available ${selectedBalance} ${asset.symbol}`}
            />
          </label>

          <div className="wallet-transfer-route wallet-field-wide">
            <span>{from}</span>
            <ArrowLeftRight size={17} />
            <span>{to}</span>
          </div>

          {validationMessage && (
            <p className="wallet-validation-message wallet-field-wide">
              {validationMessage}
            </p>
          )}

          <button
            type="button"
            className="wallet-primary-action wallet-field-wide"
            onClick={submit}
            disabled={
              numericAmount <= 0 ||
              Boolean(validationMessage) ||
              from === to
            }
          >
            Confirm Transfer
          </button>
        </div>
      </section>
    </section>
  );
}
