import React, { useState, useEffect } from 'react';
import { useKeranjang } from '../context/KeranjangContext';
import ModalStruk from './ModalStruk';
import CheckoutSummary from './CheckoutSummary';
import CustomerForm from './CustomerForm';
import PaymentSection from './PaymentSection';
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
  const [uangDibayar, setUangDibayar] = useState(0);
  const [bankName, setBankName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const getItemsToBuy = () => {
    if (isDirectBuy && transaksiLangsung) return [transaksiLangsung];
    return itemKeranjang.filter((item) =>
      itemTerpilih.includes(`${item.id_product}-${item.size}`)
    );
  };

  const itemsToBuy = getItemsToBuy();

  const totalHarga = itemsToBuy.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const kembalian =
    dataForm.payment_method === 'Tunai'
      ? Math.max(uangDibayar - totalHarga, 0)
      : 0;

  const adaStokHabis = itemsToBuy.some((item) => item.quantity > item.stock);

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
            setDataForm((prev) => ({
              ...prev,
              id_kasir: userData.id_user,
            }));
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
        console.error(error);
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

    for (const item of itemsToBuy) {
      if (item.quantity > item.stock) {
        alert(`Stok ${item.name_product} tidak mencukupi!`);
        return;
      }
    }

    if (dataForm.payment_method === 'Tunai' && uangDibayar < totalHarga) {
      alert('Uang dibayar tidak cukup!');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    const payload = {
      id_kasir: parseInt(dataForm.id_kasir),
      customer_name: dataForm.customer_name.trim(),
      customer_phone: dataForm.customer_phone.trim(),
      customer_address: dataForm.customer_address.trim(),
      payment_method: dataForm.payment_method,
      cash_paid:
        dataForm.payment_method === 'Tunai'
          ? Number(uangDibayar)
          : Number(totalHarga),
      change_amount:
        dataForm.payment_method === 'Tunai'
          ? Number(uangDibayar) - Number(totalHarga)
          : 0,
      bank_name: dataForm.payment_method === 'Transfer' ? bankName : null,
      reference_number:
        dataForm.payment_method === 'Transfer' ? referenceNumber : null,
      items: itemsToBuy.map((item) => ({
        id_product: parseInt(item.id_product),
        qty: parseInt(item.quantity),
        price_at_time: parseFloat(item.price),
        size: item.size || 'default',
      })),
    };

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

      if (response.ok) {
        if (!isDirectBuy) hapusItemTerpilih();
        setDataStruk(data.transaction);
        setTampilStruk(true);
      } else {
        alert(data.message || 'Gagal memproses transaksi');
      }
    } catch (error) {
      alert('Error koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  if (tampilStruk && dataStruk) {
    return (
      <ModalStruk
        transaksi={dataStruk}
        tutup={() => {
          setTampilStruk(false);
          sukses();
        }}
      />
    );
  }

  return (
    <div className="overlay-modal">
      <div className="konten-modal modal-checkout">
        <CheckoutSummary itemsToBuy={itemsToBuy} totalHarga={totalHarga} />

        <form onSubmit={handleSubmit}>
          <CustomerForm
            dataForm={dataForm}
            setDataForm={setDataForm}
            userLogin={userLogin}
            daftarKasir={daftarKasir}
          />

          <PaymentSection
            dataForm={dataForm}
            setDataForm={setDataForm}
            uangDibayar={uangDibayar}
            setUangDibayar={setUangDibayar}
            totalHarga={totalHarga}
            kembalian={kembalian}
            bankName={bankName}
            setBankName={setBankName}
            referenceNumber={referenceNumber}
            setReferenceNumber={setReferenceNumber}
          />

          <button type="submit" disabled={loading || adaStokHabis}>
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalCheckout;
