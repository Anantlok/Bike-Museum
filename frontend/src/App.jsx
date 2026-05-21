import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// ── CORE SUBBOARD ROUTING ARCHIVE IMPORTS ──────────────────────────────────
import Archive from './pages/Archive';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';

// ⚡️ FIXED: ADDED THE MISSING IMPORT SO VITE CAN PROCESS THE DECK PLATFORM
import OpenPacksPage from './pages/OpenPacksPage';

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [activeTab, setActiveTab]         = useState('marketplace');
  const [bikes, setBikes]                 = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [minBhp, setMinBhp]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [errorMessage, setErrorMessage]   = useState('');

  const [openedBike, setOpenedBike]   = useState(null);
  const [openingPack, setOpeningPack] = useState(false);
  const [gachaError, setGachaError]   = useState('');

  const [token, setToken]     = useState(localStorage.getItem('userToken') || '');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // ── WebGL fluid ink background ──────────────────────────────────────────
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;

    const SCALE = 0.5;
    const resize = () => {
      canvas.width  = Math.floor(window.innerWidth  * SCALE);
      canvas.height = Math.floor(window.innerHeight * SCALE);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const VS = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const FS = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2  u_res;

      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = dot(hash2(i + vec2(0,0)), f - vec2(0,0));
        float b = dot(hash2(i + vec2(1,0)), f - vec2(1,0));
        float c = dot(hash2(i + vec2(0,1)), f - vec2(0,1));
        float d = dot(hash2(i + vec2(1,1)), f - vec2(1,1));
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y) * 0.5 + 0.5;
      }

      float fbm(vec2 p) {
        float v = 0.0, amp = 0.55, total = 0.0;
        v += amp * noise(p); total += amp; amp *= 0.46;
        p = vec2(p.x*0.9284 - p.y*0.3714, p.x*0.3714 + p.y*0.9284) * 2.08;
        v += amp * noise(p); total += amp; amp *= 0.46;
        p = vec2(p.x*0.9284 - p.y*0.3714, p.x*0.3714 + p.y*0.9284) * 2.08;
        v += amp * noise(p); total += amp; amp *= 0.46;
        p = vec2(p.x*0.9284 - p.y*0.3714, p.x*0.3714 + p.y*0.9284) * 2.08;
        v += amp * noise(p); total += amp; amp *= 0.46;
        p = vec2(p.x*0.9284 - p.y*0.3714, p.x*0.3714 + p.y*0.9284) * 2.08;
        v += amp * noise(p); total += amp;
        return v / total;
      }

      float warpedNoise(vec2 uv, float t) {
        float s = t * 0.038;
        vec2 q = vec2(fbm(uv + vec2(0.00, 0.00) + s), fbm(uv + vec2(5.20, 1.30) + s));
        vec2 r = vec2(fbm(uv + 3.2*q + vec2(1.70, 9.20) + s*0.8), fbm(uv + 3.2*q + vec2(8.30, 2.80) + s*0.8));
        return fbm(uv + 3.8 * r + t * 0.016);
      }

      void main() {
        vec2 uv = v_uv;
        uv = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 1.05 + 0.5;

        float f = warpedNoise(uv * 2.1, u_time);
        f = pow(f, 1.45);
        f = smoothstep(0.30, 0.70, f);
        f = smoothstep(0.12, 0.88, f);

        vec2 px = uv * u_res;
        float gx = fract(sin(dot(px + fract(u_time * 9.3),  vec2(12.9898, 78.233))) * 43758.5453);
        float gy = fract(sin(dot(px + fract(u_time * 7.7) + 31.4, vec2(93.9898, 67.345))) * 24751.1234);
        float g  = mix(gx, gy, 0.45);
        float midBoost = 1.0 + 0.6 * (1.0 - abs(f * 2.0 - 1.0));
        f += (g - 0.5) * 0.055 * midBoost;
        f  = clamp(f, 0.0, 0.95);

        f = 1.0 - f;
        gl_FragColor = vec4(vec3(f), 1.0);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes  = gl.getUniformLocation(prog, 'u_res');

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const FRAME_MS = isMobile ? 1000 / 30 : 1000 / 60;
    const start = performance.now();
    let raf, lastFrame = 0, paused = false;

    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (paused || now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      const t = (now - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(draw);

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteProgram(prog);
    };
  }, []);

  // ── Marketplace data fetching ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'marketplace') return;
    setLoading(true);
    setErrorMessage('');

    const params = [];
    if (selectedBrand)  params.push(`brand=${encodeURIComponent(selectedBrand)}`);
    if (selectedRarity) params.push(`rarity=${encodeURIComponent(selectedRarity)}`);
    if (minBhp)         params.push(`min_bhp=${encodeURIComponent(minBhp)}`);

    const url = 'https://bike-museum-production.up.railway.app/api/marketplace/' + (params.length ? `?${params.join('&')}` : '');

    axios.get(url)
      .then(res  => { setBikes(res.data); setLoading(false); })
      .catch(err => {
        console.error(err);
        setErrorMessage('Failed to fetch data from Django backend. Ensure your Python server is running.');
        setLoading(false);
      });
  }, [selectedBrand, selectedRarity, minBhp, activeTab]);

  // ── Gacha pack opener ───────────────────────────────────────────────────
  const handleOpenPack = () => {
    setOpeningPack(true);
    setGachaError('');
    setOpenedBike(null);
    const config = { headers: { Authorization: `Token ${token}` } };
    axios.post('https://bike-museum-production.up.railway.app/api/open-pack/', {}, config)
      .then(res  => { setOpenedBike(res.data); setOpeningPack(false); })
      .catch(err => {
        setGachaError(err.response?.data?.error || 'Token verification failed or tokens exhausted.');
        setOpeningPack(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setToken('');
    setActiveTab('marketplace');
    setIsNavOpen(false);
  };

  return (
    <Router>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&family=Funnel+Display:wght@300..800&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        @font-face {
          font-family: 'MyCustomHeader';
          src: url('./src/fonts/ngetic.italic.otf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --glass-bg: rgba(255,255,255,0.45);
          --glass-bg-hover: rgba(255,255,255,0.58);
          --glass-border: rgba(0,0,0,0.10);
          --glass-border-strong: rgba(0,0,0,0.14);
          --glass-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset;
          --glass-shadow-lg: 0 20px 60px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.9) inset;
          --radius: 20px;
          --radius-sm: 12px;
          --radius-xs: 8px;
          --text-primary: rgba(0,0,0,0.88);
          --text-secondary: rgba(0,0,0,0.52);
          --text-tertiary: rgba(0,0,0,0.32);
          --accent-blue: #1a6fff;
          --accent-purple: #7c3aed;
          --accent-amber: #b45309;
          --font-display: 'MyCustomHeader', 'DM Serif Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --font-card-model: 'Cabin', sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
        }

        body {
          font-family: var(--font-body);
          background: #f5f5f5;
          min-height: 100vh;
          overflow-x: hidden;
          color: var(--text-primary);
        }

        /* Grain overlay */
        #root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E");
          background-size: 120px 120px;
          z-index: 20;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        #root::before { display: none; }
        #root { position: relative; z-index: 1; }

        #gradient-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          image-rendering: auto;
        }

        .glass {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          box-shadow: var(--glass-shadow);
        }
        .glass-strong {
          background: rgba(255,255,255,0.55);
          border: 1px solid var(--glass-border-strong);
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);
          box-shadow: var(--glass-shadow-lg);
        }

        /* ── Sticky frosted navbar ── */
        .frosted-header-container {
          position: sticky;
          top: 0;
          width: 100%;
          z-index: 100;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(28px) saturate(1.7);
          -webkit-backdrop-filter: blur(28px) saturate(1.7);
          border-bottom: 1px solid rgba(0,0,0,0.10);
          box-shadow: 0 4px 30px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.8) inset;
        }

        .header-inner-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 8px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          min-height: 56px;
        }

        /* ── Brand / home link ── */
        .header-brand {
          display: flex;
          align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 12px;
          margin: -6px -10px;
          transition:
            background  0.22s ease,
            box-shadow  0.22s ease,
            transform   0.22s cubic-bezier(0.34,1.1,0.64,1);
        }
        .header-brand:hover {
          background: rgba(0,0,0,0.04);
          box-shadow: 0 2px 14px rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }
        .header-brand:active {
          transform: translateY(0px) scale(0.98);
          transition-duration: 0.10s;
        }

        .header-title {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 2.5vw, 1.9rem);
          font-weight: 550;
          line-height: 1.4;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #111 40%, rgba(0,0,0,0.55) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: opacity 0.18s ease;
        }
        .header-brand:hover .header-title { opacity: 0.80; }

        .header-side-tagline {
          font-family: var(--font-card-model);
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 400;
          opacity: 0.8;
        }

        /* ── Nav links ── */
        .tab-switcher {
          display: flex;
          gap: 4px;
          padding: 4px;
          border-radius: 14px;
        }

        .nav-link-btn {
          padding: 8px 18px;
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          color: var(--text-secondary);
          transition: all 0.22s cubic-bezier(0.34, 1.1, 0.64, 1);
          letter-spacing: 0.01em;
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .nav-link-btn:hover { color: var(--text-primary); background: rgba(0,0,0,0.06); }
        .nav-link-btn.active {
          background: rgba(26,111,255,0.12);
          border: 1px solid rgba(26,111,255,0.28);
          color: #1a4fff;
          box-shadow: 0 2px 16px rgba(26,111,255,0.10);
        }

        /* ── Mobile hamburger ── */
        .mobile-nav-toggle {
          display: none;
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border-strong);
          border-radius: 12px;
          padding: 8px 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-primary);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
          outline: none;
          flex-shrink: 0;
        }
        .mobile-nav-toggle:hover { background: rgba(255,255,255,0.65); }

        .app-wrapper {
          position: relative;
          z-index: 3;
          min-height: calc(100vh - 56px);
          padding-top: 0;
        }

        .error-banner {
          background: rgba(200,30,30,0.08);
          border: 1px solid rgba(200,30,30,0.18);
          color: rgba(160,20,20,0.9);
          padding: 14px 18px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          backdrop-filter: blur(12px);
          letter-spacing: 0.01em;
        }

        .loading-pulse { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

        .state-box {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-tertiary);
          letter-spacing: 0.04em;
        }

        /* ── Gacha panel ── */
        .gacha-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 420px;
          margin: 0 auto;
          padding: 48px 36px;
          border-radius: 28px;
          text-align: center;
          animation: fadeUp 0.3s cubic-bezier(0.34,1.1,0.64,1);
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .gacha-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .gacha-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 36px;
          font-weight: 300;
          line-height: 1.6;
        }
        .gacha-card-stage {
          width: 260px; height: 340px;
          border-radius: 22px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.45);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
        .gacha-idle-icon { display:flex; flex-direction:column; align-items:center; gap:16px; }
        .gacha-pack-visual {
          width:100px; height:130px; border-radius:16px;
          background: linear-gradient(145deg, rgba(124,58,237,0.15), rgba(26,111,255,0.12));
          border: 1px solid rgba(124,58,237,0.2);
          display:flex; align-items:center; justify-content:center;
          font-size:44px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.10);
        }
        .gacha-pack-visual.bouncing { animation: bounce 0.7s ease infinite alternate; }
        @keyframes bounce { from{transform:translateY(0) scale(1)} to{transform:translateY(-8px) scale(1.04)} }
        .gacha-pack-label {
          font-size:10px; letter-spacing:0.2em; text-transform:uppercase;
          color:var(--text-tertiary); font-weight:700;
        }
        .gacha-result-appear { animation: scaleUp 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes scaleUp { from{transform:scale(0.75);opacity:0} to{transform:scale(1);opacity:1} }
        .gacha-error {
          background: rgba(200,30,30,0.07); border: 1px solid rgba(200,30,30,0.16);
          color: rgba(160,20,20,0.9); padding:12px 16px; border-radius:var(--radius-xs);
          font-size:12px; font-weight:600; margin-bottom:20px; width:100%;
        }

        .cta-btn {
          width:100%; padding:15px 24px; border-radius:14px;
          font-family:var(--font-body); font-size:14px; font-weight:700;
          letter-spacing:0.02em; cursor:pointer; border:none;
          transition: all 0.22s cubic-bezier(0.34,1.1,0.64,1);
          position:relative; overflow:hidden;
        }
        .cta-btn::before {
          content:''; position:absolute; inset:0;
          background:rgba(0,0,0,0.06); opacity:0; transition:opacity 0.18s;
        }
        .cta-btn:hover::before { opacity:1; }
        .cta-btn-gacha {
          background: linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(26,111,255,0.16) 100%);
          border: 1px solid rgba(124,58,237,0.25);
          color: #4c1d95;
          box-shadow: 0 4px 24px rgba(124,58,237,0.10), 0 1px 0 rgba(255,255,255,0.8) inset;
        }
        .cta-btn:disabled { opacity:0.35; cursor:not-allowed; }

        /* ── Responsive ── */
        @media (max-width: 789px) {
          .mobile-nav-toggle { display: block; }
          .header-side-tagline { display: none; }

          .tab-switcher {
            display: none;
            position: absolute;
            top: 100%;
            right: 20px;
            width: 220px;
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 14px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.12);
            padding: 10px;
            flex-direction: column;
            gap: 6px;
            z-index: 99;
            animation: dropdownSlide 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
          }
          .tab-switcher.mobile-dropdown-open { display: flex; }
          .nav-link-btn { width:100%; text-align:left; padding:10px 14px; border-radius:8px; }
          .gacha-panel { padding: 28px 20px; }
          .gacha-title { font-size: 1.8rem; }
          .gacha-card-stage { width: 100%; }
        }

        @keyframes dropdownSlide {
          from { opacity:0; transform:scale(0.95) translateY(-8px); }
          to   { opacity:1; transform:scale(1)    translateY(0);     }
        }

        @media (max-width: 400px) {
          .gacha-card-stage { height: 300px; }
        }
      `}</style>

      <canvas ref={canvasRef} id="gradient-canvas" />

      {/* ── Navbar ── */}
      <nav className="frosted-header-container">
        <div className="header-inner-content">

          {/* Brand → home link */}
          <Link
            to="/"
            className="header-brand"
            onClick={() => setIsNavOpen(false)}
          >
            <h1 className="header-title">Indian Bike Museum</h1>
            <p className="header-side-tagline">— Explore, filter &amp; roll randomized vehicle drops.</p>
          </Link>

          <button className="mobile-nav-toggle" onClick={() => setIsNavOpen(v => !v)}>
            {isNavOpen ? '✕ Close' : 'Index ☰'}
          </button>

          <div className={`tab-switcher glass ${isNavOpen ? 'mobile-dropdown-open' : ''}`}>
            <Link
              to="/Archive"
              onClick={() => { setActiveTab('marketplace'); setIsNavOpen(false); }}
              className={`nav-link-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
            >
              Marketplace
            </Link>
            
            <Link
              to="/open-packs"
              onClick={() => { setActiveTab('gacha'); setIsNavOpen(false); }}
              className={`nav-link-btn ${activeTab === 'gacha' ? 'active' : ''}`}
            >
              Open Packs
            </Link>
            
            <Link to="/profile" onClick={() => setIsNavOpen(false)} className="nav-link-btn">
              My Profile
            </Link>
            {!token && (
              <Link to="/login" onClick={() => setIsNavOpen(false)} className="nav-link-btn">
                Login
              </Link>
            )}
            {token && (
              <button onClick={handleLogout} className="nav-link-btn">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Routes ── */}
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/archive"
            element={
              <Archive
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                bikes={bikes}
                loading={loading}
                errorMessage={errorMessage}
                selectedBrand={selectedBrand}     setSelectedBrand={setSelectedBrand}
                selectedRarity={selectedRarity}   setSelectedRarity={setSelectedRarity}
                minBhp={minBhp}                   setMinBhp={setMinBhp}
              />
            }
          />
          
          <Route
            path="/open-packs"
            element = {
              <ProtectedRoute token={token}>
                <OpenPacksPage 
                  token={token} 
                  openedBike={openedBike}
                  setOpenedBike={setOpenedBike}
                  openingPack={openingPack}
                  setOpeningPack={setOpeningPack}
                  gachaError={gachaError}
                  setGachaError={setGachaError}
                  handleOpenPack={handleOpenPack}
                />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute token={token}>
                <Profile token={token} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="/login"  element={<Login  setToken={setToken} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}