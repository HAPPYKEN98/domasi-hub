require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Connect to Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required on Render
});

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    );
    res.status(201).send('User created');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error creating user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).send('Invalid credentials');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).send('Invalid credentials');

    res.send('Login successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const regPattern = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i;

const dbPath = path.join(__dirname, 'domasi.db');
const schemaPath = path.join(__dirname, 'schema.sql');
const db = new sqlite3.Database(dbPath);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Apply schema on startup
function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema, err => {
    if (err) console.error('Schema migration failed:', err);
    else console.log('Schema applied successfully');
  });
}
initializeDatabase();

// --- USERS ---
function getUserByRegNumber(regNumber, callback) {
  db.get(
    'SELECT * FROM users WHERE lower(reg_number) = lower(?)',
    [regNumber.trim()],
    callback
  );
}

function createUser({ fullName, regNumber, whatsappNumber, passwordHash }, callback) {
  db.run(
    'INSERT INTO users (full_name, reg_number, whatsapp_number, password_hash) VALUES (?, ?, ?, ?)',
    [fullName.trim(), regNumber.trim(), whatsappNumber.trim(), passwordHash],
    callback
  );
}

app.post('/api/signup', async (req, res) => {
  const { fullName, regNumber, whatsappNumber, password } = req.body;
  if (!fullName || !regNumber || !whatsappNumber || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }
  if (!regPattern.test(regNumber.trim())) {
    return res.status(400).json({ message: 'Registration number format is invalid.' });
  }

  getUserByRegNumber(regNumber, async (err, existing) => {
    if (existing) {
      return res.status(409).json({ message: 'An account with this registration number already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    createUser({ fullName, regNumber, whatsappNumber, passwordHash }, err2 => {
      if (err2) return res.status(500).json({ message: 'Error creating account.' });
      return res.status(201).json({ message: 'Account created successfully.' });
    });
  });
});

app.post('/api/signin', async (req, res) => {
  const { regNumber, password } = req.body;
  if (!regNumber || !password) {
    return res.status(400).json({ message: 'Please provide registration number and password.' });
  }

  getUserByRegNumber(regNumber, async (err, user) => {
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    return res.json({ message: 'Sign in successful.' });
  });
});

// --- MARKETPLACE ---
app.post('/api/marketplace', (req, res) => {
  const { title, price, category, condition_text, seller_name, seller_phone, description, image_urls } = req.body;
  if (!title || !price || !category || !condition_text || !seller_name || !seller_phone) {
    return res.status(400).json({ message: 'Please provide all required listing fields.' });
  }
  db.run(
    'INSERT INTO marketplace_items (title, price, category, condition_text, seller_name, seller_phone, description, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title.trim(), price, category.trim(), condition_text.trim(), seller_name.trim(), seller_phone.trim(), description || '', Array.isArray(image_urls) ? image_urls.join(',') : ''],
    err => {
      if (err) return res.status(500).json({ message: 'Error saving listing.' });
      return res.status(201).json({ message: 'Marketplace listing saved.' });
    }
  );
});

app.get('/api/marketplace', (req, res) => {
  db.all('SELECT * FROM marketplace_items ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching marketplace.' });
    res.json(rows);
  });
});

// --- ACCOMMODATIONS ---
app.post('/api/accommodations', (req, res) => {
  const { hostel_name, rent, distance, specs, security, landlord_phone, image_urls } = req.body;
  if (!hostel_name || !rent || !distance || !specs || !security || !landlord_phone) {
    return res.status(400).json({ message: 'Please provide all accommodation fields.' });
  }
  db.run(
    'INSERT INTO accommodations (hostel_name, rent, distance, specs, security, landlord_phone, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [hostel_name.trim(), rent, distance.trim(), specs.trim(), security.trim(), landlord_phone.trim(), Array.isArray(image_urls) ? image_urls.join(',') : ''],
    err => {
      if (err) return res.status(500).json({ message: 'Error saving accommodation.' });
      return res.status(201).json({ message: 'Accommodation saved.' });
    }
  );
});

app.get('/api/accommodations', (req, res) => {
  db.all('SELECT * FROM accommodations ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching accommodations.' });
    res.json(rows);
  });
});

// --- PRINTER STATIONS ---
app.post('/api/printers', (req, res) => {
  const { station_name, location, hardware_model, rate_bw, rate_color, image_urls } = req.body;
  if (!station_name || !location || !hardware_model || !rate_bw || !rate_color) {
    return res.status(400).json({ message: 'Please provide all printer station fields.' });
  }
  db.run(
    'INSERT INTO printer_stations (station_name, location, hardware_model, rate_bw, rate_color, image_urls) VALUES (?, ?, ?, ?, ?, ?)',
    [station_name.trim(), location.trim(), hardware_model.trim(), rate_bw, rate_color, Array.isArray(image_urls) ? image_urls.join(',') : ''],
    err => {
      if (err) return res.status(500).json({ message: 'Error saving printer station.' });
      return res.status(201).json({ message: 'Printer station saved.' });
    }
  );
});

app.get('/api/printers', (req, res) => {
  db.all('SELECT * FROM printer_stations ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching printers.' });
    res.json(rows);
  });
});

// --- SUMMARY ---
app.get('/api/summary', (req, res) => {
  const recentMarketplace = db.prepare('SELECT title, category, price FROM marketplace_items ORDER BY created_at DESC LIMIT 3').all();
  const recentAccommodations = db.prepare('SELECT hostel_name AS title, rent FROM accommodations ORDER BY created_at DESC LIMIT 3').all();
  res.json({ marketplace: recentMarketplace, accommodations: recentAccommodations });
});

app.listen(PORT, () => {
  console.log(`Domasi Hub backend running at http://localhost:${PORT}`);
});
