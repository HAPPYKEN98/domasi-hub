const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'users.json');
const regPattern = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

function readUsers() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2), 'utf8');
}

app.post('/api/signup', async (req, res) => {
  const { fullName, regNumber, whatsappNumber, password } = req.body;

  if (!fullName || !regNumber || !whatsappNumber || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (!regPattern.test(regNumber.trim())) {
    return res.status(400).json({ message: 'Registration number format is invalid.' });
  }

  const users = readUsers();
  const existing = users.find(u => u.regNumber.toLowerCase() === regNumber.trim().toLowerCase());

  if (existing) {
    return res.status(409).json({ message: 'An account with this registration number already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    regNumber: regNumber.trim(),
    whatsappNumber: whatsappNumber.trim(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  return res.status(201).json({ message: 'Account created successfully.' });
});

app.post('/api/signin', async (req, res) => {
  const { regNumber, password } = req.body;

  if (!regNumber || !password) {
    return res.status(400).json({ message: 'Please provide registration number and password.' });
  }

  const users = readUsers();
  const user = users.find(u => u.regNumber.toLowerCase() === regNumber.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  return res.json({ message: 'Sign in successful.' });
});

app.listen(PORT, () => {
  console.log(`Domasi Hub backend running at http://localhost:${PORT}`);
});
