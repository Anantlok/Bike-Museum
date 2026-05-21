import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
 
// ── Icon imports ────────────────────────────────────────────────────────────
import bikeIcon      from '../icons/icons8-bike-48.png';
import boxIcon       from '../icons/icons8-box-128.png';
import diamondIcon   from '../icons/icons8-diamond-96.png';
import heartIcon     from '../icons/icons8-heart-100.png';
import horseIcon     from '../icons/icons8-horse-100.png';
 
const RARITY_COLOR = { 1:'#8A9BB0', 2:'#4A9EFF', 3:'#BF7FFF', 4:'#FFB340' };
const RARITY_LABEL = { 1:'Common',  2:'Rare',    3:'Epic',    4:'Legendary' };
const RARITY_BG    = {
  1:'rgba(138,155,176,0.10)',
  2:'rgba(74,158,255,0.10)',
  3:'rgba(191,127,255,0.10)',
  4:'rgba(255,179,64,0.10)',
};
 
/* Tiny helper – renders one of our icons at a given size */
function Icon({ src, size = 22, style = {}, alt = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0, ...style }}
    />
  );
}
 
export default function Profile({ token, handleLogout }) {
  const [profileData, setProfileData] = useState(null);
  const [ownedBikes,  setOwnedBikes]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const navigate = useNavigate();
 
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const headers = { Authorization: `Token ${token}` };
    Promise.all([
      axios.get('https://bike-museum-production.up.railway.app/api/user/profile/',  { headers }),
      axios.get('bike-museum-production.up.railway.app/api/my-inventory/',  { headers })
        .catch(() => ({ data: [] })),
    ])
    .then(([profileRes, collectionRes]) => {
      setProfileData(profileRes.data);
      const normalized = (collectionRes.data || []).map(item => item.bike ? item.bike : item);
      setOwnedBikes(normalized);
      setLoading(false);
    })
    .catch(err => {
      setError('Failed to load your profile.');
      setLoading(false);
      if (err.response?.status === 401) handleLogout();
    });
  }, [token, navigate, handleLogout]);
 
  if (loading) return (
    <div className="profile-page">
      <div className="state-box glass" style={{ minHeight: 200 }}>
        <span className="loading-pulse" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          Loading garage…
        </span>
      </div>
    </div>
  );
 
  if (error) return (
    <div className="profile-page">
      <div className="error-banner" style={{ textAlign: 'center' }}>{error}</div>
    </div>
  );
 
  const d = profileData || { username: 'Collector', email: '', tokens_count: 0, unlocked_count: 0, rank: '—' };
 
  const rarityDist = ownedBikes.reduce((acc, b) => {
    acc[b.rarity] = (acc[b.rarity] || 0) + 1; return acc;
  }, {});
 
  const topRarity = ownedBikes.length > 0
    ? ownedBikes.reduce((best, b) => b.rarity > best.rarity ? b : best, ownedBikes[0])
    : null;
 
  const milestones = [
    {
      icon: horseIcon,
      title: 'Museum Entry',
      desc: 'Registered a certified collector account in the archives.',
      unlocked: true,
    },
    {
      icon: boxIcon,
      title: 'First Drop',
      desc: 'Opened your first pack and claimed a vehicle.',
      unlocked: (d.unlocked_count ?? 0) >= 1 || ownedBikes.length >= 1,
    },
    {
      icon: bikeIcon,
      title: 'BHP Enthusiast',
      desc: 'Own a vehicle with 30+ BHP.',
      unlocked: ownedBikes.some(b => b.power >= 30),
    },
    {
      icon: heartIcon,
      title: 'Epic Collector',
      desc: 'Own at least one Epic rarity bike.',
      unlocked: ownedBikes.some(b => b.rarity >= 3),
    },
    {
      icon: diamondIcon,
      title: 'Legendary Vault',
      desc: 'Own a Legendary rarity vehicle.',
      unlocked: ownedBikes.some(b => b.rarity === 4),
    },
  ];
 
  return (
    <>
      <style>{`
        .profile-page {
          position: relative;
          z-index: 3;
          max-width: 1100px;
          margin: 0 auto;
          padding: 36px 28px 60px;
          animation: pFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes pFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .profile-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .profile-header-left p {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }
        .profile-signout {
          padding: 9px 20px;
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid rgba(239,68,68,0.18);
          background: rgba(239,68,68,0.07);
          color: #ef4444;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .profile-signout:hover { background: rgba(239,68,68,0.13); transform: translateY(-1px); }
 
        /* ── Bento grid ── */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: auto;
          gap: 14px;
        }
        .bento-tile {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.82);
          backdrop-filter: blur(28px) saturate(1.7);
          -webkit-backdrop-filter: blur(28px) saturate(1.7);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
          border-radius: 22px;
          padding: 24px;
          transition: box-shadow 0.22s ease, transform 0.22s cubic-bezier(0.34,1.1,0.64,1);
          overflow: hidden;
          position: relative;
        }
        .bento-tile:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.11), 0 1px 0 rgba(255,255,255,0.95) inset;
          transform: translateY(-2px);
        }
        .bento-tile::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 38%;
          background: linear-gradient(180deg, rgba(255,255,255,0.46) 0%, transparent 100%);
          border-radius: 22px 22px 0 0;
          pointer-events: none;
        }
 
        /* tile icon watermark – large faded icon in corner */
        .tile-watermark {
          position: absolute;
          bottom: -8px;
          right: -4px;
          opacity: 0.055;
          pointer-events: none;
          filter: grayscale(1);
          z-index: 0;
        }
 
        .tile-identity   { grid-column: span 8; }
        .tile-tokens     { grid-column: span 4; }
        .tile-bikes      { grid-column: span 4; }
        .tile-rank       { grid-column: span 4; }
        .tile-top-rarity { grid-column: span 4; }
        .tile-rarity-dist{ grid-column: span 5; }
        .tile-milestones { grid-column: span 7; }
        .tile-garage     { grid-column: span 12; }
 
        @media (max-width: 900px) {
          .tile-identity   { grid-column: span 12; }
          .tile-tokens     { grid-column: span 6; }
          .tile-bikes      { grid-column: span 6; }
          .tile-rank       { grid-column: span 6; }
          .tile-top-rarity { grid-column: span 6; }
          .tile-rarity-dist{ grid-column: span 12; }
          .tile-milestones { grid-column: span 12; }
          .tile-garage     { grid-column: span 12; }
        }
        @media (max-width: 560px) {
          .tile-tokens  { grid-column: span 12; }
          .tile-bikes   { grid-column: span 12; }
          .tile-rank    { grid-column: span 12; }
          .tile-top-rarity { grid-column: span 12; }
          .profile-page { padding: 20px 16px 60px; }
        }
 
        .tile-label {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
 
        /* ── Identity tile ── */
        .identity-name {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.1;
          background: linear-gradient(135deg, #111 30%, rgba(0,0,0,0.45) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }
        .identity-email {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          position: relative;
          z-index: 1;
        }
        .identity-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 7px 14px;
          border-radius: 8px;
          background: rgba(26,111,255,0.08);
          border: 1px solid rgba(26,111,255,0.16);
          font-size: 11px;
          font-weight: 700;
          color: #1a6fff;
          font-family: var(--font-mono);
          letter-spacing: 0.06em;
          position: relative;
          z-index: 1;
        }
 
        /* ── Stat tiles ── */
        .stat-icon-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }
        .stat-number {
          font-family: var(--font-mono);
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 700;
          line-height: 1;
          position: relative;
          z-index: 1;
        }
        .stat-sub {
          font-size: 11px;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-weight: 500;
          position: relative;
          z-index: 1;
          margin-top: 4px;
        }
 
        /* ── Rarity dist ── */
        .rarity-bars { display: flex; flex-direction: column; gap: 9px; position: relative; z-index: 1; }
        .rarity-row  { display: flex; align-items: center; gap: 10px; }
        .rarity-row-label { font-size: 11px; font-weight: 600; font-family: var(--font-body); width: 60px; flex-shrink: 0; }
        .rarity-bar-track { flex: 1; height: 6px; border-radius: 3px; background: rgba(0,0,0,0.06); overflow: hidden; }
        .rarity-bar-fill  { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.22,1,0.36,1); }
        .rarity-row-count { font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--text-tertiary); width: 20px; text-align: right; flex-shrink: 0; }
 
        /* ── Top rarity ── */
        .top-rarity-content { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; position: relative; z-index: 1; }
        .top-rarity-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 12px; font-weight: 700; font-family: var(--font-mono);
          letter-spacing: 0.06em; margin-top: 6px;
        }
        .top-rarity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .top-rarity-name {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 2.2vw, 1.8rem);
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .top-rarity-model { font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); letter-spacing: 0.04em; }
 
        /* ── Milestones ── */
        .milestone-list { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
        .milestone-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px; border-radius: 14px;
          background: rgba(255,255,255,0.40);
          border: 1px solid rgba(0,0,0,0.05);
          transition: background 0.18s ease;
        }
        .milestone-item:hover { background: rgba(255,255,255,0.62); }
        .milestone-item.locked { opacity: 0.46; }
 
        /* icon wrapper – gives unlocked icons a tinted bg pill */
        .milestone-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .milestone-item:not(.locked) .milestone-icon-wrap {
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
        }
        .milestone-item.locked .milestone-icon-wrap {
          background: transparent;
          filter: grayscale(1);
          opacity: 0.6;
        }
 
        .milestone-text { flex: 1; }
        .milestone-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .milestone-desc  { font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
        .milestone-status { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; flex-shrink: 0; }
 
        /* ── Garage grid ── */
        .garage-tile-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px; position: relative; z-index: 1;
        }
        .garage-count-badge {
          font-family: var(--font-mono); font-size: 10px; font-weight: 700;
          padding: 3px 10px; border-radius: 6px;
          background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.07);
          color: var(--text-secondary); letter-spacing: 0.06em;
        }
        .garage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px; margin-top: 16px; position: relative; z-index: 1;
        }
        .garage-bike-card {
          background: rgba(255,255,255,0.58);
          border: 1px solid rgba(255,255,255,0.80);
          border-radius: 16px; padding: 16px;
          transition: transform 0.22s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.22s ease;
          cursor: default; position: relative; overflow: hidden;
        }
        .garage-bike-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 35%;
          background: linear-gradient(180deg, rgba(255,255,255,0.48) 0%, transparent 100%);
          border-radius: 16px 16px 0 0; pointer-events: none;
        }
        .garage-bike-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
 
        .gc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; position: relative; z-index: 1; }
        .gc-brand  { font-family: var(--font-mono); font-size: 8px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(0,0,0,0.28); }
        .gc-rarity-pip { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; }
        .gc-model  { font-family: var(--font-card-model); font-size: 14px; font-weight: 700; color: rgba(0,0,0,0.84); line-height: 1.2; margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; position: relative; z-index: 1; }
        .gc-image  { width: 100%; height: 90px; border-radius: 10px; background: rgba(255,255,255,0.88); border: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 12px; position: relative; z-index: 1; }
        .gc-image img { width: 100%; height: 100%; object-fit: contain; padding: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08)); }
        .gc-image-fallback { font-family: var(--font-mono); font-size: 11px; color: #c0c8d4; font-weight: 700; }
        .gc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.055); position: relative; z-index: 1; }
        .gc-stat   { font-size: 12px; font-weight: 700; color: rgba(0,0,0,0.72); font-family: var(--font-body); }
        .gc-stat-label { font-size: 8px; font-family: var(--font-mono); color: rgba(0,0,0,0.26); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
        .gc-rarity-badge { font-size: 11px; font-weight: 700; font-family: var(--font-body); }
 
        .garage-empty {
          grid-column: 1 / -1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 24px; gap: 12px; text-align: center;
        }
        .garage-empty-icon-wrap { opacity: 0.35; filter: grayscale(0.3); }
        .garage-empty-title { font-family: var(--font-card-model); font-size: 15px; font-weight: 600; color: var(--text-secondary); }
        .garage-empty-sub { font-size: 12px; color: var(--text-tertiary); max-width: 280px; line-height: 1.6; }
        .garage-empty-cta {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 8px; padding: 10px 22px; border-radius: 12px;
          background: rgba(0,0,0,0.80); color: #fff;
          font-size: 13px; font-weight: 700; text-decoration: none;
          transition: all 0.2s ease;
        }
        .garage-empty-cta:hover { background: rgba(0,0,0,0.92); transform: translateY(-1px); }
      `}</style>
 
      <div className="profile-page">
 
        {/* ── Page header ── */}
        <div className="profile-header">
          <div className="profile-header-left">
            <p>Collector · Indian Bike Museum</p>
          </div>
          <button className="profile-signout" onClick={handleLogout}>Sign Out</button>
        </div>
 
        <div className="bento-grid">
 
          {/* ── Identity ── */}
          <div className="bento-tile tile-identity">
            <img src={horseIcon} className="tile-watermark" width={120} height={120} alt="" />
            <div className="tile-label">Identity</div>
            <div className="identity-name">{d.username}</div>
            <div className="identity-email">{d.email || 'authenticated_user'}</div>
            <div className="identity-badge">
              <Icon src={bikeIcon} size={14} />
              Certified Collector
            </div>
          </div>
 
          {/* ── Tokens ── */}
          <div className="bento-tile tile-tokens">
            <img src={diamondIcon} className="tile-watermark" width={90} height={90} alt="" />
            <div className="tile-label">Drop Tokens</div>
            <div className="stat-icon-row">
              <Icon src={diamondIcon} size={28} style={{ filter: 'hue-rotate(260deg) saturate(1.4)' }} />
              <div className="stat-number" style={{ color: 'var(--accent-purple)' }}>{d.tokens_count ?? 0}</div>
            </div>
            <div className="stat-sub">Available to spend</div>
          </div>
 
          {/* ── Bikes owned ── */}
          <div className="bento-tile tile-bikes">
            <img src={bikeIcon} className="tile-watermark" width={90} height={90} alt="" />
            <div className="tile-label">Garage</div>
            <div className="stat-icon-row">
              <Icon src={bikeIcon} size={28} />
              <div className="stat-number" style={{ color: 'var(--accent-blue)' }}>
                {ownedBikes.length > 0 ? ownedBikes.length : (d.unlocked_count ?? 0)}
              </div>
            </div>
            <div className="stat-sub">Bikes collected</div>
          </div>
 
          {/* ── Rank ── */}
          <div className="bento-tile tile-rank">
            <img src={horseIcon} className="tile-watermark" width={90} height={90} alt="" />
            <div className="tile-label">Global Rank</div>
            <div className="stat-icon-row">
              <Icon src={horseIcon} size={28} />
              <div className="stat-number" style={{ color: 'var(--accent-amber)' }}>#{d.rank ?? '—'}</div>
            </div>
            <div className="stat-sub">Collector standing</div>
          </div>
 
          {/* ── Top rarity ── */}
          <div className="bento-tile tile-top-rarity">
            <img src={heartIcon} className="tile-watermark" width={90} height={90} alt="" />
            <div className="tile-label">Crown Jewel</div>
            {topRarity ? (
              <div className="top-rarity-content">
                <div className="top-rarity-badge" style={{
                  background: RARITY_BG[topRarity.rarity],
                  border: `1px solid ${RARITY_COLOR[topRarity.rarity]}33`,
                }}>
                  <span className="top-rarity-dot" style={{
                    background: RARITY_COLOR[topRarity.rarity],
                    boxShadow: `0 0 6px ${RARITY_COLOR[topRarity.rarity]}88`,
                  }} />
                  <span style={{ color: RARITY_COLOR[topRarity.rarity] }}>
                    {RARITY_LABEL[topRarity.rarity]}
                  </span>
                </div>
                <div className="top-rarity-name">{topRarity.model_name}</div>
                <div className="top-rarity-model">{topRarity.brand} · {topRarity.cc}cc</div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 13, fontStyle: 'italic', marginTop: 8, position: 'relative', zIndex: 1 }}>
                Open packs to find your rarest
              </div>
            )}
          </div>
 
          {/* ── Rarity distribution ── */}
          <div className="bento-tile tile-rarity-dist">
            <div className="tile-label">Collection Breakdown</div>
            <div className="rarity-bars">
              {[4, 3, 2, 1].map(r => {
                const count    = rarityDist[r] || 0;
                const maxCount = Math.max(...Object.values(rarityDist), 1);
                return (
                  <div className="rarity-row" key={r}>
                    <span className="rarity-row-label" style={{ color: RARITY_COLOR[r] }}>{RARITY_LABEL[r]}</span>
                    <div className="rarity-bar-track">
                      <div className="rarity-bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: RARITY_COLOR[r] }} />
                    </div>
                    <span className="rarity-row-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* ── Milestones ── */}
          <div className="bento-tile tile-milestones">
            <div className="tile-label">Milestones</div>
            <div className="milestone-list">
              {milestones.map((m, i) => (
                <div key={i} className={`milestone-item ${m.unlocked ? '' : 'locked'}`}>
                  <div className="milestone-icon-wrap">
                    <Icon src={m.icon} size={22} />
                  </div>
                  <div className="milestone-text">
                    <div className="milestone-title">{m.title}</div>
                    <div className="milestone-desc">{m.desc}</div>
                  </div>
                  <span className="milestone-status" style={{ color: m.unlocked ? '#10b981' : 'var(--text-tertiary)' }}>
                    {m.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
 
          {/* ── Garage ── */}
          <div className="bento-tile tile-garage">
            <div className="garage-tile-header">
              <div className="tile-label" style={{ marginBottom: 0 }}>My Garage</div>
              {ownedBikes.length > 0 && (
                <span className="garage-count-badge">{ownedBikes.length} bikes</span>
              )}
            </div>
 
            <div className="garage-grid">
              {ownedBikes.length === 0 ? (
                <div className="garage-empty">
                  <div className="garage-empty-icon-wrap">
                    <Icon src={bikeIcon} size={52} />
                  </div>
                  <div className="garage-empty-title">Your garage is empty</div>
                  <div className="garage-empty-sub">Open packs to claim bikes and build your collection.</div>
                  <Link to="/open-packs" className="garage-empty-cta">
                    <Icon src={boxIcon} size={16} style={{ filter: 'invert(1)' }} />
                    Open Packs
                  </Link>
                </div>
              ) : (
                ownedBikes.map((bike, i) => {
                  const rc = RARITY_COLOR[bike.rarity] || '#8A9BB0';
                  const rl = RARITY_LABEL[bike.rarity] || 'Common';
                  return (
                    <div key={bike.id || i} className="garage-bike-card">
                      <div className="gc-header">
                        <span className="gc-brand">{bike.brand}</span>
                        <span className="gc-rarity-pip" style={{ background: rc, boxShadow: `0 0 5px ${rc}66` }} />
                      </div>
                      <div className="gc-model">{bike.model_name}</div>
                      <div className="gc-image">
                        {bike.image_url
                          ? <img src={bike.image_url} alt={bike.model_name} loading="lazy" />
                          : <span className="gc-image-fallback">{bike.cc}cc</span>
                        }
                      </div>
                      <div className="gc-footer">
                        <div>
                          <div className="gc-stat-label">Power</div>
                          <div className="gc-stat">{bike.power} BHP</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="gc-stat-label">Rarity</div>
                          <div className="gc-rarity-badge" style={{ color: rc }}>{rl}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
 
        </div>
      </div>
    </>
  );
}