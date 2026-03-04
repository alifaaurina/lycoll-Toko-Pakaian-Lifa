import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsAdmin from './pages/ProductsAdmin';
import TransactionsAdmin from './pages/TransactionsAdmin';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/products"
        element={
          <AdminRoute>
            <ProductsAdmin />
          </AdminRoute>
        }
      />

      <Route
        path="/dashboard/transactions"
        element={
          <AdminRoute>
            <TransactionsAdmin />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
