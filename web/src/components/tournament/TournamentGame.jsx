import { useState, useCallback, useEffect } from 'react';
import { playGoal, playLose, startBgMusic, stopBgMusic } from '@/lib/gameSounds';
import GameScreen from '@/components/game/GameScreen';
import HUD from '@/components/game/HUD';
import LandscapeGuard from '@/components/game/LandscapeGuard';
import CountrySelectScreen from '@/components/game/CountrySelectScreen';
import { Trophy, X } from 'lucide-react';

// Assets (same as in Game.jsx)
const ASSETS = {
  background: '/mondialito-assets/images/background_goalpost.png',
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

// Tournament mode: 10 misses = end
const TOURNAMENT_MAX_MISSES = 10;

export default function TournamentGame({ tournament, onGameEnd }) {
  const [country, setCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (musicOn && !finished) startBgMusic();
    else stopBgMusic();
  }, [musicOn, finished]);

  const handleGoal = useCallback((points) => {
    playGoal();
    setScore(prev => prev + points);
  }, []);

  const handleMiss = useCallback(() => {
    playLose();
    setMisses(prev => {
      const next = prev + 1;
      if (next >= TOURNAMENT_MAX_MISSES) {
        setFinished(true);
      }
      return next;
    });
  }, []);

  if (!country) {
    return (
      <LandscapeGuard>
        <div style={{ width: '100%', height: '100%' }}>
          <CountrySelectScreen assets={ASSETS} onConfirm={setCountry} />
        </div>
      </LandscapeGuard>
    );
  }

  if (finished) {
    return (
      <LandscapeGuard>
        <div style={{ width: '100%', height: '100%', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#131929', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px solid rgba(255,215,0,0.3)', maxWidth: 360 }}>
            <Trophy size={48} color="#ffd700" />
            <h2 style={{ color: '#fff', margin: '12px 0 4px', fontSize: 22 }}>Tentative terminée</h2>
            <p style={{ color: '#aaa', fontSize: 13, marginBottom: 16 }}>Tantativ fini</p>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ffd700', marginBottom: 20 }}>
              {score} pts
            </div>
            <button onClick={() => onGameEnd(score)} style={{
              background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              Voir classement / Wè klasman
            </button>
          </div>
        </div>
      </LandscapeGuard>
    );
  }

  return (
    <LandscapeGuard>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        {/* Quit button */}
        <button
          onClick={() => { setFinished(true); }}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 50,
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, color: '#fff', padding: '6px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
          }}
        >
          <X size={14} /> Terminer / Fini
        </button>

        {/* Game takes remaining space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <GameScreen
            assets={ASSETS}
            score={score}
            misses={misses}
            onGoal={handleGoal}
            onMiss={handleMiss}
            musicOn={musicOn}
            toggleMusic={() => setMusicOn(m => !m)}
            mode="tournament"
            hideHUD
          />
        </div>

        {/* HUD at the bottom */}
        <HUD
          assets={ASSETS}
          score={score}
          misses={misses}
          musicOn={musicOn}
          toggleMusic={() => setMusicOn(m => !m)}
          maxMisses={TOURNAMENT_MAX_MISSES}
          position="bottom"
        />
      </div>
    </LandscapeGuard>
  );
}