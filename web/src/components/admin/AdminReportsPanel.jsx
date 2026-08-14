import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import {
  TrendingUp, Users, Wallet, ArrowUpCircle, ArrowDownCircle,
  Trophy, Swords, RefreshCw, AlertCircle, BarChart2,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR');
const fmtPct = (a, b) => b ? `${((a / b) * 100).toFixed(1)}%` : '—';

function StatCard({ icon: Icon, color, bg, label, value, sub }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EBF5FB', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{ fontSize: 12, color: '#566573', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#2C3E50', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#85929E', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#2C3E50', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</h3>
      {children}
    </div>
  );
}

function TableRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid #F4F6F7' }}>
      <span style={{ fontSize: 13, color: '#566573' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight || '#2C3E50' }}>{value}</span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function AdminReportsPanel() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState(30); // days

  // Tout kalkil yo (balans, depo, retrè, pwofi, klasman) fèt SÈVÈ-kote kounye a
  // (GET /admin/reports) — pa gen plis lis konplè telechaje pou kalkile nan navigatè a.
  const load = async () => {
    setLoading(true);
    const report = await api.admin.reports(period);
    setData(report);
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const s = data;

  const netFlow = s ? s.totalDeposited - s.totalWithdrawn : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={18} color="#5DADE2" />
          <span style={{ fontWeight: 800, fontSize: 16, color: '#2C3E50' }}>Rapports & Statistiques</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setPeriod(d)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: period === d ? '#5DADE2' : '#EBF5FB',
              color: period === d ? '#fff' : '#566573',
            }}>{d}j</button>
          ))}
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF5FB', border: 'none', borderRadius: 8, padding: '5px 12px', color: '#5DADE2', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#85929E' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #D6EAF8', borderTopColor: '#5DADE2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Calcul en cours...
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard icon={Users} color="#5DADE2" bg="#EBF5FB"
              label="Joueurs inscrits" value={fmt(s.userCount)}
              sub={`${s.bannedCount} bannis · ${s.kycApproved} KYC approuvés`} />
            <StatCard icon={Wallet} color="#27AE60" bg="#EAFAF1"
              label="Total soldes joueurs" value={`${fmt(s.totalBalance)} HTG`}
              sub={`Moy. ${fmt(Math.round(s.avgBalance))} HTG / joueur`} />
            <StatCard icon={ArrowDownCircle} color="#27AE60" bg="#EAFAF1"
              label={`Dépôts (${period}j)`} value={`${fmt(s.periodDeposited)} HTG`}
              sub={`Total all-time : ${fmt(s.totalDeposited)} HTG`} />
            <StatCard icon={ArrowUpCircle} color="#EC7063" bg="#FDEDEC"
              label={`Retraits (${period}j)`} value={`${fmt(s.periodWithdrawn)} HTG`}
              sub={`En attente : ${fmt(s.pendingAmount)} HTG (${s.pendingCount})`} />
            <StatCard icon={TrendingUp} color="#8E44AD" bg="#F5EEF8"
              label="Profit Défis (house)" value={`${fmt(Math.round(s.challengeProfit))} HTG`}
              sub={`Pot total : ${fmt(s.totalChallengePot)} · Gains : ${fmt(s.totalChallengePrizes)}`} />
            <StatCard icon={Trophy} color="#F39C12" bg="#FEF9E7"
              label="Tournois actifs" value={s.activeTournaments}
              sub={`Jackpots cumulés : ${fmt(s.totalJackpots)} HTG`} />
            <StatCard icon={Swords} color="#E74C3C" bg="#FDEDEC"
              label="Matchs terminés" value={fmt(s.finishedMatches)}
              sub={`${s.pendingMatches} en cours / attente`} />
            <StatCard icon={AlertCircle} color="#F39C12" bg="#FEF9E7"
              label="KYC en attente" value={s.kycPending}
              sub={`${s.kycApproved} approuvés`} />
          </div>

          {/* Flux net */}
          <Section title="Flux financier global">
            <div style={{ background: '#fff', border: '1px solid #EBF5FB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <TableRow label="Total dépôts (complétés)" value={`${fmt(s.totalDeposited)} HTG`} highlight="#27AE60" />
              <TableRow label="Total retraits payés" value={`${fmt(s.totalWithdrawn)} HTG`} highlight="#EC7063" />
              <TableRow label="Flux net (dépôts − retraits)" value={`${fmt(netFlow)} HTG`} highlight={netFlow >= 0 ? '#27AE60' : '#EC7063'} />
              <TableRow label="Soldes détenus (obligations)" value={`${fmt(s.totalBalance)} HTG`} />
              <TableRow label="Retraits en attente" value={`${fmt(s.pendingAmount)} HTG (${s.pendingCount} dem.)`} highlight="#F39C12" />
              <TableRow label="Profit maison — Défis" value={`${fmt(Math.round(s.challengeProfit))} HTG`} highlight="#8E44AD" />
            </div>
          </Section>

          {/* Activité journalière 7j */}
          <Section title={`Activité journalière — 7 derniers jours`}>
            <div style={{ background: '#fff', border: '1px solid #EBF5FB', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', padding: '8px 14px', background: '#F4F6F7', fontSize: 11, fontWeight: 700, color: '#566573' }}>
                <span>Date</span><span style={{ textAlign: 'right' }}>Dépôts</span><span style={{ textAlign: 'right' }}>Retraits</span><span style={{ textAlign: 'right' }}>Matchs</span>
              </div>
              {Object.entries(s.dailyMap).map(([date, v]) => (
                <div key={date} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', padding: '9px 14px', borderBottom: '1px solid #F4F6F7', fontSize: 12 }}>
                  <span style={{ color: '#566573', fontWeight: 600 }}>{date}</span>
                  <span style={{ textAlign: 'right', color: '#27AE60', fontWeight: 700 }}>{v.dep ? `+${fmt(v.dep)}` : '—'}</span>
                  <span style={{ textAlign: 'right', color: v.wit ? '#EC7063' : '#BDC3C7', fontWeight: 700 }}>{v.wit ? `−${fmt(v.wit)}` : '—'}</span>
                  <span style={{ textAlign: 'right', color: '#5DADE2', fontWeight: 700 }}>{v.matches || '—'}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Top joueurs */}
          <Section title="Top 10 joueurs (par gains cumulés)">
            <div style={{ background: '#fff', border: '1px solid #EBF5FB', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 100px 100px 80px', padding: '8px 14px', background: '#F4F6F7', fontSize: 11, fontWeight: 700, color: '#566573' }}>
                <span>#</span><span>Joueur</span><span style={{ textAlign: 'right' }}>Solde</span><span style={{ textAlign: 'right' }}>Total gagné</span><span style={{ textAlign: 'right' }}>Parties</span>
              </div>
              {s.topPlayers.map((p, i) => (
                <div key={p.accountId || i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 100px 100px 80px', padding: '9px 14px', borderBottom: '1px solid #F4F6F7', fontSize: 12, alignItems: 'center' }}>
                  <span style={{ color: i < 3 ? '#F39C12' : '#BDC3C7', fontWeight: 800 }}>{i + 1}</span>
                  <div>
                    <div style={{ color: '#2C3E50', fontWeight: 700 }}>{p.username || '—'}</div>
                    <div style={{ color: '#85929E', fontSize: 10 }}>ID {p.accountId || '—'}</div>
                  </div>
                  <span style={{ textAlign: 'right', color: '#27AE60', fontWeight: 700 }}>{fmt(p.balance)} HTG</span>
                  <span style={{ textAlign: 'right', color: '#8E44AD', fontWeight: 700 }}>{fmt(p.totalWon)} HTG</span>
                  <span style={{ textAlign: 'right', color: '#566573' }}>{p.gamesPlayed ?? 0}</span>
                </div>
              ))}
              {s.topPlayers.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#BDC3C7', fontSize: 13 }}>Aucun joueur</div>}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}