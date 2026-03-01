import React from 'react';
import './ModalStruk.css';

function ModalStruk({ transaksi, tutup }) {
  const handleCetak = () => {
    window.print();
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overlay-struk" onClick={tutup}>
      <div className="modal-struk" onClick={(e) => e.stopPropagation()}>
        <div className="struk-content" id="area-cetak">
          {/* HEADER */}
          {/* HEADER */}
          <div className="text-center header-struk">
            <div className="nama-toko">Lyffa.collections</div>
            <div>Sistem Manajemen Toko</div>
            <div>Jl. Margomulyo A16 Jenangan Ponorogo</div>
            <div>0851-2218-8987</div>
          </div>

          <div className="divider">================================</div>

          {/* INFO TRANSAKSI */}
          <div className="struk-section">
            <p>No. Transaksi #{transaksi.id_transaction}</p>
            <p>Waktu : {formatTanggal(transaksi.created_at)}</p>
            <p>Kasir : {transaksi.kasir_name}</p>
          </div>

          <div className="divider">--------------------------------</div>

          {/* INFO CUSTOMER */}
          <div className="struk-section">
            <p>Pelanggan : {transaksi.customer_name}</p>
            <p>No. HP : {transaksi.customer_phone}</p>
          </div>

          <div className="divider">--------------------------------</div>

          {/* ITEM */}
          <div className="struk-section">
            {transaksi.items &&
              transaksi.items.map((item, index) => (
                <div key={index} className="item-row">
                  <p>{item.name_product}</p>
                  <div className="flex-between">
                    <span>
                      {item.qty} x Rp{' '}
                      {Number(item.price).toLocaleString('id-ID')}
                    </span>
                    <span>
                      Rp {Number(item.price * item.qty).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <div className="divider">--------------------------------</div>

          {/* TOTAL */}
          <div className="struk-section total-section">
            <div className="flex-between total">
              <span>BAYAR</span>
              <span>Rp {Number(transaksi.total).toLocaleString('id-ID')}</span>
            </div>
            <p className="metode">
              Metode Pembayaran : {transaksi.payment_method}
            </p>
          </div>

          <div className="divider">================================</div>

          {/* FOOTER */}
          <div className="text-center footer">
            <p>Terima kasih telah berbelanja!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>

        <div className="struk-actions no-print">
          <button className="btn-cetak" onClick={handleCetak}>
            🖨️ Cetak Struk
          </button>
          <button className="btn-tutup-struk" onClick={tutup}>
            ✕ Tutup Struk
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalStruk;
