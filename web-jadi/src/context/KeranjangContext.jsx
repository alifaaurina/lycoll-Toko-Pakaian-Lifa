import React, { createContext, useContext, useState, useEffect } from 'react';

const KeranjangContext = createContext();

export function KeranjangProvider({ children }) {
  // Load dari localStorage saat init (hanya untuk session yang sama)
  const [itemKeranjang, setItemKeranjang] = useState(() => {
    const saved = localStorage.getItem('keranjang');
    return saved ? JSON.parse(saved) : [];
  });

  const [itemTerpilih, setItemTerpilih] = useState([]);
  const [transaksiLangsung, setTransaksiLangsung] = useState(null); // Untuk beli sekarang

  // Simpan ke localStorage setiap kali keranjang berubah
  useEffect(() => {
    localStorage.setItem('keranjang', JSON.stringify(itemKeranjang));
  }, [itemKeranjang]);

  // Kosongkan keranjang saat logout
  const kosongkanSaatLogout = () => {
    setItemKeranjang([]);
    setItemTerpilih([]);
    setTransaksiLangsung(null);
    localStorage.removeItem('keranjang');
  };

  const tambahKeKeranjang = (produk) => {
    setItemKeranjang((sebelumnya) => {
      const key = `${produk.id_product}-${produk.size}`;
      const sudahAda = sebelumnya.find(
        (item) => `${item.id_product}-${item.size}` === key
      );

      if (sudahAda) {
        return sebelumnya.map((item) =>
          `${item.id_product}-${item.size}` === key
            ? { ...item, quantity: item.quantity + (produk.quantity || 1) }
            : item
        );
      }
      return [...sebelumnya, { ...produk, quantity: produk.quantity || 1 }];
    });
  };

  const updateQuantity = (id_product, size, quantity) => {
    if (quantity <= 0) {
      hapusDariKeranjang(id_product, size);
      return;
    }
    setItemKeranjang((sebelumnya) =>
      sebelumnya.map((item) =>
        item.id_product === id_product && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const hapusDariKeranjang = (id_product, size) => {
    const key = `${id_product}-${size}`;
    setItemKeranjang((sebelumnya) =>
      sebelumnya.filter(
        (item) => !(item.id_product === id_product && item.size === size)
      )
    );
    setItemTerpilih((prev) => prev.filter((id) => id !== key));
  };

  const kosongkanKeranjang = () => {
    setItemKeranjang([]);
    setItemTerpilih([]);
    localStorage.removeItem('keranjang');
  };

  // Hapus item yang sudah dibeli setelah transaksi sukses
  const hapusItemTerpilih = () => {
    setItemKeranjang((sebelumnya) =>
      sebelumnya.filter(
        (item) => !itemTerpilih.includes(`${item.id_product}-${item.size}`)
      )
    );
    setItemTerpilih([]);
  };

  const togglePilihItem = (id_product, size) => {
    const key = `${id_product}-${size}`;
    setItemTerpilih((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const totalHargaTerpilih = itemKeranjang
    .filter((item) => itemTerpilih.includes(`${item.id_product}-${item.size}`))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemTerpilih = () => {
    return itemKeranjang.filter((item) =>
      itemTerpilih.includes(`${item.id_product}-${item.size}`)
    );
  };

  return (
    <KeranjangContext.Provider
      value={{
        itemKeranjang,
        setItemKeranjang,
        itemTerpilih,
        setItemTerpilih,
        transaksiLangsung,
        setTransaksiLangsung,
        tambahKeKeranjang,
        updateQuantity,
        hapusDariKeranjang,
        kosongkanKeranjang,
        kosongkanSaatLogout,
        hapusItemTerpilih,
        togglePilihItem,
        totalHargaTerpilih,
        getItemTerpilih,
        jumlahItem: itemKeranjang.length,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  return useContext(KeranjangContext);
}
