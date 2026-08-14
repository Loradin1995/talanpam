import { useEffect, useState } from 'react';

// Zone index to dive direction (6 zones: 2 rows x 3 cols):
// 0,3 = left zones, 1,4 = center zones, 2,5 = right zones
// Row 0 = top → dive high, Row 1 = bottom → dive low

function getDiveStyle(zoneIndex) {
  if (zoneIndex === null || zoneIndex === undefined) return {};
  const col = zoneIndex % 3; // 0=left, 1=center, 2=right
  const row = Math.floor(zoneIndex / 3); // 0=top, 1=bottom

  let translateX = '0';
  let translateY = '0';
  let scaleX = 1;
  let rotate = '0deg';

  if (row === 0) { // top → high dive
    translateY = '-30%';
    if (col === 0) { // mirror of right: scaleX(-1) then same translate/rotate as right
      return {
        transform: `translateX(-100%) translateY(-30%) scaleX(-1) rotate(15deg)`,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      };
    } else if (col === 2) {
      translateX = '100%';
      rotate = '15deg';
    }
  } else { // bottom
    translateY = '10%';
    if (col === 0) {
      translateX = '-60%';
      scaleX = -1;
    } else if (col === 2) {
      translateX = '60%';
    }
  }

  return {
    transform: `translateX(${translateX}) translateY(${translateY}) scaleX(${scaleX}) rotate(${rotate})`,
    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };
}

// For bottom zones (3,4,5): slide in idle pose to be centered on the target column
// The goal is ~3x the goalkeeper width wide, so each column is ~1 goalkeeper width.
// Left col (3): shift left by ~100% of goalkeeper width → translateX(-100%)
// Center col (4): stay centered
// Right col (5): shift right by ~100% → translateX(100%)
function getSlideStyle(zoneIndex) {
  const col = zoneIndex % 3;
  if (col === 0) return { transform: 'translateX(-100%)', transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' };
  if (col === 2) return { transform: 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' };
  return { transform: 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' };
}

export default function GoalkeeperDisplay({ assets, phase, goalkeeperDir }) {
  const [idleOffset, setIdleOffset] = useState(0);
  const animRef = { current: null };

  // Idle oscillation
  useEffect(() => {
    if (phase !== 'idle') return;
    let offset = 0;
    let dir = 1;
    let lastTime = null;

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

  const isActive = phase === 'shooting' || phase === 'result';
  const isBottomZone = goalkeeperDir !== null && goalkeeperDir !== undefined && Math.floor(goalkeeperDir / 3) === 1;
  const isDiving = isActive && !isBottomZone;
  const isSliding = isActive && isBottomZone;

  let imgStyle = {};
  if (isDiving) {
    imgStyle = getDiveStyle(goalkeeperDir);
  } else if (isSliding) {
    imgStyle = getSlideStyle(goalkeeperDir);
  } else {
    imgStyle = { transform: `translateX(${idleOffset}px)`, transition: 'none' };
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '14%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        pointerEvents: 'none',
        width: '18%',
        height: '38%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={isDiving ? assets.goalkeeper_jumping : assets.goalkeeper_idle}
        alt="goalkeeper"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          ...imgStyle,
        }}
      />
    </div>
  );
}