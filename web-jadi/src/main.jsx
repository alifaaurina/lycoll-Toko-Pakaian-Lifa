import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { KeranjangProvider } from './context/KeranjangContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <KeranjangProvider>
        <App />
      </KeranjangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
