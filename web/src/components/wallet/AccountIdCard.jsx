import { useState } from 'react';
import { Hash, Copy, Check } from 'lucide-react';

export default function AccountIdCard({ accountId, compact = false }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(accountId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2E86C1 0%, #5DADE2 100%)',
      borderRadius: 14, padding: compact ? '12px 14px' : '16px 18px',
      marginBottom: compact ? 0 : 18, color: '#fff',
      boxShadow: '0 4px 16px rgba(46,134,193,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, opacity: 0.9 }}>
        <Hash size={14} />
        <span style={{ fontSize: 12, fontWeight: 600 }}>Votre ID de compte</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: compact ? 20 : 26, fontWeight: 900, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}>
          {accountId}
        </span>
        <button onClick={copy} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 9, padding: '7px 12px', color: '#fff', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', minHeight: 36, flexShrink: 0,
        }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8, lineHeight: 1.4 }}>
        Communiquez ce numéro à l'administrateur pour recharger votre compte.
        <br />Bay administratè a nimewo sa pou w rechaje.
      </div>
    </div>
  );
}