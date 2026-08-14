import { Trophy, Star } from 'lucide-react';

// Default prize distribution percentages (mirrors top platforms)
const DISTRIBUTION = [0.40, 0.20, 0.12, 0.06, 0.05, 0.04, 0.03, 0.025, 0.015, 0.01];

const RANK_STYLE = [
  { bg: '#FEF9E7', icon: '#F4D03F', iconBg: '#FCF3CF' }, // gold
  { bg: '#F4F6F7', icon: '#AEB6BF', iconBg: '#EAECEE' }, // silver
  { bg: '#FDF2E9', icon: '#E59866', iconBg: '#FAE5D3' }, // bronze
];

export default function TournamentPrizes({ jackpot = 0 }) {
  const prizes = DISTRIBUTION.map((pct, i) => ({
    rank: i + 1,
    amount: Math.round(jackpot * pct),
  })).filter(p => p.amount > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#2C3E50' }}>Prix</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prizes.map((p, idx) => {
          const s = RANK_STYLE[idx] || { bg: '#fff', icon: '#5DADE2', iconBg: '#EBF5FB' };
          return (
            <div key={p.rank} style={{
              background: '#fff', borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: '1px solid #EBF5FB',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {idx < 3 ? <Trophy size={20} color={s.icon} /> : <Star size={18} color={s.icon} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50' }}>{p.rank} place</div>
                <div style={{ fontSize: 14, color: '#85C1E9', fontWeight: 600 }}>G {p.amount.toLocaleString('fr-FR')}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}