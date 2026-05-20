import React from 'react';
import BikeCard from '../components/BikeCard';
 
// ── Icon imports ─────────────────────────────────────────────────────────────
import boxIcon  from '../icons/icons8-box-128.png';
import bikeIcon from '../icons/icons8-bike-48.png';
 
export default function OpenPacksPage({
  token,
  openedBike,
  setOpenedBike,
  openingPack,
  gachaError,
  handleOpenPack
}) {
  return (
    <div className="app-wrapper" style={{
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 56px)',
    }}>
 
      <style>{`
        .unbox-arena {
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 32px;
          border-radius: 24px;
          text-align: center;
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glow-glow {
          box-shadow: 0 0 40px rgba(124,58,237,0.15), 0 1px 0 rgba(255,255,255,0.8) inset !important;
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .card-reveal-track {
          perspective: 1000px;
          margin: 32px 0;
          display: flex;
          justify-content: center;
        }
        .minted-bike-drop {
          animation: holographicReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes holographicReveal {
          0%   { opacity: 0; transform: scale(0.8) rotateY(-180deg); filter: brightness(3); }
          100% { opacity: 1; transform: scale(1)   rotateY(0deg);    filter: brightness(1); }
        }
 
        /* ── Pack crate visual ── */
        .pack-crate-stage {
          width: 100%;
          max-width: 280px;
          margin: 0;
          height: 220px;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.38);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
 
        .pack-icon-wrap {
          width: 96px;
          height: 96px;
          border-radius: 22px;
          background: linear-gradient(145deg, rgba(124,58,237,0.12), rgba(26,111,255,0.10));
          border: 1px solid rgba(124,58,237,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 28px rgba(124,58,237,0.10);
          transition: transform 0.2s ease;
        }
        .pack-icon-wrap.bouncing {
          animation: packBounce 0.65s ease infinite alternate;
        }
        @keyframes packBounce {
          from { transform: translateY(0)   scale(1);    }
          to   { transform: translateY(-8px) scale(1.04); }
        }
        .pack-icon-wrap.opening {
          background: linear-gradient(145deg, rgba(26,111,255,0.18), rgba(124,58,237,0.22));
        }
 
        .pack-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          font-weight: 700;
          font-family: var(--font-mono);
        }
      `}</style>
 
      <div className="unbox-arena glass-strong glow-glow">
 
        {/* Header */}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--accent-purple)', fontWeight: '700',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '7px', marginBottom: '10px',
        }}>
          <img src={boxIcon} width={14} height={14} style={{ objectFit: 'contain', opacity: 0.7 }} alt="" />
          Drop Vault
        </span>
 
        <h2 className="gacha-title" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          Vehicle Drops
        </h2>
        <p className="gacha-sub" style={{ marginBottom: '24px' }}>
          Spend one drop token to unlock a randomised vehicle card and add it to your garage.
        </p>
 
        {/* Card stage */}
        <div className="card-reveal-track">
          {openedBike ? (
            <div className="minted-bike-drop">
              <BikeCard bike={openedBike} />
            </div>
          ) : (
            <div className="pack-crate-stage">
              <div className={`pack-icon-wrap ${openingPack ? 'bouncing opening' : ''}`}>
                <img
                  src={openingPack ? bikeIcon : boxIcon}
                  width={openingPack ? 44 : 56}
                  height={openingPack ? 44 : 56}
                  style={{ objectFit: 'contain', transition: 'all 0.3s ease' }}
                  alt={openingPack ? 'Revealing bike' : 'Pack'}
                />
              </div>
              <span className="pack-label">
                {openingPack ? 'Revealing vehicle…' : 'Crate sealed'}
              </span>
            </div>
          )}
        </div>
 
        {/* Error */}
        {gachaError && (
          <div className="gacha-error" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            ⚠ {gachaError}
          </div>
        )}
 
        {/* CTA */}
        <button
          onClick={handleOpenPack}
          disabled={openingPack}
          className="cta-btn cta-btn-gacha"
          style={{
            padding: '15px',
            fontSize: '13px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <img
            src={openingPack ? bikeIcon : boxIcon}
            width={18} height={18}
            style={{ objectFit: 'contain', opacity: 0.75 }}
            alt=""
          />
          {openingPack ? 'Opening…' : 'Unlock Card Drop'}
        </button>
 
        {/* Reset */}
        {openedBike && !openingPack && (
          <button
            onClick={() => setOpenedBike(null)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px', textDecoration: 'underline',
              marginTop: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              width: '100%',
            }}
          >
            <img src={boxIcon} width={12} height={12} style={{ objectFit: 'contain', opacity: 0.5 }} alt="" />
            Clear &amp; open another
          </button>
        )}
 
      </div>
    </div>
  );
}