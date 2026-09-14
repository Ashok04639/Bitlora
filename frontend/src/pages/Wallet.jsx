import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const NETWORKS = [
  "BEP20",
  "ERC20",
  "TRC20",
  "Solana",
  "Bitcoin",
  "Arbitrum",
  "Polygon",
];

function numberValue(value) {
  const numeric = Number(
    String(value ?? "").replace(/[$,]/g, "")
  );

  return Number.isFinite(numeric) ? numeric : 0;
}

function formatNumber(value, maximumFractionDigits = 8) {
  return numberValue(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
}

function formatUsd(value) {
  return `$${formatNumber(value, 2)}`;
}

function formatTransactionValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return formatNumber(value, 8);
  }

  return String(value);
}

export default function Wallet() {
  const [balanceData, setBalanceData] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  const [marketsData, setMarketsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [walletAction, setWalletAction] = useState("Deposit");
  const [walletAsset, setWalletAsset] = useState("USDT");
  const [walletNetwork, setWalletNetwork] = useState("BEP20");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletMemo, setWalletMemo] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletSearch, setWalletSearch] = useState("");
  const [walletMessage, setWalletMessage] = useState("");

  const [walletHideSmall, setWalletHideSmall] = useState(false);
  const [walletShowUsd, setWalletShowUsd] = useState(true);

  const [walletConfirmWithdrawal] = useState(true);
  const [walletWhitelistOnly] = useState(true);
  const [walletNewAddressLock] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWallet = async () => {
      try {
        setLoading(true);
        setError("");

        const [balance, assets, transactions, markets] =
          await Promise.all([
            api.balance(1),
            api.assets(1),
            api.transactions(),
            api.markets(),
          ]);

        if (!mounted) return;

        if (balance?.success) {
          setBalanceData(balance);
        }

        if (assets?.success && Array.isArray(assets.assets)) {
          setAssetsData(assets.assets);
        }

        if (
          transactions?.success &&
          Array.isArray(transactions.transactions)
        ) {
          setTransactionsData(transactions.transactions);
        }

        if (
          markets?.success &&
          Array.isArray(markets.markets)
        ) {
          setMarketsData(markets.markets);
        }

        if (!balance?.success && !assets?.success) {
          setError("Wallet data is currently unavailable.");
        }
      } catch {
        if (!mounted) return;

        setError("Unable to connect to the wallet service.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWallet();

    return () => {
      mounted = false;
    };
  }, []);

  const walletAssets = useMemo(() => {
    return assetsData.map((item) => {
      const available = numberValue(item.amount);
      const frozen = numberValue(item.locked);
      const balance = available + frozen;

      const explicitValue = numberValue(item.value);

      const marketPrice =
        item.symbol === "USDT"
          ? 1
          : numberValue(
              marketsData.find(
                (market) =>
                  market.pair === `${item.symbol}/USDT`
              )?.price
            );

      const price =
        balance > 0 && explicitValue > 0
          ? explicitValue / balance
          : marketPrice;

      return {
        asset: item.symbol || "—",
        name: item.name || item.symbol || "Unknown Asset",
        balance,
        available,
        frozen,
        price,
        value: balance * price,
      };
    });
  }, [assetsData, marketsData]);

  const walletTotalUsd = useMemo(
    () =>
      walletAssets.reduce(
        (sum, item) => sum + item.value,
        0
      ),
    [walletAssets]
  );

  const walletAvailableUsd = useMemo(
    () =>
      walletAssets.reduce(
        (sum, item) =>
          sum + item.available * item.price,
        0
      ),
    [walletAssets]
  );

  const walletFrozenUsd = useMemo(
    () =>
      walletAssets.reduce(
        (sum, item) =>
          sum + item.frozen * item.price,
        0
      ),
    [walletAssets]
  );

  /*
   * RULE:
   * walletAssets = complete API asset list.
   *
   * Hide-small/zero only controls rendering.
   * It never removes an asset from totals or API state.
   */
  const walletVisibleAssets = useMemo(() => {
    const query = walletSearch.trim().toLowerCase();

    return walletAssets.filter((item) => {
      if (
        walletHideSmall &&
        item.value < 1
      ) {
        return false;
      }

      if (!query) return true;

      return (
        item.asset.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
      );
    });
  }, [walletAssets, walletSearch, walletHideSmall]);

  const submitWalletAction = () => {
    if (walletAction === "Deposit") {
      setWalletMessage(
        "Deposit address generation will be connected to the wallet backend."
      );
      return;
    }

    if (walletAction === "Withdraw") {
      if (!walletAddress || !walletAmount) {
        setWalletMessage(
          "Enter withdrawal address and amount."
        );
        return;
      }

      if (walletConfirmWithdrawal && !walletWhitelistOnly) {
        setWalletMessage(
          "Withdrawal security verification is required."
        );
        return;
      }

      setWalletMessage(
        "Withdrawal request prepared. Security verification will be required."
      );
      return;
    }

    if (walletAction === "Transfer") {
      if (!walletAmount) {
        setWalletMessage("Enter transfer amount.");
        return;
      }

      setWalletMessage(
        "Transfer module is ready for backend integration."
      );
    }
  };

  const availableSelectedAsset = numberValue(
    walletAssets.find(
      (item) => item.asset === walletAsset
    )?.available
  );

  return (
    <section className="page-section wallet-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ASSETS</span>
          <h1>Wallet</h1>
        </div>

        <span>
          {loading
            ? "Loading account assets…"
            : "Manage assets, deposits and withdrawals"}
        </span>
      </div>

      <div className="wallet-balance-hero">
        <div className="wallet-total">
          <span>Total Estimated Balance</span>

          <strong>
            {loading
              ? "Loading…"
              : formatUsd(walletTotalUsd)}
          </strong>

          {walletShowUsd && !loading && (
            <small>
              ≈ USDT {formatNumber(walletTotalUsd, 2)}
            </small>
          )}
        </div>

        <div className="wallet-balance-stats">
          <div>
            <span>Available</span>
            <strong>
              {loading
                ? "—"
                : formatUsd(walletAvailableUsd)}
            </strong>
          </div>

          <div>
            <span>Frozen / In Order</span>
            <strong>
              {loading
                ? "—"
                : formatUsd(walletFrozenUsd)}
            </strong>
          </div>

          <div>
            <span>Account Balance</span>
            <strong>
              {balanceData
                ? formatUsd(
                    numberValue(
                      balanceData.totalBalance ??
                        balanceData.balance
                    )
                  )
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="wallet-message wallet-message-error">
          {error}
        </div>
      )}

      <div className="wallet-main-grid">
        <div className="wallet-assets-card">
          <div className="wallet-card-header">
            <div>
              <strong>Assets</strong>
              <span>
                {walletAssets.length} assets in account
              </span>
            </div>

            <input
              type="search"
              value={walletSearch}
              onChange={(event) =>
                setWalletSearch(event.target.value)
              }
              placeholder="Search asset"
              aria-label="Search wallet assets"
            />
          </div>

          <label className="wallet-hide-toggle">
            <input
              type="checkbox"
              checked={walletHideSmall}
              onChange={(event) =>
                setWalletHideSmall(event.target.checked)
              }
            />

            <span>
              Hide zero / small balances
            </span>
          </label>

          <div className="wallet-asset-head">
            <span>Asset</span>
            <span>Balance</span>
            <span>Available</span>
            <span>In Order</span>
            <span>Value</span>
          </div>

          <div className="wallet-asset-list">
            {loading ? (
              <div className="wallet-empty">
                Loading assets…
              </div>
            ) : walletVisibleAssets.length === 0 ? (
              <div className="wallet-empty">
                {walletAssets.length === 0
                  ? "No wallet assets available."
                  : "No assets match the current filter."}
              </div>
            ) : (
              walletVisibleAssets.map((item) => (
                <div
                  className="wallet-asset-row"
                  key={item.asset}
                >
                  <div className="wallet-asset-name">
                    <div className="wallet-coin-icon">
                      {item.asset.slice(0, 1)}
                    </div>

                    <div>
                      <strong>{item.asset}</strong>
                      <span>{item.name}</span>
                    </div>
                  </div>

                  <strong>
                    {formatNumber(item.balance, 8)}
                  </strong>

                  <span>
                    {formatNumber(item.available, 8)}
                  </span>

                  <span>
                    {formatNumber(item.frozen, 8)}
                  </span>

                  <strong>
                    {formatUsd(item.value)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="wallet-action-card">
          <div className="wallet-action-tabs">
            {["Deposit", "Withdraw", "Transfer"].map(
              (action) => (
                <button
                  type="button"
                  key={action}
                  className={
                    walletAction === action
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setWalletAction(
                      walletAction === action
                        ? ""
                        : action
                    );
                    setWalletMessage("");
                  }}
                >
                  {action}
                </button>
              )
            )}
          </div>

          {walletAction && (
            <div className="wallet-form">
              <label>
                <span>Asset</span>

                <select
                  value={walletAsset}
                  onChange={(event) =>
                    setWalletAsset(event.target.value)
                  }
                >
                  {walletAssets.length > 0 ? (
                    walletAssets.map((item) => (
                      <option
                        key={item.asset}
                        value={item.asset}
                      >
                        {item.asset}
                      </option>
                    ))
                  ) : (
                    <option>USDT</option>
                  )}
                </select>
              </label>

              {walletAction === "Deposit" && (
                <>
                  <label>
                    <span>Network</span>

                    <select
                      value={walletNetwork}
                      onChange={(event) =>
                        setWalletNetwork(
                          event.target.value
                        )
                      }
                    >
                      {NETWORKS.map((network) => (
                        <option key={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="wallet-address-box">
                    <span>Deposit Address</span>
                    <strong>
                      Generate deposit address
                    </strong>
                    <small>
                      QR Code · Minimum deposit ·
                      Confirmations
                    </small>
                  </div>
                </>
              )}

              {walletAction === "Withdraw" && (
                <>
                  <label>
                    <span>Network</span>

                    <select
                      value={walletNetwork}
                      onChange={(event) =>
                        setWalletNetwork(
                          event.target.value
                        )
                      }
                    >
                      {NETWORKS.map((network) => (
                        <option key={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Withdrawal Address</span>

                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(event) =>
                        setWalletAddress(
                          event.target.value
                        )
                      }
                      placeholder="Paste wallet address"
                    />
                  </label>

                  <label>
                    <span>Memo / Tag</span>

                    <input
                      type="text"
                      value={walletMemo}
                      onChange={(event) =>
                        setWalletMemo(event.target.value)
                      }
                      placeholder="Optional"
                    />
                  </label>

                  <label>
                    <span>
                      Amount · Available{" "}
                      {formatNumber(
                        availableSelectedAsset,
                        8
                      )}
                    </span>

                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={walletAmount}
                      onChange={(event) =>
                        setWalletAmount(
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <div className="wallet-fee-box">
                    <div>
                      <span>Network Fee</span>
                      <strong>
                        Calculated automatically
                      </strong>
                    </div>

                    <div>
                      <span>Security</span>
                      <strong>
                        {walletNewAddressLock
                          ? "New-address lock enabled"
                          : "Standard"}
                      </strong>
                    </div>
                  </div>
                </>
              )}

              {walletAction === "Transfer" && (
                <>
                  <label>
                    <span>From</span>

                    <select>
                      <option>Spot Wallet</option>
                      <option>Funding Wallet</option>
                      <option>Futures Wallet</option>
                    </select>
                  </label>

                  <label>
                    <span>To</span>

                    <select>
                      <option>Futures Wallet</option>
                      <option>Spot Wallet</option>
                      <option>Funding Wallet</option>
                    </select>
                  </label>

                  <label>
                    <span>Amount</span>

                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={walletAmount}
                      onChange={(event) =>
                        setWalletAmount(
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </label>
                </>
              )}

              <button
                type="button"
                className="wallet-primary-action"
                onClick={submitWalletAction}
              >
                {walletAction === "Deposit"
                  ? "GENERATE DEPOSIT"
                  : walletAction === "Withdraw"
                    ? "REVIEW WITHDRAWAL"
                    : "TRANSFER FUNDS"}
              </button>

              {walletMessage && (
                <div className="wallet-message">
                  {walletMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="wallet-security-strip">
        <div>
          <span>Withdrawal Security</span>
          <strong>Protected</strong>
        </div>

        <div>
          <span>Address Whitelist</span>
          <strong>
            {walletWhitelistOnly
              ? "Enabled"
              : "Disabled"}
          </strong>
        </div>

        <div>
          <span>Withdrawal Confirmation</span>
          <strong>
            {walletConfirmWithdrawal
              ? "Required"
              : "Optional"}
          </strong>
        </div>

        <div>
          <span>New Address Lock</span>
          <strong>
            {walletNewAddressLock
              ? "Enabled"
              : "Disabled"}
          </strong>
        </div>
      </div>

      <div className="wallet-history-card">
        <div className="wallet-card-header">
          <div>
            <strong>Wallet History</strong>
            <span>
              Deposits, withdrawals, transfers and fees
            </span>
          </div>
        </div>

        <div className="wallet-history-table">
          <div className="wallet-history-head">
            <span>Type</span>
            <span>Asset</span>
            <span>Network</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          {loading ? (
            <div className="wallet-empty">
              Loading transaction history…
            </div>
          ) : transactionsData.length === 0 ? (
            <div className="wallet-empty">
              No wallet transactions found.
            </div>
          ) : (
            transactionsData.map((transaction, index) => (
              <div
                className="wallet-history-row"
                key={
                  transaction.id ??
                  transaction.transactionId ??
                  `${transaction.type}-${index}`
                }
              >
                <strong>
                  {transaction.type ??
                    transaction.action ??
                    "Transaction"}
                </strong>

                <span>
                  {transaction.asset ??
                    transaction.symbol ??
                    "—"}
                </span>

                <span>
                  {transaction.network ??
                    "—"}
                </span>

                <span>
                  {formatTransactionValue(
                    transaction.amount ??
                      transaction.value
                  )}
                </span>

                <span
                  className={
                    String(
                      transaction.status ?? ""
                    ).toLowerCase() === "completed"
                      ? "positive"
                      : ""
                  }
                >
                  {transaction.status ?? "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
