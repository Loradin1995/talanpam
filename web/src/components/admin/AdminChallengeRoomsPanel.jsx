import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Plus, Crown } from 'lucide-react';

const emptyForm = { gameSlug: 'penalty', name: '', description: '', entryCost: '', prize: '', color: '#ff6b00', isActive: true };

export default function AdminChallengeRoomsPanel() {
  const [rooms, setRooms] = useState([]);
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [all, gameList] = await Promise.all([api.admin.rooms(), api.games.list()]);
    setRooms(all);
    setGames(gameList);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, entryCost: Number(form.entryCost), prize: Number(form.prize) };
    if (editing) {
      await api.admin.updateRoom(editing.id, data);
    } else {
      await api.admin.createRoom(data);
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const toggleActive = async (room) => {
    await api.admin.updateRoom(room.id, { isActive: !room.isActive });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Salles de défi ({rooms.length})</h3>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }} style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Plus size={14} /> Créer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#0d1226', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid rgba(255,107,0,0.2)' }}>
          <h4 style={{ color: '#ff6b00', margin: '0 0 14px' }}>{editing ? 'Modifier' : 'Nouvelle'} salle</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {!editing && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#aaa', fontSize: 11, display: 'block', marginBottom: 4 }}>Jeu</label>
                <select value={form.gameSlug} onChange={e => setForm(f => ({ ...f, gameSlug: e.target.value }))}
                  style={{ width: '100%', background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }}>
                  {games.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                </select>
              </div>
            )}
            {[
              { key: 'name', label: 'Nom (ex: VIP)', full: true },
              { key: 'description', label: 'Description', full: true },
              { key: 'entryCost', label: 'Mise (HTG)', type: 'number' },
              { key: 'prize', label: 'Gain (HTG)', type: 'number' },
              { key: 'color', label: 'Couleur', type: 'color' },
            ].map(({ key, label, type = 'text', full }) => (
              <div key={key} style={{ gridColumn: full ? 'span 2' : 'auto' }}>
                <label style={{ color: '#aaa', fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button type="submit" style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{editing ? 'Enregistrer' : 'Créer'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {rooms.map(room => (
          <div key={room.id} style={{ background: '#0d1226', borderRadius: 10, padding: 16, border: `2px solid ${room.isActive ? room.color : '#333'}`, opacity: room.isActive ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Crown size={16} color={room.color} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{room.name}</span>
              <span style={{ color: '#666', fontSize: 10 }}>· {room.game?.name}</span>
            </div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>Mise: <span style={{ color: room.color, fontWeight: 700 }}>{Number(room.entryCost).toLocaleString()} HTG</span></div>
            <div style={{ color: '#aaa', fontSize: 12, marginBottom: 10 }}>Gain: <span style={{ color: '#00e676', fontWeight: 700 }}>{Number(room.prize).toLocaleString()} HTG</span></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { setEditing(room); setForm({ ...room, entryCost: String(room.entryCost), prize: String(room.prize) }); setShowForm(true); }} style={{ flex: 1, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', borderRadius: 6, padding: '5px', cursor: 'pointer', fontSize: 11 }}>Modifier</button>
              <button onClick={() => toggleActive(room)} style={{ flex: 1, background: room.isActive ? 'rgba(255,23,68,0.1)' : 'rgba(0,230,118,0.1)', border: `1px solid ${room.isActive ? '#ff1744' : '#00e676'}`, color: room.isActive ? '#ff1744' : '#00e676', borderRadius: 6, padding: '5px', cursor: 'pointer', fontSize: 11 }}>
                {room.isActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <div style={{ color: '#666', textAlign: 'center', padding: 20, gridColumn: '1/-1' }}>Aucune salle</div>}
      </div>
    </div>
  );
}
