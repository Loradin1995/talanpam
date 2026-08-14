export default function GameOverScreen({ assets, score, highScore, onMenu, onReplay, musicOn, toggleMusic }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url(${assets.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

      {/* Music button */}
      <button
        onClick={toggleMusic}
        style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
      >
        <img src={musicOn ? assets.music_on : assets.music_off} alt="music" style={{ width: 60, height: 60 }} />
      </button>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <img src={assets.game_over} alt="Game Over" style={{ width: 'min(520px, 85vw)', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.8))' }} />

        {/* Score display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '18px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={assets.score} alt="Score" style={{ height: 40 }} />
            <span style={{ color: '#fff', fontFamily: 'Arial Black, sans-serif', fontSize: 48, fontWeight: 900, textShadow: '0 2px 8px #000' }}>
              {score}
            </span>
          </div>
          {score >= highScore && score > 0 && (
            <div style={{ color: '#ffe066', fontFamily: 'Arial Black, sans-serif', fontSize: 18, fontWeight: 900, textShadow: '0 1px 4px #000', letterSpacing: 2 }}>
              🏆 MEILLEUR SCORE !
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onMenu}
            style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src={assets.menu} alt="Menu" style={{ width: 'min(180px, 40vw)' }} />
          </button>
          <button
            onClick={onReplay}
            style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src={assets.play} alt="Play" style={{ width: 'min(180px, 40vw)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}