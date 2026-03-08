const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// Create transaction + kurangi stok
router.post('/', authenticateToken, async (req, res) => {
  console.log('📦 Data diterima:', JSON.stringify(req.body, null, 2));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      id_kasir,
      customer_name,
      customer_phone,
      customer_address,
      payment_method,
      cash_paid,
      change_amount,
      bank_name,
      reference_number,
      items,
    } = req.body;

    // Validasi input yang lebih ketat
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items tidak valid atau kosong' });
    }

    if (!id_kasir) {
      return res.status(400).json({ message: 'Pilih kasir yang melayani' });
    }

    if (!customer_name || !customer_phone || !customer_address) {
      return res.status(400).json({ message: 'Data pelanggan lengkap wajib diisi' });
    }

    // Validasi setiap item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id_product || !item.qty || !item.price_at_time || !item.size) {
        return res.status(400).json({ 
          message: `Data item ke-${i + 1} tidak lengkap` 
        });
      }
      
      // Pastikan qty dan price adalah number
      if (isNaN(item.qty) || isNaN(item.price_at_time)) {
        return res.status(400).json({ 
          message: `Qty dan harga harus berupa angka` 
        });
      }
    }

    // Cek kasir
    const kasirCheck = await client.query(
      "SELECT id_user, username, is_active FROM users WHERE id_user = $1 AND role = 'Kasir'",
      [id_kasir]
    );

    if (kasirCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Kasir tidak valid' });
    }

    const kasir = kasirCheck.rows[0];

    if (!kasir.is_active) {
      return res.status(400).json({
        message: `Kasir ${kasir.username} tidak aktif. Pilih kasir yang aktif.`,
      });
    }

    // Validasi hak akses kasir
    if (req.user.role === 'Kasir') {
      if (req.user.id !== parseInt(id_kasir)) {
        return res.status(403).json({ message: 'Kasir hanya bisa input atas nama sendiri' });
      }
    }

    // Hitung total dengan memastikan semua number
    const total_amount = items.reduce((sum, item) => {
      const qty = parseInt(item.qty);
      const price = parseFloat(item.price_at_time);
      return sum + (price * qty);
    }, 0);

    console.log('💰 Total amount:', total_amount);
    console.log('💵 cash_paid dari frontend:', cash_paid);
    console.log('💰 change_amount dari frontend:', change_amount);

    const finalBankName = payment_method === 'Transfer' ? bank_name : null;

    const finalReferenceNumber =
      payment_method === 'Transfer' ? reference_number : null;

    // Insert transaksi
    const transactionResult = await client.query(
      `INSERT INTO transactions 
(id_user, customer_name, customer_phone, customer_address, total, payment_method, cash_paid, change_amount, bank_name, reference_number, status, created_at, updated_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'completed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
RETURNING *`,
      [
        id_kasir,
        customer_name,
        customer_phone,
        customer_address,
        total_amount,
        payment_method,
        Number(cash_paid ?? 0),
        Number(change_amount ?? 0),
        finalBankName,
        finalReferenceNumber,
      ]
    );
    console.log("🔎 HASIL INSERT LANGSUNG:", transactionResult.rows[0]);

    const id_transaction = transactionResult.rows[0].id_transaction;
    console.log('✅ Transaksi dibuat:', id_transaction);
    

    // Insert items dan kurangi stok
    for (const item of items) {
      const qty = parseInt(item.qty);
      const price = parseFloat(item.price_at_time);
      
      // Insert item transaksi
      await client.query(
        `INSERT INTO transaction_items 
         (id_transaction, id_product, qty, price, size)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_transaction, item.id_product, qty, price, item.size]
      );

      // Kurangi stok produk
      const stockResult = await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id_product = $2 AND stock >= $1 RETURNING stock, name_product',
        [qty, item.id_product]
      );

      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Stok tidak cukup untuk produk ID ${item.id_product}`,
        });
      }

      console.log(`✅ Stok ${stockResult.rows[0].name_product} berhasil dikurangi. Sisa: ${stockResult.rows[0].stock}`);
    }

    await client.query('COMMIT');

    // Ambil detail transaksi lengkap untuk response
    const detailResult = await client.query(
      `SELECT t.*, u.username as kasir_name
       FROM transactions t
       JOIN users u ON t.id_user = u.id_user
       WHERE t.id_transaction = $1`,
      [id_transaction]
    );

    const itemsResult = await client.query(
      `SELECT ti.*, p.name_product, p.image
       FROM transaction_items ti
       JOIN products p ON ti.id_product = p.id_product
       WHERE ti.id_transaction = $1`,
      [id_transaction]
    );

    res.status(201).json({
      message: 'Transaksi berhasil',
      transaction: {
        ...detailResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error transaksi:', err);
    res.status(500).json({ 
      message: 'Gagal memproses transaksi', 
      error: err.message,
      detail: err.detail 
    });
  } finally {
    client.release();
  }
});

// Get all transactions (Admin: semua, Kasir: miliknya saja)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT t.*, u.username as kasir_name
      FROM transactions t
      JOIN users u ON t.id_user = u.id_user
    `;
    let params = [];

    if (req.user.role !== 'Admin') {
      query += ' WHERE t.id_user = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil transaksi' });
  }
});

// Get single transaction detail
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const transactionResult = await pool.query(
      `SELECT t.*, u.username as kasir_name
       FROM transactions t
       JOIN users u ON t.id_user = u.id_user
       WHERE t.id_transaction = $1`,
      [id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    const transaction = transactionResult.rows[0];

    if (req.user.role !== 'Admin' && transaction.id_user !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const itemsResult = await pool.query(
      `SELECT ti.*, p.name_product, p.image
       FROM transaction_items ti
       JOIN products p ON ti.id_product = p.id_product
       WHERE ti.id_transaction = $1`,
      [id]
    );

    res.json({
      ...transaction,
      items:
        itemsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil detail transaksi' });
  }
});

module.exports = router;


