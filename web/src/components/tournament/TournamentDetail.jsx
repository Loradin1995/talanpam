import { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import TournamentPrizes from './TournamentPrizes';
import TournamentLeaderboard from './TournamentLeaderboard.jsx';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80';
const TABS = ['Description', 'Classement', 'Prix', 'Conditions'];

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TournamentDetail({
  tournament, entry, leaderboard, currentUserId, joining,
  onBack, onJoin, onPlay,
}) {
  const [tab, setTab] = useState('Description');
  const jackpot = Number(tournament.jackpotAmount || 0).toLocaleString('fr-FR');
  const isJoined = !!entry;

  return (
    <div style={{ background: '#F4F6F7', borderRadius: 18, overflow: 'hidden', minHeight: 400, position: 'relative' }}>
      {/* Hero header */}
      <div style={{
        position: 'relative', minHeight: 200, padding: '16px 18px 22px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url(${tournament.bannerImage || DEFAULT_BANNER})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 14, left: 14, width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={20} color="#fff" />
        </button>
        <h2 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1.05, textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
          {tournament.title}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: '#58D68D', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>Actif</span>
          <span style={{ background: '#85C1E9', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>Par étapes</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', padding: '12px 14px', display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid #EBF5FB' }}>
        {TABS.map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap',
            background: tab === tb ? '#5DADE2' : '#EBF5FB',
            color: tab === tb ? '#fff' : '#85C1E9',
          }}>
            {tb}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 14px 90px' }}>
        {tab === 'Description' && (
          <>
            {/* Prize fund banner */}
            <div style={{
              borderRadius: 16, padding: '18px', textAlign: 'center', marginBottom: 18,
              background: 'linear-gradient(135deg, #8E44AD, #5DADE2)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>🪙 Fonds des prix 🪙</div>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: '4px 0 6px' }}>G {jackpot}</div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600 }}>
                {fmtDate(tournament.startDate)} {tournament.endDate && `— ${fmtDate(tournament.endDate)}`}
              </div>
            </div>

            {tournament.endDate && (
              <div style={{ marginBottom: 18 }}>
                <CountdownTimer endDate={tournament.endDate} variant="block" />
              </div>
            )}

            {tournament.description && (
              <p style={{ color: '#566573', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{tournament.description}</p>
            )}

            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2C3E50', margin: '18px 0 12px' }}>Votre progression</h3>
            <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #EBF5FB', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Stat label="Mon meilleur score" value={entry ? `${entry.bestScore} pts` : '—'} color="#5DADE2" />
              <Stat label="Tentatives jouées" value={entry ? entry.attemptsUsed : '—'} color="#58D68D" />
              <Stat label="Frais d'entrée" value={`${Number(tournament.entryFee)} HTG`} color="#EC7063" />
              <Stat label="Coût / tentative" value={`${Number(tournament.costPerAttempt)} HTG`} color="#EC7063" />
            </div>
          </>
        )}

        {tab === 'Classement' && (
          <TournamentLeaderboard entries={leaderboard} currentUserId={currentUserId} />
        )}

        {tab === 'Prix' && (
          <TournamentPrizes jackpot={Number(tournament.jackpotAmount || 0)} />
        )}

        {tab === 'Conditions' && (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#2C3E50', margin: '0 0 12px' }}>Conditions générales</h3>
            <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #EBF5FB', color: '#566573', fontSize: 14, lineHeight: 1.7 }}>
              Pour participer à ce tournoi, vous devez vous inscrire en cliquant sur le bouton « Participer ».
              <br /><br />
              • Frais d'entrée : <strong>{Number(tournament.entryFee)} HTG</strong> (payés une seule fois).<br />
              • Chaque tentative coûte <strong>{Number(tournament.costPerAttempt)} HTG</strong>, dont {Number(tournament.jackpotSharePct)}% alimentent la cagnotte.<br />
              • Les tentatives sont illimitées. Seul votre <strong>meilleur score</strong> est retenu au classement.<br />
              • Les prix sont distribués aux meilleurs joueurs à la fin du tournoi selon le classement.
            </div>
          </>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, padding: '12px 14px', background: 'linear-gradient(180deg, transparent, #fff 30%)' }}>
        {isJoined ? (
          <button onClick={onPlay} style={ctaPrimary}>
            <Zap size={18} /> Jouer une tentative ({Number(tournament.costPerAttempt)} HTG)
          </button>
        ) : (
          <button onClick={onJoin} disabled={joining} style={{ ...ctaPrimary, opacity: joining ? 0.7 : 1 }}>
            {joining ? '...' : `Participer (${Number(tournament.entryFee)} HTG)`}
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#F4F6F7', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ color: '#566573', fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: 16 }}>{value}</div>
    </div>
  );
}

const ctaPrimary = {
  width: '100%', background: '#58D68D', color: '#fff', border: 'none',
  borderRadius: 12, padding: '15px', fontWeight: 800, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52,
  boxShadow: '0 4px 14px rgba(88,214,141,0.4)',
};