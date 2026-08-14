import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Search, Wallet, CheckCircle, User } from 'lucide-react';

export default function AdminDepositsPanel() {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [crediting, setCrediting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recent, setRecent] = useState([]);

  const loadRecent = async () => setRecent(await api.admin.recentDeposits());

  useEffect(() => { loadRecent(); }, []);

  const search = async () => {
    setError(''); setSuccess(''); setFound(null);
    const id = accountId.trim();
    if (!/^\d{10}$/.test(id)) { setError('Entrez un ID de compte valide (10 chiffres).'); return; }
    setSearching(true);
    try {
      const wallet = await api.admin.searchAccount(id);
      setFound(wallet);
    } catch (err) {
      setError(err.data?.error === 'account_not_found' ? 'Aucun joueur trouvé avec cet ID.' : 'Erreur de recherche.');
    } finally {
      setSearching(false);
    }
  };

  const credit = async () => {
    const amt = parseFloat(amount);
    setError(''); setSuccess('');
    if (!amt || amt <= 0) { setError('Montant invalide.'); return; }
    setCrediting(true);
    try {
      const result = await api.admin.creditDeposit(found.userId, amt);
      setSuccess(`${amt.toLocaleString()} HTG crédités à ${found.user?.kyc?.username || found.accountId}.`);
      setFound(f => ({ ...f, balance: Number(result.wallet.balance) }));
      setAmount('');
      loadRecent();
    } catch (err) {
      setError(err.message || 'Erreur de recharge.');
    } finally {
      setCrediting(false);
    }
  };

  const inputStyle = {
    flex: 1, background: '#0d1226', border: '1px solid #2a3556', borderRadius: 8,
    padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', minHeight: 44, boxSizing: 'border-box',
  };
  const btn = (bg) => ({
    background: bg, border: 'none', color: '#fff', borderRadius: 8, padding: '11px 18px',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <div>
      <h3 style={{ color: '#fff', marginBottom: 6, fontSize: 16 }}>Recharger un compte</h3>
      <p style={{ color: '#8a93b2', fontSize: 13, marginBottom: 16 }}>Recherchez un joueur par son ID de compte puis créditez son solde.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          style={inputStyle} placeholder="ID de compte (10 chiffres)" inputMode="numeric"
          value={accountId} onChange={e => setAccountId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button onClick={search} disabled={searching} style={btn('#5DADE2')}>
          <Search size={15} /> {searching ? '...' : 'Chercher'}
        </button>
      </div>

      {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{error}</div>}
      {success && (
        <div style={{ color: '#00e676', fontSize: 13, marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      {found && (
        <div style={{ background: '#0d1226', border: '1px solid #2a3556', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#5DADE220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#5DADE2" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{found.user?.kyc?.username || found.user?.email || 'Sans pseudo'}</div>
              <div style={{ color: '#8a93b2', fontSize: 12 }}>ID: {found.accountId}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ color: '#8a93b2', fontSize: 11 }}>Solde actuel</div>
              <div style={{ color: '#00e676', fontWeight: 800, fontSize: 16 }}>{Number(found.balance || 0).toLocaleString()} HTG</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              style={inputStyle} placeholder="Montant à créditer (HTG)" inputMode="numeric" type="number"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && credit()}
            />
            <button onClick={credit} disabled={crediting || !amount} style={{ ...btn('#00b894'), opacity: crediting || !amount ? 0.6 : 1 }}>
              <Wallet size={15} /> {crediting ? '...' : 'Recharger'}
            </button>
          </div>
        </div>
      )}

      <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 10 }}>Recharges récentes</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map(tx => (
          <div key={tx.id} style={{
            background: '#0d1226', borderRadius: 10, padding: '11px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1c2540',
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>+{Number(tx.amount)?.toLocaleString()} HTG</div>
              <div style={{ color: '#666', fontSize: 11 }}>{tx.note} | {new Date(tx.createdAt).toLocaleDateString()}</div>
            </div>
            <span style={{ background: '#00e67620', color: '#00e676', borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
              {tx.status}
            </span>
          </div>
        ))}
        {recent.length === 0 && <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>Aucune recharge</div>}
      </div>
    </div>
  );
}
