import { useState, useEffect } from 'react';

function getRemaining(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    ended: false,
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ endDate, label = 'Le tournoi se termine dans', variant = 'inline' }) {
  const [time, setTime] = useState(() => getRemaining(endDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!time) return null;
  if (time.ended) {
    return <span style={{ color: '#EC7063', fontWeight: 700, fontSize: 14 }}>Tournoi terminé</span>;
  }

  const units = [
    { v: time.d, u: 'j' },
    { v: time.h, u: 'h' },
    { v: time.m, u: 'm' },
    { v: time.s, u: 's' },
  ];

  // Big "flip" style block variant
  if (variant === 'block') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#566573', fontSize: 13, marginBottom: 10 }}>{label}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {units.map(({ v, u }, i) => (
            <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {pad(v).split('').map((digit, di) => (
                  <div key={di} style={{
                    width: 34, height: 44, background: '#5b6b8c', borderRadius: 8,
                    color: '#fff', fontSize: 24, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
                    position: 'relative',
                  }}>
                    {digit}
                    {i === 0 && di === 1 && (
                      <span style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{u}</span>
                    )}
                  </div>
                ))}
              </div>
              {i < units.length - 1 && <span style={{ color: '#5b6b8c', fontWeight: 800, fontSize: 22 }}>:</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Inline variant (used on banner card)
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      {units.map(({ v, u }, i) => (
        <div key={u} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2C3E50', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{pad(v)}</div>
            <div style={{ fontSize: 10, color: '#85C1E9', marginTop: 2 }}>{u}</div>
          </div>
          {i < units.length - 1 && <span style={{ fontSize: 20, fontWeight: 800, color: '#2C3E50' }}>:</span>}
        </div>
      ))}
    </div>
  );
}