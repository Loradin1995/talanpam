import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import PageLayout from '@/components/layout/PageLayout';
import { ArrowUpCircle, CheckCircle, Clock, XCircle, Banknote } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);

  const loadAll = async () => {
    const [w, txs] = await Promise.all([api.wallet.me(), api.wallet.transactions('withdrawal')]);
    setWallet(w);
    setWithdrawals(txs);
  };

  useEffect(() => {
    api.auth.me().then(async u => { setUser(u); await loadAll(); }).catch(() => navigate('/login'));
  }, []);

  const balance = Number(wallet?.balance || 0);
  const withdrawable = Number(wallet?.withdrawable || 0);
  const hasPendingWithdrawal = withdrawals.some(tx => tx.status === 'pending');

  const ERROR_LABELS = {
    amount_below_minimum: 'Montant minimum : 100 HTG.',
    insufficient_balance: 'Solde insuffisant.',
    withdrawal_already_pending: 'Une demande de retrait est déjà en cours.',
    amount_exceeds_withdrawable: `Vous ne pouvez retirer que vos gains (max ${withdrawable.toLocaleString()} HTG).`,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (!amt) { setError('Montant invalide.'); return; }
    setLoading(true);
    try {
      await api.wallet.withdraw(amt);
      await loadAll();
      setSubmitted(true);
    } catch (err) {
      setError(ERROR_LABELS[err.data?.error] || err.message || 'Échec de la demande.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const labelStyle = { display: 'block', color: '#566573', fontSize: 12, fontWeight: 600, marginBottom: 6 };
  const inputStyle = {
    width: '100%', background: '#F4F6F7', border: '1.5px solid #EBF5FB',
    borderRadius: 10, padding: '12px 14px', color: '#2C3E50', fontSize: 14,
    boxSizing: 'border-box', outline: 'none', minHeight: 48,
  };
  const statusMeta = {
    pending: { label: 'En attente', color: '#F59E0B', Icon: Clock },
    completed: { label: 'Payé', color: '#58D68D', Icon: CheckCircle },
    cancelled: { label: 'Refusé', color: '#EC7063', Icon: XCircle },
    failed: { label: 'Refusé', color: '#EC7063', Icon: XCircle },
  };

  return (
    <PageLayout profile={wallet} user={user}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowUpCircle size={20} color="#EC7063" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2C3E50' }}>Demande de retrait</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#566573' }}>Mande retrè</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div style={{ background: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)', borderRadius: 14, padding: '14px 16px', color: '#fff' }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>Solde total</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{balance.toLocaleString()} <span style={{ fontSize: 12 }}>HTG</span></div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #58D68D 0%, #82E0AA 100%)', borderRadius: 14, padding: '14px 16px', color: '#fff' }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>Retirable (gains)</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{withdrawable.toLocaleString()} <span style={{ fontSize: 12 }}>HTG</span></div>
          </div>
        </div>
        {hasPendingWithdrawal && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={15} /> Une demande de retrait est déjà en cours. Attendez sa validation avant d'en faire une nouvelle.
          </div>
        )}
        {!hasPendingWithdrawal && withdrawable === 0 && (
          <div style={{ background: '#FEF9E7', border: '1px solid #F9E79F', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#7D6608' }}>
            ⚠️ Vous n'avez pas encore de gains à retirer. Seuls les montants gagnés lors des tournois et défis peuvent être retirés.
          </div>
        )}

        {submitted ? (
          <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 24 : 40, textAlign: 'center', border: '1px solid #EBF5FB', boxShadow: '0 4px 20px rgba(93,173,226,0.1)' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FFFBEB', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={34} color="#F59E0B" />
            </div>
            <h3 style={{ color: '#2C3E50', margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>Demande envoyée !</h3>
            <p style={{ color: '#566573', fontSize: 14, margin: '0 0 22px' }}>L'administrateur validera votre retrait et vous remettra l'argent.</p>
            <button onClick={() => { setSubmitted(false); setAmount(''); }} style={{
              background: '#5DADE2', color: '#fff', border: 'none',
              borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 48,
            }}>
              Nouvelle demande
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 16 : 24, border: '1px solid #EBF5FB', boxShadow: '0 4px 20px rgba(93,173,226,0.08)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Montant à retirer (HTG)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {PRESET_AMOUNTS.map(a => (
                    <button key={a} type="button" onClick={() => { setAmount(String(a)); setError(''); }} disabled={a > withdrawable} style={{
                      padding: '8px 12px', borderRadius: 20, minHeight: 36,
                      border: `1.5px solid ${amount === String(a) ? '#5DADE2' : '#EBF5FB'}`,
                      background: amount === String(a) ? '#EBF5FB' : '#F4F6F7',
                      color: a > withdrawable ? '#BDC3C7' : (amount === String(a) ? '#5DADE2' : '#566573'),
                      fontSize: 13, fontWeight: 600, cursor: a > withdrawable ? 'not-allowed' : 'pointer',
                    }}>
                      {a.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input type="number" inputMode="numeric" min="100" required style={inputStyle}
                  placeholder="Montant personnalisé"
                  value={amount} onChange={e => { setAmount(e.target.value); setError(''); }} />
              </div>

              {error && (
                <div style={{ color: '#EC7063', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{error}</div>
              )}

              <button type="submit" disabled={loading || !amount || hasPendingWithdrawal || withdrawable === 0} style={{
                width: '100%', background: loading || !amount || hasPendingWithdrawal || withdrawable === 0 ? '#BDC3C7' : '#EC7063', color: '#fff',
                border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700,
                cursor: loading || !amount ? 'not-allowed' : 'pointer', minHeight: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Banknote size={16} /> {loading ? 'Envoi...' : 'Demander le retrait'}
              </button>
            </form>
          </div>
        )}

        {withdrawals.length > 0 && (
          <div style={{ marginTop: 16, background: '#fff', borderRadius: 14, border: '1px solid #EBF5FB', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F4F6F7' }}>
              <span style={{ color: '#2C3E50', fontWeight: 700, fontSize: 13 }}>Mes retraits</span>
            </div>
            {withdrawals.map(tx => {
              const m = statusMeta[tx.status] || statusMeta.pending;
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid #F4F6F7', fontSize: 13 }}>
                  <span style={{ color: '#566573' }}>{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: m.color, fontSize: 11, fontWeight: 700 }}>
                      <m.Icon size={12} /> {m.label}
                    </span>
                    <span style={{ color: '#2C3E50', fontWeight: 700 }}>{Math.abs(Number(tx.amount)).toLocaleString()} HTG</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
