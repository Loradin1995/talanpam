import { Trophy, Medal } from 'lucide-react';

// Non pou montre pou yon antre klasman: pseudo KYC si li apwouve/soumèt,
// sinon premye pati imel la kòm repli — pa gen plis apèl base44 UserProfile.
function displayNameFor(entry) {
  const kyc = entry.user?.kyc;
  if (kyc?.username) return kyc.username;
  if (kyc?.firstName) return kyc.firstName;
  return entry.user?.email?.split('@')[0] || `Joueur #${entry.userId?.slice(-4)}`;
}

export default function TournamentLeaderboard({ entries, currentUserId }) {
  const rankColors = ['#F4D03F', '#AEB6BF', '#E59866'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Trophy size={18} color="#F4D03F" />
        <h3 style={{ margin: 0, color: '#2C3E50', fontWeight: 900, fontSize: 18 }}>Classement</h3>
      </div>
      {entries.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, textAlign: 'center', color: '#85C1E9', border: '1px solid #EBF5FB', fontSize: 13, fontWeight: 600 }}>
          Aucun joueur pour le moment
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry, idx) => {
            const isMe = entry.userId === currentUserId;
            return (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12,
                background: isMe ? '#EBF5FB' : '#fff',
                border: `1px solid ${isMe ? '#5DADE2' : '#EBF5FB'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: idx < 3 ? `${rankColors[idx]}22` : '#F4F6F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: idx < 3 ? rankColors[idx] : '#85C1E9', fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>
                    {idx < 3 ? <Medal size={16} color={rankColors[idx]} /> : idx + 1}
                  </div>
                  <span style={{ color: isMe ? '#5DADE2' : '#2C3E50', fontSize: 14, fontWeight: isMe ? 800 : 600 }}>
                    {isMe ? `${displayNameFor(entry)} (Vous)` : displayNameFor(entry)}
                  </span>
                </div>
                <span style={{ color: '#2C3E50', fontWeight: 800, fontSize: 14 }}>
                  {entry.bestScore} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}