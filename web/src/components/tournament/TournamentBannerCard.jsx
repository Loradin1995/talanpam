import { Check } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80';

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function TournamentBannerCard({ tournament, isJoined, joining, onJoin, onDetails }) {
  const jackpot = Number(tournament.jackpotAmount || 0).toLocaleString('fr-FR');

  return (
    <div style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(93,173,226,0.12)', border: '1px solid #EBF5FB',
    }}>
      {/* Banner image with prize overlay */}
      <div style={{
        position: 'relative', height: 150,
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.45)), url(${tournament.bannerImage || DEFAULT_BANNER})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', left: 18, bottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Fonds des prix</div>
          <div style={{ color: '#fff', fontSize: 30, fontWeight: 900, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            G {jackpot}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 19, fontWeight: 900, color: '#2C3E50', textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {tournament.title}
        </h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span style={{ background: '#58D68D', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
            Actif
          </span>
          <span style={{ background: '#85C1E9', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
            Par étapes
          </span>
        </div>

        <div style={{ color: '#566573', fontSize: 13, marginBottom: 14 }}>
          {fmtDate(tournament.startDate)} {tournament.endDate && `- ${fmtDate(tournament.endDate)}`}
        </div>

        <div style={{ height: 1, background: '#EBF5FB', margin: '0 0 14px' }} />

        {tournament.endDate && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <span style={{ color: '#566573', fontSize: 14, maxWidth: 110, lineHeight: 1.3 }}>Le tournoi se termine dans</span>
            <CountdownTimer endDate={tournament.endDate} variant="inline" />
          </div>
        )}

        {isJoined ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#58D68D', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              <Check size={18} /> Vous participez déjà
            </div>
            <button onClick={onDetails} style={btnSecondary}>En savoir plus</button>
          </>
        ) : (
          <>
            <button onClick={onJoin} disabled={joining} style={{ ...btnPrimary, opacity: joining ? 0.7 : 1 }}>
              {joining ? '...' : 'Participer'}
            </button>
            <button onClick={onDetails} style={btnSecondary}>En savoir plus</button>
          </>
        )}
      </div>
    </div>
  );
}

const btnPrimary = {
  width: '100%', background: '#5DADE2', color: '#fff', border: 'none',
  borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
  marginBottom: 10, minHeight: 50,
};

const btnSecondary = {
  width: '100%', background: '#EBF5FB', color: '#5DADE2', border: 'none',
  borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
  minHeight: 50,
};