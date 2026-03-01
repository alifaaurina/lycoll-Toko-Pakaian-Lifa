const express = require('express');
const cors = require('cors');
const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
app.use('/transactions', require('./routes/transactions'));

module.exports = app;
