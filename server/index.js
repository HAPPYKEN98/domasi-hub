require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required on Render
});

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // adjust if you serve static files

// --- USERS ---
app.post('/api/signup', async (req, res) => {
  const { fullName, regNumber, whatsappNumber, password } = req.body;
  if (!fullName || !regNumber || !whatsappNumber || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE lower(reg_number) = lower($1)',
      [regNumber.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this registration number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, reg_number, whatsapp_number, password_hash) VALUES ($1, $2, $3, $4)',
      [fullName.trim(), regNumber.trim(), whatsappNumber.trim(), passwordHash]
    );
    res.status(201).json({ message: 'Account created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating account.' });
  }
});

app.post('/api/signin', async (req, res) => {
  const { regNumber, password } = req.body;
  if (!regNumber || !password) {
    return res.status(400).json({ message: 'Please provide registration number and password.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE lower(reg_number) = lower($1)',
      [regNumber.trim()]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    res.json({ message: 'Sign in successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- MARKETPLACE ---
app.post('/api/marketplace', async (req, res) => {
  const { title, price, category, condition_text, seller_name, seller_phone, description, image_urls } = req.body;
  if (!title || !price || !category || !condition_text || !seller_name || !seller_phone) {
    return res.status(400).json({ message: 'Please provide all required listing fields.' });
  }

  try {
    await pool.query(
      'INSERT INTO marketplace_items (title, price, category, condition_text, seller_name, seller_phone, description, image_urls) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [title.trim(), price, category.trim(), condition_text.trim(), seller_name.trim(), seller_phone.trim(), description || '', Array.isArray(image_urls) ? image_urls.join(',') : '']
    );
    res.status(201).json({ message: 'Marketplace listing saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving listing.' });
  }
});

app.get('/api/marketplace', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM marketplace_items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching marketplace.' });
  }
});

// --- ACCOMMODATIONS ---
app.post('/api/accommodations', async (req, res) => {
  const { hostel_name, rent, distance, specs, security, landlord_phone, image_urls } = req.body;
  if (!hostel_name || !rent || !distance || !specs || !security || !landlord_phone) {
    return res.status(400).json({ message: 'Please provide all accommodation fields.' });
  }

  try {
    await pool.query(
      'INSERT INTO accommodations (hostel_name, rent, distance, specs, security, landlord_phone, image_urls) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [hostel_name.trim(), rent, distance.trim(), specs.trim(), security.trim(), landlord_phone.trim(), Array.isArray(image_urls) ? image_urls.join(',') : '']
    );
    res.status(201).json({ message: 'Accommodation saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving accommodation.' });
  }
});

app.get('/api/accommodations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM accommodations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching accommodations.' });
  }
});

// --- PRINTER STATIONS ---
app.post('/api/printers', async (req, res) => {
  const { station_name, location, hardware_model, rate_bw, rate_color, image_urls } = req.body;
  if (!station_name || !location || !hardware_model || !rate_bw || !rate_color) {
    return res.status(400).json({ message: 'Please provide all printer station fields.' });
  }

  try {
    await pool.query(
      'INSERT INTO printer_stations (station_name, location, hardware_model, rate_bw, rate_color, image_urls) VALUES ($1, $2, $3, $4, $5, $6)',
      [station_name.trim(), location.trim(), hardware_model.trim(), rate_bw, rate_color, Array.isArray(image_urls) ? image_urls.join(',') : '']
    );
    res.status(201).json({ message: 'Printer station saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving printer station.' });
  }
});

app.get('/api/printers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM printer_stations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching printers.' });
  }
});

// --- SUMMARY ---
app.get('/api/summary', async (req, res) => {
  try {
    const recentMarketplace = await pool.query('SELECT title, category, price FROM marketplace_items ORDER BY created_at DESC LIMIT 3');
    const recentAccommodations = await pool.query('SELECT hostel_name AS title, rent FROM accommodations ORDER BY created_at DESC LIMIT 3');
    res.json({ marketplace: recentMarketplace.rows, accommodations: recentAccommodations.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching summary.' });
  }
});

// --- DB Check Route ---
app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection failed');
  }
});

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('Domasi Hub backend is running!');
});


app.listen(PORT, () => {
  console.log(`Domasi Hub backend running at http://localhost:${PORT}`);
});