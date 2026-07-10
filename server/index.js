const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const regPattern = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i;
const dbPath = path.join(__dirname, 'domasi.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const { DatabaseSync } = sqlite3;
const db = new DatabaseSync(dbPath);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

function getUserByRegNumber(regNumber) {
  return db.prepare('SELECT * FROM users WHERE lower(reg_number) = lower(?)').get(regNumber.trim());
}

function createUser({ fullName, regNumber, whatsappNumber, passwordHash }) {
  db.prepare('INSERT INTO users (full_name, reg_number, whatsapp_number, password_hash) VALUES (?, ?, ?, ?)').run(fullName.trim(), regNumber.trim(), whatsappNumber.trim(), passwordHash);
}

initializeDatabase();

app.post('/api/signup', async (req, res) => {
  const { fullName, regNumber, whatsappNumber, password } = req.body;

  if (!fullName || !regNumber || !whatsappNumber || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (!regPattern.test(regNumber.trim())) {
    return res.status(400).json({ message: 'Registration number format is invalid.' });
  }

  const existing = getUserByRegNumber(regNumber);
  if (existing) {
    return res.status(409).json({ message: 'An account with this registration number already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  createUser({ fullName, regNumber, whatsappNumber, passwordHash });

  return res.status(201).json({ message: 'Account created successfully.' });
});

app.post('/api/signin', async (req, res) => {
  const { regNumber, password } = req.body;

  if (!regNumber || !password) {
    return res.status(400).json({ message: 'Please provide registration number and password.' });
  }

  const user = getUserByRegNumber(regNumber);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  return res.json({ message: 'Sign in successful.' });
});

app.post('/api/marketplace', (req, res) => {
  const { title, price, category, conditionText, sellerName, sellerPhone, description, imageUrls } = req.body;

  if (!title || !price || !category || !conditionText || !sellerName || !sellerPhone) {
    return res.status(400).json({ message: 'Please provide all required listing fields.' });
  }

  db.prepare('INSERT INTO marketplace_items (title, price, category, condition_text, seller_name, seller_phone, description, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(title.trim(), Number(price), category.trim(), conditionText.trim(), sellerName.trim(), sellerPhone.trim(), description ? description.trim() : '', Array.isArray(imageUrls) ? imageUrls.join(',') : '');

  return res.status(201).json({ message: 'Marketplace listing saved.' });
});

app.get('/api/marketplace', (req, res) => {
  const items = db.prepare('SELECT * FROM marketplace_items ORDER BY created_at DESC').all();
  return res.json(items);
});

app.get('/api/summary', (req, res) => {
  const recentMarketplace = db.prepare('SELECT title, category, price FROM marketplace_items ORDER BY created_at DESC LIMIT 3').all();
  const recentAccommodations = db.prepare('SELECT hostel_name AS title, rent FROM accommodations ORDER BY created_at DESC LIMIT 3').all();
  return res.json({ marketplace: recentMarketplace, accommodations: recentAccommodations });
});

app.post('/api/printers', (req, res) => {
  const { stationName, location, hardwareModel, rateBW, rateColor, imageUrls } = req.body;

  if (!stationName || !location || !hardwareModel || !rateBW || !rateColor) {
    return res.status(400).json({ message: 'Please provide all printer station fields.' });
  }

  db.prepare('INSERT INTO printer_stations (station_name, location, hardware_model, rate_bw, rate_color, image_urls) VALUES (?, ?, ?, ?, ?, ?)')
    .run(stationName.trim(), location.trim(), hardwareModel.trim(), Number(rateBW), Number(rateColor), Array.isArray(imageUrls) ? imageUrls.join(',') : '');

  return res.status(201).json({ message: 'Printer station saved.' });
});

app.get('/api/printers', (req, res) => {
  const stations = db.prepare('SELECT * FROM printer_stations ORDER BY created_at DESC').all();
  return res.json(stations);
});

app.post('/api/accommodations', (req, res) => {
  const { hostelName, rent, distance, specs, security, landlordPhone, imageUrls } = req.body;

  if (!hostelName || !rent || !distance || !specs || !security || !landlordPhone) {
    return res.status(400).json({ message: 'Please provide all accommodation fields.' });
  }

  db.prepare('INSERT INTO accommodations (hostel_name, rent, distance, specs, security, landlord_phone, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(hostelName.trim(), Number(rent), distance.trim(), specs.trim(), security.trim(), landlordPhone.trim(), Array.isArray(imageUrls) ? imageUrls.join(',') : '');

  return res.status(201).json({ message: 'Accommodation saved.' });
});

app.get('/api/accommodations', (req, res) => {
  const rows = db.prepare('SELECT * FROM accommodations ORDER BY created_at DESC').all();
  return res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Domasi Hub backend running at http://localhost:${PORT}`);
});
