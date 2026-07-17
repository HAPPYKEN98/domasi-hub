-- USERS table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    reg_number TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MARKETPLACE ITEMS
CREATE TABLE IF NOT EXISTS marketplace_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    condition_text TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_phone TEXT NOT NULL,
    description TEXT,
    image_urls TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACCOMMODATIONS
CREATE TABLE IF NOT EXISTS accommodations (
    id SERIAL PRIMARY KEY,
    hostel_name TEXT NOT NULL,
    rent NUMERIC NOT NULL,
    distance TEXT NOT NULL,
    specs TEXT NOT NULL,
    security TEXT NOT NULL,
    landlord_phone TEXT NOT NULL,
    image_urls TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRINTER STATIONS
CREATE TABLE IF NOT EXISTS printer_stations (
    id SERIAL PRIMARY KEY,
    station_name TEXT NOT NULL,
    location TEXT NOT NULL,
    hardware_model TEXT NOT NULL,
    rate_bw NUMERIC NOT NULL,
    rate_color NUMERIC NOT NULL,
    image_urls TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
