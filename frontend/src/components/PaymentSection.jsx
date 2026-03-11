import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function PaymentSection({
  dataForm,
  setDataForm,
  uangDibayar,
  setUangDibayar,
  totalHarga,
  kembalian,
  bankName,
  setBankName,
  referenceNumber,
  setReferenceNumber,
}) {
  return (
    <>
      <div className="grup-form">
        <label>Metode Pembayaran</label>

        <select
          value={dataForm.payment_method}
          onChange={(e) => {
            const metode = e.target.value;

            setDataForm({ ...dataForm, payment_method: metode });

            // reset field jika ganti metode
            setUangDibayar(0);
            setBankName('');
            setReferenceNumber('');
          }}
        >
          <option value="Tunai">Tunai</option>
          <option value="Qris">Qris</option>
          <option value="Transfer">Transfer Bank</option>
        </select>
      </div>

      {/* ================= TUNAI ================= */}
      {dataForm.payment_method === 'Tunai' && (
        <>
          <div className="grup-form">
            <label>Uang Dibayar *</label>
            <input
              type="number"
              min="0"
              value={uangDibayar}
              onChange={(e) => setUangDibayar(Number(e.target.value))}
              required
            />
          </div>

          <div className="grup-form">
            <label>Kembalian</label>
            <input
              type="text"
              value={
                uangDibayar >= totalHarga
                  ? `Rp ${kembalian.toLocaleString('id-ID')}`
                  : 'Uang kurang'
              }
              disabled
            />
          </div>
        </>
      )}

      {/* ================= QRIS ================= */}
      {dataForm.payment_method === 'Qris' && (
        <div className="qris-box">
          <h4>Silahkan Scan untuk Membayar</h4>

          <QRCodeCanvas value={`QRIS-LYFFA-${totalHarga}`} size={180} />

          <p>Total Bayar : Rp {Number(totalHarga).toLocaleString('id-ID')}</p>
        </div>
      )}

      {/* ================= TRANSFER ================= */}
      {dataForm.payment_method === 'Transfer' && (
        <div className="transfer-box">
          <div className="grup-form">
            <label>Pilih Bank *</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            >
              <option value="">-- Pilih Bank --</option>
              <option value="BCA">BCA</option>
              <option value="BRI">BRI</option>
              <option value="BNI">BNI</option>
              <option value="Mandiri">Mandiri</option>
            </select>
          </div>

          <div className="grup-form">
            <label>No. Referensi *</label>
            <input
              type="text"
              placeholder="Masukkan nomor referensi transfer"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required
            />
          </div>

          <div className="info-transfer">
            <p>Total yang harus dibayar:</p>
            <strong>Rp {Number(totalHarga).toLocaleString('id-ID')}</strong>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentSection;
