import { useState, useEffect, useRef, useCallback } from 'react';
import GoalGrid, { ZONE_POINTS } from './GoalGrid';
import BallAnimation from './BallAnimation';
import GoalkeeperDisplay from './GoalkeeperDisplay';
import ResultOverlay from './ResultOverlay';
import HUD from './HUD';

// 6 zones total (2 rows x 3 cols)
const TOTAL_ZONES = 6;

// Returns number of covered zones based on score and mode
// mode='tournament': 1/6 jusqu'à 500pts, 2/6 de 500 à 1000, 3/6 au delà de 1000
// mode='standard': difficulty escalation classique
function getCoveredCount(score, mode) {
  if (mode === 'tournament') {
    if (score >= 2000) return 3;
    if (score >= 1000) return 2;
    return 1; // 1/6 : seulement 1 zone couverte → facile à marquer
  }
  if (score >= 200) return 5;
  if (score >= 100) return 4;
  if (score >= 50) return 3;
  return 2;
}

// Pick N random indices from 0 to TOTAL_ZONES-1
function pickRandom(n) {
  const all = Array.from({ length: TOTAL_ZONES }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, n);
}

export default function GameScreen({ assets, score, misses, onGoal, onMiss, musicOn, toggleMusic, mode = 'standard', hideHUD = false }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'shooting' | 'result'
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  const [coveredZones, setCoveredZones] = useState(() => pickRandom(4));
  const [selectedZone, setSelectedZone] = useState(null);
  const [goalkeeperDir, setGoalkeeperDir] = useState(null); // zone index goalkeeper dives to
  const [result, setResult] = useState(null); // 'goal' | 'saved' | 'out'
  const [ballTarget, setBallTarget] = useState(null); // {x, y} percentages
  const timeoutRef = useRef(null);

  // Regenerate covered zones when score changes (new kick)
  useEffect(() => {
    const count = getCoveredCount(score, mode);
    setCoveredZones(pickRandom(count));
  }, [score, mode]);

  const handleZoneClick = useCallback((zoneIndex, zonePos) => {
    if (phase !== 'idle') return;

    setPhase('shooting');
    setSelectedZone(zoneIndex);
    setBallTarget(zonePos);

    const isCovered = coveredZones.includes(zoneIndex);
    const points = ZONE_POINTS[zoneIndex] || 0;

    if (isCovered) {
      setGoalkeeperDir(zoneIndex);
      timeoutRef.current = setTimeout(() => {
        setResult('saved');
        setPhase('result');
        onMiss();
        timeoutRef.current = setTimeout(() => {
          setResult(null);
          setSelectedZone(null);
          setGoalkeeperDir(null);
          setBallTarget(null);
          const count = getCoveredCount(score, mode);
          setCoveredZones(pickRandom(count));
          setPhase('idle');
        }, 1600);
      }, 700);
    } else {
      const randomCovered = coveredZones[Math.floor(Math.random() * coveredZones.length)];
      setGoalkeeperDir(randomCovered);
      timeoutRef.current = setTimeout(() => {
        setResult('goal');
        setPhase('result');
        onGoal(points);
        timeoutRef.current = setTimeout(() => {
          setResult(null);
          setSelectedZone(null);
          setGoalkeeperDir(null);
          setBallTarget(null);
          setPhase('idle');
        }, 1600);
      }, 700);
    }
  }, [phase, coveredZones, score, onGoal, onMiss]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  // Fit 2:1 canvas into available screen without overflow
  const RATIO = 2 / 1;
  let canvasW = dims.width;
  let canvasH = canvasW / RATIO;
  if (canvasH > dims.height) {
    canvasH = dims.height;
    canvasW = canvasH * RATIO;
  }

  // Outer wrapper centers the game canvas
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
      <div
        style={{
          position: 'relative',
          width: canvasW,
          height: canvasH,
          backgroundImage: `url(${assets.background})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          overflow: 'hidden',
          cursor: phase === 'idle' ? `url(${assets.cursor}) 12 4, crosshair` : 'default',
          flexShrink: 0,
        }}
      >
        {/* HUD */}
        {!hideHUD && <HUD assets={assets} score={score} misses={misses} musicOn={musicOn} toggleMusic={toggleMusic} />}

        {/* Goal Grid (clickable zones) */}
        <GoalGrid
          assets={assets}
          phase={phase}
          onZoneClick={handleZoneClick}
        />

        {/* Goalkeeper */}
        <GoalkeeperDisplay
          assets={assets}
          phase={phase}
          goalkeeperDir={goalkeeperDir}
        />

        {/* Ball at rest (idle) */}
        {phase === 'idle' && (
          <img
            src={assets.ball}
            alt="ball"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '12%',
              transform: 'translateX(-50%)',
              width: '10%',
              pointerEvents: 'none',
              zIndex: 2,
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
            }}
          />
        )}

        {/* Ball animation */}
        {ballTarget && (
          <BallAnimation assets={assets} target={ballTarget} phase={phase} result={result} />
        )}

        {/* Result Overlay */}
        {result && <ResultOverlay assets={assets} result={result} />}
      </div>
    </div>
  );
}