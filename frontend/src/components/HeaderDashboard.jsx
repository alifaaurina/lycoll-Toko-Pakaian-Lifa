import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeranjang } from '../context/KeranjangContext';

function HeaderDashboard({ user, onLogout, onBukaKeranjang }) {
  const { jumlahItem } = useKeranjang();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleNavigate = (path) => {
    setOpenDropdown(false);
    navigate(path);
  };

  return (
    <header className="header-dashboard">
      <div className="header-kiri">
        <h1>🛍️ Lyffa.collections</h1>
      </div>

      <div className="header-kanan">
        <button className="tombol-keranjang" onClick={onBukaKeranjang}>
          🛒 Keranjang ({jumlahItem})
        </button>

        {user && (
          <div className="user-dropdown">
            <button
              className="tombol-user tombol-gradient"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              {user.role}: {user.username} ▼
            </button>

            {openDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => handleNavigate('/dashboard')}>
                  Dashboard
                </button>

                {user.role === 'Admin' && (
                  <>
                    <button
                      onClick={() => handleNavigate('/dashboard/products')}
                    >
                      Kelola Produk
                    </button>

                    <button
                      onClick={() => handleNavigate('/dashboard/transactions')}
                    >
                      Riwayat Transaksi
                    </button>

                    <button onClick={() => handleNavigate('/dashboard/users')}>
                      Kelola Users
                    </button>
                  </>
                )}
                <button onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default HeaderDashboard;
