export const sqlSchemaTables = ["clients", "wallets", "merchants", "transactions"];

export const sqlSchemaColumns = {
  clients: ["id", "name", "status", "registered_at"],
  wallets: ["id", "client_id", "balance"],
  merchants: ["id", "name"],
  transactions: ["id", "client_id", "merchant_id", "amount", "currency", "status", "created_at"],
};

export const SQL_SCHEMA_SQL = `
CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  registered_at TEXT NOT NULL
);

CREATE TABLE wallets (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  balance INTEGER NOT NULL
);

CREATE TABLE merchants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  merchant_id INTEGER,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT INTO clients (id, name, status, registered_at) VALUES
  (1, 'Алина', 'active', '2026-07-12'),
  (2, 'Максим', 'active', '2026-07-18'),
  (3, 'Роман', 'inactive', '2026-05-02'),
  (4, 'Ольга', 'active', '2026-06-20'),
  (5, 'Дмитрий', 'inactive', '2026-04-11'),
  (6, 'Ирина', 'active', '2026-07-01'),
  (7, 'Павел', 'active', '2026-03-15'),
  (8, 'Светлана', 'inactive', '2026-06-05'),
  (9, 'Артём', 'active', '2026-07-22'),
  (10, 'Юлия', 'active', '2026-02-10');

INSERT INTO wallets (id, client_id, balance) VALUES
  (1, 1, 82400),
  (2, 2, 51900),
  (3, 4, 15300),
  (4, 6, 9800),
  (5, 8, 4200),
  (6, 9, 120000),
  (7, 10, 3100);

INSERT INTO merchants (id, name) VALUES
  (1, 'CryptoMarket'),
  (2, 'FastPay'),
  (3, 'GlobalTrade'),
  (4, 'QuickCash'),
  (5, 'NanoPay'),
  (6, 'UrbanPay');

INSERT INTO transactions (id, client_id, merchant_id, amount, currency, status, created_at) VALUES
  (1, 1, 1, 145000, 'BTC', 'completed', '2026-06-03'),
  (2, 1, 2, 230000, 'BTC', 'completed', '2026-06-14'),
  (3, 2, 1, 51000, 'ETH', 'completed', '2026-06-20'),
  (4, 2, 3, 12000, 'ETH', 'completed', '2026-06-22'),
  (5, 4, 1, 62000, 'USDT', 'completed', '2026-06-25'),
  (6, 6, 1, 8000, 'USDT', 'pending', '2026-06-27'),
  (7, 9, 1, 310000, 'BTC', 'completed', '2026-06-28'),
  (8, 1, 1, 175000, 'BTC', 'completed', '2026-07-02'),
  (9, 2, 4, 43000, 'ETH', 'completed', '2026-07-04'),
  (10, 4, 1, 91000, 'USDT', 'completed', '2026-07-06'),
  (11, 6, 5, 15000, 'USDT', 'failed', '2026-07-08'),
  (12, 9, 1, 265000, 'BTC', 'completed', '2026-07-10'),
  (13, 10, 6, 4200, 'ETH', 'completed', '2026-07-11'),
  (14, 1, 1, 198000, 'BTC', 'completed', '2026-07-15'),
  (15, 2, 1, 67000, 'ETH', 'completed', '2026-07-16'),
  (16, 9, 1, 140000, 'BTC', 'completed', '2026-07-18'),
  (17, 4, 2, 5400, 'USDT', 'completed', '2026-07-19'),
  (18, 8, 5, 2200, 'USDT', 'pending', '2026-07-20'),
  (19, 1, 1, 84000, 'BTC', 'completed', '2026-07-21'),
  (20, 9, 1, 176000, 'BTC', 'completed', '2026-07-24');
`;
