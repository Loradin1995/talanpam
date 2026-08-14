import { useState } from 'react';

const COUNTRIES = [
  { code: 'HT', name: 'Haïti', flag: '🇭🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'HR', name: 'Croatie', flag: '🇭🇷' },
  { code: 'EN', name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'JP', name: 'Japon', flag: '🇯🇵' },
  { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
  { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
];

export default function CountrySelectScreen({ assets, onConfirm }) {
  const [selected, setSelected] = useState('HT');

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: `url(${assets.background})`,
      backgroundSize: '100% 100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
      }} />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(10,20,40,0.85)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: '16px 12px',
        maxWidth: 400, width: '95%',
        maxHeight: '90vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
      }}>
        <h2 style={{
          textAlign: 'center', color: '#fff',
          fontSize: 16, fontWeight: 800,
          marginBottom: 12, letterSpacing: 0.5,
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          flexShrink: 0,
        }}>
          Équipe
        </h2>

        {/* Grid of flags */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6,
          overflowY: 'auto',
          paddingRight: 4,
          flex: 1,
          minHeight: 0,
        }}>
          {COUNTRIES.map(c => {
            const isSelected = selected === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                title={c.name}
                style={{
                  background: isSelected
                    ? 'rgba(93,173,226,0.35)'
                    : 'rgba(255,255,255,0.07)',
                  border: isSelected
                    ? '2px solid #5DADE2'
                    : '2px solid transparent',
                  borderRadius: 8,
                  padding: '4px 2px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? '0 0 12px rgba(93,173,226,0.5)' : 'none',
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{c.flag}</span>
                <span style={{
                  color: isSelected ? '#AED6F1' : 'rgba(255,255,255,0.6)',
                  fontSize: 7, fontWeight: 600, textAlign: 'center', lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected display & Confirm */}
        <div style={{ flexShrink: 0, marginTop: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            {(() => {
              const c = COUNTRIES.find(x => x.code === selected);
              return c ? (
                <span style={{ color: '#AED6F1', fontSize: 12, fontWeight: 700 }}>
                  {c.flag} {c.name}
                </span>
              ) : null;
            })()}
          </div>
          <button
            onClick={() => onConfirm(selected)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #5DADE2, #2E86C1)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px', fontWeight: 800, fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(93,173,226,0.4)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}