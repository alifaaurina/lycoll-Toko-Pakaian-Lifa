import React, { useEffect, useState } from 'react';
import './UsersAdmin.css';

// Halaman ini hanya untuk admin, jadi tidak perlu dicek role lagi karena sudah dicek di routing
function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Kasir',
  });


  const token = localStorage.getItem('token');

  // AMBIL DATA USERS
  const fetchUsers = async () => {
    try {
      const res = await fetch('https://lycoll-backend.onrender.com/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        console.log('Gagal ambil users', data);
      }
    } catch (err) {
      console.log('Server error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // TAMBAH USER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://lycoll-backend.onrender.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert('User berhasil dibuat');

        setForm({
          username: '',
          email: '',
          password: '',
          role: 'Kasir',
        });

        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Server error');
    }
  };

  // DISABLE USER
  const disableUser = async (id) => {
    if (!window.confirm('Nonaktifkan user ini?')) return;

    try {
      const res = await fetch(
        `https://lycoll-backend.onrender.com/users/${id}/disable`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.message); // tampilkan pesan error dari backend
      }
    } catch (err) {
      alert('Server error');
    }
  };

  // ENABLE USER
  const enableUser = async (id) => {
    try {
      const res = await fetch(
        `https://lycoll-backend.onrender.com/users/${id}/enable`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div className="users-admin-container">
      <h1 className="users-title">👥 Manajemen Users</h1>

      {/* FORM TAMBAH USER */}

      <form className="form-user" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          required
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="Kasir">Kasir</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" className="btn-add">
          + Tambah User
        </button>
      </form>

      {/* TABEL USERS */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id_user}>
                <td>{user.id_user}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>

                <td>
                  <span className={`role ${user.role}`}>{user.role}</span>
                </td>

                <td>
                  {user.is_active ? (
                    <span className="status aktif">Aktif</span>
                  ) : (
                    <span className="status nonaktif">Nonaktif</span>
                  )}
                </td>

                <td>
                  {user.is_active ? (
                    <button
                      className="btn-disable"
                      onClick={() => disableUser(user.id_user)}
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      className="btn-enable"
                      onClick={() => enableUser(user.id_user)}
                    >
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersAdmin;
