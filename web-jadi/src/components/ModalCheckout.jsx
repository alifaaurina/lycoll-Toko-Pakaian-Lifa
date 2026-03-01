import React, { useState, useEffect } from 'react';
import { useKeranjang } from '../context/KeranjangContext';
import ModalStruk from './ModalStruk';
import './ModalCheckout.css';

function ModalCheckout({ tutup, sukses, isDirectBuy = false }) {
  const { itemKeranjang, itemTerpilih, transaksiLangsung, hapusItemTerpilih } =
    useKeranjang();

  const [dataForm, setDataForm] = useState({
    id_kasir: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    payment_method: 'Tunai',
  });

  const [daftarKasir, setDaftarKasir] = useState([]);
  const [userLogin, setUserLogin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tampilStruk, setTampilStruk] = useState(false);
  const [dataStruk, setDataStruk] = useState(null);

  // Tentukan item yang akan dibeli
  const getItemsToBuy = () => {
    if (isDirectBuy && transaksiLangsung) {
      return [transaksiLangsung];
    }
    return itemKeranjang.filter((item) =>
      itemTerpilih.includes(`${item.id_product}-${item.size}`)
    );
  };

  const itemsToBuy = getItemsToBuy();
  const totalHarga = itemsToBuy.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ambilData = async () => {
      try {
        const userRes = await fetch('http://localhost:5000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserLogin(userData);

          if (userData.role === 'Kasir') {
            setDataForm((prev) => ({ ...prev, id_kasir: userData.id_user }));
          } else if (userData.role === 'Admin') {
            const kasirRes = await fetch('http://localhost:5000/users/kasir', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (kasirRes.ok) {
              const kasirData = await kasirRes.json();
              setDaftarKasir(kasirData);
              if (kasirData.length > 0) {
                setDataForm((prev) => ({
                  ...prev,
                  id_kasir: kasirData[0].id_user,
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    ambilData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (itemsToBuy.length === 0) {
      alert('Tidak ada produk untuk dibeli!');
      return;
    }

    // Validasi stok
    for (const item of itemsToBuy) {
      if (item.quantity > item.stock) {
        alert(
          `Stok ${item.name_product} (${item.size}) tidak mencukupi! Tersisa: ${item.stock}`
        );
        return;
      }
    }

    // Validasi form
    if (!dataForm.id_kasir) {
      alert('Pilih kasir yang melayani!');
      return;
    }
    if (!dataForm.customer_name.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }
    if (!dataForm.customer_phone.trim()) {
      alert('Nomor telepon wajib diisi!');
      return;
    }
    if (!dataForm.customer_address.trim()) {
      alert('Alamat wajib diisi!');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    // PERSIAPAN DATA YANG AKAN DIKIRIM - PERBAIKAN UTAMA DI SINI
    const payload = {
      id_kasir: parseInt(dataForm.id_kasir),
      customer_name: dataForm.customer_name.trim(),
      customer_phone: dataForm.customer_phone.trim(),
      customer_address: dataForm.customer_address.trim(),
      payment_method: dataForm.payment_method,
      items: itemsToBuy.map((item) => ({
        id_product: parseInt(item.id_product),
        qty: parseInt(item.quantity),
        price_at_time: parseFloat(item.price),
        size: item.size || 'default', 
        
      })),
      
    };
    console.log('CEK ITEMS:', itemsToBuy);
    console.log('📦 Payload yang dikirim:', JSON.stringify(payload, null, 2));
    

    try {
      const response = await fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 Response dari server:', data);

      if (response.ok) {
        // Hapus item yang sudah dibeli dari keranjang (jika dari keranjang)
        if (!isDirectBuy) {
          hapusItemTerpilih();
        }

        // Simpan data struk dan tampilkan
        setDataStruk(data.transaction);
        setTampilStruk(true);
      } else {
        console.error('❌ Error dari server:', data);
        alert(data.message || data.error || 'Gagal memproses transaksi');
      }
    } catch (error) {
      console.error('❌ Error koneksi:', error);
      alert('Error koneksi ke server: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelesai = () => {
    setTampilStruk(false);
    setDataStruk(null);
    sukses();
  };

  const renderDropdownKasir = () => {
    if (!userLogin) return <option>Memuat...</option>;
    if (userLogin.role === 'Kasir') {
      return (
        <option value={userLogin.id_user}>{userLogin.username} (Anda)</option>
      );
    }
    return daftarKasir.map((kasir) => (
      <option key={kasir.id_user} value={kasir.id_user}>
        {kasir.username}
      </option>
    ));
  };

  if (tampilStruk && dataStruk) {
    return <ModalStruk transaksi={dataStruk} tutup={handleSelesai} />;
  }

  return (
    <div
      className="overlay-modal"
      onClick={(e) => {
        if (e.target.className === 'overlay-modal') {
          tutup();
        }
      }}
    >
      <div
        className="konten-modal modal-checkout"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checkout-header">
          <h2>{isDirectBuy ? 'Checkout ' : 'Checkout Pesanan'}</h2>
          <button className="btn-tutup-checkout" onClick={tutup}>
            ×
          </button>
        </div>

        <div className="ringkasan-pesanan">
          <h3>Ringkasan ({itemsToBuy.length} Produk)</h3>
          <div className="scroll-ringkasan">
            {itemsToBuy.length === 0 ? (
              <p className="pesan-kosong">Tidak ada produk</p>
            ) : (
              itemsToBuy.map((item, index) => (
                <div
                  key={`${item.id_product}-${item.size}-${index}`}
                  className="item-ringkasan"
                >
                  <div className="item-detail-text">
                    <span className="nama-p">{item.name_product}</span>
                    <span className="size-p">
                      Size: {item.size} | {item.quantity}x
                    </span>
                    <span className="stok-p">Stok: {item.stock}</span>
                  </div>
                  <span className="harga-p">
                    Rp.{' '}
                    {(Number(item.price) * item.quantity).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="total-ringkasan">
            <strong>Total Pembayaran</strong>
            <strong>Rp {Number(totalHarga).toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grup-form">
            <label>Dilayani Oleh*</label>
            <select
              required
              value={dataForm.id_kasir}
              onChange={(e) =>
                setDataForm({ ...dataForm, id_kasir: e.target.value })
              }
              disabled={userLogin?.role === 'Kasir'}
            >
              {renderDropdownKasir()}
            </select>
          </div>

          <div className="grup-form">
            <label>Nama Pelanggan *</label>
            <input
              type="text"
              required
              value={dataForm.customer_name}
              onChange={(e) =>
                setDataForm((prev) => ({
                  ...prev,
                  customer_name: e.target.value,
                }))
              }
              placeholder="Masukkan nama pelanggan"
            />
          </div>

          <div className="grup-form">
            <label>Nomor Telepon *</label>
            <input
              type="tel"
              required
              value={dataForm.customer_phone}
              onChange={(e) =>
                setDataForm((prev) => ({
                  ...prev,
                  customer_phone: e.target.value,
                }))
              }
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="grup-form">
            <label>Alamat Lengkap *</label>
            <textarea
              required
              value={dataForm.customer_address}
              onChange={(e) =>
                setDataForm((prev) => ({
                  ...prev,
                  customer_address: e.target.value,
                }))
              }
              placeholder="Masukkan alamat lengkap pengiriman"
              rows="3"
            />
          </div>

          <div className="grup-form">
            <label>Metode Pembayaran</label>
            <select
              value={dataForm.payment_method}
              onChange={(e) =>
                setDataForm({ ...dataForm, payment_method: e.target.value })
              }
            >
              <option value="Tunai">Tunai</option>
              <option value="QRIS">Qris</option>
              <option value="Transfer">Transfer Bank</option>
            </select>
          </div>

          <div className="tombol-modal">
            <button type="button" className="btn-batal" onClick={tutup}>
              Batalkan Pesanan
            </button>
            <button
              type="submit"
              className="btn-bayar"
              disabled={loading || itemsToBuy.length === 0}
            >
              {loading ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCheckout;
