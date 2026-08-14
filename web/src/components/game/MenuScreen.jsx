import { useState, useEffect } from 'react';

export default function MenuScreen({ assets, onPlay, musicOn, toggleMusic, highScore }) {
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Scale UI elements based on available height (landscape mobile has very little height)
  const scale = Math.min(1, dims.h / 500);
  const logoW = Math.round(Math.min(360, dims.w * 0.55) * scale);
  const playW = Math.round(Math.min(180, dims.w * 0.38) * scale);
  const gap = Math.round(Math.max(8, 28 * scale));

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
        overflow: 'hidden',
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      {/* Music button */}
      <button
        onClick={toggleMusic}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
      >
        <img src={musicOn ? assets.music_on : assets.music_off} alt="music" style={{ width: Math.round(48 * scale), height: Math.round(48 * scale) }} />
      </button>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap }}>
        {/* Logo */}
        <img src={assets.logo} alt="Penalty Kick" style={{ width: logoW, filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.7))' }} />

        {/* High Score */}
        {highScore > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: `${Math.round(6 * scale)}px ${Math.round(16 * scale)}px` }}>
            <img src={assets.score} alt="Score" style={{ height: Math.round(28 * scale) }} />
            <span style={{ color: '#fff', fontFamily: 'Arial Black, sans-serif', fontSize: Math.round(26 * scale), fontWeight: 900, textShadow: '0 2px 8px #000' }}>
              {highScore}
            </span>
          </div>
        )}

        {/* Play button */}
        <button
          onClick={onPlay}
          style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s', padding: 8 }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src={assets.play} alt="Play" style={{ width: playW }} />
        </button>
      </div>
    </div>
  );
}