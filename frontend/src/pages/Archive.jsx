import React from 'react';
import BikeCard from '../components/BikeCard';

export default function Archive({
  activeTab, bikes, loading, errorMessage,
  selectedBrand, setSelectedBrand,
  selectedRarity, setSelectedRarity,
  minBhp, setMinBhp,
  openedBike, openingPack, gachaError, handleOpenPack
}) {

  const resetFilters = () => {
    setSelectedBrand('');
    setSelectedRarity('');
    setMinBhp('');
  };

  const hasActiveFilters = selectedBrand || selectedRarity || minBhp;

  return (
    <>
      <style>{`
        /* ── FILTER BAR ─────────────────────────────────────────────── */
        .filter-bar-wrapper {
          position: relative;
          top: unset;
          z-index: 50;
          padding: 24px 32px 0;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* The outer rounded pill container */
        .filter-pill-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.62);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 18px;
          padding: 10px 14px;
          backdrop-filter: blur(28px) saturate(1.8);
          -webkit-backdrop-filter: blur(28px) saturate(1.8);
          box-shadow:
            0 4px 24px rgba(0,0,0,0.07),
            0 1px 0 rgba(255,255,255,0.9) inset;
          flex-wrap: wrap;
        }

        /* Divider between selects */
        .filter-divider {
          width: 1px;
          height: 28px;
          background: rgba(0,0,0,0.08);
          flex-shrink: 0;
        }

        /* Individual select pill */
        .filter-select {
          flex: 1;
          min-width: 140px;
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          padding: 6px 28px 6px 10px;
          cursor: pointer;
          /* Custom chevron */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='rgba(0,0,0,0.35)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          transition: color 0.15s;
        }
        .filter-select:focus { color: #1a4fff; }
        .filter-select option { background: #fff; color: #111; }

        /* BHP slider inline section */
        .filter-bhp-section {
          flex: 1;
          min-width: 160px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px;
        }

        .bhp-label {
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .bhp-slider {
          flex: 1;
          accent-color: var(--accent-purple);
          cursor: pointer;
          height: 3px;
        }

        .bhp-value {
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--accent-purple);
          white-space: nowrap;
          min-width: 42px;
          text-align: right;
        }

        /* Reset pill button */
        .filter-reset-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          padding: 6px 14px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .filter-reset-btn:hover {
          background: rgba(0,0,0,0.09);
          color: var(--text-primary);
        }
        .filter-reset-btn.has-filters {
          background: rgba(26,111,255,0.08);
          border-color: rgba(26,111,255,0.22);
          color: #1a4fff;
        }
        .filter-reset-btn.has-filters:hover {
          background: rgba(26,111,255,0.14);
        }

        /* Status bar below filter pill */
        .filter-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 4px 16px;
        }

        .filter-status-label {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .filter-status-count {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          font-weight: 600;
        }

        .filter-status-count span {
          color: var(--accent-blue);
          font-weight: 700;
        }

        /* ── MAIN CONTENT AREA ──────────────────────────────────────── */
        .archive-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px 80px;
        }

        .archive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          width: 100%;
        }

        .archive-state-box {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 320px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-tertiary);
          letter-spacing: 0.04em;
          background: rgba(255,255,255,0.4);
          border: 1px solid rgba(0,0,0,0.07);
          backdrop-filter: blur(16px);
        }

        /* ── GACHA ──────────────────────────────────────────────────── */
        .gacha-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 32px 80px;
        }

        /* ── RESPONSIVE ─────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .filter-bar-wrapper { padding: 12px 16px 0; top: 58px; }
          .filter-pill-bar { flex-direction: column; align-items: stretch; border-radius: 16px; padding: 12px; }
          .filter-divider { width: 100%; height: 1px; }
          .filter-select { min-width: unset; width: 100%; }
          .filter-bhp-section { min-width: unset; width: 100%; padding: 0; }
          .filter-reset-btn { width: 100%; justify-content: center; }
          .archive-content { padding: 16px 16px 60px; }
          .gacha-wrapper { padding: 16px 16px 60px; }
          .archive-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        }

        @media (max-width: 400px) {
          .archive-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── MARKETPLACE ─────────────────────────────────────────────── */}
      {activeTab === 'marketplace' && (
        <>
          {/* Sticky horizontal filter pill bar */}
          <div className="filter-bar-wrapper">
            <div className="filter-pill-bar">

              {/* Select 1 — Brand */}
              <select
                className="filter-select"
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
              >
                <option value="">All Manufacturers</option>
                <option value="Royal Enfield">Royal Enfield</option>
                <option value="Honda">Honda</option>
                <option value="TVS">TVS</option>
                <option value="Jawa">Jawa</option>
                <option value="Hero">Hero</option>
              </select>

              <div className="filter-divider" />

              {/* Select 2 — Rarity */}
              <select
                className="filter-select"
                value={selectedRarity}
                onChange={e => setSelectedRarity(e.target.value)}
              >
                <option value="">All Rarity Tiers</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>

              <div className="filter-divider" />

              {/* Inline BHP slider — matches sketch's third "dropdown" slot */}
              <div className="filter-bhp-section">
                <span className="bhp-label">Min BHP</span>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={minBhp || 0}
                  onChange={e => setMinBhp(e.target.value === '0' ? '' : e.target.value)}
                  className="bhp-slider"
                />
                <span className="bhp-value">{minBhp || 0} BHP</span>
              </div>

              <div className="filter-divider" />

              {/* Reset */}
              <button
                onClick={resetFilters}
                className={`filter-reset-btn ${hasActiveFilters ? 'has-filters' : ''}`}
              >
                {hasActiveFilters ? '✕ Clear' : 'Reset'}
              </button>
            </div>

            {/* Status row */}
            <div className="filter-status-bar">
              <span className="filter-status-label">Showroom Index · Live Directory</span>
              <span className="filter-status-count">
                <span>{bikes.length}</span> records
              </span>
            </div>
          </div>

          {/* Card grid */}
          <div className="archive-content">
            {errorMessage && <div className="error-banner" style={{ marginBottom: '20px' }}>{errorMessage}</div>}
            <div className="archive-grid">
              {loading ? (
                <div className="archive-state-box">
                  <span className="loading-pulse">Querying Live Archive…</span>
                </div>
              ) : bikes.length === 0 ? (
                <div className="archive-state-box">
                  No vehicles match the current filters.
                </div>
              ) : (
                bikes.map(bike => <BikeCard key={bike.id} bike={bike} />)
              )}
            </div>
          </div>
        </>
      )}

      {/* ── GACHA ───────────────────────────────────────────────────── */}
      {activeTab === 'gacha' && (
        <div className="gacha-wrapper">
          <div className="gacha-panel glass-strong">
            <h2 className="gacha-title">Daily Vehicle Drop</h2>
            <p className="gacha-sub">Burn one pack token to roll<br />a random card from the archive.</p>
            <div className="gacha-card-stage">
              {openedBike ? (
                <div className="gacha-result-appear"><BikeCard bike={openedBike} /></div>
              ) : (
                <div className="gacha-idle-icon">
                  <div className={`gacha-pack-visual ${openingPack ? 'bouncing' : ''}`}>
                    {openingPack ? '📦' : '✨'}
                  </div>
                  <span className="gacha-pack-label">
                    {openingPack ? 'Unsealing…' : 'Container Sealed'}
                  </span>
                </div>
              )}
            </div>
            {gachaError && <div className="gacha-error">⚠ {gachaError}</div>}
            <button
              onClick={handleOpenPack}
              disabled={openingPack}
              className="cta-btn cta-btn-gacha"
            >
              {openingPack ? 'Opening Crate…' : 'Claim Vehicle Drop'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}