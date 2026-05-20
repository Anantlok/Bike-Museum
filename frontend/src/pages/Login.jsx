// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('bike-museum-production.up.railway.app/api/auth/login/', { username, password })
      .then(res => {
        const token = res.data.token;
        localStorage.setItem('userToken', token);
        setToken(token);
        navigate('/archive');
      })
      .catch(err => setError(err.response?.data?.error || "Invalid credentials."));
  };

  // ⚡️ ENSURE THIS RETURN LAYER CONTAINER USES THE APP-WRAPPER CLASS
  return (
    <div className="app-wrapper" style={{ maxWidth: '420px', margin: '40px auto 0', position: 'relative', zIndex: '50' }}>
      <div className="gacha-panel glass-strong" style={{ padding: '40px', alignItems: 'stretch' }}>
        
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 className="gacha-title" style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
            Welcome Back
          </h2>
          <p className="gacha-sub" style={{ marginBottom: '0' }}>
            Access your personal vehicle collection grid.
          </p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Username" 
            className="brand-select" 
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }} 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="brand-select" 
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="cta-btn cta-btn-gacha">Secure Login</button>
        </form>

        <p style={{ fontSize: '12px', marginTop: '28px', textAlign: 'center' }}>
          New here? <Link to="/signup" style={{ color: 'var(--accent-purple)', fontWeight: '600', textDecoration: 'none' }}>Create an Account</Link>
        </p>

      </div>
    </div>
  );
}