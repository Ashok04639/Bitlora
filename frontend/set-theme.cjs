const fs = require("fs");

const color = (process.argv[2] || "blue").toLowerCase();

const themes = {
  blue: {
    bg:"#050b16", bg2:"#081426", surface:"#0b1930", surface2:"#10233f",
    border:"rgba(64,156,255,.22)", text:"#f3f8ff", muted:"#8197b5",
    primary:"#268cff", bright:"#63b5ff", soft:"rgba(38,140,255,.14)"
  },
  purple: {
    bg:"#090615", bg2:"#120b24", surface:"#180f2d", surface2:"#21153b",
    border:"rgba(157,105,255,.22)", text:"#f7f2ff", muted:"#9b8db5",
    primary:"#925cff", bright:"#bd94ff", soft:"rgba(146,92,255,.14)"
  },
  green: {
    bg:"#04110d", bg2:"#071c15", surface:"#09251b", surface2:"#0d3024",
    border:"rgba(38,220,145,.22)", text:"#effff8", muted:"#7fa596",
    primary:"#20d98e", bright:"#61f0b1", soft:"rgba(32,217,142,.14)"
  },
  red: {
    bg:"#130609", bg2:"#210b10", surface:"#2a0e15", surface2:"#35131b",
    border:"rgba(255,85,111,.22)", text:"#fff3f5", muted:"#b58b94",
    primary:"#ff4f70", bright:"#ff849b", soft:"rgba(255,79,112,.14)"
  },
  orange: {
    bg:"#120a04", bg2:"#211207", surface:"#2b1708", surface2:"#381f0b",
    border:"rgba(255,139,45,.22)", text:"#fff8ef", muted:"#b49a82",
    primary:"#ff8b2d", bright:"#ffb267", soft:"rgba(255,139,45,.14)"
  },
  gold: {
    bg:"#100c04", bg2:"#1d1607", surface:"#281e09", surface2:"#35280c",
    border:"rgba(225,181,74,.22)", text:"#fffaf0", muted:"#aa9a78",
    primary:"#dcb34d", bright:"#f2d37a", soft:"rgba(220,179,77,.14)"
  }
};

if (!themes[color]) {
  console.log("Available themes: blue, purple, green, red, orange, gold");
  process.exit(1);
}

const t = themes[color];
const file = "src/App.css";
let css = fs.readFileSync(file, "utf8");

const start = "/* BITLORA_DYNAMIC_THEME_START */";
const end = "/* BITLORA_DYNAMIC_THEME_END */";

const block = `
${start}
:root {
  --theme-bg:${t.bg};
  --theme-bg2:${t.bg2};
  --theme-surface:${t.surface};
  --theme-surface2:${t.surface2};
  --theme-border:${t.border};
  --theme-text:${t.text};
  --theme-muted:${t.muted};
  --theme-primary:${t.primary};
  --theme-bright:${t.bright};
  --theme-soft:${t.soft};
}

.app {
  background:
    radial-gradient(circle at 50% -12%, ${t.soft}, transparent 38%),
    linear-gradient(180deg, var(--theme-bg2) 0%, var(--theme-bg) 58%, var(--theme-bg) 100%) !important;
  color:var(--theme-text) !important;
}

.header,
.balance,
.market,
.market-search,
.market-list,
.trade-panel,
.trade-price-card,
.wallet-pro-header,
.wallet-pro-settings-header,
.wallet-pro-card-header,
.futures-chart-header,
.futures-settings-header {
  background:
    linear-gradient(145deg, rgba(255,255,255,.035), ${t.soft}),
    var(--theme-surface) !important;
  border-color:var(--theme-border) !important;
}

.trade-screen {
  background:
    radial-gradient(circle at 50% 0%, ${t.soft}, transparent 32%),
    var(--theme-bg) !important;
}

.wallet-screen,
.markets-screen {
  background:
    radial-gradient(circle at 50% 0%, ${t.soft}, transparent 35%),
    transparent !important;
}

.market-row,
.market-list-header,
.trade-header {
  background-color:transparent !important;
  border-color:var(--theme-border) !important;
}

.market-tabs button.active,
.trade-tabs button.active,
.order-tabs button.active,
.bottom button.active {
  color:var(--theme-bright) !important;
  border-color:var(--theme-primary) !important;
  background:var(--theme-soft) !important;
}

.market-pair strong,
.market-price strong,
.trade-header strong,
.trade-price-card strong,
.wallet-pro-header h1,
.wallet-pro-header h2,
.wallet-pro-header h3,
.wallet-pro-card-header strong,
.wallet-pro-card-header h3,
.wallet-pro-card-header h4,
.futures-chart-header strong,
.futures-settings-header strong {
  color:var(--theme-text) !important;
}

.market-pair span,
.market-price span,
.trade-header span,
.trade-price-card span,
.wallet-pro-header p,
.wallet-pro-card-header span,
.futures-chart-header span,
.futures-settings-header span {
  color:var(--theme-muted) !important;
}

.market-search input,
.wallet-screen input,
.wallet-pro-card-header input {
  background:var(--theme-surface2) !important;
  border-color:var(--theme-border) !important;
  color:var(--theme-text) !important;
}

.actions button,
.bottom button,
.wallet-actions button,
.futures-chart-header button,
.futures-settings-header button {
  background:var(--theme-surface2) !important;
  border-color:var(--theme-border) !important;
  color:var(--theme-text) !important;
}

button:hover {
  border-color:var(--theme-primary) !important;
  box-shadow:0 8px 26px ${t.soft} !important;
}

input:focus {
  border-color:var(--theme-primary) !important;
  box-shadow:0 0 0 3px var(--theme-soft) !important;
}

* {
  scrollbar-color:${t.primary} ${t.bg};
}
${end}`;

const re = new RegExp(
  `${start.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}`,
  "m"
);

css = re.test(css) ? css.replace(re, block.trim()) : css + "\n" + block.trim() + "\n";
fs.writeFileSync(file, css);

console.log(`BITLORA THEME: ${color.toUpperCase()}`);
console.log("Theme changed without modifying layout or functionality.");
