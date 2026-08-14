import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/api/client';
import PageLayout from '@/components/layout/PageLayout';
import ChallengeMatchManager from '@/components/challenge/ChallengeMatchManager';
import { Swords, Crown, Zap } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function ChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [match, setMatch] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const gameSlug = new URLSearchParams(location.search).get('game') || undefined;

  useEffect(() => {
    api.auth.me().then(async u => {
      setUser(u);
      const w = await api.wallet.me();
      setProfile(w);
      const activeRooms = await api.matches.rooms(gameSlug);
      setRooms(activeRooms);

      // Reprann yon match ki poko fini (si jwè a rechaje paj la)
      const mine = await api.matches.mine();
      if (mine) {
        setMatch(mine);
        setSelectedRoom(mine.room || activeRooms.find(r => r.id === mine.roomId) || null);
      }

      setLoading(false);
    }).catch(() => navigate('/login'));
  }, [gameSlug]);

  const refreshWallet = async () => {
    const w = await api.wallet.me();
    setProfile(w);
  };

  const joinOrCreate = async (room) => {
    if (!profile) return;
    if (Number(profile.balance) < Number(room.entryCost)) { alert('Solde insuffisant / Balans ou pa ase'); return; }
    setJoining(true);
    try {
      // Sèvè a debite antre a e retounen match la (ni yon match ki t ap tann,
      // ni yon nouvo match kreye) — okenn ekriti balans kliyan pa nesesè.
      const currentMatch = await api.matches.join(room.id);
      await refreshWallet();
      setSelectedRoom(room);
      setMatch(currentMatch);
    } catch (e) {
      if (e?.data?.error === 'already_in_a_match') alert('Ou deja gen yon match aktif.');
      else alert('Erè — eseye ankò.');
    }
    setJoining(false);
  };

  // Rele lè match la fini (viktwa/defèt/matnul) oswa lè li anile pandan
  // n ap tann — sèvè a deja ajiste bous la, isit la nou jis rafrechi afichaj la.
  const handleMatchEnd = async (finalMatch) => {
    await refreshWallet();
    if (!finalMatch) {
      setMatch(null);
      setSelectedRoom(null);
    }
    // Si finalMatch egziste (match fini), n ap kite MatchResult afiche jiskaske
    // itilizatè a klike "Retour au lobby" (handleReturnToLobby).
  };

  const handleReturnToLobby = () => {
    setMatch(null);
    setSelectedRoom(null);
  };

  if (loading) return <PageLoader />;

  // Active match → show game manager
  if (match) {
    return (
      <ChallengeMatchManager
        match={match}
        userId={user.id}
        room={selectedRoom}
        onMatchEnd={handleMatchEnd}
        onReturnToLobby={handleReturnToLobby}
      />
    );
  }

  // Room selection lobby
  const gridCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(260px, 1fr))';

  return (
    <PageLayout profile={profile} user={user} activeNav="defis">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Swords size={20} color="#5DADE2" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2C3E50' }}>Défis 1v1</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#566573' }}>5 tirs + 5 défenses — le meilleur score remporte la mise</p>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#EBF5FB', borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 12, color: '#2C3E50', lineHeight: 1.6 }}>
        <strong>Comment ça marche :</strong> Chaque joueur joue <strong>5 rounds en tant que Gardien</strong> (choisissez 3 zones à couvrir) et <strong>5 rounds en tant que Tireur</strong>. Le plus haut score remporte la mise. En cas d'égalité : manche éliminatoire.
      </div>

      {rooms.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EBF5FB' }}>
          <Swords size={36} color="#D6EAF8" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 600, color: '#566573' }}>Aucune salle active pour le moment</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 14 }}>
          {rooms.map(room => {
            const canAfford = Number(profile?.balance || 0) >= Number(room.entryCost);
            return (
              <div key={room.id} style={{
                background: '#fff', borderRadius: 16, padding: isMobile ? 16 : 20,
                border: `2px solid ${room.color || '#5DADE2'}22`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Crown size={20} color={room.color || '#5DADE2'} />
                  <h3 style={{ margin: 0, color: '#2C3E50', fontSize: 15, fontWeight: 800 }}>{room.name}</h3>
                </div>
                {room.description && <p style={{ color: '#566573', fontSize: 13, marginBottom: 12 }}>{room.description}</p>}
                <div style={{ background: '#F4F6F7', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#566573', fontSize: 13 }}>Mise</span>
                    <span style={{ color: '#EC7063', fontWeight: 700, fontSize: 14 }}>{Number(room.entryCost).toLocaleString()} HTG</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#566573', fontSize: 13 }}>Gain si victoire</span>
                    <span style={{ color: '#58D68D', fontWeight: 700, fontSize: 14 }}>{Number(room.prize).toLocaleString()} HTG</span>
                  </div>
                </div>
                <button onClick={() => joinOrCreate(room)} disabled={joining || !canAfford} style={{
                  width: '100%', background: canAfford ? (room.color || '#5DADE2') : '#F4F6F7',
                  color: canAfford ? '#fff' : '#BDC3C7', border: 'none', borderRadius: 10, padding: '12px',
                  fontWeight: 700, fontSize: 14, cursor: canAfford ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  minHeight: 48,
                }}>
                  <Zap size={14} />
                  {joining ? 'Connexion...' : canAfford ? 'Rejoindre le défi' : '💸 Solde insuffisant'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #D6EAF8', borderTopColor: '#5DADE2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ color: '#85C1E9', fontWeight: 600 }}>Chargement...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
