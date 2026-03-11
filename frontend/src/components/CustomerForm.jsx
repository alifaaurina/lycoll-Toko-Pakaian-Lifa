import React from 'react';

function CustomerForm({ dataForm, setDataForm, userLogin, daftarKasir }) {
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

  return (
    <>
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
            setDataForm({
              ...dataForm,
              customer_name: e.target.value,
            })
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
            setDataForm({
              ...dataForm,
              customer_phone: e.target.value,
            })
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
            setDataForm({
              ...dataForm,
              customer_address: e.target.value,
            })
          }
          placeholder="Masukkan alamat lengkap"
          rows="3"
        />
      </div>
    </>
  );
}

export default CustomerForm;