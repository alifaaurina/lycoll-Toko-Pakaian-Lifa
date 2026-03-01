import React from 'react';
import { useKeranjang } from '../context/KeranjangContext';

function HeaderDashboard({ user, onLogout, onBukaKeranjang }) {
  const { jumlahItem } = useKeranjang();

  return (
    <header className="header-dashboard">
      <div className="header-kiri">
        <h1>🛍️ Lyffa.collections</h1>
        {user && (
          <span className="info-user">
            {user.role}: {user.username}
          </span>
        )}
      </div>
      <div className="header-kanan">
        <button className="tombol-keranjang" onClick={onBukaKeranjang}>
          🛒 Keranjang ({jumlahItem})
        </button>
        <button onClick={onLogout} className="tombol-logout">
          ⏻ Logout
        </button>
      </div>
    </header>
  );
}

export default HeaderDashboard;
