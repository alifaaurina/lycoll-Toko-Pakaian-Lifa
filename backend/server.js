const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Routes
app.use(express.json());
app.use(
  cors({
    origin: '*', // biar bisa diakses dari frontend di mana saja
    credentials: true,
  })
);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);
app.use('/categories', categoryRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server jalan di port ${PORT}`));

module.exports = app;
