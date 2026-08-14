import { useState } from 'react';
import { Play, Clock, ChevronRight } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'Tous les matchs' },
  { id: 'live', label: '🔴 En direct' },
  { id: 'today', label: "Aujourd'hui" },
  { id: 'tomorrow', label: 'Demain' },
  { id: 'week', label: 'Cette semaine' },
];

const MOCK_MATCHES = [
  { id: 1, league: 'Ligue 1 - France', flag: '🇫🇷', team1: 'Paris Saint-Germain', team2: 'Olympique de Marseille', time: '21:00', status: 'live', score: '2 - 1', isTop: true },
  { id: 2, league: 'Premier League - Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team1: 'Manchester City', team2: 'Arsenal', time: '20:45', status: 'upcoming', score: null, isTop: true },
  { id: 3, league: 'La Liga - Espagne', flag: '🇪🇸', team1: 'Real Madrid', team2: 'FC Barcelona', time: '22:00', status: 'upcoming', score: null, isTop: false },
  { id: 4, league: 'Serie A - Italie', flag: '🇮🇹', team1: 'Juventus', team2: 'Inter Milan', time: '20:00', status: 'live', score: '1 - 1', isTop: false },
  { id: 5, league: 'Bundesliga - Allemagne', flag: '🇩🇪', team1: 'Bayern Munich', team2: 'Borussia Dortmund', time: '18:30', status: 'finished', score: '3 - 2', isTop: false },
  { id: 6, league: 'Champions League', flag: '🏆', team1: 'Atletico Madrid', team2: 'Porto', time: '21:00', status: 'upcoming', score: null, isTop: false },
];

const COMPETITIONS = [
  { name: 'Ligue 1', flag: '🇫🇷', country: 'France', matches: 10 },
  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Angleterre', matches: 10 },
  { name: 'La Liga', flag: '🇪🇸', country: 'Espagne', matches: 10 },
  { name: 'Serie A', flag: '🇮🇹', country: 'Italie', matches: 10 },
  { name: 'Bundesliga', flag: '🇩🇪', country: 'Allemagne', matches: 9 },
  { name: 'Champions League', flag: '🏆', country: 'UEFA', matches: 8 },
];

const GAME_MODES = [
  { icon: '🏆', label: 'Tournois', sub: 'Jackpot cumulatif', color: '#FEF9E7', border: '#F9E79F', btn: '#F0B429', path: '/tournament' },
  { icon: '⚔️', label: 'Défis 1v1', sub: 'Affrontez un joueur', color: '#EBF5FB', border: '#AED6F1', btn: '#5DADE2', path: '/challenge' },
  { icon: '🎮', label: 'Entraînement', sub: 'Jouez gratuitement', color: '#EAFAF1', border: '#A9DFBF', btn: '#58D68D', path: '/free-play' },
];

export default function MatchCenter({ activeSport, loading, navigate }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredMatches = MOCK_MATCHES.filter(m => {
    if (activeFilter === 'live') return m.status === 'live';
    if (activeFilter === 'today') return m.status !== 'finished';
    return true;
  });

  if (loading) return <MatchSkeleton />;

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Game mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {GAME_MODES.map(mode => (
          <div
            key={mode.label}
            onClick={() => navigate(mode.path)}
            style={{
              background: mode.color, border: `1px solid ${mode.border}`,
              borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; }}
          >
            <span style={{ fontSize: 28 }}>{mode.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2C3E50' }}>{mode.label}</div>
              <div style={{ fontSize: 11, color: '#566573' }}>{mode.sub}</div>
            </div>
            <div style={{
              background: mode.btn, color: '#fff', borderRadius: 8,
              padding: '5px 10px', fontSize: 11, fontWeight: 700,
            }}>Jouer</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(93,173,226,0.07)',
        border: '1px solid #EBF5FB',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: activeFilter === f.id ? '#5DADE2' : '#F4F6F7',
                color: activeFilter === f.id ? '#fff' : '#566573',
                transition: 'all 0.15s',
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Matches Table */}
      <div style={{
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 10px rgba(93,173,226,0.07)',
        border: '1px solid #EBF5FB', overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px 100px',
          padding: '10px 16px', background: '#F4F6F7',
          borderBottom: '1px solid #EBF5FB',
          fontSize: 11, fontWeight: 700, color: '#85C1E9', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <span>Match</span>
          <span style={{ textAlign: 'center' }}>Heure</span>
          <span style={{ textAlign: 'center' }}>Statut</span>
          <span style={{ textAlign: 'center' }}>Score</span>
          <span style={{ textAlign: 'center' }}>Actions</span>
        </div>

        {filteredMatches.map((match, idx) => (
          <MatchRow key={match.id} match={match} isLast={idx === filteredMatches.length - 1} />
        ))}
      </div>

      {/* Competitions */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#2C3E50', marginBottom: 10, paddingLeft: 2 }}>
          🏆 Compétitions populaires
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {COMPETITIONS.map(comp => (
            <CompetitionCard key={comp.name} comp={comp} />
          ))}
        </div>
      </div>
    </main>
  );
}

function MatchRow({ match, isLast }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px 100px',
      padding: '12px 16px',
      borderBottom: isLast ? 'none' : '1px solid #F4F6F7',
      transition: 'background 0.15s', alignItems: 'center',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#F8FCFF'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      {/* Teams */}
      <div>
        <div style={{ fontSize: 10, color: '#85C1E9', fontWeight: 600, marginBottom: 4 }}>
          {match.flag} {match.league}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{match.team1}</div>
        <div style={{ fontSize: 12, color: '#566573', marginTop: 2 }}>{match.team2}</div>
      </div>
      {/* Time */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <Clock size={11} color="#85C1E9" />
          <span style={{ fontSize: 12, color: '#566573' }}>{match.time}</span>
        </div>
      </div>
      {/* Status */}
      <div style={{ textAlign: 'center' }}>
        {match.status === 'live' && (
          <span style={{
            background: '#FDEDEC', color: '#EC7063', borderRadius: 8,
            padding: '3px 8px', fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EC7063', display: 'inline-block' }} />
            LIVE
          </span>
        )}
        {match.status === 'upcoming' && (
          <span style={{ background: '#EBF5FB', color: '#5DADE2', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
            À venir
          </span>
        )}
        {match.status === 'finished' && (
          <span style={{ background: '#F4F6F7', color: '#566573', borderRadius: 8, padding: '3px 8px', fontSize: 11 }}>
            Terminé
          </span>
        )}
      </div>
      {/* Score */}
      <div style={{ textAlign: 'center' }}>
        {match.score ? (
          <span style={{ fontSize: 14, fontWeight: 800, color: '#2C3E50', fontVariantNumeric: 'tabular-nums' }}>
            {match.score}
          </span>
        ) : (
          <span style={{ color: '#BDC3C7', fontSize: 12 }}>- vs -</span>
        )}
      </div>
      {/* Action */}
      <div style={{ textAlign: 'center' }}>
        <button style={{
          background: '#EBF5FB', color: '#5DADE2', border: 'none',
          borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#5DADE2'}
          onMouseLeave={e => e.currentTarget.style.background = '#EBF5FB'}
        >
          <Play size={10} /> Voir
        </button>
      </div>
    </div>
  );
}

function CompetitionCard({ comp }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '12px 14px',
      border: '1px solid #EBF5FB',
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', transition: 'all 0.15s',
      boxShadow: '0 1px 6px rgba(93,173,226,0.06)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#5DADE2'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(93,173,226,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBF5FB'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(93,173,226,0.06)'; }}
    >
      <span style={{ fontSize: 24 }}>{comp.flag}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{comp.name}</div>
        <div style={{ fontSize: 11, color: '#566573' }}>{comp.country} · {comp.matches} matchs</div>
      </div>
      <ChevronRight size={14} color="#85C1E9" />
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: '#fff', borderRadius: 14, padding: 16,
          boxShadow: '0 2px 10px rgba(93,173,226,0.07)',
        }}>
          {[1, 2, 3].map(j => (
            <div key={j} style={{
              height: 52, background: 'linear-gradient(90deg, #F4F6F7 25%, #EBF5FB 50%, #F4F6F7 75%)',
              borderRadius: 8, marginBottom: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}