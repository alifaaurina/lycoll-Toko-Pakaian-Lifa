import React, { useState } from 'react';
import './ProductCard.css';
import { useKeranjang } from '../context/KeranjangContext';
import ModalCheckout from './ModalCheckout';

// Komponen kartu produk yang menampilkan informasi produk dan memungkinkan pengguna memilih size, jumlah, serta menambahkan ke keranjang atau langsung checkout
function ProductCard({ id_product, name_product, price, stock, image }) {
  const { tambahKeKeranjang, setTransaksiLangsung } = useKeranjang();
  const [showModal, setShowModal] = useState(false);
  const [showDirectCheckout, setShowDirectCheckout] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Fungsi untuk mengatur jumlah produk yang akan dibeli
  const handleQty = (type) => {
    if (type === 'plus' && qty < stock) setQty(qty + 1);
    if (type === 'minus' && qty > 1) setQty(qty - 1);
  };

  // Fungsi untuk menambahkan produk ke keranjang
  const handleAddToCart = (e) => {
    e.stopPropagation();

    tambahKeKeranjang({
      id_product,
      name_product,
      price: Number(price),
      stock,
      size: selectedSize,
      image,
      quantity: qty,
    });

    alert('Produk berhasil ditambahkan ke keranjang!');
    setShowModal(false);
    setQty(1);
  };

  // Fungsi untuk langsung checkout produk tanpa melalui keranjang
  const handleBuyNow = (e) => {
    e.stopPropagation();

    // Validasi stok
    if (qty > stock) {
      alert('Stok tidak mencukupi!');
      return;
    }

    // Set transaksi langsung (tanpa melalui keranjang)
    setTransaksiLangsung({
      id_product,
      name_product,
      price: Number(price),
      stock,
      size: selectedSize,
      image,
      quantity: qty,
    });

    // Tutup modal size dan buka modal checkout langsung
    setShowModal(false);
    setShowDirectCheckout(true);
  };

  return (
    <>
      <div className="product-card" onClick={() => setShowModal(true)}>
        <div className="product-image-container">
          {image && image.startsWith('http') ? (
            <img src={image} alt={name_product} className="product-img-file" />
          ) : (
            <div className="product-emoji-fallback">👕</div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title">
            {name_product || 'Produk Tanpa Nama'}
          </h3>
          <p className="product-stock">Stok: {stock}</p>
          <p className="product-price">
            Rp {price ? Number(price).toLocaleString('id-ID') : '0'}
          </p>
        </div>
      </div>

      {/* MODAL PILIH SIZE & QTY */}
      {showModal && (
        <div className="size-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="size-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ×
            </button>
            <div className="modal-body-detail">
              <div className="modal-left">
                <img src={image || '👕'} alt={name_product} />
              </div>
              <div className="modal-right">
                <h2>{name_product}</h2>
                <p className="modal-price">
                  Rp {Number(price).toLocaleString('id-ID')}
                </p>

                <div className="size-selector">
                  <span className="label-modal">SIZE:</span>
                  <div className="size-options">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        className={selectedSize === s ? 'active' : ''}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QUANTITY COUNTER */}
                <div className="qty-selector">
                  <span className="label-modal">JUMLAH:</span>
                  <div className="qty-controls">
                    <button onClick={() => handleQty('minus')}>-</button>
                    <input type="number" value={qty} readOnly />
                    <button onClick={() => handleQty('plus')}>+</button>
                  </div>
                  <small>Stok tersedia: {stock}</small>
                </div>

                <div className="modal-actions">
                  <button className="btn-add-cart" onClick={handleAddToCart}>
                    TAMBAHKAN KE KERANJANG
                  </button>
                  <button className="btn-buy-now" onClick={handleBuyNow}>
                    BELI SEKARANG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT CHECKOUT MODAL (Beli Sekarang) */}
      {showDirectCheckout && (
        <ModalCheckout
          isDirectBuy={true}
          tutup={() => {
            setShowDirectCheckout(false);
            setTransaksiLangsung(null);
          }}
          sukses={() => {
            setShowDirectCheckout(false);
            setTransaksiLangsung(null);
          }}
        />
      )}
    </>
  );
}

export default ProductCard;
