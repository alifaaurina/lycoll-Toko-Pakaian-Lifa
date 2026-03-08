import React, { useState } from 'react';
import { useKeranjang } from '../context/KeranjangContext';
import ModalCheckout from './ModalCheckout';
import './SidebarKeranjang.css';

// Komponen sidebar keranjang yang muncul saat tombol keranjang di header diklik
function SidebarKeranjang({ buka, tutup }) {
  const {
    itemKeranjang,
    itemTerpilih,
    togglePilihItem,
    updateQuantity,
    hapusDariKeranjang,
    totalHargaTerpilih,
    kosongkanKeranjang,
  } = useKeranjang();

  const [bukaCheckout, setBukaCheckout] = useState(false);

  // Fungsi untuk membuka modal checkout dengan item yang dipilih
  const handleCheckout = () => {
    if (itemTerpilih.length === 0) {
      alert('Pilih minimal satu produk untuk dibeli!');
      return;
    }
    setBukaCheckout(true);
  };

  if (!buka) return null;

  return (
    <>
      <div className="overlay-keranjang" onClick={tutup}></div>
      <div className="sidebar-keranjang">
        <div className="header-keranjang">
          <h2>🛒 Keranjang</h2>
          <button className="tombol-tutup" onClick={tutup}>
            ×
          </button>
        </div>

        {itemKeranjang.length === 0 ? (
          <div className="keranjang-kosong">
            <p>Keranjang masih kosong</p>
            <span>Pilih produk untuk memulai belanja</span>
          </div>
        ) : (
          <>
            <div className="daftar-item">
              {itemKeranjang.map((item) => {
                const itemKey = `${item.id_product}-${item.size}`;
                const isSelected = itemTerpilih.includes(itemKey);

                return (
                  <div
                    key={itemKey}
                    className={`item-keranjang ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        togglePilihItem(item.id_product, item.size)
                      }
                      className="checkbox-item"
                    />
                    <img
                      src={item.image || '👕'}
                      alt={item.name_product}
                      className="gambar-item"
                    />
                    <div className="info-item">
                      <h4>{item.name_product}</h4>
                      <span className="item-size">Size: {item.size}</span>
                      <p className="item-price">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                      <div className="kontrol-qty">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id_product,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id_product,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="tombol-hapus"
                      onClick={() =>
                        hapusDariKeranjang(item.id_product, item.size)
                      }
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="footer-keranjang">
              <div className="info-terpilih">
                <span>{itemTerpilih.length} item dipilih</span>
              </div>
              <div className="total-harga">
                <strong>Total:</strong>
                <strong>
                  Rp {Number(totalHargaTerpilih).toLocaleString('id-ID')}
                </strong>
              </div>
              <button
                className="tombol-checkout"
                disabled={itemTerpilih.length === 0}
                onClick={handleCheckout}
              >
                Buat Pesanan ({itemTerpilih.length})
              </button>
              <button className="tombol-kosongkan" onClick={kosongkanKeranjang}>
                Kosongkan Keranjang
              </button>
            </div>
          </>
        )}
      </div>

      {bukaCheckout && (
        <ModalCheckout
          isDirectBuy={false}
          tutup={() => setBukaCheckout(false)}
          sukses={() => {
            setBukaCheckout(false);
            tutup();
          }}
        />
      )}
    </>
  );
}

export default SidebarKeranjang;
