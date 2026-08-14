import { useState, useEffect } from 'react';
import { playGoal, playLose, startBgMusic, stopBgMusic } from '@/lib/gameSounds';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/lib/LangContext';
import GameScreen from '@/components/game/GameScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import MenuScreen from '@/components/game/MenuScreen';
import LandscapeGuard from '@/components/game/LandscapeGuard';

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

export default function FreePlay() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('menu');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('freePlayHighScore') || '0'));
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (musicOn && (screen === 'menu' || screen === 'game')) startBgMusic();
    else stopBgMusic();
  }, [musicOn, screen]);

  const handlePlay = () => { setScore(0); setMisses(0); setScreen('game'); };

  const handleGoal = (points = 1) => {
    playGoal();
    setScore(prev => {
      const next = prev + points;
      if (next > highScore) { setHighScore(next); localStorage.setItem('freePlayHighScore', String(next)); }
      return next;
    });
  };

  const handleMiss = () => {
    playLose();
    setMisses(prev => {
      const next = prev + 1;
      if (next >= 3) setTimeout(() => setScreen('gameover'), 1600);
      return next;
    });
  };

  return (
    <LandscapeGuard>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#000', position: 'relative' }}>
        {/* Back button */}
        {screen === 'menu' && (
          <button onClick={() => { stopBgMusic(); navigate('/lobby'); }} style={{
            position: 'absolute', top: 12, left: 12, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 12,
          }}>
            ← Lobby
          </button>
        )}
        {screen === 'menu' && <MenuScreen assets={ASSETS} onPlay={handlePlay} musicOn={musicOn} toggleMusic={() => { const n = !musicOn; setMusicOn(n); if (n) startBgMusic(); else stopBgMusic(); }} highScore={highScore} />}
        {screen === 'game' && <GameScreen assets={ASSETS} score={score} misses={misses} onGoal={handleGoal} onMiss={handleMiss} musicOn={musicOn} toggleMusic={() => setMusicOn(m => !m)} />}
        {screen === 'gameover' && <GameOverScreen assets={ASSETS} score={score} highScore={highScore} onMenu={() => setScreen('menu')} onReplay={handlePlay} musicOn={musicOn} toggleMusic={() => setMusicOn(m => !m)} />}
      </div>
    </LandscapeGuard>
  );
}