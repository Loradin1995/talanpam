import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import ChallengeGKSelectionScreen from './ChallengeGKSelectionScreen';
import ChallengeShooterScreen from './ChallengeShooterScreen';
import MatchResult from './MatchResult';
import LandscapeGuard from '@/components/game/LandscapeGuard';
import { Clock, Swords, AlertTriangle } from 'lucide-react';

const ROUNDS = 5;
const ABANDON_TIMEOUT = 5 * 60 * 1000; // 5 minit, dwe konkòde ak ABANDON_TIMEOUT_MS sèvè a

/*
  FLUX — TOUT KALKIL SKÒ AK ETA JWÈT FÈT SÈVÈ-KOTE KOUNYE A (games/penalty/index.js).
  Kliyan an sèlman soumèt chwa zòn li (kote li tire / kote li pare) atravè
  api.matches.move(id, moveType, payload) — li pa janm ekri yon skò oswa yon
  "winnerId" dirèkteman. Sa a korije feblès kritik ki te egziste nan vèsyon
  Base44 a, kote yon kliyan modifye ka ekri nenpòt bagay nan match la.

  1. waiting              → adversaire rejoint (match.status)
  2. gk_selection         → match.state.phase — 2 jwè yo chwazi 5×3 zòn gadyen an menm tan
  3. shooting              → match.state.phase — 2 jwè yo tire 5 fwa an menm tan
  4. tiebreak_gk / tiebreak_shooting → match.state.phase — egalite, tou siplemantè
  5. finished              → match.status
*/

function currentPhase(match) {
  if (match.status === 'waiting') return 'waiting';
  if (match.status === 'finished' || match.status === 'abandoned') return 'finished';
  return match.state?.phase || 'gk_selection';
}

