CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  reg_number TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  condition_text TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  description TEXT,
  image_urls TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS printer_stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_name TEXT NOT NULL,
  location TEXT NOT NULL,
  hardware_model TEXT NOT NULL,
  rate_bw INTEGER NOT NULL,
  rate_color INTEGER NOT NULL,
  image_urls TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accommodations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostel_name TEXT NOT NULL,
  rent INTEGER NOT NULL,
  distance TEXT NOT NULL,
  specs TEXT NOT NULL,
  security TEXT NOT NULL,
  landlord_phone TEXT NOT NULL,
  image_urls TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
