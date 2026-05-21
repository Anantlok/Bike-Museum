import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RARITY_COLOR = { 1:'#8A9BB0', 2:'#4A9EFF', 3:'#BF7FFF', 4:'#FFB340' };
const RARITY_LABEL = { 1:'Common',  2:'Rare',    3:'Epic',    4:'Legendary' };

/* ─────────────────────────────────────────────────────────────
   WELCOME CARD  – slot 0 in the carousel
───────────────────────────────────────────────────────────── */
function WelcomeCard({ isCenter, totalBikes }) {
  return (
    <div className={`card-inner welcome-card-inner ${isCenter ? 'is-center' : ''}`}>
      <div className="card-glare" />

      <p className="wc-eyebrow">Indian Bike Archive · Est. 2026</p>

      <h1 className="wc-title">
        Welcome<br />to the<br />Bike Museum
      </h1>

      <p className="wc-sub">
        Discover, collect &amp; roll<br />rare Indian motorcycles.
      </p>

      {isCenter && (
        <div className="wc-meta">
          <span className="wc-count">
            {totalBikes > 0 ? `${totalBikes} vehicles indexed` : 'Loading…'}
          </span>
          <div className="wc-ctas">
            <Link to="/archive" className="wc-btn wc-btn-primary">Browse Archive</Link>
            <Link to="/login"   className="wc-btn wc-btn-secondary">Sign In</Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BIKE CARD  – slots 1..n
───────────────────────────────────────────────────────────── */
function BikeCard({ bike, isCenter }) {
  if (!bike) return null;
  const rc = RARITY_COLOR[bike.rarity] || '#8A9BB0';
  const rl = RARITY_LABEL[bike.rarity] || 'Common';

  return (
    <div className={`card-inner ${isCenter ? 'is-center' : ''}`}>
      <div className="card-glare" />

      <div className="card-header">
        <span className="card-brand">{bike.brand}</span>
        <span className="card-type-tag">{bike.bike_type || 'Motorcycle'}</span>
      </div>

      <h3 className="card-model">{bike.model_name}</h3>

      <div className="card-image-box">
        {bike.image_url
          ? <img src={bike.image_url} alt={bike.model_name} loading="lazy" />
          : <span className="card-img-fallback">{bike.cc}<br /><small>cc</small></span>
        }
      </div>

      <div className="card-stats">
        <div className="card-stat">
          <span className="card-stat-label">Power</span>
          <span className="card-stat-value">{bike.power} BHP</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-label">Engine</span>
          <span className="card-stat-value">{bike.cc} cc</span>
        </div>
        <div className="card-rarity">
          <span className="rarity-dot" style={{ background: rc, boxShadow: `0 0 6px ${rc}66` }} />
          <span className="rarity-label" style={{ color: rc }}>{rl}</span>
        </div>
      </div>

      {isCenter && (
        <Link to="/archive" className="card-cta">
          View in Archive →
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CARD SHELL  – positions + animation classes
───────────────────────────────────────────────────────────── */
const POS_CLASS = {
  farleft:  'pos-farleft',
  left:     'pos-left',
  center:   'pos-center',
  right:    'pos-right',
  farright: 'pos-farright',
  hidden:   'pos-hidden',
};

/* ─────────────────────────────────────────────────────────────
   HOME
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [bikes,    setBikes]   = useState([]);
  const [current,  setCurrent] = useState(0);   // 0 = welcome card
  const [loading,  setLoading] = useState(true);

  // animation state
  const [transDir,  setTransDir]  = useState(null);   // 'left' | 'right'
  const [transPhase, setTransPhase] = useState('idle'); // 'idle' | 'out' | 'in'
  const lockRef = useRef(false);

  /* fetch bikes once */
  useEffect(() => {
    axios.get('https://bike-museum-production.up.railway.app/api/marketplace/')
      .then(res => {
        const shuffled = [...res.data].sort(() => Math.random() - 0.5);
        setBikes(shuffled.slice(0, Math.min(shuffled.length, 20)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // slots = [welcome, ...bikes]  – total = bikes.length + 1
  const slots = bikes.length > 0 ? [null, ...bikes] : [];  // null = welcome card
  const total = slots.length;
  const wrap  = useCallback((i) => ((i % total) + total) % total, [total]);

  /* ── navigate ── */
  const go = useCallback((dir) => {
    if (lockRef.current || total < 2) return;
    lockRef.current = true;
    setTransDir(dir);
    setTransPhase('out');

    // after exit animation completes, flip index and play entrance
    setTimeout(() => {
      setCurrent(prev => dir === 'right' ? wrap(prev + 1) : wrap(prev - 1));
      setTransPhase('in');
      setTimeout(() => {
        setTransPhase('idle');
        setTransDir(null);
        lockRef.current = false;
      }, 420);
    }, 260);
  }, [total, wrap]);

  /* keyboard */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  go('left');
      if (e.key === 'ArrowRight') go('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  /* touch swipe */
  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) go(dx < 0 ? 'right' : 'left');
    touchX.current = null;
  };

  /* center card exit class */
  const centerAnim =
    transPhase === 'out' ? (transDir === 'right' ? 'anim-exit-left' : 'anim-exit-right') :
    transPhase === 'in'  ? (transDir === 'right' ? 'anim-enter-right' : 'anim-enter-left') :
    '';

  /* render a slot */
  const renderSlot = (offset, posKey, clickable) => {
    if (total === 0) return null;
    const i    = wrap(current + offset);
    const item = slots[i];
    const isC  = posKey === 'center';

    return (
      <div
        key={posKey}
        className={`gallery-card ${POS_CLASS[posKey]} ${isC ? centerAnim : ''}`}
        onClick={clickable ? () => go(offset > 0 ? 'right' : 'left') : undefined}
      >
        {item === null
          ? <WelcomeCard isCenter={isC} totalBikes={bikes.length} />
          : <BikeCard    bike={item}    isCenter={isC} />
        }
      </div>
    );
  };

  const displayIdx = current === 0 ? '★' : String(current).padStart(2, '0');
  const displayTotal = total > 0 ? String(total - 1).padStart(2, '0') : '00';

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════
           HOME ROOT  – fills the viewport below the navbar,
           no scrollbar
        ═══════════════════════════════════════════════════ */
        .home-root {
          position: relative;
          z-index: 3;
          height: calc(100vh - 56px);   /* 56px = navbar height */
          max-height: calc(100vh - 56px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px 0;
          overflow: hidden;
          gap: 0;
        }

        /* ═══════════════════════════════════════════════════
           GALLERY STAGE
        ═══════════════════════════════════════════════════ */
        .gallery-stage {
          position: relative;
          width: 100%;
          max-width: 1100px;
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1600px;
          transform-style: preserve-3d;
          animation: hFadeUp 0.7s 0.05s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ═══════════════════════════════════════════════════
           CARD SHELL  (shared)
        ═══════════════════════════════════════════════════ */
        .gallery-card {
          position: absolute;
          width: 330px;
          border-radius: 28px;
          background: rgba(255,255,255,0.86);
          border: 1px solid rgba(255,255,255,0.82);
          backdrop-filter: blur(34px) saturate(1.8);
          -webkit-backdrop-filter: blur(34px) saturate(1.8);
          box-shadow:
            0 18px 56px rgba(0,0,0,0.10),
            0 1px 0  rgba(255,255,255,0.94) inset;
          overflow: hidden;

          /* smooth positional transitions */
          transition:
            transform  0.52s cubic-bezier(0.25, 1, 0.5, 1),
            opacity    0.52s cubic-bezier(0.25, 1, 0.5, 1),
            filter     0.52s cubic-bezier(0.25, 1, 0.5, 1),
            box-shadow 0.52s cubic-bezier(0.25, 1, 0.5, 1),
            width      0.52s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform, opacity, filter;
        }

        /* ─── CENTER ─── */
        .gallery-card.pos-center {
          transform: translateX(0px) translateZ(0px) scale(1) rotateY(0deg);
          opacity: 1;
          filter: blur(0px) brightness(1);
          z-index: 10;
          width: 356px;
          box-shadow:
            0 40px 96px rgba(0,0,0,0.17),
            0 1px 0 rgba(255,255,255,0.98) inset;
          cursor: default;
        }

        /* Welcome card in center gets extra width */
        .gallery-card.pos-center:has(.welcome-card-inner) {
          width: 420px;
        }

        /* ─── LEFT ─── */
        .gallery-card.pos-left {
          transform: translateX(-336px) translateZ(-60px) scale(0.87) rotateY(13deg);
          opacity: 0.60;
          filter: blur(0.8px) brightness(0.96);
          z-index: 5;
          cursor: pointer;
        }
        .gallery-card.pos-left:hover {
          opacity: 0.78;
          filter: blur(0px) brightness(0.99);
          transform: translateX(-322px) translateZ(-50px) scale(0.89) rotateY(10deg);
          transition-duration: 0.28s;
        }

        /* ─── RIGHT ─── */
        .gallery-card.pos-right {
          transform: translateX(336px) translateZ(-60px) scale(0.87) rotateY(-13deg);
          opacity: 0.60;
          filter: blur(0.8px) brightness(0.96);
          z-index: 5;
          cursor: pointer;
        }
        .gallery-card.pos-right:hover {
          opacity: 0.78;
          filter: blur(0px) brightness(0.99);
          transform: translateX(322px) translateZ(-50px) scale(0.89) rotateY(-10deg);
          transition-duration: 0.28s;
        }

        /* ─── FAR LEFT ─── */
        .gallery-card.pos-farleft {
          transform: translateX(-558px) translateZ(-160px) scale(0.70) rotateY(22deg);
          opacity: 0.22;
          filter: blur(2.5px) brightness(0.93);
          z-index: 2;
          pointer-events: none;
        }

        /* ─── FAR RIGHT ─── */
        .gallery-card.pos-farright {
          transform: translateX(558px) translateZ(-160px) scale(0.70) rotateY(-22deg);
          opacity: 0.22;
          filter: blur(2.5px) brightness(0.93);
          z-index: 2;
          pointer-events: none;
        }

        /* ─── HIDDEN ─── */
        .gallery-card.pos-hidden {
          opacity: 0;
          pointer-events: none;
          z-index: 0;
          transform: translateX(0) scale(0.6);
        }

        /* ═══════════════════════════════════════════════════
           CENTER CARD TRANSITION ANIMATIONS
           Uses CSS animations so they run independently of
           the positional transitions above.
        ═══════════════════════════════════════════════════ */

        /* exit: center slides out to the left */
        .gallery-card.pos-center.anim-exit-left {
          animation: centerExitLeft 0.26s cubic-bezier(0.4, 0, 1, 1) both;
        }
        @keyframes centerExitLeft {
          from { transform: translateX(0)    scale(1)    rotateY(0deg); opacity: 1; }
          to   { transform: translateX(-60px) scale(0.92) rotateY(8deg); opacity: 0; }
        }

        /* exit: center slides out to the right */
        .gallery-card.pos-center.anim-exit-right {
          animation: centerExitRight 0.26s cubic-bezier(0.4, 0, 1, 1) both;
        }
        @keyframes centerExitRight {
          from { transform: translateX(0)   scale(1)    rotateY(0deg);  opacity: 1; }
          to   { transform: translateX(60px) scale(0.92) rotateY(-8deg); opacity: 0; }
        }

        /* enter: new center slides in from the right */
        .gallery-card.pos-center.anim-enter-right {
          animation: centerEnterFromRight 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes centerEnterFromRight {
          from { transform: translateX(50px) scale(0.92) rotateY(-6deg); opacity: 0; }
          to   { transform: translateX(0)    scale(1)    rotateY(0deg);  opacity: 1; }
        }

        /* enter: new center slides in from the left */
        .gallery-card.pos-center.anim-enter-left {
          animation: centerEnterFromLeft 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes centerEnterFromLeft {
          from { transform: translateX(-50px) scale(0.92) rotateY(6deg); opacity: 0; }
          to   { transform: translateX(0)     scale(1)    rotateY(0deg); opacity: 1; }
        }

        /* ═══════════════════════════════════════════════════
           CARD INTERIOR – shared
        ═══════════════════════════════════════════════════ */
        .card-inner {
          padding: 30px 28px 26px;
          display: flex;
          flex-direction: column;
          gap: 0;
          height: 100%;
          position: relative;
        }

        .card-glare {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(180deg, rgba(255,255,255,0.50) 0%, transparent 100%);
          border-radius: 28px 28px 0 0;
          pointer-events: none;
          z-index: 1;
        }

        /* ═══════════════════════════════════════════════════
           WELCOME CARD INTERIOR
        ═══════════════════════════════════════════════════ */
        .welcome-card-inner {
          padding: 32px 36px 28px;
          justify-content: space-between;
          min-height: 340px;
        }

        .wc-eyebrow {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.28);
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
        }

        .wc-title {
          font-family: var(--font-display);
          font-size: clamp(2.0rem, 3.8vw, 3.0rem);
          font-weight: 400;
          line-height: 1.04;
          letter-spacing: -0.02em;
          background: linear-gradient(140deg, #111 20%, rgba(0,0,0,0.38) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
        }

        .wc-sub {
          font-size: 13px;
          color: rgba(0,0,0,0.44);
          font-weight: 300;
          line-height: 1.65;
          letter-spacing: 0.01em;
          margin-bottom: 0;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .wc-meta {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
          position: relative;
          z-index: 2;
        }

        .wc-count {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.28);
          font-weight: 700;
        }

        .wc-ctas {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wc-btn {
          display: block;
          text-align: center;
          padding: 11px 18px;
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.22s cubic-bezier(0.34,1.1,0.64,1);
          cursor: pointer;
        }
        .wc-btn-primary {
          background: rgba(0,0,0,0.82);
          color: #fff;
          box-shadow: 0 4px 18px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .wc-btn-primary:hover {
          background: rgba(0,0,0,0.94);
          transform: translateY(-1px);
          box-shadow: 0 8px 26px rgba(0,0,0,0.22);
        }
        .wc-btn-secondary {
          background: rgba(255,255,255,0.60);
          border: 1px solid rgba(0,0,0,0.10);
          color: rgba(0,0,0,0.72);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
        .wc-btn-secondary:hover {
          background: rgba(255,255,255,0.82);
          transform: translateY(-1px);
        }

        /* ═══════════════════════════════════════════════════
           BIKE CARD INTERIOR
        ═══════════════════════════════════════════════════ */
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          position: relative;
          z-index: 2;
        }

        .card-brand {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.28);
        }

        .card-type-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 5px;
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.07);
          color: rgba(0,0,0,0.36);
        }

        .card-model {
          font-family: var(--font-card-model);
          font-size: 21px;
          font-weight: 700;
          color: rgba(0,0,0,0.84);
          line-height: 1.14;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          position: relative;
          z-index: 2;
        }
        .card-inner.is-center .card-model { font-size: 22px; }

        .card-image-box {
          flex: 1;
          border-radius: 16px;
          background: rgba(255,255,255,0.90);
          border: 1px solid rgba(0,0,0,0.055);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 18px;
          min-height: 175px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.055);
          position: relative;
          z-index: 2;
        }
        .card-inner.is-center .card-image-box { min-height: 200px; }
        .card-image-box img {
          width: 100%; height: 100%;
          object-fit: contain;
          padding: 12px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.09));
        }
        .card-img-fallback {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          color: #c0c8d4;
          text-align: center;
          line-height: 1.2;
        }
        .card-img-fallback small { font-size: 13px; opacity: 0.7; }

        .card-stats {
          display: flex;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,0.06);
          margin-bottom: 14px;
          position: relative;
          z-index: 2;
        }
        .card-stat { flex: 1; }
        .card-stat-label {
          font-size: 8.5px;
          font-family: var(--font-mono);
          color: rgba(0,0,0,0.27);
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .card-stat-value {
          font-size: 14px;
          font-weight: 700;
          color: rgba(0,0,0,0.78);
          font-family: var(--font-body);
        }
        .card-rarity {
          display: flex;
          align-items: center;
          gap: 5px;
          justify-content: flex-end;
        }
        .rarity-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .rarity-label {
          font-size: 13px;
          font-weight: 700;
          font-family: var(--font-body);
        }

        .card-cta {
          display: block;
          text-align: center;
          padding: 11px 18px;
          border-radius: 12px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          background: rgba(0,0,0,0.82);
          color: #fff;
          box-shadow: 0 4px 18px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.1) inset;
          transition: all 0.22s cubic-bezier(0.34,1.1,0.64,1);
          margin-top: auto;
          position: relative;
          z-index: 2;
        }
        .card-cta:hover {
          background: rgba(0,0,0,0.94);
          transform: translateY(-1px);
          box-shadow: 0 8px 26px rgba(0,0,0,0.20);
        }

        /* ═══════════════════════════════════════════════════
           ARROWS
        ═══════════════════════════════════════════════════ */
        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          width: 46px; height: 46px;
          border-radius: 50%;
          background: rgba(255,255,255,0.66);
          border: 1px solid rgba(0,0,0,0.08);
          backdrop-filter: blur(20px) saturate(1.4);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition:
            background 0.22s ease,
            transform  0.22s cubic-bezier(0.34,1.2,0.64,1),
            box-shadow 0.22s ease,
            color      0.18s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.88) inset;
          color: rgba(0,0,0,0.55);
          font-size: 20px;
          user-select: none;
          outline: none;
        }
        .gallery-arrow:hover {
          background: rgba(255,255,255,0.90);
          transform: translateY(-50%) scale(1.10);
          box-shadow: 0 8px 28px rgba(0,0,0,0.12);
          color: rgba(0,0,0,0.88);
        }
        .gallery-arrow:active {
          transform: translateY(-50%) scale(0.93);
          transition-duration: 0.10s;
        }
        .gallery-arrow-left  { left:  6px; }
        .gallery-arrow-right { right: 6px; }

        /* ═══════════════════════════════════════════════════
           META  (counter + dots)
        ═══════════════════════════════════════════════════ */
        .gallery-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 0 20px;
          flex-shrink: 0;
          animation: hFadeUp 0.7s 0.18s cubic-bezier(0.22,1,0.36,1) both;
        }

        .gallery-counter {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--text-tertiary);
          font-weight: 700;
          text-transform: uppercase;
        }

        .gallery-dots {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 340px;
        }
        .gallery-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(0,0,0,0.13);
          transition: width 0.28s cubic-bezier(0.34,1.1,0.64,1),
                      background 0.28s ease,
                      border-radius 0.28s ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .gallery-dot.active {
          width: 18px;
          border-radius: 3px;
          background: rgba(0,0,0,0.50);
        }
        /* welcome dot = subtle star */
        .gallery-dot.welcome-dot.active {
          background: rgba(0,0,0,0.62);
        }
        .gallery-dot:hover:not(.active) { background: rgba(0,0,0,0.24); }

        /* ═══════════════════════════════════════════════════
           LOADING
        ═══════════════════════════════════════════════════ */
        .gallery-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          animation: loadPulse 1.6s infinite;
        }
        @keyframes loadPulse { 0%,100%{opacity:0.35} 50%{opacity:1} }

        /* ═══════════════════════════════════════════════════
           KEYFRAMES
        ═══════════════════════════════════════════════════ */
        @keyframes hFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ═══════════════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════════════ */
        @media (max-width: 720px) {
          .home-root { height: calc(100vh - 56px); }
          .gallery-card    { width: 278px; }
          .gallery-card.pos-center  { width: 300px; }
          .gallery-card.pos-left    { transform: translateX(-222px) translateZ(-40px) scale(0.84) rotateY(13deg); }
          .gallery-card.pos-right   { transform: translateX(222px)  translateZ(-40px) scale(0.84) rotateY(-13deg); }
          .gallery-card.pos-farleft  { opacity: 0; pointer-events: none; }
          .gallery-card.pos-farright { opacity: 0; pointer-events: none; }
          .gallery-arrow-left  { left:  2px; }
          .gallery-arrow-right { right: 2px; }
          .wc-title { font-size: 2.1rem; }
        }

        @media (max-width: 400px) {
          .gallery-card.pos-center { width: 272px; }
        }
      `}</style>

      <div
        className="home-root"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Gallery stage ── */}
        <div className="gallery-stage">
          {loading ? (
            <div className="gallery-loading">Loading vehicles…</div>
          ) : (
            <>
              {renderSlot(-2, 'farleft',  false)}
              {renderSlot(-1, 'left',     true)}
              {renderSlot( 0, 'center',   false)}
              {renderSlot( 1, 'right',    true)}
              {renderSlot( 2, 'farright', false)}

              <button className="gallery-arrow gallery-arrow-left"  onClick={() => go('left')}  aria-label="Previous">‹</button>
              <button className="gallery-arrow gallery-arrow-right" onClick={() => go('right')} aria-label="Next">›</button>
            </>
          )}
        </div>

        {/* ── Meta ── */}
        {total > 0 && (
          <div className="gallery-meta">
            <span className="gallery-counter">
              {current === 0 ? '★ Welcome' : `${String(current).padStart(2,'0')} / ${displayTotal}`}
            </span>
            <div className="gallery-dots">
              {slots.map((_, i) => (
                <div
                  key={i}
                  className={`gallery-dot ${i === 0 ? 'welcome-dot' : ''} ${i === current ? 'active' : ''}`}
                  onClick={() => { if (!lockRef.current) setCurrent(i); }}
                  title={i === 0 ? 'Welcome' : `Bike ${i}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}