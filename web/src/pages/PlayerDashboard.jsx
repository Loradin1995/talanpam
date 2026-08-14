import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import PageLayout from '@/components/layout/PageLayout';
import AccountIdCard from '@/components/wallet/AccountIdCard';
import { Wallet, Trophy, Gamepad2, TrendingUp, Clock, CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle, Shield } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const typeLabels = {
  deposit: { label: 'Dépôt', color: '#58D68D' },
  withdrawal: { label: 'Retrait', color: '#EC7063' },
  entry_fee: { label: 'Mise / Entrée', color: '#F59E0B' },
  prize: { label: 'Gain', color: '#58D68D' },
  refund: { label: 'Remboursement', color: '#5DADE2' },
  insurance: { label: 'Assurance', color: '#8E44AD' },
  adjustment: { label: 'Ajustement', color: '#85C1E9' },
};

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me().then(async u => {
      setUser(u);
      const [w, k, txs] = await Promise.all([api.wallet.me(), api.kyc.me(), api.wallet.transactions()]);
      setWallet(w);
      setKyc(k);
      setTransactions(txs);
      setLoading(false);
    }).catch(() => navigate('/login'));
  }, []);

  if (loading) return <PageLoader />;

  const stats = [
    { icon: Wallet, label: 'Solde', value: `${Number(wallet?.balance || 0).toFixed(0)} HTG`, bg: '#EFF6FF', color: '#5DADE2' },
    { icon: Trophy, label: 'Total gagné', value: `${Number(wallet?.totalWon || 0).toFixed(0)} HTG`, bg: '#FFFBEB', color: '#F59E0B' },
    { icon: Gamepad2, label: 'Parties', value: wallet?.gamesPlayed || 0, bg: '#F0FDF4', color: '#58D68D' },
    { icon: TrendingUp, label: 'Total misé', value: `${Number(wallet?.totalWagered || 0).toFixed(0)} HTG`, bg: '#F5EEF8', color: '#8E44AD' },
  ];

  const statCols = isMobile ? '1fr 1fr' : 'repeat(4, 1fr)';

  return (
    <PageLayout profile={wallet} user={user} activeNav="dashboard">
      <div style={{
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', marginBottom: 20,
        flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#2C3E50' }}>
            Bonjour, {kyc?.firstName || user?.email?.split('@')[0] || 'Joueur'} 👋
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#566573' }}>Résumé de votre compte</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/deposit')} style={{
            background: '#5DADE2', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
          }}>
            <ArrowDownCircle size={14} /> Recharge
          </button>
          <button onClick={() => navigate('/withdraw')} style={{
            background: '#EC7063', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
          }}>
            <ArrowUpCircle size={14} /> Retrait
          </button>
          <button onClick={() => navigate('/kyc')} style={{
            background: '#F4F6F7', color: '#566573', border: '1px solid #EBF5FB', borderRadius: 10,
            padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
          }}>
            <Shield size={14} /> KYC
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 10, marginBottom: 20 }}>
        {stats.map(({ icon: Icon, label, value, bg, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #EBF5FB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: '#2C3E50', marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 11, color: '#85C1E9', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {wallet?.accountId && <AccountIdCard accountId={wallet.accountId} />}

      {kyc?.status !== 'approved' && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
          flexWrap: 'wrap',
        }}>
          <Shield size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <span style={{ fontWeight: 700, color: '#92400E', fontSize: 13 }}>KYC requis — </span>
            <span style={{ color: '#92400E', fontSize: 13 }}>Complétez votre identité pour débloquer tous les modes.</span>
          </div>
          <button onClick={() => navigate('/kyc')} style={{ background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', minHeight: 36 }}>
            Vérifier →
          </button>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EBF5FB', overflow: 'hidden', boxShadow: '0 2px 10px rgba(93,173,226,0.07)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F4F6F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>Transactions</h3>
          <span style={{ fontSize: 12, color: '#85C1E9' }}>{transactions.length} entrées</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#BDC3C7' }}>
            <Clock size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>Aucune transaction</div>
          </div>
        ) : (
          <div>
            {transactions.map((tx, i) => {
              const meta = typeLabels[tx.type] || { label: tx.type, color: '#85C1E9' };
              const isCredit = Number(tx.amount) > 0;
              return (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: isMobile ? '10px 14px' : '12px 20px',
                  borderBottom: i < transactions.length - 1 ? '1px solid #F4F6F7' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: isCredit ? '#EAFAF1' : '#FEF3F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isCredit ? <ArrowDownCircle size={14} color="#58D68D" /> : <ArrowUpCircle size={14} color="#EC7063" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{meta.label}</div>
                      <div style={{ fontSize: 11, color: '#BDC3C7' }}>{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {tx.status === 'completed' ? <CheckCircle size={12} color="#58D68D" />
                      : tx.status === 'failed' || tx.status === 'cancelled' ? <XCircle size={12} color="#EC7063" />
                      : <Clock size={12} color="#F59E0B" />}
                    <span style={{ color: isCredit ? '#58D68D' : '#EC7063', fontWeight: 700, fontSize: 13 }}>
                      {isCredit ? '+' : ''}{Number(tx.amount)?.toFixed(0)} HTG
                    </span>
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
