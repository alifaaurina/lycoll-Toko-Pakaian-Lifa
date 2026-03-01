const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const todaySales = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const todayCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const lowStock = await pool.query(`
      SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC
    `);

    const topProducts = await pool.query(`
      SELECT p.name_product, SUM(ti.qty) as total_sold
      FROM transaction_items ti
      JOIN products p ON ti.id_product = p.id_product
      GROUP BY p.id_product, p.name_product
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      todaySales: todaySales.rows[0].total,
      todayTransactions: parseInt(todayCount.rows[0].count),
      lowStockProducts: lowStock.rows,
      topProducts: topProducts.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil statistik' });
  }
});

module.exports = router;
