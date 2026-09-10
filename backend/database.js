const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "bitlora.db"));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    currency TEXT NOT NULL,
    available REAL NOT NULL DEFAULT 0,
    locked REAL NOT NULL DEFAULT 0,
    UNIQUE(user_id, currency),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pair TEXT NOT NULL,
    side TEXT NOT NULL CHECK(side IN ('Buy', 'Sell')),
    type TEXT NOT NULL DEFAULT 'Limit',
    price REAL NOT NULL,
    amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    total REAL NOT NULL,
      reserved_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Deposit', 'Withdraw')),
      currency TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT "Completed",
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buy_order_id TEXT NOT NULL,
    sell_order_id TEXT NOT NULL,
    pair TEXT NOT NULL,
    price REAL NOT NULL,
    amount REAL NOT NULL,
    total REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(buy_order_id) REFERENCES orders(id),
    FOREIGN KEY(sell_order_id) REFERENCES orders(id)
  );
`);

const user = db.prepare("SELECT id FROM users WHERE id = 1").get();

if (!user) {
  db.prepare(
    "INSERT INTO users (id, email, password_hash) VALUES (1, ?, ?)"
  ).run("demo@bitlora.local", "demo-account");
}

const initialBalances = [
  ["USDT", 12051.5, 0],
  ["BTC", 0.0024, 0],
  ["ETH", 0.041, 0],
  ["BNB", 0.18, 0],
];

for (const [currency, available, locked] of initialBalances) {
  db.prepare(`
    INSERT INTO balances (user_id, currency, available, locked)
    VALUES (1, ?, ?, ?)
    ON CONFLICT(user_id, currency) DO NOTHING
  `).run(currency, available, locked);
}

module.exports = db;
