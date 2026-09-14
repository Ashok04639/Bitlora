import { useState } from "react";
import "./styles/index.css";

import Home from "./pages/Home";
import Markets from "./pages/Markets";
import Trade from "./pages/Trade";
import Futures from "./pages/Futures";
import Wallet from "./pages/Wallet";

const pages = {
  Home,
  Markets,
  Trade,
  Futures,
  Wallet,
};

function App() {
  const [active, setActive] = useState("Home");
  const Page = pages[active];

  return (
    <div className="app">
      <header className="header">
        <div className="brand">BITLORA</div>

        <nav className="nav">
          {Object.keys(pages).map((page) => (
            <button
              key={page}
              className={active === page ? "nav-item active" : "nav-item"}
              onClick={() => setActive(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="header-btn">Log In</button>
          <button className="header-btn primary">Sign Up</button>
        </div>
      </header>

      <main className="page">
        <Page />
      </main>
    </div>
  );
}

export default App;
