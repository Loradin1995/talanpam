import { useState } from 'react';
import { Search, Bell, Wallet, ChevronDown, LogOut, Menu, X, Shield, BarChart2, Home, Trophy, Swords, Gamepad2, User, Settings } from 'lucide-react';
import { api } from '@/api/client';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function LobbyHeader({ user, profile, navigate }) {
  const [searchVal, setSearchVal] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Joueur';

  const handleLogout = async () => {
    await api.auth.logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Accueil', icon: Home, path: '/lobby' },
    { label: 'Tournois', icon: Trophy, path: '/tournament' },
    { label: 'Défis 1v1', icon: Swords, path: '/challenge' },
    { label: 'Entraînement', icon: Gamepad2, path: '/free-play' },
    { label: 'Mon Compte', icon: User, path: '/dashboard' },
    ...(user?.role === 'admin' ? [{ label: 'Administration', icon: Settings, path: '/admin', admin: true }] : []),
  ];

  return (
    <>
      <header style={{
        background: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 50%, #AED6F1 100%)',
        boxShadow: '0 2px 20px rgba(93,173,226,0.3)',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 12px',
          height: isMobile ? 50 : 64, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16,
        }}>

          {/* Logo */}
          <div onClick={() => navigate('/lobby')} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: isMobile ? 26 : 36, height: isMobile ? 26 : 36, borderRadius: 9,
                background: 'rgba(255,255,255,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                fontSize: isMobile ? 13 : 18, flexShrink: 0,
              }}>⚽</div>
              {!isMobile && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: 0.3, lineHeight: 1 }}>
                    MONDIAL<span style={{ color: '#D6EAF8' }}>ITO</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Plateforme de jeux</div>
                </div>
              )}
              {isMobile && (
                <span style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: 0.3 }}>MONDIALITO</span>
              )}
            </div>
          </div>

          {/* Search — hidden on mobile */}
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: isTablet ? 280 : 420, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%', paddingLeft: 32, paddingRight: 12, height: 36,
                  borderRadius: 20, border: 'none', outline: 'none',
                  background: 'rgba(255,255,255,0.92)', fontSize: 13, color: '#566573',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Balance */}
          {profile && (
            <div onClick={() => navigate('/deposit')} style={{
              display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
              background: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: isMobile ? '4px 9px' : '6px 14px',
              border: '1px solid rgba(255,255,255,0.4)',
            }}>
              <Wallet size={isMobile ? 12 : 13} color="#fff" />
              <span style={{ color: '#fff', fontWeight: 600, fontSize: isMobile ? 11 : 13 }}>
                {Number(profile.balance || 0).toFixed(0)} HTG
              </span>
            </div>
          )}

          {/* Deposit CTA — hidden on mobile */}
          {!isMobile && (
            <button onClick={() => navigate('/deposit')} style={{
              background: '#fff', color: '#5DADE2', border: 'none', borderRadius: 20,
              padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)', whiteSpace: 'nowrap',
            }}>
              + Dépôt
            </button>
          )}

          {/* Desktop user menu */}
          {!isMobile && user ? (
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowMenu(m => !m)} style={{
                display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 12px',
                border: '1px solid rgba(255,255,255,0.35)',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0,
                }}>
                  {displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                  {displayName}
                </span>
                <ChevronDown size={12} color="rgba(255,255,255,0.8)" />
              </div>
              {showMenu && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, background: '#fff',
                  borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  minWidth: 190, overflow: 'hidden', zIndex: 300,
                }}>
                  {[
                    { label: 'Mon compte', action: () => { navigate('/dashboard'); setShowMenu(false); } },
                    { label: 'KYC Vérification', action: () => { navigate('/kyc'); setShowMenu(false); } },
                    { label: 'Dépôt', action: () => { navigate('/deposit'); setShowMenu(false); } },
                    ...(user?.role === 'admin' ? [{ label: '⚙️ Administration', action: () => { navigate('/admin'); setShowMenu(false); }, admin: true }] : []),
                  ].map(item => (
                    <div key={item.label} onClick={item.action} style={{
                      padding: '12px 16px', cursor: 'pointer', fontSize: 13,
                      color: item.admin ? '#E74C3C' : '#566573',
                      fontWeight: item.admin ? 700 : 400,
                      borderBottom: '1px solid #F4F6F7',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#D6EAF8'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      {item.label}
                    </div>
                  ))}
                  <div onClick={handleLogout} style={{
                    padding: '12px 16px', cursor: 'pointer', fontSize: 13, color: '#EC7063',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF9F8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <LogOut size={13} /> Déconnexion
                  </div>
                </div>
              )}
            </div>
          ) : !isMobile && !user ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/login')} style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: 20, padding: '7px 14px', color: '#fff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}>Connexion</button>
              <button onClick={() => navigate('/register')} style={{
                background: '#fff', border: 'none', borderRadius: 20,
                padding: '7px 14px', color: '#5DADE2', fontSize: 13,
                fontWeight: 700, cursor: 'pointer',
              }}>Inscription</button>
            </div>
          ) : null}

          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setShowMobileMenu(v => !v)} style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}>
              {showMobileMenu ? <X size={16} color="#fff" /> : <Menu size={16} color="#fff" />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile drawer menu */}
      {isMobile && showMobileMenu && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 190,
        }} onClick={() => setShowMobileMenu(false)}>
          <div style={{
            background: '#fff', width: '80%', maxWidth: 300, height: '100%',
            padding: '16px 0', overflowY: 'auto',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>

            {/* User info */}
            {user && (
              <div style={{
                padding: '16px 20px', marginBottom: 8,
                background: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#5DADE2',
                  }}>{displayName?.[0]?.toUpperCase() || '?'}</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{displayName}</div>
                    {profile && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{Number(profile.balance || 0).toFixed(0)} HTG</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            {navItems.map(({ label, icon: Icon, path, admin }) => (
              <div key={label} onClick={() => { navigate(path); setShowMobileMenu(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', cursor: 'pointer', fontSize: 14,
                color: admin ? '#E74C3C' : '#2C3E50', fontWeight: admin ? 700 : 500,
                borderBottom: '1px solid #F4F6F7',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#F4F6F7'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <Icon size={18} color={admin ? '#E74C3C' : '#5DADE2'} />
                {label}
              </div>
            ))}

            {/* Auth actions */}
            {!user ? (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => { navigate('/login'); setShowMobileMenu(false); }} style={{
                  background: '#5DADE2', color: '#fff', border: 'none', borderRadius: 12,
                  padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>Connexion</button>
                <button onClick={() => { navigate('/register'); setShowMobileMenu(false); }} style={{
                  background: '#F4F6F7', color: '#566573', border: '1px solid #EBF5FB', borderRadius: 12,
                  padding: '12px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}>Inscription</button>
              </div>
            ) : (
              <div style={{ padding: '16px 20px' }}>
                <button onClick={handleLogout} style={{
                  width: '100%', background: '#FEF3F2', color: '#EC7063', border: 'none', borderRadius: 12,
                  padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}