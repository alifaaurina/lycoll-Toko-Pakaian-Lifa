import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeaderDashboard from '../components/HeaderDashboard';
import SidebarKeranjang from '../components/SidebarKeranjang';
import Footer from '../components/Footer';
import './Dashboard.css';

function Dashboard() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keranjangBuka, setKeranjangBuka] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const fetchProduk = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/products');
      const data = await response.json();
      setProduk(data);
      console.log('Produk di-refresh:', data.length);
    } catch (error) {
      console.error('Gagal ambil data:', error);
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
  }, [navigate]);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk, refreshKey]);

  useEffect(() => {
    const handleRefreshProduk = () => {
      console.log('Event refreshProduk diterima!');
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener('refreshProduk', handleRefreshProduk);

    return () => {
      window.removeEventListener('refreshProduk', handleRefreshProduk);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('keranjang'); // Kosongkan keranjang saat logout
    navigate('/');
  };

  if (loading && produk.length === 0) {
    return <div className="loading">Memuat...</div>;
  }

  return (
    <div className="dashboard-container">
      <HeaderDashboard
        user={user}
        onLogout={handleLogout}
        onBukaKeranjang={() => setKeranjangBuka(true)}
      />

      <main className="dashboard-content">
        <h2>New Arrivals</h2>
        <div className="products-grid">
          {produk.map((p) => (
            <ProductCard
              key={p.id_product}
              id_product={p.id_product}
              name_product={p.name_product}
              price={p.price}
              stock={p.stock}
              size={p.size}
              image={p.image}
            />
          ))}
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
