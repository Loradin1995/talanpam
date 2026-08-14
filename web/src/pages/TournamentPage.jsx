import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/api/client';
import PageLayout from '@/components/layout/PageLayout';
import TournamentGame from '@/components/tournament/TournamentGame';
import TournamentBannerCard from '@/components/tournament/TournamentBannerCard';
import TournamentDetail from '@/components/tournament/TournamentDetail';
import { Trophy } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import LiveJackpot from '@/components/tournament/LiveJackpot';

export default function TournamentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [entriesByTour, setEntriesByTour] = useState({});
  const [selected, setSelected] = useState(null);
  const [entry, setEntry] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const gameSlug = new URLSearchParams(location.search).get('game') || undefined;

  useEffect(() => {
    api.auth.me().then(async u => {
      setUser(u);
      const w = await api.wallet.me();
      setProfile(w);
      const tours = await api.tournaments.list(gameSlug);
      setTournaments(tours);
      // Pou konnen ki tounwa jwè a deja rejwenn, nou chaje detay chak tounwa
      // (lis la se admin-kontwole, kantite yo rete piti).
      const details = await Promise.all(tours.map(t => api.tournaments.detail(t.id).catch(() => null)));
      const map = {};
      details.forEach(d => { if (d?.myEntry) map[d.tournament.id] = d.myEntry; });
      setEntriesByTour(map);
      setLoading(false);
    }).catch(() => navigate('/login'));
  }, [gameSlug]);

  const refreshWallet = async () => {
    const w = await api.wallet.me();
    setProfile(w);
  };

  const refreshLeaderboard = async (tid) => {
    const d = await api.tournaments.detail(tid);
    setLeaderboard(d.leaderboard);
    setEntry(d.myEntry);
    setSelected(d.tournament);
  };

  const openDetail = async (tour) => {
    setSelected(tour);
    const d = await api.tournaments.detail(tour.id);
    setEntry(d.myEntry);
    setLeaderboard(d.leaderboard);
    setSelected(d.tournament);
  };

  const joinTournament = async (tour) => {
    const target = tour || selected;
    if (!target) return;
    if (Number(profile?.balance || 0) < Number(target.entryFee)) { alert('Solde insuffisant'); return; }
    setJoining(true);
    try {
      const newEntry = await api.tournaments.join(target.id);
      setEntry(newEntry);
      setEntriesByTour(m => ({ ...m, [target.id]: newEntry }));
      await refreshWallet();
    } catch (e) {
      alert(e?.data?.error === 'already_joined' ? 'Ou deja rejwenn tounwa sa a.' : 'Erè — eseye ankò.');
    }
    setJoining(false);
  };

  const startAttempt = async () => {
    if (!entry || !selected) return;
    if (Number(profile?.balance || 0) < Number(selected.costPerAttempt)) { alert('Solde insuffisant — Rechargez votre compte.'); return; }
    try {
      const { entry: updatedEntry } = await api.tournaments.startAttempt(selected.id);
      setEntry(updatedEntry);
      await refreshWallet();
      setGameActive(true);
    } catch (e) {
      alert(e?.data?.error === 'max_attempts_reached' ? 'Ou rive nan limit tantativ yo.' : 'Erè — eseye ankò.');
    }
  };

  const handleGameEnd = useCallback(async (score) => {
    setGameActive(false);
    if (!entry || !selected) return;
    // Sèvè a valide skò a e sèlman konsève pi bon eseye a (monotonik) —
    // pa gen plis meknism "asirans" peyan pou kenbe yon ansyen skò.
    const res = await api.tournaments.submitScore(selected.id, score, {});
    setEntry(res.entry);
    await refreshLeaderboard(selected.id);
    await refreshWallet();
  }, [entry, selected]);

  if (loading) return <PageLoader />;
  if (gameActive && selected) return <TournamentGame tournament={selected} onGameEnd={handleGameEnd} />;

  return (
    <PageLayout profile={profile} user={user} activeNav="tournois">
      {/* Detail view */}
      {selected ? (
        <TournamentDetail
          tournament={selected}
          entry={entry}
          leaderboard={leaderboard}
          currentUserId={user?.id}
          joining={joining}
          onBack={() => setSelected(null)}
          onJoin={() => joinTournament()}
          onPlay={startAttempt}
        />
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={20} color="#F59E0B" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2C3E50' }}>Tournois</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#566573' }}>Jackpot cumulatif — tentatives illimitées</p>
            </div>
          </div>

          {/* Live Jackpot Banner — affiche le total de tous les tournois actifs */}
          {tournaments.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <LiveJackpot amount={tournaments.reduce((sum, t) => sum + Number(t.jackpotAmount || 0), 0)} />
            </div>
          )}

          {tournaments.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, textAlign: 'center', color: '#85C1E9', border: '1px solid #EBF5FB' }}>
              <Trophy size={36} color="#D6EAF8" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 600, color: '#566573' }}>Aucun tournoi actif</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {tournaments.map(tour => (
                <TournamentBannerCard
                  key={tour.id}
                  tournament={tour}
                  isJoined={!!entriesByTour[tour.id]}
                  joining={joining}
                  onJoin={() => joinTournament(tour)}
                  onDetails={() => openDetail(tour)}
                />
              ))}
            </div>
          )}
        </>
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
