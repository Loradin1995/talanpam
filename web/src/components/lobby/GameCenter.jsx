import { useEffect, useState } from 'react';
import { Trophy, Gamepad2, Zap } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { api } from '@/api/client';

// Chak jwèt gen yon lyen pou chak mòd li sipòte. Lè yon nouvo jwèt ajoute
// nan baz done a (tab Game), li parèt otomatikman isit la — pa gen bezwen
// modifye kòd frontend lan.
const MODE_META = {
  TOURNAMENT: {
    icon: '🏆', label: 'Tournoi', sub: 'Jackpot cumulatif — tentatives illimitées',
    color: '#FFFBEB', border: '#FDE68A', btn: '#F59E0B', btnText: '#fff',
    badge: 'JACKPOT', badgeColor: '#F59E0B', pathFn: (slug) => `/tournament?game=${slug}`,
  },
  HEAD_TO_HEAD: {
    icon: '⚔️', label: 'Face à face', sub: 'Affrontez un autre joueur en direct',
    color: '#EFF6FF', border: '#BFDBFE', btn: '#5DADE2', btnText: '#fff',
    badge: 'PvP', badgeColor: '#5DADE2', pathFn: (slug) => `/challenge?game=${slug}`,
  },
};

const FREE_PLAY_TILE = {
  icon: '🎮', label: 'Entraînement', sub: 'Mode gratuit — aucun dépôt requis',
  color: '#F0FDF4', border: '#BBF7D0', btn: '#58D68D', btnText: '#fff',
  badge: 'GRATUIT', badgeColor: '#58D68D', path: '/free-play',
};

const HOW_IT_WORKS = [
  { step: '1', icon: '💳', title: 'Rechargez', desc: 'Déposez via MonCash en quelques secondes.' },
  { step: '2', icon: '🎯', title: 'Choisissez', desc: 'Tournoi, Défi 1v1 ou Entraînement gratuit.' },
  { step: '3', icon: '⚽', title: 'Tirez', desc: 'Ciblez la zone, évitez le gardien, marquez.' },
  { step: '4', icon: '💰', title: 'Gagnez', desc: 'Récupérez vos gains directement sur MonCash.' },
];

export default function GameCenter({ loading, navigate }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    api.games.list().then(setGames).catch(() => setGames([])).finally(() => setGamesLoading(false));
  }, []);

  if (loading || gamesLoading) return <GameSkeleton />;

  // Bati yon tuile pou chak konbinezon jwèt × mòd (ex: Penalti-Tounwa, Penalti-Fasafas),
  // plis tuile Entraînement gratis la ki pa fè pati kad jwèt/mòd la.
  const modeTiles = games.flatMap(game => (game.modes || []).map(mode => {
    const meta = MODE_META[mode];
    if (!meta) return null;
    return {
      key: `${game.slug}-${mode}`,
      icon: meta.icon,
      label: `${game.name} — ${meta.label}`,
      sub: meta.sub,
      detail: game.description || meta.sub,
      color: meta.color, border: meta.border, btn: meta.btn, btnText: meta.btnText,
      badge: meta.badge,
      badgeColor: meta.badgeColor,
      path: meta.pathFn(game.slug),
    };
  }).filter(Boolean));

  const GAME_MODES = [...modeTiles, { ...FREE_PLAY_TILE, key: 'free-play', label: FREE_PLAY_TILE.label }];

  const cardCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)';
  const howCols = isMobile ? '1fr 1fr' : 'repeat(4,1fr)';

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #5DADE2 0%, #2E86C1 100%)',
        borderRadius: 16, padding: isMobile ? '20px 18px' : '28px 32px',
        boxShadow: '0 8px 30px rgba(93,173,226,0.35)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20,
          fontSize: isMobile ? 80 : 120, opacity: 0.12, lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none',
        }}>⚽</div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: '#EC7063', color: '#fff', borderRadius: 6,
              padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            }}>⚡ EN LIVE</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Tournoi actif</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: isMobile ? 18 : 26, fontWeight: 900, margin: '0 0 6px', letterSpacing: 0.3 }}>
            MONDIALITO
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 11 : 14, margin: '0 0 14px', maxWidth: 400 }}>
            La plateforme de tirs au but — Tournois, Défis 1v1, Mode entraînement.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/tournament')} style={{
              background: '#fff', color: '#5DADE2', border: 'none', borderRadius: 10,
              padding: isMobile ? '10px 16px' : '10px 22px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 44,
            }}>
              <Trophy size={14} /> Tournois
            </button>
            <button onClick={() => navigate('/free-play')} style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10,
              padding: isMobile ? '10px 16px' : '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 44,
            }}>
              <Gamepad2 size={14} /> Jouer gratuit
            </button>
          </div>
        </div>
      </div>

      {/* Game mode cards */}
      <div>
        <h2 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#2C3E50', marginBottom: 10, paddingLeft: 2 }}>
          Choisissez votre mode de jeu
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: cardCols, gap: isMobile ? 10 : 12 }}>
          {GAME_MODES.map(mode => (
            <div
              key={mode.key || mode.label}
              onClick={() => navigate(mode.path)}
              style={{
                background: mode.color, border: `1.5px solid ${mode.border}`,
                borderRadius: 14, padding: isMobile ? '14px' : '18px', cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 28 }}>{mode.icon}</span>
                <span style={{
                  background: mode.badgeColor, color: '#fff', borderRadius: 6,
                  padding: '2px 7px', fontSize: 10, fontWeight: 700,
                }}>{mode.badge}</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: isMobile ? 13 : 14, color: '#2C3E50', marginBottom: 3 }}>{mode.label}</div>
                <div style={{ fontSize: isMobile ? 11 : 12, color: '#566573', fontWeight: 500 }}>{mode.sub}</div>
                {!isMobile && <div style={{ fontSize: 11, color: '#85C1E9', marginTop: 4 }}>{mode.detail}</div>}
              </div>
              <button style={{
                width: '100%', background: mode.btn, color: mode.btnText,
                border: 'none', borderRadius: 10, padding: '10px',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                minHeight: 44,
              }}>
                <Zap size={13} /> Jouer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: isMobile ? '16px' : '20px',
        boxShadow: '0 2px 10px rgba(93,173,226,0.07)',
        border: '1px solid #EBF5FB',
      }}>
        <h2 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#2C3E50', marginBottom: 12 }}>
          Comment ça marche ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: howCols, gap: isMobile ? 10 : 12 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#EBF5FB', margin: '0 auto 8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>{step.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50', marginBottom: 2 }}>{step.title}</div>
              <div style={{ fontSize: 11, color: '#566573', lineHeight: 1.4 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}

function GameSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[120, 200, 160].map((h, i) => (
        <div key={i} style={{
          height: h, background: 'linear-gradient(90deg, #F4F6F7 25%, #EBF5FB 50%, #F4F6F7 75%)',
          borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}