const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_toko_pakaian',
  password: 'postgres',
  port: 5432,
});

module.exports = pool;
