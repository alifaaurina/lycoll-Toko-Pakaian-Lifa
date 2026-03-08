import React, { useEffect, useState } from 'react';
import './TransactionsAdmin.css';

// Komponen untuk halaman admin melihat riwayat transaksi
function TransactionsAdmin() {
  const [transactions, setTransactions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const token = localStorage.getItem('token');
  // Fetch semua transaksi
  const fetchTransactions = async () => {
    const res = await fetch('http://localhost:5000/transactions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setTransactions(data);
  };

  // Fetch detail transaksi berdasarkan ID
  const fetchDetail = async (id) => {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }

    const res = await fetch(`http://localhost:5000/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setDetail(data);
    setSelectedId(id);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Hitung total transaksi, omzet, dan jumlah kasir unik
  const totalTransaksi = transactions.length;
  const totalOmzet = transactions.reduce((acc, t) => acc + Number(t.total), 0);
  const uniqueKasir = [...new Set(transactions.map((t) => t.kasir_name))]
    .length;

  const filteredTransactions = transactions.filter((t) => {
    if (!startDate || !endDate) return true;

    const transactionDate = new Date(t.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Supaya end date termasuk hari itu juga
    end.setHours(23, 59, 59, 999);

    return transactionDate >= start && transactionDate <= end;
  });
  // Format angka ke Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(angka);
  };

  // Format tanggal ke format Indonesia
  return (
    <div className="transactions-container">
      <h2>Riwayat Transaksi</h2>

      {/* STAT CARDS */}
      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Transaksi</h4>
          <p>{totalTransaksi}</p>
        </div>

        <div className="stat-card success">
          <h4>Total Omzet</h4>
          <p>{formatRupiah(totalOmzet)}</p>
        </div>

        <div className="stat-card">
          <h4>Kasir Aktif</h4>
          <p>{uniqueKasir}</p>
        </div>
      </div>

      <div className="filter-container">
        <div>
          <label>Dari:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>Sampai:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          className="btn-clear"
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <table className="transactions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanggal</th>
            <th>Kasir</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((t) => (
            <React.Fragment key={t.id_transaction}>
              <tr>
                <td>{t.id_transaction}</td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.kasir_name}</td>
                <td>{t.customer_name}</td>
                <td>{formatRupiah(t.total)}</td>
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => fetchDetail(t.id_transaction)}
                  >
                    Detail
                  </button>
                </td>
              </tr>

              {selectedId === t.id_transaction && detail && (
                <tr>
                  <td colSpan="6" className="detail-row">
                    <div className="detail-box">
                      {detail.items.map((item) => (
                        <div key={item.id_transaction_item}>
                          {item.name_product} ({item.size}) x{item.qty} ={' '}
                          {formatRupiah(item.qty * item.price)}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsAdmin;
