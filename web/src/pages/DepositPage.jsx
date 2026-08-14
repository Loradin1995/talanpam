import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import PageLayout from '@/components/layout/PageLayout';
import AccountIdCard from '@/components/wallet/AccountIdCard';
import { Wallet, ArrowDownCircle } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function DepositPage() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [recharges, setRecharges] = useState([]);

  useEffect(() => {
    api.auth.me().then(async u => {
      setUser(u);
      const w = await api.wallet.me();
      setWallet(w);
      const txs = await api.wallet.transactions('deposit');
      setRecharges(txs);
    }).catch(() => navigate('/login'));
  }, []);

  if (!user) return null;

  const steps = [
    "Copiez votre ID de compte de 10 chiffres ci-dessus.",
    "Contactez l'administrateur et donnez-lui votre ID + le montant.",
    "Remettez l'argent à l'administrateur.",
    "Votre solde est crédité instantanément.",
  ];

  return (
    <PageLayout profile={wallet} user={user}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wallet size={20} color="#5DADE2" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2C3E50' }}>Recharger mon compte</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#566573' }}>Rechaje kont ou</p>
          </div>
        </div>

        {wallet?.accountId && <AccountIdCard accountId={wallet.accountId} />}

        <div style={{ background: '#fff', borderRadius: 16, padding: isMobile ? 16 : 22, border: '1px solid #EBF5FB', boxShadow: '0 4px 20px rgba(93,173,226,0.08)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#2C3E50' }}>Comment recharger ?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: '#EBF5FB', color: '#2E86C1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: 13.5, color: '#566573', lineHeight: 1.5, paddingTop: 3 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {recharges.length > 0 && (
          <div style={{ marginTop: 16, background: '#fff', borderRadius: 14, border: '1px solid #EBF5FB', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F4F6F7' }}>
              <span style={{ color: '#2C3E50', fontWeight: 700, fontSize: 13 }}>Recharges récentes</span>
            </div>
            {recharges.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid #F4F6F7', fontSize: 13 }}>
                <span style={{ color: '#566573', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowDownCircle size={14} color="#58D68D" />
                  {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <span style={{ color: '#58D68D', fontWeight: 700 }}>+{Number(tx.amount).toLocaleString()} HTG</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
