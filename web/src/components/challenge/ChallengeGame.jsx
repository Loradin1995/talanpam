import { useState, useCallback } from 'react';
import GameScreen from '@/components/game/GameScreen';
import LandscapeGuard from '@/components/game/LandscapeGuard';
import CountrySelectScreen from '@/components/game/CountrySelectScreen';
import { Swords, X } from 'lucide-react';

const ASSETS = {
  background: '/mondialito-assets/images/background_challenge.png',
  ball: '/mondialito-assets/images/ball.png',
  goalkeeper_idle: '/mondialito-assets/images/goalkeeper_idle.png',
  goalkeeper_jumping: '/mondialito-assets/images/goalkeeper_jumping.png',
  goalpost: '/mondialito-assets/images/goalpost.png',
  cursor: '/mondialito-assets/images/cursor.png',
  game_over: '/mondialito-assets/images/game_over.png',
  goal: '/mondialito-assets/images/goal.png',
  kicks: '/mondialito-assets/images/kicks.png',
  logo: '/mondialito-assets/images/logo.png',
  menu: '/mondialito-assets/images/menu.png',
  music_off: '/mondialito-assets/images/music_off.png',
  music_on: '/mondialito-assets/images/music_on.png',
  out: '/mondialito-assets/images/out.png',
  play: '/mondialito-assets/images/play.png',
  saved: '/mondialito-assets/images/saved.png',
  score: '/mondialito-assets/images/score.png',
};

export default function ChallengeGame({ room, match, onGameEnd }) {
  const [country, setCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  const handleGoal = useCallback((points) => setScore(prev => prev + points), []);
  const handleMiss = useCallback(() => {
    setMisses(prev => {
      const next = prev + 1;
      if (next >= 3) setFinished(true);
      return next;
    });
  }, []);

  if (!country) {
    return (
      <LandscapeGuard>
        <div style={{ width: '100vw', height: '100vh' }}>
          <CountrySelectScreen assets={ASSETS} onConfirm={setCountry} />
        </div>
      </LandscapeGuard>
    );
  }

  if (finished) {
    return (
      <LandscapeGuard>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#131929', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px solid rgba(255,107,0,0.3)', maxWidth: 340 }}>
            <Swords size={44} color="#ff6b00" />
            <h2 style={{ color: '#fff', margin: '12px 0 4px' }}>Défi terminé / Defi fini</h2>
            <div style={{ fontSize: 38, fontWeight: 900, color: '#ff6b00', margin: '12px 0 20px' }}>
              {score} pts
            </div>
            <p style={{ color: '#aaa', fontSize: 12, marginBottom: 20 }}>En attente du résultat final... / Ap tann rezilta final...</p>
            <button onClick={() => onGameEnd(score)} style={{
              background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              Voir résultat / Wè rezilta
            </button>
          </div>
        </div>
      </LandscapeGuard>
    );
  }

  return (
    <LandscapeGuard>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <button
          onClick={() => setFinished(true)}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 50,
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, color: '#fff', padding: '6px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
          }}
        >
          <X size={14} /> Terminer / Fini
        </button>

        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, background: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#fff', fontWeight: 700,
          border: `1px solid ${room?.color || '#ff6b00'}40`,
        }}>
          <Swords size={14} color={room?.color || '#ff6b00'} />
          <span style={{ color: room?.color || '#ff6b00' }}>{score} pts</span>
          <span style={{ color: '#aaa' }}>|</span>
          <span>❌ {misses}/3</span>
          <span style={{ color: '#aaa' }}>|</span>
          <span style={{ color: '#00e676', fontSize: 11 }}>Gain: {room?.prize?.toLocaleString()} HTG</span>
        </div>

        <GameScreen
          assets={ASSETS}
          score={score}
          misses={misses}
          onGoal={handleGoal}
          onMiss={handleMiss}
          musicOn={musicOn}
          toggleMusic={() => setMusicOn(m => !m)}
        />
      </div>
    </LandscapeGuard>
  );
}