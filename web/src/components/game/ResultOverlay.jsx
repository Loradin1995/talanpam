import { useEffect, useState } from 'react';

export default function ResultOverlay({ assets, result }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay then pop in
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [result]);

  const imgSrc = result === 'goal' ? assets.goal
    : result === 'saved' ? assets.saved
    : assets.out;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <img
        src={imgSrc}
        alt={result}
        style={{
          width: 'min(480px, 75vw)',
          transform: visible ? 'scale(1)' : 'scale(0.3)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
          filter: 'drop-shadow(0 0 32px rgba(0,0,0,0.8))',
        }}
      />
    </div>
  );
}