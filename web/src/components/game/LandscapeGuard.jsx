import { useState, useEffect } from 'react';

// Request fullscreen on mobile to hide the address bar
function requestFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

export default function LandscapeGuard({ children }) {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  // Request fullscreen on first touch interaction (required by browsers)
  useEffect(() => {
    const onTouch = () => {
      if (!document.fullscreenElement) requestFullscreen();
    };
    document.addEventListener('touchstart', onTouch, { once: true });
    return () => document.removeEventListener('touchstart', onTouch);
  }, []);

  if (isPortraitMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0a0e1a',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 24, textAlign: 'center',
        height: '100dvh',
      }}>
        <div style={{
          fontSize: 64,
          animation: 'rotatePhone 1.5s ease-in-out infinite',
          marginBottom: 24,
          display: 'inline-block',
        }}>
          📱
        </div>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>
          Tournez votre écran
        </div>
        <div style={{ color: '#85C1E9', fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
          Le jeu nécessite l'orientation paysage. Veuillez tourner votre téléphone.
        </div>
        <div style={{ color: '#566573', fontSize: 12, marginTop: 20 }}>
          Retounen telefòn ou pou jwe
        </div>
        <style>{`
          @keyframes rotatePhone {
            0%, 100% { transform: rotate(0deg); }
            40% { transform: rotate(90deg); }
            60% { transform: rotate(90deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}