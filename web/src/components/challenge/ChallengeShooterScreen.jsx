import { useState, useEffect, useRef, useCallback } from 'react';
import { Target } from 'lucide-react';
import { ZONE_POINTS } from '@/components/game/GoalGrid';

const BG = '/mondialito-assets/images/background_goalpost.png';
const BALL_URL = '/mondialito-assets/images/ball.png';
const GK_IDLE = '/mondialito-assets/images/goalkeeper_idle.png';
const GK_JUMP = '/mondialito-assets/images/goalkeeper_jumping.png';

const ZONE_POSITIONS = [
  { x: 32, y: 15 }, { x: 50, y: 15 }, { x: 68, y: 15 },
  { x: 32, y: 30 }, { x: 50, y: 30 }, { x: 68, y: 30 },
];

const zoneColors = {
  50: { bg: 'rgba(255,200,0,0.25)', border: 'rgba(255,200,0,0.8)', text: '#ffe066' },
  30: { bg: 'rgba(100,220,255,0.2)', border: 'rgba(100,220,255,0.8)', text: '#7de8ff' },
  20: { bg: 'rgba(150,255,150,0.18)', border: 'rgba(150,255,150,0.7)', text: '#90ff90' },
};

function getDiveStyle(zoneIndex) {
  if (zoneIndex === null || zoneIndex === undefined) return {};
  const col = zoneIndex % 3;
  const row = Math.floor(zoneIndex / 3);
  let translateX = '0', translateY = '0', scaleX = 1, rotate = '0deg';
  if (row === 0) {
    translateY = '-30%';
    if (col === 0) return { transform: 'translateX(-100%) translateY(-30%) scaleX(-1) rotate(15deg)', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' };
    else if (col === 2) { translateX = '100%'; rotate = '15deg'; }
  } else {
    translateY = '10%';
    if (col === 0) { translateX = '-60%'; scaleX = -1; }
    else if (col === 2) { translateX = '60%'; }
  }
  return { transform: `translateX(${translateX}) translateY(${translateY}) scaleX(${scaleX}) rotate(${rotate})`, transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' };
}
function getSlideStyle(zoneIndex) {
  const col = zoneIndex % 3;
  if (col === 0) return { transform: 'translateX(-100%)', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' };
  if (col === 2) return { transform: 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' };
  return { transform: 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' };
}

// gkChoicesPerRound: [[z,z,z], ...] — opponent's goalkeeper choices per round
// onComplete(shotZones): called with array of all shot zone indices
export default function ChallengeShooterScreen({ totalRounds = 5, gkChoicesPerRound = [], isTiebreak = false, onComplete }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [allShots, setAllShots] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [shotZone, setShotZone] = useState(null);
  const [result, setResult] = useState(null);
  const [gkZone, setGkZone] = useState(null);
  const [ballPos, setBallPos] = useState(null);
  const [idleOffset, setIdleOffset] = useState(0);
  const timeoutRef = useRef(null);
  const animRef = useRef(null);

  // Idle oscillation — same as GoalkeeperDisplay
  useEffect(() => {
    if (phase !== 'idle') { cancelAnimationFrame(animRef.current); return; }
    let offset = 0, dir = 1, lastTime = null;
    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      offset += dir * 60 * dt;
      if (offset > 40) { offset = 40; dir = -1; }
      if (offset < -40) { offset = -40; dir = 1; }
      setIdleOffset(offset);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const shoot = (zoneIndex) => {
    if (phase !== 'idle') return;
    setPhase('kicking');
    setShotZone(zoneIndex);
    // Ball starts at player position (bottom center)
    setBallPos({ x: 50, y: 85, rotate: 0 });

    const gkCovered = gkChoicesPerRound[currentRound] || [];
    const isSaved = gkCovered.includes(zoneIndex);
    const gkDiveZone = isSaved ? zoneIndex : (gkCovered[Math.floor(Math.random() * gkCovered.length)] ?? zoneIndex);
    setGkZone(gkDiveZone);

    // Animate ball flight
    const targetPos = ZONE_POSITIONS[zoneIndex];
    const startTime = Date.now();
    const duration = 600;

    const animateBall = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for realistic deceleration
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setBallPos(prev => ({
        x: 50 + (targetPos.x - 50) * ease,
        y: 85 + (targetPos.y - 85) * ease,
        rotate: progress * 720 // 2 full rotations during flight
      }));

      if (progress < 1) {
        requestAnimationFrame(animateBall);
      } else {
        // Ball reached target
        setPhase('shooting');
        timeoutRef.current = setTimeout(() => {
          setResult(isSaved ? 'saved' : 'goal');
          timeoutRef.current = setTimeout(() => {
            const newShots = [...allShots, zoneIndex];
            if (newShots.length < totalRounds) {
              setAllShots(newShots);
              setCurrentRound(r => r + 1);
              setPhase('idle');
              setShotZone(null);
              setResult(null);
              setGkZone(null);
              setBallPos(null);
            } else {
              onComplete(newShots);
            }
          }, 1400);
        }, 700);
      }
    };

    requestAnimationFrame(animateBall);
  };

  // Goalkeeper render
  const isBottomZone = gkZone !== null && Math.floor(gkZone / 3) === 1;
  const isDiving = gkZone !== null && !isBottomZone;
  const isSliding = gkZone !== null && isBottomZone;
  const gkImgStyle = isDiving
    ? getDiveStyle(gkZone)
    : isSliding
    ? getSlideStyle(gkZone)
    : phase === 'idle'
    ? { transform: `translateX(${idleOffset}px)`, transition: 'none' }
    : { transform: 'translateX(0)', transition: 'none' };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, background: 'rgba(0,0,0,0.8)', borderRadius: 20, padding: '8px 20px',
        display: 'flex', alignItems: 'center', gap: 12, color: '#fff', fontWeight: 700, fontSize: 13,
        border: '1px solid rgba(255,107,0,0.4)', whiteSpace: 'nowrap',
      }}>
        <Target size={16} color="#ff6b00" />
        <span style={{ color: '#ff6b00' }}>
          {isTiebreak ? 'Tiebreak — Tir' : `Tir ${currentRound + 1}/${totalRounds}`}
        </span>
        <span style={{ color: '#aaa' }}>|</span>
        <span style={{ fontSize: 12 }}>
          {phase === 'idle' ? 'Choisissez où tirer' : result === 'goal' ? '⚽ BUT !' : result === 'saved' ? '🧤 SAUVÉ !' : '...'}
        </span>
      </div>

      {/* Round progress dots */}
      {!isTiebreak && (
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 50 }}>
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < currentRound ? '#58D68D' : i === currentRound ? '#ff6b00' : 'rgba(255,255,255,0.2)',
            }} />
          ))}
        </div>
      )}

      {/* Game container */}
      <div style={{
        position: 'relative', aspectRatio: '2 / 1', height: '100%', maxWidth: '100%',
        backgroundImage: `url(${BG})`, backgroundSize: '100% 100%',
        overflow: 'hidden', flexShrink: 0,
        cursor: phase === 'idle' ? 'crosshair' : 'default',
      }}>
        {/* Goal grid */}
        <div style={{
          position: 'absolute', left: '50%', top: '5%', transform: 'translateX(-50%)',
          width: '62%', height: '42%',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)',
          zIndex: 10, pointerEvents: phase === 'idle' ? 'auto' : 'none',
        }}>
          {ZONE_POINTS.map((points, i) => {
            const colors = zoneColors[points];
            const isShot = shotZone === i;
            return (
              <div key={i} onClick={() => shoot(i)} style={{
                border: `2px solid ${isShot ? '#ff6b00' : colors.border}`,
                background: isShot ? 'rgba(255,107,0,0.3)' : colors.bg,
                cursor: 'pointer', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                <span style={{ color: colors.text, fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 'clamp(10px,2.5%,22px)', textShadow: `0 0 8px ${colors.border}`, userSelect: 'none' }}>
                  {points}
                </span>
              </div>
            );
          })}
        </div>

        {/* Goalkeeper */}
        <div style={{ position: 'absolute', left: '50%', top: '14%', transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none', width: '18%', height: '38%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={isDiving ? GK_JUMP : GK_IDLE} alt="goalkeeper" style={{ width: '100%', height: '100%', objectFit: 'contain', ...gkImgStyle }} />
        </div>

        {/* Ball idle */}
        {phase === 'idle' && (
          <img src={BALL_URL} alt="ball" style={{ position: 'absolute', left: '50%', bottom: '12%', transform: 'translateX(-50%)', width: '10%', pointerEvents: 'none', zIndex: 6, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }} />
        )}

        {/* Ball animation with trajectory and spin */}
        {ballPos && (
          <img src={BALL_URL} alt="ball" style={{
            position: 'absolute',
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: `translate(-50%, -50%) rotate(${ballPos.rotate || 0}deg)`,
            width: phase === 'idle' ? '10%' : phase === 'kicking' ? '8%' : '6%',
            pointerEvents: 'none',
            zIndex: 6,
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
            transition: phase === 'kicking' ? 'none' : 'width 0.3s ease-out',
          }} />
        )}

        {/* Result overlay */}
        {result && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
            <div style={{
              fontSize: 'clamp(32px,8%,72px)', fontFamily: 'Arial Black, sans-serif', fontWeight: 900,
              color: result === 'goal' ? '#FFD700' : '#FF4444',
              textShadow: `0 0 30px ${result === 'goal' ? 'rgba(255,215,0,0.8)' : 'rgba(255,68,68,0.8)'}`,
              animation: 'resultPop 0.3s ease-out',
            }}>
              {result === 'goal' ? 'BUT ! ⚽' : 'SAUVÉ ! 🧤'}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes resultPop { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}