import LobbyHeader from '@/components/lobby/LobbyHeader';
import LobbyNav from '@/components/lobby/LobbyNav';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function PageLayout({ children, profile, user, activeNav = '' }) {
  const navigate = useNavigate();
  const [nav, setNav] = useState(activeNav);
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <LobbyHeader user={user} profile={profile} navigate={navigate} />
      {!isMobile && <LobbyNav activeNav={nav} setActiveNav={setNav} />}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: isMobile ? '12px 12px 72px' : '24px 16px',
      }}>
        {children}
      </div>
      {isMobile && <LobbyNav activeNav={nav} setActiveNav={setNav} />}
    </div>
  );
}