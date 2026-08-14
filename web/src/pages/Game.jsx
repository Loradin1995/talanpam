import { useState, useEffect, useRef, useCallback } from 'react';
import MenuScreen from '../components/game/MenuScreen';
import GameScreen from '../components/game/GameScreen';
import GameOverScreen from '../components/game/GameOverScreen';
import CountrySelectScreen from '../components/game/CountrySelectScreen';

import { playGoal, playLose, BG_MUSIC, startBgMusic, stopBgMusic } from '@/lib/gameSounds';

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

export default function Game() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'country' | 'game' | 'gameover'
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('penaltyHighScore') || '0');
  });
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (musicOn && (screen === 'menu' || screen === 'country' || screen === 'game')) {
      startBgMusic();
    } else {
      stopBgMusic();
    }
  }, [musicOn, screen]);

  const handlePlay = () => {
    setScreen('country');
  };

  const handleCountryConfirm = (countryCode) => {
    setSelectedCountry(countryCode);
    setScore(0);
    setMisses(0);
    setScreen('game');
  };

  const handleGoal = useCallback((points = 1) => {
    playGoal();
    setScore(prev => {
      const next = prev + points;
      if (next > highScore) {
        setHighScore(next);
        localStorage.setItem('penaltyHighScore', String(next));
      }
      return next;
    });
  }, [highScore]);

  const handleMiss = useCallback(() => {
    playLose();
    setMisses(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setTimeout(() => setScreen('gameover'), 1600);
      }
      return next;
    });
  }, []);

  const handleMenu = () => setScreen('menu');
  const handleReplay = () => { setScore(0); setMisses(0); setScreen('country'); };
  const toggleMusic = () => setMusicOn(m => {
    const next = !m;
    if (next) startBgMusic();
    else stopBgMusic();
    return next;
  });

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {screen === 'menu' && (
        <MenuScreen assets={ASSETS} onPlay={handlePlay} musicOn={musicOn} toggleMusic={toggleMusic} highScore={highScore} />
      )}
      {screen === 'country' && (
        <CountrySelectScreen assets={ASSETS} onConfirm={handleCountryConfirm} />
      )}
      {screen === 'game' && (
        <GameScreen
          assets={ASSETS}
          score={score}
          misses={misses}
          onGoal={handleGoal}
          onMiss={handleMiss}
          musicOn={musicOn}
          toggleMusic={toggleMusic}
        />
      )}
      {screen === 'gameover' && (
        <GameOverScreen assets={ASSETS} score={score} highScore={highScore} onMenu={handleMenu} onReplay={handleReplay} musicOn={musicOn} toggleMusic={toggleMusic} />
      )}
    </div>
  );
}