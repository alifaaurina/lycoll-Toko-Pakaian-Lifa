require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/db/pool');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// IMPORT ROUTES
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const transactionRoutes = require('./src/routes/transactions');
const categoryRoutes = require('./src/routes/categories');

// ROUTES
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);
app.use('/categories', categoryRoutes);

// TEST DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json({ status: '✅ Koneksi berhasil!', data: result.rows });
  } catch (err) {
    res.json({ status: '❌ Koneksi gagal', error: err.message });
  }
});

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://lycoll-backend.onrender.com',
      'https://lycoll-frontend.onrender.com', // ganti dengan URL frontend kamu
    ],
    credentials: true,
  })
);

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server backend jalan di http://localhost:${PORT}`);
});
