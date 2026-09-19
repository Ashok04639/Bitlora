import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Markets from "../pages/Markets";
import Trade from "../pages/Trade";
import Futures from "../pages/Futures";
import Wallet from "../pages/Wallet";
import Deposit from "../pages/Deposit";
import Withdraw from "../pages/Withdraw";
import Transfer from "../pages/Transfer";
import History from "../pages/History";
import AuthFlow from "../components/auth/AuthFlow";

const pages = {
  Home,
  Markets,
  Trade,
  Futures,
  Wallet,
  Deposit,
  Withdraw,
  Transfer,
  History,
};

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [selectedTradePair, setSelectedTradePair] = useState("BTC/USDT");
  const [walletBalances, setWalletBalances] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:wallet-balances");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to demo balances.
    }

    return {
      "Spot Wallet": {
        USDT: 4250,
        BTC: 0.045,
        ETH: 1.25,
        SOL: 8.5,
        BNB: 2.1,
      },
      "Futures Wallet": {},
    };
  });
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:transactions");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to demo transactions.
    }

    return [
    {
      type: "Deposit",
      asset: "USDT",
      amount: "+1,500.00",
      status: "Completed",
      date: "Today, 18:42",
    },
    {
      type: "Trade",
      asset: "BTC",
      amount: "0.0100",
      status: "Completed",
      date: "Today, 16:20",
    },
    {
      type: "Transfer",
      asset: "USDT",
      amount: "250.00",
      status: "Completed",
      date: "Yesterday, 12:08",
    },
    {
      type: "Withdrawal",
      asset: "ETH",
      amount: "0.2500",
      status: "Processing",
      date: "Yesterday, 09:34",
    },
    ];
  });

  const [tradeOrders, setTradeOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:trade-orders");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to an empty demo order store.
    }

    return [];
  });

  const [tradeFills, setTradeFills] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:trade-fills");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to an empty demo fill store.
    }

    return [];
  });

  const [futuresPositions, setFuturesPositions] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:futures-positions");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to an empty futures position store.
    }

    return [];
  });

  const [futuresOrders, setFuturesOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:futures-orders");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to an empty futures order store.
    }

    return [];
  });

  const [todayPnl, setTodayPnl] = useState(() => {
    try {
      const saved = localStorage.getItem("bitlora:today-pnl");
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to the initial demo P&L state.
    }

    return {
      value: 128.45,
      points: [
        { time: "09:00", value: 42.18 },
        { time: "10:00", value: 58.72 },
        { time: "11:00", value: 51.34 },
        { time: "12:00", value: 76.91 },
        { time: "13:00", value: 69.45 },
        { time: "14:00", value: 94.26 },
        { time: "15:00", value: 82.73 },
        { time: "16:00", value: 116.84 },
        { time: "17:00", value: 128.45 },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem(
      "bitlora:wallet-balances",
      JSON.stringify(walletBalances)
    );
  }, [walletBalances]);

  useEffect(() => {
    localStorage.setItem(
      "bitlora:today-pnl",
      JSON.stringify(todayPnl)
    );
  }, [todayPnl]);

  useEffect(() => {
    localStorage.setItem(
      "bitlora:transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      "bitlora:trade-orders",
      JSON.stringify(tradeOrders)
    );
  }, [tradeOrders]);

  useEffect(() => {
    localStorage.setItem(
      "bitlora:trade-fills",
      JSON.stringify(tradeFills)
    );
  }, [tradeFills]);

  useEffect(() => {
    localStorage.setItem(
      "bitlora:futures-positions",
      JSON.stringify(futuresPositions)
    );
  }, [futuresPositions]);

  useEffect(() => {
    localStorage.setItem(
      "bitlora:futures-orders",
      JSON.stringify(futuresOrders)
    );
  }, [futuresOrders]);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("bitlora:logged-in") === "true";
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authScreen, setAuthScreen] = useState("login");

  useEffect(() => {
    const handleDemoLogin = () => {
      setAuthScreen("login");
      setShowAuth(true);
    };
    window.addEventListener("bitlora-login", handleDemoLogin);

    return () => window.removeEventListener("bitlora-login", handleDemoLogin);
  }, []);

  useEffect(() => {
    const handleLogin = () => {
      setAuthScreen("login");
      setShowAuth(true);
    };

    const handleSignUp = () => {
      setAuthScreen("signup");
      setShowAuth(true);
    };

    window.addEventListener("bitlora:login", handleLogin);
    window.addEventListener("bitlora:signup", handleSignUp);

    return () => {
      window.removeEventListener("bitlora:login", handleLogin);
      window.removeEventListener("bitlora:signup", handleSignUp);
    };
  }, []);

  const Page = pages[activePage];

  if (showAuth && !isLoggedIn) {
    return (
      <div className="app">
        <AuthFlow
          initialScreen={authScreen}
          onBack={() => setShowAuth(false)}
          onAuthenticated={() => {
            localStorage.setItem("bitlora:logged-in", "true");
            setIsLoggedIn(true);
            setShowAuth(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        onNavigate={setActivePage}
        isLoggedIn={isLoggedIn}
        onLogin={() => {
          setAuthScreen("login");
          setShowAuth(true);
        }}
        onLogout={() => {
          localStorage.removeItem("bitlora:logged-in");
          setIsLoggedIn(false);
          setShowAuth(false);
          setActivePage("Home");
        }}
      />

      <main className="page">
        <Page
          isLoggedIn={isLoggedIn}
          onNavigate={setActivePage}
          walletBalances={walletBalances}
          setWalletBalances={setWalletBalances}
          todayPnl={todayPnl}
            selectedTradePair={selectedTradePair}
            setSelectedTradePair={setSelectedTradePair}
            transactions={transactions}
            setTransactions={setTransactions}
            tradeOrders={tradeOrders}
            setTradeOrders={setTradeOrders}
            tradeFills={tradeFills}
            setTradeFills={setTradeFills}
            futuresPositions={futuresPositions}
            setFuturesPositions={setFuturesPositions}
            futuresOrders={futuresOrders}
            setFuturesOrders={setFuturesOrders}
        />
      </main>

      <Footer
        activePage={activePage}
        onNavigate={setActivePage}
      />
    </div>
  );
}
