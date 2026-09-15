import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/home.css";
import "./styles/markets.css";
import "./styles/trade.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import "./styles/futures.css";

import "./styles/wallet.css";
import "./styles/footer.css";
