import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Activity, RefreshCw, Clock, User, Swords, Trophy, XCircle, Crown, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_LABELS = {
  waiting: { label: 'En attente', color: '#F39C12', bg: '#FEF9E7' },
  gk_selection: { label: 'Sélection gardien', color: '#5DADE2', bg: '#EBF5FB' },
  shooting: { label: 'Phase de tir', color: '#E74C3C', bg: '#FDEDEC' },
  tiebreak_gk: { label: 'Tiebreak - Gardien', color: '#8E44AD', bg: '#F5EEF8' },
  tiebreak_shooting: { label: 'Tiebreak - Tir', color: '#C0392B', bg: '#FDEDEC' },
};

function playerName(p) {
  if (!p) return null;
  return p.kyc?.username || p.kyc?.firstName || p.email?.split('@')[0] || p.id;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function AdminLiveMatchesPanel() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // matchId being actioned
  const [confirmCancel, setConfirmCancel] = useState(null); // matchId awaiting confirm

  const fetchMatches = async () => {
    const live = await api.admin.liveMatches();
    setMatches(live);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      fetchMatches();
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Just re-render every second for the timer
  useEffect(() => {
    const t = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Sèvè a soti ranbouse toude jwè yo epi make match la abandone.
  const handleCancelMatch = async (match) => {
    setActionLoading(match.id);
    try { await api.admin.cancelMatch(match.id); } catch { /* ignore */ }
    setConfirmCancel(null);
    setActionLoading(null);
    fetchMatches();
  };

  // Fòse yon viktwa — sèvè a kredite genyan an atravè applyWalletTransaction.
  const handleForceWin = async (match, winnerId) => {
    setActionLoading(match.id);
    try { await api.admin.forceWinMatch(match.id, winnerId); } catch { /* ignore */ }
    setActionLoading(null);
    fetchMatches();
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#85C1E9' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #D6EAF8', borderTopColor: '#5DADE2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#E74C3C" />
          <span style={{ fontWeight: 700, color: '#2C3E50', fontSize: 15 }}>Matchs en cours</span>
          {matches.length > 0 && (
            <span style={{ background: '#E74C3C', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {matches.length} LIVE
            </span>
          )}
        </div>
        <button onClick={fetchMatches} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EBF5FB', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#5DADE2', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#BDC3C7' }}>
          <Swords size={36} color="#D6EAF8" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>Aucun match en cours</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Actualisation automatique toutes les 5s</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {matches.map(match => {
            const phase = match.status === 'waiting' ? 'waiting' : (match.state?.phase || 'gk_selection');
            const statusInfo = STATUS_LABELS[phase] || { label: phase, color: '#566573', bg: '#F4F6F7' };
            const room = match.room;
            const timeSinceUpdate = Date.now() - new Date(match.updatedAt).getTime();
            const isStale = timeSinceUpdate > 3 * 60 * 1000; // > 3 min inactive
            const p1Gk = (match.state?.p1?.gk || []).length;
            const p1Shots = (match.state?.p1?.shots || []).length;
            const p2Gk = (match.state?.p2?.gk || []).length;
            const p2Shots = (match.state?.p2?.shots || []).length;

            return (
              <div key={match.id} style={{
                border: `1px solid ${isStale ? '#FDEDEC' : '#EBF5FB'}`,
                borderRadius: 12, padding: '14px 16px',
                background: isStale ? '#FFFAFA' : '#fff',
                position: 'relative',
              }}>
                {/* Stale warning */}
                {isStale && (
                  <div style={{ position: 'absolute', top: 10, right: 12, background: '#FDEDEC', color: '#E74C3C', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}>
                    ⚠ Inactif {timeAgo(match.updatedAt)}
                  </div>
                )}

                {/* Room + status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {room && <Trophy size={13} color={room.color || '#5DADE2'} />}
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#2C3E50' }}>{room?.name || 'Salle inconnue'}</span>
                  <span style={{
                    background: statusInfo.bg, color: statusInfo.color,
                    fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px',
                  }}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Players */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ background: '#EBF5FB', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                      <User size={11} color="#5DADE2" />
                      <span style={{ fontSize: 10, color: '#85C1E9', fontWeight: 600 }}>J1</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {playerName(match.player1) || '...'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#5DADE2', marginTop: 2 }}>{match.player1Score ?? 0} pts</div>
                    <div style={{ fontSize: 10, color: '#85C1E9', marginTop: 2 }}>
                      🛡 {p1Gk}/5 défenses · ⚽ {p1Shots}/5 tirs
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontWeight: 900, color: '#BDC3C7', fontSize: 16 }}>VS</div>

                  <div style={{ background: '#FEF9E7', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                      <User size={11} color="#F39C12" />
                      <span style={{ fontSize: 10, color: '#F9C74F', fontWeight: 600 }}>J2</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }}>
                      {match.player2Id ? (playerName(match.player2) || '...') : 'En attente...'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#F39C12', marginTop: 2 }}>{match.player2Score ?? 0} pts</div>
                    <div style={{ fontSize: 10, color: '#F9C74F', marginTop: 2 }}>
                      🛡 {p2Gk}/5 défenses · ⚽ {p2Shots}/5 tirs
                    </div>
                  </div>
                </div>

                {/* Footer: mise + timer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#AEB6BF', marginBottom: 10 }}>
                  <span>Mise : <strong style={{ color: '#EC7063' }}>{Number(match.entryCost).toLocaleString()} HTG</strong> · Gain : <strong style={{ color: '#58D68D' }}>{Number(match.prize).toLocaleString()} HTG</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    Màj il y a {timeAgo(match.updatedAt)}
                  </span>
                </div>

                {/* Admin actions toggle */}
                <button onClick={() => setExpandedId(expandedId === match.id ? null : match.id)} style={{
                  width: '100%', background: '#F4F6F7', border: '1px solid #EBF5FB',
                  borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600, color: '#566573',
                }}>
                  {expandedId === match.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  Actions admin
                </button>

                {/* Expanded actions */}
                {expandedId === match.id && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>

                    {/* Force win buttons */}
                    {match.player2Id && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button
                          disabled={actionLoading === match.id}
                          onClick={() => handleForceWin(match, match.player1Id)}
                          style={{ background: '#EBF5FB', border: '1px solid #AED6F1', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#2471A3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                        >
                          <Crown size={13} /> Victoire J1
                        </button>
                        <button
                          disabled={actionLoading === match.id}
                          onClick={() => handleForceWin(match, match.player2Id)}
                          style={{ background: '#FEF9E7', border: '1px solid #F9C74F', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#B7950B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                        >
                          <Crown size={13} /> Victoire J2
                        </button>
                      </div>
                    )}

                    {/* Cancel match */}
                    {confirmCancel === match.id ? (
                      <div style={{ background: '#FDEDEC', border: '1px solid #F1948A', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#E74C3C', marginBottom: 8 }}>
                          Confirmer l'annulation ? Les deux joueurs seront remboursés.
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            disabled={actionLoading === match.id}
                            onClick={() => handleCancelMatch(match)}
                            style={{ flex: 1, background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                          >
                            {actionLoading === match.id ? '...' : 'Confirmer'}
                          </button>
                          <button onClick={() => setConfirmCancel(null)} style={{ flex: 1, background: '#F4F6F7', border: 'none', borderRadius: 8, padding: '8px', fontWeight: 600, fontSize: 12, cursor: 'pointer', color: '#566573' }}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(match.id)}
                        style={{ background: '#FDEDEC', border: '1px solid #F1948A', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#E74C3C', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <XCircle size={13} /> Annuler le match + rembourser
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
