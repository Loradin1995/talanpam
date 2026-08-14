import { Home, Gamepad2, Trophy, Swords, User, BarChart2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const NAV_ITEMS = [
  { id: 'accueil', label: 'Accueil', icon: Home, path: '/lobby' },
  { id: 'tournois', label: 'Tournois', icon: Trophy, path: '/tournament' },
  { id: 'defis', label: 'Défis 1v1', icon: Swords, path: '/challenge' },
  { id: 'entrainement', label: 'Entraîn.', icon: Gamepad2, path: '/free-play' },
  { id: 'dashboard', label: 'Compte', icon: User, path: '/dashboard' },
];

export default function LobbyNav({ activeNav, setActiveNav }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useBreakpoint();

  // Mobile: bottom tab bar
  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: '#fff', borderTop: '1px solid #EBF5FB',
        boxShadow: '0 -4px 20px rgba(93,173,226,0.12)',
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const active = path ? location.pathname === path : activeNav === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveNav(id); if (path) navigate(path); }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '8px 4px', border: 'none',
                background: active ? '#EBF5FB' : 'transparent',
                color: active ? '#5DADE2' : '#566573',
                cursor: 'pointer', minHeight: 56, gap: 3,
              }}
            >
              <Icon size={active ? 22 : 20} />
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, lineHeight: 1 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Desktop/Tablet: horizontal nav bar
  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #EBF5FB',
      boxShadow: '0 1px 8px rgba(93,173,226,0.08)',
      position: 'sticky', top: 64, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto',
      }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const active = path ? location.pathname === path : activeNav === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveNav(id); if (path) navigate(path); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 14px', height: 44, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 700 : 500,
                background: active ? '#EBF5FB' : 'transparent',
                color: active ? '#5DADE2' : '#566573',
                borderBottom: active ? '2px solid #5DADE2' : '2px solid transparent',
                borderRadius: active ? '8px 8px 0 0' : 0,
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F4F6F7'; e.currentTarget.style.color = '#5DADE2'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#566573'; } }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}