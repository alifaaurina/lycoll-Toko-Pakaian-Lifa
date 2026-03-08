const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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


// Endpoint Melihat Semua User : Ambil semua user (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_user, username, email, role, is_active, created_at FROM users ORDER BY id_user DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
});

// Tambah user baru (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const cekUser = await pool.query(
      'SELECT * FROM users WHERE username=$1',
      [username]
    );

    if (cekUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, is_active, created_at)
       VALUES ($1,$2,$3,$4,true,NOW())
       RETURNING id_user, username, email, role`,
      [username, email, hashedPassword, role]
    );

    res.json({
      message: 'User berhasil dibuat',
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat user' });
  }
});

// Nonaktifkan user
router.patch('/:id/disable', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        message: 'Admin tidak bisa menonaktifkan dirinya sendiri',
      });
    }

    await pool.query(
      'UPDATE users SET is_active=false, updated_at=NOW() WHERE id_user=$1',
      [id]
    );

    res.json({ message: 'User berhasil dinonaktifkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menonaktifkan user' });
  }
});

// Aktifkan user kembali
router.patch('/:id/enable', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE users SET is_active=true, updated_at=NOW() WHERE id_user=$1',
      [id]
    );

    res.json({ message: 'User berhasil diaktifkan kembali' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengaktifkan user' });
  }
});
module.exports = router;
