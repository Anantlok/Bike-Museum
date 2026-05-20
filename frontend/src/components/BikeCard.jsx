import React from 'react';
 
const rarityConfig = {
  1: {
    label: 'Common',
    accent: 'rgba(160,170,190,0.6)',
    glow: 'rgba(160,170,190,0.10)',
    border: 'rgba(255,255,255,0.16)',
    dot: '#8A9BB0',
  },
  2: {
    label: 'Rare',
    accent: 'rgba(74,158,255,0.75)',
    glow: 'rgba(74,158,255,0.14)',
    border: 'rgba(74,158,255,0.30)',
    dot: '#4A9EFF',
  },
  3: {
    label: 'Epic',
    accent: 'rgba(191,127,255,0.75)',
    glow: 'rgba(191,127,255,0.16)',
    border: 'rgba(191,127,255,0.32)',
    dot: '#BF7FFF',
  },
  4: {
    label: 'Legendary',
    accent: 'rgba(255,179,64,0.85)',
    glow: 'rgba(255,179,64,0.18)',
    border: 'rgba(255,179,64,0.35)',
    dot: '#FFB340',
  },
};
 
export default function BikeCard({ bike }) {
  const r = rarityConfig[bike.rarity] || rarityConfig[1];
 
  const cardStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '260px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.55)',
    border: `1px solid ${r.border}`,
    borderRadius: '20px',
    backdropFilter: 'blur(28px) saturate(1.7)',
    WebkitBackdropFilter: 'blur(28px) saturate(1.7)',
    boxShadow: `0 8px 32px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(255,255,255,0.8) inset, 0 8px 40px ${r.glow}`,
    padding: '20px',
    transition: 'transform 0.22s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.22s ease',
    cursor: 'default',
    overflow: 'hidden',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };
 
  const glareStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    borderRadius: '20px 20px 0 0',
    pointerEvents: 'none',
  };
 
  const accentBarStyle = {
    position: 'absolute',
    top: 0, left: '20%', right: '20%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${r.accent}, transparent)`,
    borderRadius: '0 0 2px 2px',
  };
 
  const brandStyle = {
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: 'rgba(0,0,0,0.7)', marginBottom: '4px',
  };
 
  const modelStyle = {
    fontSize: '22px', fontWeight: 600, color: 'rgba(0,0,0,0.85)',
    letterSpacing: '-0.02em', lineHeight: 1.2,
    fontFamily: "'Cabin', sans-serif",
    
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  };
 
  const tagStyle = {
    display: 'inline-block', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '3px 10px', borderRadius: '6px',
    background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)',
    color: 'rgba(0,0,0,0.62)', marginTop: '8px',
  };
 
  const imageBoxStyle = {
    margin: '16px 0', height: '110px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  };
 
  const imgStyle = {
    objectFit: 'contain', height: '100%', width: '100%', padding: '8px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
  };
 
  const ccFallbackStyle = {
    fontSize: '24px', fontWeight: 800, color: '#9ca3af',
    letterSpacing: '0.05em', fontFamily: "'DM Serif Display', Georgia, serif",
  };
 
  const statsRowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.07)', marginTop: '4px',
  };
 
  const statLabelStyle = {
    fontSize: '10px', color: 'rgba(0,0,0,0.32)', fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px',
  };
 
  const statValueStyle = { fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.75)' };
 
  const rarityValueStyle = {
    fontSize: '13px', fontWeight: 700, color: r.dot,
    display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end',
  };
 
  const dotStyle = {
    width: '6px', height: '6px', borderRadius: '50%',
    background: r.dot, boxShadow: `0 0 6px ${r.dot}`, display: 'inline-block',
  };
 
  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(255,255,255,0.9) inset, 0 12px 50px ${r.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(255,255,255,0.8) inset, 0 8px 40px ${r.glow}`;
      }}
    >
      {/* Glass glare + rarity accent */}
      <div style={glareStyle} />
      <div style={accentBarStyle} />
 
      {/* Brand */}
      <p style={brandStyle}>{bike.brand}</p>
 
      {/* Model */}
      <h3 style={modelStyle}>{bike.model_name}</h3>
 
      {/* Type tag */}
      <span style={tagStyle}>{bike.bike_type || 'Motorcycle'}</span>
 
      {/* Image */}
      <div style={imageBoxStyle}>
        {bike.image_url ? (
          <img src={bike.image_url} alt={bike.model_name} style={imgStyle} />
        ) : (
          <span style={ccFallbackStyle}>{bike.cc} CC</span>
        )}
      </div>
 
      {/* Stats */}
      <div style={statsRowStyle}>
        <div>
          <p style={statLabelStyle}>Power</p>
          <p style={statValueStyle}>{bike.power} BHP</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={statLabelStyle}>Rarity</p>
          <p style={rarityValueStyle}>
            <span style={dotStyle} />
            {r.label}
          </p>
        </div>
      </div>
    </div>
  );
}