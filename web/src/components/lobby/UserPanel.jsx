import { useState } from 'react';
import { Star, Gift, Bell, Clock, Zap, ChevronRight, Shield, Trophy } from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: '🏆', title: 'Tournois actifs', sub: 'Jackpot en cours', color: '#FFFBEB', path: '/tournament' },
  { icon: '⚔️', title: 'Défis 1v1', sub: 'Trouver un adversaire', color: '#EFF6FF', path: '/challenge' },
  { icon: '🎮', title: 'Entraînement', sub: 'Mode gratuit', color: '#F0FDF4', path: '/free-play' },
];

const RECENT = [
  { icon: '🏆', text: 'Tournoi rejoint', time: 'il y a 2h' },
  { icon: '✅', text: 'KYC approuvé', time: 'hier' },
  { icon: '💰', text: 'Dépôt 500 HTG reçu', time: 'il y a 2j' },
  { icon: '⚔️', text: 'Défi gagné +200 HTG', time: 'il y a 3j' },
];

export default function UserPanel({ user, profile, navigate }) {
  const [activeTab, setActiveTab] = useState('promos');
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Joueur';

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, #5DADE2 0%, #85C1E9 100%)',
        borderRadius: 16, padding: '18px',
        boxShadow: '0 4px 20px rgba(93,173,226,0.3)',
      }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#5DADE2',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}>
                {displayName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                  {displayName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <Star size={11} color="#FFF176" fill="#FFF176" />
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Niveau Bronze</span>
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backdropFilter: 'blur(4px)',
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Solde</div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>
                  {Number(profile?.balance || 0).toFixed(0)} <span style={{ fontSize: 12, fontWeight: 500 }}>HTG</span>
                </div>
              </div>
              <button onClick={() => navigate('/deposit')} style={{
                background: '#fff', color: '#5DADE2', border: 'none', borderRadius: 10,
                padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}>
                + Dépôt
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <button onClick={() => navigate('/kyc')} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '7px', color: '#fff', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <Shield size={12} /> Vérification
              </button>
              <button onClick={() => navigate('/dashboard')} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '7px', color: '#fff', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <Trophy size={12} /> Mon compte
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎮</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Rejoignez Mondialito</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 14 }}>
              Créez votre compte et commencez à jouer
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/login')} style={{
                flex: 1, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 10, padding: '8px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Connexion</button>
              <button onClick={() => navigate('/register')} style={{
                flex: 1, background: '#fff', border: 'none',
                borderRadius: 10, padding: '8px', color: '#5DADE2', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}>Inscription</button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Promos / Historique */}
      <div style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(93,173,226,0.08)',
        border: '1px solid #EBF5FB',
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #EBF5FB' }}>
          {[
            { id: 'promos', label: '🎮 Jouer', icon: Gift },
            { id: 'recent', label: '🕐 Activité', icon: Clock },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '11px', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: activeTab === tab.id ? '#EBF5FB' : '#fff',
              color: activeTab === tab.id ? '#5DADE2' : '#566573',
              borderBottom: activeTab === tab.id ? '2px solid #5DADE2' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ padding: '12px' }}>
          {activeTab === 'promos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_ACTIONS.map(action => (
                <div key={action.title} onClick={() => navigate(action.path)} style={{
                  background: action.color, borderRadius: 10, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  transition: 'transform 0.15s',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <span style={{ fontSize: 22 }}>{action.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50' }}>{action.title}</div>
                    <div style={{ fontSize: 11, color: '#566573' }}>{action.sub}</div>
                  </div>
                  <ChevronRight size={14} color="#85C1E9" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECENT.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: i < RECENT.length - 1 ? '1px solid #F4F6F7' : 'none',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8, background: '#F4F6F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
                  }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#2C3E50', fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 10, color: '#BDC3C7', marginTop: 1 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      {user && profile && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 14,
          boxShadow: '0 2px 10px rgba(93,173,226,0.08)',
          border: '1px solid #EBF5FB',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#566573', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Statistiques
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Parties jouées', value: profile.gamesPlayed || 0, icon: '🎮' },
              { label: 'Total gagné', value: `${Number(profile.totalWon || 0).toFixed(0)} HTG`, icon: '💰' },
              { label: 'Total misé', value: `${Number(profile.totalWagered || 0).toFixed(0)} HTG`, icon: '📊' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#F8FCFF', borderRadius: 10, padding: '8px 10px',
                border: '1px solid #EBF5FB',
              }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{stat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#85C1E9' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}