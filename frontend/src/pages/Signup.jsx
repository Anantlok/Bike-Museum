import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Fires registration payload matrix to your live running Django Views backend
    axios.post('http://127.0.0.1:8000/api/auth/signup/', { username, email, password })
      .then(() => {
        // Upon a successful database write, route the new collector to sign in
        navigate('/login');
      })
      .catch(err => {
        console.error("Signup validation exception:", err);
        setError(err.response?.data?.error || "Registration criteria rejected. Please retry.");
      });
  };

  return (
    <div className="app-wrapper" style={{ maxWidth: '420px', margin: '40px auto 0', position: 'relative', zIndex: '50' }}>
      
      {/* ── FROSTED GLASS CONTEXT PANEL ── */}
      <div className="gacha-panel glass-strong" style={{ padding: '40px', alignItems: 'stretch' }}>
        
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 className="gacha-title" style={{ fontSize: '2.2rem', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Join Registry
          </h2>
          <p className="gacha-sub" style={{ marginBottom: '0' }}>
            Create a secure master record account to start unlocking custom vehicles.
          </p>
        </div>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
              Choose Collector Username
            </span>
            <input 
              type="text" 
              placeholder="Username" 
              className="brand-select" 
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }} 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
              Email Index Identity
            </span>
            <input 
              type="email" 
              placeholder="name@domain.com" 
              className="brand-select" 
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }} 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' }}>
              Account Secure Passkey
            </span>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="brand-select" 
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {error && (
            <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              ⚠️ {error}
            </p>
          )}
          
          <button type="submit" className="cta-btn cta-btn-gacha" style={{ marginTop: '12px', padding: '14px' }}>
            Register Account
          </button>
        </form>

        <p style={{ fontSize: '12px', marginTop: '28px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already signed up?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: '600', textDecoration: 'none' }}>
            Login Here
          </Link>
        </p>

      </div>
    </div>
  );
}