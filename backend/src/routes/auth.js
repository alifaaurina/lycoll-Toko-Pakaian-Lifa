const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username=$1 AND is_active=true',
      [username]
    );
    if (result.rows.length === 0)
      return res
        .status(401)
        .json({ message: 'User tidak ditemukan atau tidak aktif' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign(
      { id: user.id_user, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id_user,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error server' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_user, username, email, role FROM users WHERE id_user = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error mengambil data user' });
  }
});

module.exports = router;