export default function ChallengeMatchManager({ match: initialMatch, userId, room, onMatchEnd, onReturnToLobby }) {
  const [match, setMatch] = useState(initialMatch);
  const [showClaimButton, setShowClaimButton] = useState(false);

  const isPlayer1 = match.player1Id === userId;
  const isPlayer2 = match.player2Id === userId;
  const mySlot = isPlayer1 ? 'p1' : 'p2';
  const oppSlot = isPlayer1 ? 'p2' : 'p1';
  const phase = currentPhase(match);
  const state = match.state || {};

  const iAlreadySubmittedGk = (state[mySlot]?.gk || []).length === ROUNDS;
  const iAlreadySubmittedShots = (state[mySlot]?.shots || []).length === ROUNDS;
  const iAlreadySubmittedTbGk = isPlayer1 ? (state.tb?.gkP1 || []).length > 0 : (state.tb?.gkP2 || []).length > 0;
  const iAlreadySubmittedTbShot = isPlayer1
    ? (state.tb?.shotP1 !== undefined && state.tb?.shotP1 !== null)
    : (state.tb?.shotP2 !== undefined && state.tb?.shotP2 !== null);

  // Poll whenever we're waiting for the opponent
  const needsPoll = (
    phase === 'waiting' ||
    (phase === 'gk_selection' && iAlreadySubmittedGk) ||
    (phase === 'shooting' && iAlreadySubmittedShots) ||
    (phase === 'tiebreak_gk' && iAlreadySubmittedTbGk) ||
    (phase === 'tiebreak_shooting' && iAlreadySubmittedTbShot)
  );

  useEffect(() => {
    if (phase === 'finished' || !needsPoll) return;
    const interval = setInterval(async () => {
      const fresh = await api.matches.detail(match.id).catch(() => null);
      if (!fresh) return;
      if (fresh.updatedAt !== match.updatedAt) {
        if (fresh.status === 'finished') {
          // Match fini pandan n ap tann → rafrechi bous la epi montre rezilta a
          await onMatchEnd(fresh);
        }
        setMatch(fresh);
      }

      // Check for opponent timeout (5 minutes of inactivity)
      const timeSinceLastUpdate = Date.now() - new Date(fresh.updatedAt).getTime();
      if (timeSinceLastUpdate > ABANDON_TIMEOUT && fresh.status !== 'finished') {
        setShowClaimButton(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, needsPoll, match.id, match.updatedAt, onMatchEnd]);

  // ── CLAIM VICTORY BY TIMEOUT ──
  const handleClaimVictory = useCallback(async () => {
    try {
      const updated = await api.matches.claimTimeout(match.id);
      setMatch(updated);
      setShowClaimButton(false);
      if (updated.status === 'finished') await onMatchEnd(updated);
    } catch {
      // Pa ankò gen timeout — reyesèye pita.
    }
  }, [match.id, onMatchEnd]);

  // ── GK SELECTION DONE ──
  const handleGkDone = useCallback(async (gkChoices) => {
    const updated = await api.matches.move(match.id, 'submit_gk', gkChoices);
    setMatch(updated);
  }, [match.id]);

  // ── SHOOTING DONE ──
  const handleShootingDone = useCallback(async (shotZones) => {
    const updated = await api.matches.move(match.id, 'submit_shots', shotZones);
    setMatch(updated);
    if (updated.status === 'finished') await onMatchEnd(updated);
  }, [match.id, onMatchEnd]);

  // ── TIEBREAK GK DONE ──
  const handleTbGkDone = useCallback(async (gkChoices) => {
    const zones = gkChoices[0]; // ChallengeGKSelectionScreen isTiebreak → 1 sèl tou
    const updated = await api.matches.move(match.id, 'submit_tb_gk', zones);
    setMatch(updated);
  }, [match.id]);

  // ── TIEBREAK SHOOTING DONE ──
  const handleTbShootingDone = useCallback(async (shotZones) => {
    const zoneIndex = shotZones[0];
    const updated = await api.matches.move(match.id, 'submit_tb_shot', zoneIndex);
    setMatch(updated);
    if (updated.status === 'finished') await onMatchEnd(updated);
  }, [match.id, onMatchEnd]);

  const handleCancelWaiting = useCallback(async () => {
    try { await api.matches.cancelWaiting(match.id); } catch { /* ignore */ }
    onMatchEnd(null);
  }, [match.id, onMatchEnd]);

  // ── RENDER ──

  if (phase === 'finished') {
    return (
      <LandscapeGuard>
        <MatchResult match={match} userId={userId} room={room} onClose={() => onReturnToLobby()} />
      </LandscapeGuard>
    );
  }

  if (phase === 'waiting') {
    return <WaitingScreen onCancel={handleCancelWaiting} />;
  }

  // ── TIEBREAK phases first (must come before generic gk/shooting checks) ──

  if (phase === 'tiebreak_gk' && !iAlreadySubmittedTbGk) {
    return (
      <LandscapeGuard>
        <ChallengeGKSelectionScreen isTiebreak onComplete={handleTbGkDone} />
      </LandscapeGuard>
    );
  }

  if (phase === 'tiebreak_gk' && iAlreadySubmittedTbGk) {
    return (
      <OpponentWaitScreen
        label="Votre adversaire choisit ses zones..."
        myScore={isPlayer1 ? match.player1Score : match.player2Score}
        showClaimButton={showClaimButton}
        onClaimVictory={handleClaimVictory}
      />
    );
  }

  if (phase === 'tiebreak_shooting' && !iAlreadySubmittedTbShot) {
    const opponentTbGk = isPlayer1 ? (state.tb?.gkP2 || []) : (state.tb?.gkP1 || []);
    return (
      <LandscapeGuard>
        <ChallengeShooterScreen
          totalRounds={1}
          gkChoicesPerRound={[opponentTbGk]}
          isTiebreak
          onComplete={handleTbShootingDone}
        />
      </LandscapeGuard>
    );
  }

  if (phase === 'tiebreak_shooting' && iAlreadySubmittedTbShot) {
    return (
      <OpponentWaitScreen
        label="Votre adversaire tire..."
        myScore={isPlayer1 ? match.player1Score : match.player2Score}
        showClaimButton={showClaimButton}
        onClaimVictory={handleClaimVictory}
      />
    );
  }

  // ── Standard phases ──

  if (phase === 'gk_selection' && iAlreadySubmittedGk) {
    return (
      <OpponentWaitScreen
        label="Votre adversaire choisit ses zones..."
        myScore={isPlayer1 ? match.player1Score : match.player2Score}
        showClaimButton={showClaimButton}
        onClaimVictory={handleClaimVictory}
      />
    );
  }

  if (phase === 'gk_selection' && !iAlreadySubmittedGk) {
    return (
      <LandscapeGuard>
        <ChallengeGKSelectionScreen onComplete={handleGkDone} />
      </LandscapeGuard>
    );
  }

  if (phase === 'shooting' && iAlreadySubmittedShots) {
    return (
      <OpponentWaitScreen
        label="Votre adversaire tire..."
        myScore={isPlayer1 ? match.player1Score : match.player2Score}
        showClaimButton={showClaimButton}
        onClaimVictory={handleClaimVictory}
      />
    );
  }

  if (phase === 'shooting' && !iAlreadySubmittedShots) {
    const opponentGkChoices = state[oppSlot]?.gk || [];
    return (
      <LandscapeGuard>
        <ChallengeShooterScreen
          totalRounds={ROUNDS}
          gkChoicesPerRound={opponentGkChoices}
          onComplete={handleShootingDone}
        />
      </LandscapeGuard>
    );
  }

  return <OpponentWaitScreen label="En attente..." />;
}

function WaitingScreen({ onCancel }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(93,173,226,0.15)', border: '1px solid #EBF5FB', maxWidth: 360, width: '100%' }}>
        <Clock size={40} color="#5DADE2" style={{ animation: 'spin 2s linear infinite', marginBottom: 16 }} />
        <h3 style={{ color: '#2C3E50', fontWeight: 800, margin: '0 0 8px', fontSize: 18 }}>En attente d'un adversaire...</h3>
        <p style={{ color: '#566573', fontSize: 13, margin: '0 0 20px' }}>Ap tann yon adversè...</p>
        <button onClick={onCancel} style={{ background: '#F4F6F7', border: 'none', color: '#566573', borderRadius: 10, padding: '11px 24px', cursor: 'pointer', fontWeight: 600, minHeight: 44 }}>
          Annuler / Anile
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function OpponentWaitScreen({ label, myScore, onClaimVictory, showClaimButton }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#131929', borderRadius: 20, padding: '32px 24px', textAlign: 'center', maxWidth: 360, width: '100%', border: '1px solid rgba(93,173,226,0.3)' }}>
        <Swords size={40} color="#5DADE2" style={{ marginBottom: 16 }} />
        <h3 style={{ color: '#fff', fontWeight: 800, margin: '0 0 8px', fontSize: 18 }}>Défi en cours</h3>
        <p style={{ color: '#aaa', fontSize: 13, marginBottom: 16 }}>{label}</p>
        <p style={{ color: '#566573', fontSize: 11, marginBottom: 16 }}>Ap tann adversè ou a...</p>
        {myScore !== undefined && (
          <div style={{ color: '#5DADE2', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Votre score: {myScore || 0} pts</div>
        )}
        {showClaimButton && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,68,68,0.1)', borderRadius: 10, border: '1px solid rgba(255,68,68,0.3)' }}>
            <AlertTriangle size={24} color="#FF4444" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: '#FF4444', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Adversaire déconnecté depuis +5 min</p>
            <button onClick={onClaimVictory} style={{
              background: '#FF4444', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%',
            }}>
              Réclamer la victoire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
