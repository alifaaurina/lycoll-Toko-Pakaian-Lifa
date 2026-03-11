import React, { useState } from 'react';
import { useKeranjang } from '../context/KeranjangContext';
import SidebarKeranjang from './SidebarKeranjang';
import './Header.css';

function Header() {
  const { jumlahItem, kosongkanSaatLogout } = useKeranjang();
  const [bukaKeranjang, setBukaKeranjang] = useState(false);

  const handleLogout = () => {
    kosongkanSaatLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <h1>🛍️ Lyffa.collections</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn-keranjang"
            onClick={() => setBukaKeranjang(true)}
          >
            🛒 Keranjang
            {jumlahItem > 0 && <span className="badge">{jumlahItem}</span>}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <SidebarKeranjang
        buka={bukaKeranjang}
        tutup={() => setBukaKeranjang(false)}
      />
    </>
  );
}

export default Header;
