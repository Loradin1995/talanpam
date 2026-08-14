import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { useLang } from '@/lib/LangContext';
import PageLayout from '@/components/layout/PageLayout';
import AdminKYCPanel from '@/components/admin/AdminKYCPanel';
import AdminDepositsPanel from '@/components/admin/AdminDepositsPanel';
import AdminWithdrawalsPanel from '@/components/admin/AdminWithdrawalsPanel';
import AdminTournamentsPanel from '@/components/admin/AdminTournamentsPanel';
import AdminChallengeRoomsPanel from '@/components/admin/AdminChallengeRoomsPanel';
import AdminSettingsPanel from '@/components/admin/AdminSettingsPanel';
import AdminLiveMatchesPanel from '@/components/admin/AdminLiveMatchesPanel';
import AdminReportsPanel from '@/components/admin/AdminReportsPanel';
import { Shield, Users, Wallet, Trophy, Swords, Settings, Activity, Banknote, BarChart2 } from 'lucide-react';
import AdminExportAssetsButton from '@/components/admin/AdminExportAssetsButton';

const TABS = [
  { id: 'reports', label: 'Rapports', icon: BarChart2 },
  { id: 'live', label: 'Live', icon: Activity },
  { id: 'kyc', label: 'KYC', icon: Users },
  { id: 'deposits', label: 'Recharge', icon: Wallet },
  { id: 'withdrawals', label: 'Retraits', icon: Banknote },
  { id: 'tournaments', label: 'Tournois', icon: Trophy },
  { id: 'challenges', label: 'Défis', icon: Swords },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me().then(async u => {
      if (u.role !== 'admin') { navigate('/lobby'); return; }
      setUser(u);
      const w = await api.wallet.me().catch(() => null);
      setProfile(w);
      setLoading(false);
    }).catch(() => navigate('/login'));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #D6EAF8', borderTopColor: '#5DADE2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <PageLayout profile={profile} user={user}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#F59E0B" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#2C3E50' }}>Administration</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#566573' }}>Panneau de gestion super-admin</p>
          </div>
        </div>
        <AdminExportAssetsButton />
      </div>

      {/* Tab bar */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '6px', marginBottom: 20,
        display: 'flex', gap: 4, flexWrap: 'wrap',
        border: '1px solid #EBF5FB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: activeTab === id ? '#5DADE2' : 'transparent',
            color: activeTab === id ? '#fff' : '#566573',
            transition: 'all 0.15s',
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EBF5FB', overflow: 'hidden', boxShadow: '0 2px 10px rgba(93,173,226,0.07)' }}>
        <div style={{ padding: 20 }}>
          {activeTab === 'reports' && <AdminReportsPanel />}
          {activeTab === 'live' && <AdminLiveMatchesPanel />}
          {activeTab === 'kyc' && <AdminKYCPanel />}
          {activeTab === 'deposits' && <AdminDepositsPanel />}
          {activeTab === 'withdrawals' && <AdminWithdrawalsPanel />}
          {activeTab === 'tournaments' && <AdminTournamentsPanel />}
          {activeTab === 'challenges' && <AdminChallengeRoomsPanel />}
          {activeTab === 'settings' && <AdminSettingsPanel />}
        </div>
      </div>
    </PageLayout>
  );
}