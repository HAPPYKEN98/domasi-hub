CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  reg_number VARCHAR(50) UNIQUE NOT NULL,
  whatsapp_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS marketplace_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price NUMERIC,
  category VARCHAR(100),
  condition_text TEXT,
  seller_name VARCHAR(255),
  seller_phone VARCHAR(20),
  description TEXT,
  image_urls TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS accommodations (
  id SERIAL PRIMARY KEY,
  hostel_name VARCHAR(255) NOT NULL,
  rent NUMERIC,
  distance VARCHAR(100),
  specs TEXT,
  security TEXT,
  landlord_phone VARCHAR(20),
  image_urls TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS printer_stations (
  id SERIAL PRIMARY KEY,
  station_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  hardware_model VARCHAR(255),
  rate_bw NUMERIC,
  rate_color NUMERIC,
  image_urls TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
