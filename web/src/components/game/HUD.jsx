// Heads-up display: score, misses (kicks remaining), music toggle — always overlay

export default function HUD({ assets, score, misses, musicOn, toggleMusic, maxMisses = 3 }) {
  return (
    <div style={{
      position: 'absolute', bottom: 8, left: 8, right: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 10, pointerEvents: 'none',
    }}>
      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.65)', borderRadius: 12, padding: '5px 12px', pointerEvents: 'none' }}>
        <img src={assets.score} alt="Score" style={{ height: 20 }} />
        <span style={{ color: '#fff', fontFamily: 'Arial Black, sans-serif', fontSize: 22, fontWeight: 900, textShadow: '0 2px 6px #000', minWidth: 28, textAlign: 'center' }}>
          {score}
        </span>
      </div>

      {/* Kicks / misses */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.65)', borderRadius: 12, padding: '5px 12px', pointerEvents: 'none' }}>
        <img src={assets.kicks} alt="Kicks" style={{ height: 20 }} />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 140 }}>
          {Array.from({ length: maxMisses }, (_, i) => (
            <div
              key={i}
              style={{
                width: 12, height: 12,
                borderRadius: '50%',
                background: i < misses ? '#ff3e3e' : 'rgba(255,255,255,0.25)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                boxShadow: i < misses ? '0 0 6px rgba(255,68,68,0.7)' : 'none',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Music toggle */}
      <button onClick={toggleMusic} style={{ background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto', padding: 0 }}>
        <img src={musicOn ? assets.music_on : assets.music_off} alt="music" style={{ width: 40, height: 40 }} />
      </button>
    </div>
  );
}