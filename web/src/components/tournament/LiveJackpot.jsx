import { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';

// Casino slot-machine counter effect
function useSlotCounter(target, duration = 1200) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    if (start === end) return;

    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

// Format with digit-by-digit slots (casino effect on change)
function CasinoDigits({ value }) {
  const digits = String(value).split('');
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <span key={i} style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 6,
          padding: '2px 6px',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 22,
          textAlign: 'center',
        }}>
          {d}
        </span>
      ))}
    </span>
  );
}

export default function LiveJackpot({ amount, compact = false }) {
  const animated = useSlotCounter(Math.round(amount || 0));

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg, #1a0533, #2d0a5e)',
        borderRadius: 40, padding: '8px 16px',
        border: '1px solid rgba(255,215,0,0.35)',
        boxShadow: '0 0 18px rgba(255,180,0,0.25)',
      }}>
        <Zap size={14} color="#FFD700" style={{ flexShrink: 0 }} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>JACKPOT</span>
        <span style={{ color: '#FFD700', fontWeight: 900, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>
          {animated.toLocaleString('fr-FR')} HTG
        </span>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 18,
      background: 'linear-gradient(135deg, #0d0022 0%, #1a0046 50%, #0d0022 100%)',
      border: '1px solid rgba(255,215,0,0.3)',
      boxShadow: '0 0 30px rgba(255,180,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      padding: '20px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,180,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        <Zap size={16} color="#FFD700" />
        <span style={{
          color: '#FFD700', fontSize: 11, fontWeight: 800, letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          Jackpot Progressif
        </span>
        <Zap size={16} color="#FFD700" />
      </div>

      <div style={{
        color: '#FFD700', fontSize: 38, fontWeight: 900, lineHeight: 1.1,
        textShadow: '0 0 20px rgba(255,215,0,0.6)',
        letterSpacing: -1,
      }}>
        <CasinoDigits value={animated} />
        <span style={{ fontSize: 18, marginLeft: 8, color: 'rgba(255,215,0,0.8)', fontWeight: 700 }}>HTG</span>
      </div>

      <div style={{
        marginTop: 8, color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600,
      }}>
        ⚡ Augmente à chaque tentative
      </div>

      {/* Decorative pulse ring */}
      <style>{`
        @keyframes jackpotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}