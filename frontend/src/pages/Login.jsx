import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

//Fungsi  untuk Login
function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fungsi untuk menangani submit form login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Kirim data login ke backend
    try {
      const res = await fetch(
        'https://lycoll-backend.onrender.com/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Server tidak terhubung');
    } finally {
      setLoading(false);
    }
  };

  // Fitur untuk hide password
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Lyffa.Colections</h1>
          <p>Sistem Manajemen Toko</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁'}
              </span>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 LiffaColections</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
