import { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { ZONE_POINTS } from '@/components/game/GoalGrid';

const BG = '/mondialito-assets/images/background_goalpost.png';
const ROUNDS = 5;
const ZONES_TO_COVER = 3;

export default function ChallengeGoalkeeperScreen({ roundIndex, totalRounds = ROUNDS, onRoundSubmit }) {
  const [selected, setSelected] = useState([]);

  const toggleZone = (i) => {
    if (selected.includes(i)) {
      setSelected(selected.filter(z => z !== i));
    } else if (selected.length < ZONES_TO_COVER) {
      setSelected([...selected, i]);
    }
  };

  const handleValidate = () => {
    if (selected.length === ZONES_TO_COVER) {
      onRoundSubmit(selected);
      setSelected([]);
    }
  };

  const zoneColors = {
    50: { bg: 'rgba(255,200,0,0.35)', border: '#ffe066', text: '#ffe066' },
    30: { bg: 'rgba(100,220,255,0.3)', border: '#7de8ff', text: '#7de8ff' },
    20: { bg: 'rgba(150,255,150,0.25)', border: '#90ff90', text: '#90ff90' },
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Top HUD */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, background: 'rgba(0,0,0,0.75)', borderRadius: 20, padding: '8px 20px',
        display: 'flex', alignItems: 'center', gap: 12, color: '#fff', fontWeight: 700, fontSize: 13,
        border: '1px solid rgba(93,173,226,0.4)',
      }}>
        <Shield size={16} color="#5DADE2" />
        <span style={{ color: '#5DADE2' }}>Manche {roundIndex + 1}/{totalRounds}</span>
        <span style={{ color: '#aaa' }}>|</span>
        <span>Choisissez {ZONES_TO_COVER} zones à garder</span>
        <span style={{ color: '#aaa' }}>|</span>
        <span style={{ color: selected.length === ZONES_TO_COVER ? '#58D68D' : '#FF8C00' }}>
          {selected.length}/{ZONES_TO_COVER} sélectionnées
        </span>
      </div>

      {/* Game container */}
      <div style={{
        position: 'relative',
        aspectRatio: '2 / 1',
        height: '100%',
        maxWidth: '100%',
        backgroundImage: `url(${BG})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Goal grid - goalkeeper selection */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '5%',
          transform: 'translateX(-50%)',
          width: '62%', height: '42%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          zIndex: 10,
        }}>
          {ZONE_POINTS.map((points, i) => {
            const isSelected = selected.includes(i);
            const colors = zoneColors[points];
            return (
              <div
                key={i}
                onClick={() => toggleZone(i)}
                style={{
                  border: `3px solid ${isSelected ? '#fff' : colors.border}`,
                  background: isSelected ? 'rgba(255,255,255,0.4)' : colors.bg,
                  cursor: 'pointer',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Shield size={20} color="#fff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }} />
                  </div>
                )}
                {!isSelected && (
                  <span style={{
                    color: colors.text,
                    fontFamily: 'Arial Black, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(10px, 2.5%, 22px)',
                    textShadow: `0 0 8px ${colors.border}`,
                    userSelect: 'none',
                  }}>
                    {points}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Validate button */}
        <div style={{
          position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 20,
        }}>
          <button
            onClick={handleValidate}
            disabled={selected.length < ZONES_TO_COVER}
            style={{
              background: selected.length === ZONES_TO_COVER ? '#5DADE2' : 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: `2px solid ${selected.length === ZONES_TO_COVER ? '#5DADE2' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: 12,
              padding: '12px 32px',
              fontSize: 15, fontWeight: 800,
              cursor: selected.length === ZONES_TO_COVER ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
              minHeight: 48,
            }}
          >
            <CheckCircle size={18} />
            Valider ma défense / Valide defans mwen
          </button>
        </div>
      </div>

      {/* Instructions bottom */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', zIndex: 50,
      }}>
        Klike sou 3 zòn pou pwoteje pòt la / Cliquez sur 3 zones à protéger
      </div>
    </div>
  );
}