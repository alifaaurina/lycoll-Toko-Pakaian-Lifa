const express = require('express');
const cors = require('cors');
const app = express();

// CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const transactionRoutes = require('./src/routes/transactions');
const categoryRoutes = require('./src/routes/categories');

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);
app.use('/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server backend jalan di http://localhost:${PORT}`);
});

module.exports = app;