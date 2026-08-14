const SPORTS = [
  { id: 'football', icon: '⚽', label: 'Football', count: 128 },
  { id: 'basketball', icon: '🏀', label: 'Basketball', count: 44 },
  { id: 'tennis', icon: '🎾', label: 'Tennis', count: 37 },
  { id: 'baseball', icon: '⚾', label: 'Baseball', count: 22 },
  { id: 'esport', icon: '🎮', label: 'Esport', count: 61 },
  { id: 'hockey', icon: '🏒', label: 'Hockey', count: 18 },
  { id: 'courses', icon: '🏎️', label: 'Courses', count: 9 },
  { id: 'volleyball', icon: '🏐', label: 'Volley', count: 14 },
  { id: 'boxing', icon: '🥊', label: 'Boxe', count: 5 },
];

export default function SportsSidebar({ activeSport, setActiveSport }) {
  return (
    <aside>
      <div style={{
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 12px rgba(93,173,226,0.08)',
        overflow: 'hidden',
        border: '1px solid #EBF5FB',
      }}>
        {SPORTS.map(({ id, icon, label, count }) => {
          const active = activeSport === id;
          return (
            <div
              key={id}
              onClick={() => setActiveSport(id)}
              title={label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3,
                padding: '12px 6px', cursor: 'pointer',
                background: active ? '#EBF5FB' : 'transparent',
                borderLeft: active ? '3px solid #5DADE2' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F4F6F7'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 500,
                color: active ? '#5DADE2' : '#566573',
                textAlign: 'center', lineHeight: 1.2,
              }}>{label}</span>
              {count && (
                <span style={{
                  fontSize: 9, background: active ? '#5DADE2' : '#EBF5FB',
                  color: active ? '#fff' : '#85C1E9',
                  borderRadius: 6, padding: '1px 5px', fontWeight: 600,
                }}>{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}