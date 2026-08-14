import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { CheckCircle, XCircle, User } from 'lucide-react';

export default function AdminWithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const load = async () => {
    const all = await api.admin.withdrawals();
    setWithdrawals(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const validate = async (tx) => {
    setProcessing(p => ({ ...p, [tx.id]: 'validating' }));
    await api.admin.approveWithdrawal(tx.id);
    setProcessing(p => ({ ...p, [tx.id]: null }));
    load();
  };

  const reject = async (tx) => {
    setProcessing(p => ({ ...p, [tx.id]: 'rejecting' }));
    await api.admin.rejectWithdrawal(tx.id);
    setProcessing(p => ({ ...p, [tx.id]: null }));
    load();
  };

  const statusColor = { pending: '#ffd700', completed: '#00e676', failed: '#ff1744', cancelled: '#aaa' };

  if (loading) return <div style={{ color: '#aaa' }}>Chargement...</div>;

  return (
    <div>
      <h3 style={{ color: '#fff', marginBottom: 14, fontSize: 16 }}>
        Demandes de retrait ({withdrawals.filter(d => d.status === 'pending').length} en attente)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {withdrawals.map(tx => {
          const prof = tx.user?.wallet;
          return (
            <div key={tx.id} style={{
              background: '#0d1226', borderRadius: 10, padding: '14px 16px',
              border: `1px solid ${statusColor[tx.status] || '#333'}40`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EC706320', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} color="#EC7063" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{Math.abs(Number(tx.amount))?.toLocaleString()} HTG</div>
                  <div style={{ color: '#8a93b2', fontSize: 12 }}>
                    {tx.user?.email || 'Joueur'} · ID: <span style={{ color: '#5DADE2' }}>{prof?.accountId || '—'}</span>
                  </div>
                  <div style={{ color: '#666', fontSize: 11 }}>{new Date(tx.createdAt).toLocaleString('fr-FR')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: `${statusColor[tx.status]}20`, color: statusColor[tx.status], borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                  {tx.status}
                </span>
                {tx.status === 'pending' && (
                  <>
                    <button onClick={() => validate(tx)} disabled={!!processing[tx.id]}
                      style={{ background: '#00e67620', border: '1px solid #00e676', color: '#00e676', borderRadius: 6, padding: '6px 12px', cursor: processing[tx.id] ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, opacity: processing[tx.id] ? 0.6 : 1, minHeight: 36 }}>
                      <CheckCircle size={12} /> {processing[tx.id] === 'validating' ? '...' : 'Payé'}
                    </button>
                    <button onClick={() => reject(tx)} disabled={!!processing[tx.id]}
                      style={{ background: '#ff174420', border: '1px solid #ff1744', color: '#ff1744', borderRadius: 6, padding: '6px 12px', cursor: processing[tx.id] ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, opacity: processing[tx.id] ? 0.6 : 1, minHeight: 36 }}>
                      <XCircle size={12} /> {processing[tx.id] === 'rejecting' ? '...' : 'Refuser'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {withdrawals.length === 0 && <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>Aucune demande de retrait</div>}
      </div>
    </div>
  );
}
