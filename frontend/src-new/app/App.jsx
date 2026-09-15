import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Markets from "../pages/Markets";
import Trade from "../pages/Trade";
import Futures from "../pages/Futures";
import Wallet from "../pages/Wallet";

const pages = {
  Home,
  Markets,
  Trade,
  Futures,
  Wallet,
};

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleLogin = () => setIsLoggedIn(true);

    window.addEventListener("bitlora:login", handleLogin);

    return () => {
      window.removeEventListener("bitlora:login", handleLogin);
    };
  }, []);

  const Page = pages[activePage];

  return (
    <div className="app">
      <Header
        onNavigate={setActivePage}
        isLoggedIn={isLoggedIn}
        onLogin={() => setIsLoggedIn(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      <main className="page">
        <Page isLoggedIn={isLoggedIn} />
      </main>

      <Footer
        activePage={activePage}
        onNavigate={setActivePage}
      />
    </div>
  );
}
