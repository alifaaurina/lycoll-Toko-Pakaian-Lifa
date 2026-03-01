const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name_category 
      FROM products p
      LEFT JOIN categories c ON p.id_category = c.id_category
      ORDER BY p.id_product ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
});

// Get single product (Public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE id_product = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error mengambil produk' });
  }
});

// Create product (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id_category, name_product, price, stock, size, image } = req.body;

    if (!name_product || !price || stock === undefined) {
      return res
        .status(400)
        .json({ message: 'Nama produk, harga, dan stok wajib diisi' });
    }

    const result = await pool.query(
      `INSERT INTO products (id_category, name_product, price, stock, size, image, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id_category, name_product, price, stock, size, image]
    );

    res.status(201).json({
      message: 'Produk berhasil ditambahkan',
      product: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan produk' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_category, name_product, price, stock, size, image } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET id_category = $1, name_product = $2, price = $3, stock = $4, 
           size = $5, image = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id_product = $7
       RETURNING *`,
      [id_category, name_product, price, stock, size, image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({
      message: 'Produk berhasil diupdate',
      product: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengupdate produk' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const checkTransaction = await pool.query(
      'SELECT * FROM transaction_items WHERE id_product = $1 LIMIT 1',
      [id]
    );

    if (checkTransaction.rows.length > 0) {
      return res.status(400).json({
        message: 'Produk tidak bisa dihapus karena sudah pernah ditransaksikan',
      });
    }

    const result = await pool.query(
      'DELETE FROM products WHERE id_product = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus produk' });
  }
});

module.exports = router;
