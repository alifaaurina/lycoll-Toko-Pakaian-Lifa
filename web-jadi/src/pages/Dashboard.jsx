import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeaderDashboard from '../components/HeaderDashboard';
import SidebarKeranjang from '../components/SidebarKeranjang';
import Footer from '../components/Footer';
import './Dashboard.css';

// Halaman utama dashboard menampilkan produk dan fitur pencarian serta kategori
function Dashboard() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keranjangBuka, setKeranjangBuka] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // FITUR M3: State Pencarian & Kategori
  const [kataKunci, setKataKunci] = useState('');
  const [kategoriTerpilih, setKategoriTerpilih] = useState('Semua');
  const [daftarKategori, setDaftarKategori] = useState([]);

  const navigate = useNavigate();

  // FITUR BARU: Ambil Daftar Kategori Langsung dari Database
  const fetchKategori = useCallback(async () => {
    try {
      // Ambil semua kategori dari backend
      const response = await fetch('http://localhost:5000/categories');
      if (response.ok) {
        const data = await response.json();
        // Ambil hanya nama kategorinya saja
        setDaftarKategori(data.map((cat) => cat.name_category));
      }
    } catch (error) {
      console.error('Gagal ambil kategori:', error);
    }
  }, []);

  // Ambil data produk dari backend
  const fetchProduk = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/products');
      const data = await response.json();
      setProduk(data);
    } catch (error) {
      console.error('Gagal ambil produk:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    // Ambil data user untuk menampilkan nama di header
    const ambilUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error ambil user:', error);
      }
    };

    ambilUser();
    fetchKategori(); // Ambil semua kategori saat pertama load
  }, [navigate, fetchKategori]);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk, refreshKey]);

  useEffect(() => {
    const handleRefreshProduk = () => {
      setRefreshKey((prev) => prev + 1);
    };
    window.addEventListener('refreshProduk', handleRefreshProduk);
    return () => {
      window.removeEventListener('refreshProduk', handleRefreshProduk);
    };
  }, []);

  // Fungsi untuk logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('keranjang');
    navigate('/');
  };

  // Fungsi untuk cetak struk
  const produkDifilter = produk.filter((p) => {
    const namaCocok = p.name_product
      .toLowerCase()
      .includes(kataKunci.toLowerCase());
    const kategoriCocok =
      kategoriTerpilih === 'Semua' || p.name_category === kategoriTerpilih;
    return namaCocok && kategoriCocok;
  });

  if (loading && produk.length === 0) {
    return <div className="loading">Memuat...</div>;
  }

  // Render halaman dashboard dengan header, daftar produk, dan footer
  return (
    <div className="dashboard-container">
      <HeaderDashboard
        user={user}
        onLogout={handleLogout}
        onBukaKeranjang={() => setKeranjangBuka(true)}
      />
      <main className="dashboard-content">
        {/* SEARCH & CATEGORY BUTTONS (PINK THEME) */}
        <div className="search-category-section">
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Cari produk impianmu..."
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              className="search-input-m3"
            />
          </div>

          <div className="category-list-m3">
            <button
              className={`category-item-btn ${kategoriTerpilih === 'Semua' ? 'active' : ''}`}
              onClick={() => setKategoriTerpilih('Semua')}
            >
              Semua
            </button>
            {daftarKategori.map((cat, index) => (
              <button
                key={index}
                className={`category-item-btn ${kategoriTerpilih === cat ? 'active' : ''}`}
                onClick={() => setKategoriTerpilih(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <h2>New Arrivals</h2>
        <div className="products-grid">
          {produkDifilter.length > 0 ? (
            produkDifilter.map((p) => (
              <ProductCard
                key={p.id_product}
                id_product={p.id_product}
                name_product={p.name_product}
                price={p.price}
                stock={p.stock}
                size={p.size}
                image={p.image}
                description={p.description}
              />
            ))
          ) : (
            /* --- JIKA PRODUK KOSONG --- */
            <div className="empty-state">
              <p>Produk "{kategoriTerpilih}" sedang kosong.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <SidebarKeranjang
        buka={keranjangBuka}
        tutup={() => setKeranjangBuka(false)}
      />
    </div>
  );
}

export default Dashboard;
