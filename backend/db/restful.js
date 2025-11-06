const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy data
let users = [
  { id: 1, name: "Rhaditya" },
  { id: 2, name: "Firza" },
];

// ROUTES
app.get('/', (req, res) => {
  res.send('Backend API berjalan!');
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = { id: users.length + 1, name: req.body.name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Jalankan server
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
