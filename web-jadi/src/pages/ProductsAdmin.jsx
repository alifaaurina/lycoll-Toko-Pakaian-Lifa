import React, { useEffect, useState } from 'react';
import './ProductsAdmin.css';

// Halaman untuk admin mengelola produk
function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  // State untuk form produk
  const [form, setForm] = useState({
    id_category: '',
    name_product: '',
    price: '',
    stock: '',
    size: '',
    image: '',
  });

  const token = localStorage.getItem('token');

  // 🔹 Fetch Products
  const fetchProducts = async () => {
    const res = await fetch('http://localhost:5000/products');
    const data = await res.json();
    setProducts(data);
  };

  // 🔹 Fetch Categories
  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form dan edit state
  const resetForm = () => {
    setForm({
      id_category: '',
      name_product: '',
      price: '',
      stock: '',
      size: '',
      image: '',
    });
    setEditId(null);
  };

  // Handle submit untuk tambah atau update produk
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://localhost:5000/products/${editId}`
      : 'http://localhost:5000/products';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      fetchProducts();
      resetForm();
    } else {
      alert(data.message || 'Gagal menyimpan produk');
    }
  };

  // Handle edit produk
  const handleEdit = (product) => {
    setForm({
      id_category: product.id_category || '',
      name_product: product.name_product || '',
      price: product.price || '',
      stock: product.stock || '',
      size: product.size || '',
      image: product.image || '',
    });
    setEditId(product.id_product);
  };

  // Handle delete produk
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk?')) return;

    const res = await fetch(`http://localhost:5000/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      fetchProducts();
    } else {
      alert(data.message || 'Gagal menghapus produk');
    }
  };

  // Statistik produk
  const totalProduk = products.length;
  const totalStok = products.reduce((acc, p) => acc + Number(p.stock), 0);
  const stokHabis = products.filter((p) => Number(p.stock) === 0).length;
  const totalInventory = products.reduce(
    (acc, p) => acc + Number(p.price) * Number(p.stock),
    0
  );

  // Format angka ke Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(angka);
  };
  const filteredProducts = products.filter((p) =>
    p.name_product.toLowerCase().includes(search.toLowerCase())
  );

  // Render halaman
  return (
    <div className="products-container">
      <h2 className="products-title">Kelola Produk</h2>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Produk</h4>
          <p>{totalProduk}</p>
        </div>

        <div className="stat-card">
          <h4>Total Stok</h4>
          <p>{totalStok}</p>
        </div>

        <div className="stat-card warning">
          <h4>Stok Habis</h4>
          <p>{stokHabis}</p>
        </div>

        <div className="stat-card success">
          <h4>Total Inventory</h4>
          <p>{formatRupiah(totalInventory)}</p>
        </div>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <form onSubmit={handleSubmit} className="products-form">
        <select
          name="id_category"
          value={form.id_category}
          onChange={handleChange}
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id_category} value={cat.id_category}>
              {cat.name_category}
            </option>
          ))}
        </select>

        <input
          name="name_product"
          placeholder="Nama Produk"
          value={form.name_product}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Harga"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="stock"
          placeholder="Stok"
          value={form.stock}
          onChange={handleChange}
          required
        />

        <input
          name="size"
          placeholder="Size"
          value={form.size}
          onChange={handleChange}
        />

        <input
          name="image"
          placeholder="URL Gambar"
          value={form.image}
          onChange={handleChange}
        />

        <button type="submit" className="btn-primary">
          {editId ? 'Update Produk' : 'Tambah Produk'}
        </button>

        {editId && (
          <button type="button" onClick={resetForm} className="btn-secondary">
            Batal
          </button>
        )}
      </form>

      <table className="products-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Size</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id_product}>
              <td>{p.name_product}</td>
              <td>{p.name_category}</td>
              <td>Rp {p.price}</td>
              <td>{p.stock}</td>
              <td>{p.size}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(p.id_product)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsAdmin;
