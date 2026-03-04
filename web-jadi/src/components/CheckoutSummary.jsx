import React from 'react';

function CheckoutSummary({ itemsToBuy, totalHarga }) {
  return (
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
                Rp{' '}
                {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
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
  );
}

export default CheckoutSummary;
