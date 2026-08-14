import { useState, useEffect } from 'react';
import { api, getAccessToken } from '@/api/client';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function AdminKYCPanel() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setKycs(await api.admin.kycList());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (kyc, status) => {
    await api.admin.reviewKyc(kyc.id, status, note);
    setSelected(null);
    setNote('');
    load();
  };

  const statusBadge = { pending: '#ffd700', approved: '#00e676', rejected: '#ff1744', submitted: '#ff6b00' };
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  if (loading) return <div style={{ color: '#aaa' }}>Chargement...</div>;

  return (
    <div>
      <h3 style={{ color: '#fff', marginBottom: 14, fontSize: 16 }}>Vérifications KYC ({kycs.filter(k => k.status === 'submitted' || k.status === 'pending').length} en attente)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {kycs.map(kyc => (
          <div key={kyc.id} style={{
            background: '#0d1226', borderRadius: 10, padding: '14px 16px',
            border: `1px solid ${statusBadge[kyc.status] || '#333'}40`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  {kyc.firstName} {kyc.lastName} <span style={{ color: '#666', fontWeight: 400 }}>({kyc.user?.email})</span>
                </div>
                <div style={{ color: '#666', fontSize: 11 }}>
                  Naissance: {kyc.birthDate ? new Date(kyc.birthDate).toLocaleDateString() : '—'} | {new Date(kyc.createdAt).toLocaleDateString()}
                </div>
                {kyc.idDocumentUrl && (
                  <a href={`${apiBase}${kyc.idDocumentUrl}?token=${encodeURIComponent(getAccessToken() || '')}`} target="_blank" rel="noreferrer" style={{ color: '#ff6b00', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <ExternalLink size={12} /> Voir pièce d'identité
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: `${statusBadge[kyc.status]}20`, color: statusBadge[kyc.status], borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                  {kyc.status}
                </span>
              </div>
            </div>

            {(kyc.status === 'submitted' || kyc.status === 'pending') && (
              <div style={{ marginTop: 10 }}>
                {selected?.id === kyc.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      placeholder="Note admin (optionnel)"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 12 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => updateStatus(kyc, 'approved')} style={{ flex: 1, background: '#00e67620', border: '1px solid #00e676', color: '#00e676', borderRadius: 6, padding: '7px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <CheckCircle size={13} /> Approuver
                      </button>
                      <button onClick={() => updateStatus(kyc, 'rejected')} style={{ flex: 1, background: '#ff174420', border: '1px solid #ff1744', color: '#ff1744', borderRadius: 6, padding: '7px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <XCircle size={13} /> Rejeter
                      </button>
                      <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 12 }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSelected(kyc)} style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid #ff6b00', color: '#ff6b00', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Examiner
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {kycs.length === 0 && <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>Aucune demande KYC</div>}
      </div>
    </div>
  );
}
