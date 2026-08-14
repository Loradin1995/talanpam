import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Plus, Trophy, RefreshCw } from 'lucide-react';

const emptyForm = {
  gameSlug: 'penalty', title: '', description: '', entryFee: '', costPerAttempt: '',
  jackpotSharePct: '30', initialJackpot: '0', attemptsPerFee: '1',
  maxAttempts: '5', topWinners: '1', prizeDistribution: [100],
  status: 'upcoming', startDate: '', endDate: '',
};

function PrizeDistributionEditor({ topWinners, distribution, onChange }) {
  const count = Number(topWinners) || 1;

  // Sync array length to count
  const dist = Array.from({ length: count }, (_, i) => distribution[i] ?? 0);

  const update = (i, val) => {
    const next = [...dist];
    next[i] = Number(val) || 0;
    onChange(next);
  };

  const total = dist.reduce((a, b) => a + b, 0);
  const isValid = total === 100;

  const autoBalance = () => {
    const base = Math.floor(100 / count);
    const rem = 100 - base * count;
    onChange(dist.map((_, i) => base + (i === 0 ? rem : 0)));
  };

  const inputStyle = {
    width: '100%', background: '#131929', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, padding: '7px 10px', color: '#fff', fontSize: 12,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ gridColumn: 'span 2', background: '#0a0e1a', borderRadius: 8, padding: 14, border: '1px solid rgba(255,215,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 700 }}>Répartition de la cagnotte</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: isValid ? '#00e676' : '#ff6b6b', fontWeight: 600 }}>
            Total : {total}% {!isValid && '⚠ doit faire 100%'}
          </span>
          <button type="button" onClick={autoBalance}
            style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
            <RefreshCw size={10} /> Équilibrer
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
        {dist.map((val, i) => (
          <div key={i}>
            <label style={{ color: '#aaa', fontSize: 10, display: 'block', marginBottom: 3 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`} %
            </label>
            <input type="number" min="0" max="100" value={val}
              onChange={e => update(i, e.target.value)} style={inputStyle} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminTournamentsPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [all, gameList] = await Promise.all([api.admin.tournaments(), api.games.list()]);
    setTournaments(all);
    setGames(gameList);
  };

  useEffect(() => { load(); }, []);

  // When topWinners changes, resize the distribution array
  const setTopWinners = (val) => {
    const n = Math.max(1, Math.min(20, Number(val) || 1));
    const current = form.prizeDistribution || [];
    let next = Array.from({ length: n }, (_, i) => current[i] ?? 0);
    const base = Math.floor(100 / n);
    const rem = 100 - base * n;
    next = next.map((_, i) => base + (i === 0 ? rem : 0));
    setForm(f => ({ ...f, topWinners: String(n), prizeDistribution: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = (form.prizeDistribution || []).reduce((a, b) => a + b, 0);
    if (total !== 100) { alert('La répartition doit totaliser 100%.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.admin.updateTournament(editing.id, form);
      } else {
        await api.admin.createTournament(form);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch {
      alert('Erè — verifye chan yo epi eseye ankò.');
    }
    setSaving(false);
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      gameSlug: t.game?.slug || 'penalty',
      title: t.title, description: t.description || '',
      entryFee: String(t.entryFee), costPerAttempt: String(t.costPerAttempt),
      jackpotSharePct: String(t.jackpotSharePct), initialJackpot: String(t.initialJackpot || 0),
      attemptsPerFee: String(t.attemptsPerFee || 1), maxAttempts: String(t.maxAttempts),
      topWinners: String(t.topWinners || 1),
      prizeDistribution: t.prizeDistribution?.length ? t.prizeDistribution : [100],
      status: t.status,
      startDate: t.startDate ? t.startDate.slice(0, 16) : '',
      endDate: t.endDate ? t.endDate.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const statusColor = { upcoming: '#aaa', active: '#00e676', finished: '#ff6b00' };
  const inputStyle = { width: '100%', background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Tournois ({tournaments.length})</h3>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }}
          style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Plus size={14} /> Créer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#0d1226', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid rgba(255,215,0,0.2)' }}>
          <h4 style={{ color: '#ffd700', margin: '0 0 14px' }}>{editing ? 'Modifier' : 'Nouveau'} tournoi</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

            {!editing && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#aaa', fontSize: 11, display: 'block', marginBottom: 4 }}>Jeu</label>
                <select value={form.gameSlug} onChange={e => setForm(f => ({ ...f, gameSlug: e.target.value }))} style={inputStyle}>
                  {games.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                </select>
              </div>
            )}

            {[
              { key: 'title', label: 'Titre', full: true },
              { key: 'description', label: 'Description', full: true },
              { key: 'entryFee', label: 'Frais entrée (HTG)', type: 'number' },
              { key: 'costPerAttempt', label: 'Coût/tentative (HTG)', type: 'number' },
              { key: 'attemptsPerFee', label: 'Tentatives incluses / paiement', type: 'number' },
              { key: 'jackpotSharePct', label: '% → cagnotte', type: 'number' },
              { key: 'initialJackpot', label: 'Cagnotte de départ (HTG)', type: 'number' },
              { key: 'maxAttempts', label: 'Tentatives max par joueur', type: 'number' },
              { key: 'startDate', label: 'Début', type: 'datetime-local' },
              { key: 'endDate', label: 'Fin', type: 'datetime-local' },
            ].map(({ key, label, type = 'text', full }) => (
              <div key={key} style={{ gridColumn: full ? 'span 2' : 'auto' }}>
                <label style={{ color: '#aaa', fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inputStyle} />
              </div>
            ))}

            <div>
              <label style={{ color: '#aaa', fontSize: 11, display: 'block', marginBottom: 4 }}>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ ...inputStyle }}>
                <option value="upcoming">upcoming</option>
                <option value="active">active</option>
                <option value="finished">finished</option>
              </select>
            </div>

            <div>
              <label style={{ color: '#aaa', fontSize: 11, display: 'block', marginBottom: 4 }}>Nombre de gagnants (Top N)</label>
              <input type="number" min="1" max="20" value={form.topWinners}
                onChange={e => setTopWinners(e.target.value)} style={inputStyle} />
            </div>

            <PrizeDistributionEditor
              topWinners={form.topWinners}
              distribution={form.prizeDistribution}
              onChange={dist => setForm(f => ({ ...f, prizeDistribution: dist }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button type="submit" disabled={saving} style={{ background: saving ? '#888' : '#ff6b00', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
              {saving ? '...' : editing ? 'Enregistrer' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tournaments.map(tour => {
          const dist = tour.prizeDistribution || [];
          const topN = tour.topWinners || 1;
          return (
            <div key={tour.id} style={{ background: '#0d1226', borderRadius: 10, padding: '14px 16px', border: `1px solid ${statusColor[tour.status]}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trophy size={14} color="#ffd700" /> {tour.title} <span style={{ color: '#666', fontWeight: 400, fontSize: 11 }}>({tour.game?.name})</span>
                </div>
                <div style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
                  Entrée: {Number(tour.entryFee)} HTG | /tentative: {Number(tour.costPerAttempt)} HTG | Cagnotte: {Number(tour.jackpotAmount || 0).toFixed(0)} HTG
                </div>
                {topN > 1 && dist.length > 0 && (
                  <div style={{ color: '#ffd700', fontSize: 11, marginTop: 4 }}>
                    Top {topN} : {dist.map((p, i) => `#${i + 1} → ${p}%`).join(' | ')}
                  </div>
                )}
                {topN === 1 && (
                  <div style={{ color: '#ffd700', fontSize: 11, marginTop: 4 }}>1 gagnant · 100% de la cagnotte</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ background: `${statusColor[tour.status]}20`, color: statusColor[tour.status], borderRadius: 10, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{tour.status}</span>
                <button onClick={() => startEdit(tour)} style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>Modifier</button>
              </div>
            </div>
          );
        })}
        {tournaments.length === 0 && <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>Aucun tournoi</div>}
      </div>
    </div>
  );
}
