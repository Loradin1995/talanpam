import { useEffect, useRef, useState } from 'react';

// Ball starts at bottom center of screen and flies to target (% coordinates)
export default function BallAnimation({ assets, target, phase, result }) {
  const [pos, setPos] = useState({ x: 50, y: 85, scale: 1, rotation: 0 });
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const arrivalRef = useRef(null); // position when ball arrives
  const DURATION = 600; // ms fly
  const BOUNCE_DURATION = 700; // ms bounce back

  useEffect(() => {
    if (!target || phase === 'idle') return;

    const startX = 50;
    const startY = 85;
    const endX = target.x;
    const endY = target.y;

    const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * 10;
    const cpY = startY - 30;

    const animate = (time) => {
      if (!startRef.current) startRef.current = time;
      const elapsed = time - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const mt = 1 - ease;
      const x = mt * mt * startX + 2 * mt * ease * cpX + ease * ease * endX;
      const y = mt * mt * startY + 2 * mt * ease * cpY + ease * ease * endY;
      const scale = 1 - ease * 0.55;
      const rotation = ease * 360;

      setPos({ x, y, scale, rotation });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // store arrival position for potential bounce
        arrivalRef.current = { x: endX, y: endY, scale };
      }
    };

    startRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, phase]);

  // Bounce-back effect on save
  useEffect(() => {
    if (result !== 'saved' || !arrivalRef.current) return;

    const { x: fromX, y: fromY, scale: fromScale } = arrivalRef.current;
    // Bounce toward player: go down and slightly back
    const toX = fromX + (Math.random() - 0.5) * 15;
    const toY = fromY + 25;
    const toScale = fromScale + 0.25;

    let startTime = null;
    const bounce = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / BOUNCE_DURATION, 1);
      // ease out bounce
      const ease = 1 - Math.pow(1 - t, 3);

      const x = fromX + (toX - fromX) * ease;
      const y = fromY + (toY - fromY) * ease;
      const scale = fromScale + (toScale - fromScale) * ease;
      const rotation = t * 180;

      setPos({ x, y, scale, rotation });

      if (t < 1) rafRef.current = requestAnimationFrame(bounce);
    };

    rafRef.current = requestAnimationFrame(bounce);
    return () => cancelAnimationFrame(rafRef.current);
  }, [result]);

  if (!target) return null;

  const size = 60;

  return (
    <img
      src={assets.ball}
      alt="ball"
      style={{
        position: 'absolute',
        left: `calc(${pos.x}% - ${(size * pos.scale) / 2}px)`,
        top: `calc(${pos.y}% - ${(size * pos.scale) / 2}px)`,
        width: size * pos.scale,
        height: size * pos.scale,
        pointerEvents: 'none',
        zIndex: 2,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
        transform: `rotate(${pos.rotation}deg)`,
      }}
    />
  );
}