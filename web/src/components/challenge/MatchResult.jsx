import { Trophy, Swords, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MatchResult({ match, userId, room, onClose }) {
  const isPlayer1 = match.player1Id === userId;
  const myScore = isPlayer1 ? (match.player1Score || 0) : (match.player2Score || 0);
  const opponentScore = isPlayer1 ? (match.player2Score || 0) : (match.player1Score || 0);
  const isWinner = match.winnerId === userId;
  const isDraw = !match.winnerId && match.status === 'finished';

  return (
    <div style={{
      width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#131929', borderRadius: 20, padding: '32px 28px',
        textAlign: 'center', maxWidth: 380, width: '100%',
        border: `2px solid ${isWinner ? 'rgba(255,215,0,0.5)' : isDraw ? 'rgba(150,150,150,0.3)' : 'rgba(255,68,68,0.3)'}`,
        boxShadow: `0 0 40px ${isWinner ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.5)'}`,
      }}>
        {/* Icon */}
        <div style={{ marginBottom: 16 }}>
          {isWinner ? (
            <Trophy size={56} color="#ffd700" style={{ filter: 'drop-shadow(0 0 16px rgba(255,215,0,0.6))' }} />
          ) : isDraw ? (
            <Minus size={56} color="#aaa" />
          ) : (
            <Swords size={56} color="#EC7063" />
          )}
        </div>

        {/* Result title */}
        <h2 style={{ color: '#fff', margin: '0 0 4px', fontSize: 24, fontWeight: 900 }}>
          {isWinner ? 'Victoire ! 🎉' : isDraw ? 'Égalité !' : 'Défaite'}
        </h2>
        <p style={{ color: '#aaa', fontSize: 12, marginBottom: 24 }}>
          {isWinner ? 'Ou genyen ! Bravo !' : isDraw ? 'Match nul' : 'Ou pèdi. Bon chans pwochen fwa !'}
        </p>

        {/* Scores */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24,
          background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 24px',
        }}>
          <div>
            <div style={{ color: '#5DADE2', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>VOUS / OU</div>
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>{myScore}</div>
          </div>
          <div style={{ color: '#aaa', fontSize: 20, fontWeight: 700 }}>vs</div>
          <div>
            <div style={{ color: '#EC7063', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>ADVERSAIRE</div>
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>{opponentScore}</div>
          </div>
        </div>

        {/* Prize info */}
        {isWinner && (
          <div style={{
            background: 'rgba(255,215,0,0.1)', borderRadius: 12, padding: '12px 16px',
            border: '1px solid rgba(255,215,0,0.3)', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <TrendingUp size={16} color="#ffd700" />
            <span style={{ color: '#ffd700', fontWeight: 800, fontSize: 16 }}>
              +{Number(room?.prize || 0).toLocaleString()} HTG
            </span>
            <span style={{ color: '#aaa', fontSize: 12 }}>crédités</span>
          </div>
        )}
        {isDraw && (
          <div style={{
            background: 'rgba(93,173,226,0.1)', borderRadius: 12, padding: '12px 16px',
            border: '1px solid rgba(93,173,226,0.3)', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <TrendingUp size={16} color="#5DADE2" />
            <span style={{ color: '#5DADE2', fontWeight: 800, fontSize: 16 }}>
              +{Number(room?.entryCost || 0).toLocaleString()} HTG remboursés
            </span>
          </div>
        )}
        {!isWinner && !isDraw && (
          <div style={{
            background: 'rgba(255,68,68,0.08)', borderRadius: 12, padding: '12px 16px',
            border: '1px solid rgba(255,68,68,0.2)', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <TrendingDown size={16} color="#EC7063" />
            <span style={{ color: '#EC7063', fontWeight: 800, fontSize: 16 }}>
              -{Number(room?.entryCost || 0).toLocaleString()} HTG
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', background: '#5DADE2', color: '#fff',
            border: 'none', borderRadius: 12, padding: '14px',
            fontWeight: 800, fontSize: 15, cursor: 'pointer', minHeight: 48,
          }}
        >
          Retour au lobby / Retounen lobby
        </button>
      </div>
    </div>
  );
}