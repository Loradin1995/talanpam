import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import LobbyHeader from '@/components/lobby/LobbyHeader';
import LobbyNav from '@/components/lobby/LobbyNav';
import GameCenter from '@/components/lobby/GameCenter';
import UserPanel from '@/components/lobby/UserPanel';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function Lobby() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeNav, setActiveNav] = useState('accueil');
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    api.auth.me().then(async u => {
      setUser(u);
      const w = await api.wallet.me().catch(() => ({ balance: 0 }));
      setProfile(w);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', fontFamily: 'Inter, sans-serif' }}>
      <LobbyHeader user={user} profile={profile} navigate={navigate} />
      {!isMobile && <LobbyNav activeNav={activeNav} setActiveNav={setActiveNav} />}

      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: isMobile ? '12px 12px 80px' : '16px',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1fr 300px',
        gap: 14,
      }}>
        <GameCenter loading={loading} navigate={navigate} />
        {!isMobile && <UserPanel user={user} profile={profile} navigate={navigate} />}
        {isMobile && <MobileUserCard user={user} profile={profile} navigate={navigate} />}
      </div>

      {isMobile && <LobbyNav activeNav={activeNav} setActiveNav={setActiveNav} />}
    </div>
  );
}

function MobileUserCard({ user, profile, navigate }) {
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Joueur';
  if (!user) return (
    <div style={{
      background: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)',
      borderRadius: 16, padding: 20, marginTop: 12,
      display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center',
    }}>
      <div style={{ fontSize: 32 }}>🎮</div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Rejoignez Mondialito</div>
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <button onClick={() => navigate('/login')} style={{
          flex: 1, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>Connexion</button>
        <button onClick={() => navigate('/register')} style={{
          flex: 1, background: '#fff', border: 'none',
          borderRadius: 12, padding: '12px', color: '#5DADE2', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Inscription</button>
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)',
      borderRadius: 16, padding: 16, marginTop: 12,
      boxShadow: '0 4px 20px rgba(93,173,226,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#5DADE2',
          }}>{displayName?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{displayName}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, fontWeight: 800 }}>
              {Number(profile?.balance || 0).toFixed(0)} <span style={{ fontSize: 11 }}>HTG</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/deposit')} style={{
          background: '#fff', color: '#5DADE2', border: 'none', borderRadius: 12,
          padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          minHeight: 44,
        }}>+ Dépôt</button>
      </div>
    </div>
  );
}