import { useState, useEffect } from 'react';

// 6 zones: 2 rows x 3 cols
// Points: top-left=50, top-mid=20, top-right=50, bot-left=30, bot-mid=20, bot-right=30
export const ZONE_POINTS = [50, 20, 50, 30, 20, 30];

export default function GoalGrid({ phase, onZoneClick }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const [blinkState, setBlinkState] = useState(true);

  const isClickable = phase === 'idle';

  // Blink animation
  useEffect(() => {
    if (!isClickable) return;
    const interval = setInterval(() => setBlinkState(b => !b), 500);
    return () => clearInterval(interval);
  }, [isClickable]);

  // Grid positioned over the goal area: background image has goal centered, occupying ~55% width, top 0-48% height
  const gridStyle = {
    position: 'absolute',
    left: '50%',
    top: '5%',
    transform: 'translateX(-50%)',
    width: '62%',
    height: '42%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    zIndex: 4,
    pointerEvents: isClickable ? 'auto' : 'none',
  };

  const zoneColors = {
    50: { bg: 'rgba(255, 200, 0, 0.25)', border: 'rgba(255, 200, 0, 0.8)', text: '#ffe066' },
    30: { bg: 'rgba(100, 220, 255, 0.2)', border: 'rgba(100, 220, 255, 0.8)', text: '#7de8ff' },
    20: { bg: 'rgba(150, 255, 150, 0.18)', border: 'rgba(150, 255, 150, 0.7)', text: '#90ff90' },
  };

  return (
    <div style={gridStyle} onClick={e => e.stopPropagation()}>
      {ZONE_POINTS.map((points, i) => {
        const isHovered = hoveredZone === i;
        const colors = zoneColors[points];
        const visible = isHovered || blinkState;

        return (
          <div
            key={i}
            onMouseEnter={() => isClickable && setHoveredZone(i)}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={(e) => {
              if (!isClickable) return;
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              onZoneClick(i, {
                x: (cx / window.innerWidth) * 100,
                y: (cy / window.innerHeight) * 100,
              });
            }}
            style={{
              border: `2px solid ${visible ? colors.border : 'rgba(255,255,255,0.1)'}`,
              background: isHovered ? colors.bg : visible ? colors.bg.replace('0.25', '0.12').replace('0.2', '0.1').replace('0.18', '0.08') : 'transparent',
              transition: 'background 0.15s, border 0.15s',
              cursor: isClickable ? 'pointer' : 'default',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Points label */}
            <span style={{
              color: visible ? colors.text : 'transparent',
              fontFamily: 'Arial Black, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(10px, 2.5%, 22px)',
              textShadow: `0 0 8px ${colors.border}, 0 2px 4px rgba(0,0,0,0.8)`,
              transition: 'color 0.15s',
              userSelect: 'none',
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
            }}>
              {points}
            </span>
          </div>
        );
      })}
    </div>
  );
}