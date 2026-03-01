const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// Endpoint ambil daftar kasir (semua, tanpa filter is_active)
router.get('/kasir', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_user, username, is_active FROM users WHERE role = 'Kasir' ORDER BY username"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil daftar kasir' });
  }
});

module.exports = router;
