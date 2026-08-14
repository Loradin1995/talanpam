import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import PageLayout from '@/components/layout/PageLayout';
import { Upload, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function KYCPage() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '' });
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.auth.me().then(async u => {
      setUser(u);
      setWallet(await api.wallet.me());
      setKyc(await api.kyc.me());
    }).catch(() => navigate('/login'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('firstName', form.first_name);
      fd.append('lastName', form.last_name);
      if (idFile) fd.append('idDocument', idFile);
      const updated = await api.kyc.submit(fd);
      setKyc(updated);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const kycStatus = submitted ? 'pending' : (kyc?.status === 'submitted' ? 'pending' : kyc?.status);
  const alreadySubmitted = kyc && ['submitted', 'approved', 'rejected'].includes(kyc.status);

  const labelStyle = { display: 'block', color: '#566573', fontSize: 12, fontWeight: 600, marginBottom: 6 };
  const inputStyle = {
    width: '100%', background: '#F4F6F7', border: '1.5px solid #EBF5FB',
    borderRadius: 10, padding: '12px 14px', color: '#2C3E50', fontSize: 14,
    boxSizing: 'border-box', outline: 'none', minHeight: 48,
  };

  return (
    <PageLayout profile={wallet} user={user}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={20} color="#5DADE2" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2C3E50' }}>Vérification KYC</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#566573' }}>Vérifiez votre identité</p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 18 : 28, border: '1px solid #EBF5FB', boxShadow: '0 4px 20px rgba(93,173,226,0.08)' }}>
          {(alreadySubmitted || submitted) ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              {kycStatus === 'pending' && (
                <>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FFFBEB', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={32} color="#F59E0B" />
                  </div>
                  <h3 style={{ color: '#2C3E50', margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>En cours de vérification</h3>
                  <p style={{ color: '#566573', fontSize: 14 }}>Votre demande a été soumise. Un administrateur va la traiter sous peu.</p>
                </>
              )}
              {kycStatus === 'approved' && (
                <>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#EAFAF1', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={32} color="#58D68D" />
                  </div>
                  <h3 style={{ color: '#2C3E50', margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>Compte vérifié ✅</h3>
                  <p style={{ color: '#566573', fontSize: 14, margin: '0 0 22px' }}>Votre identité a été validée. Vous avez accès à toutes les fonctionnalités.</p>
                  <button onClick={() => navigate('/lobby')} style={{
                    background: '#5DADE2', color: '#fff', border: 'none', borderRadius: 12,
                    padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(93,173,226,0.35)', minHeight: 48,
                  }}>Retour au lobby →</button>
                </>
              )}
              {kycStatus === 'rejected' && (
                <>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FEF3F2', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XCircle size={32} color="#EC7063" />
                  </div>
                  <h3 style={{ color: '#2C3E50', margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>Vérification refusée</h3>
                  {kyc?.adminNote && <p style={{ color: '#566573', fontSize: 13, margin: '0 0 18px' }}>{kyc.adminNote}</p>}
                  <button onClick={() => { setKyc({ ...kyc, status: 'pending' }); setSubmitted(false); }} style={{
                    background: '#F4F6F7', color: '#566573', border: 'none', borderRadius: 10,
                    padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44,
                  }}>Soumettre à nouveau</button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <input required style={inputStyle} placeholder="Prénom" value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input required style={inputStyle} placeholder="Nom de famille" value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Pièce d'identité (photo ou PDF)</label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
                  background: '#F4F6F7', border: `2px dashed ${idFile ? '#58D68D' : '#D6EAF8'}`,
                  borderRadius: 12, cursor: 'pointer', color: idFile ? '#58D68D' : '#85C1E9', fontSize: 13,
                  minHeight: 52,
                }}>
                  <Upload size={18} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {idFile ? idFile.name : 'Cliquez pour choisir un fichier'}
                  </span>
                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                    onChange={e => setIdFile(e.target.files[0])} />
                </label>
              </div>

              <button type="submit" disabled={loading || !idFile} style={{
                width: '100%', background: loading || !idFile ? '#BDC3C7' : '#5DADE2', color: '#fff',
                border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700,
                cursor: loading || !idFile ? 'not-allowed' : 'pointer',
                boxShadow: loading || !idFile ? 'none' : '0 4px 14px rgba(93,173,226,0.35)',
                minHeight: 50,
              }}>
                {loading ? 'Envoi en cours...' : 'Soumettre ma vérification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
