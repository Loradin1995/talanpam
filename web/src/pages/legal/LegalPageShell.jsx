import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LegalPageShell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F7', padding: '32px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5DADE2', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 18 }}>
          <ArrowLeft size={15} /> Retounen
        </Link>
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 26px', border: '1px solid #EBF5FB', boxShadow: '0 4px 20px rgba(93,173,226,0.08)' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: '#2C3E50' }}>{title}</h1>
          {subtitle && <p style={{ margin: '0 0 22px', color: '#85C1E9', fontSize: 13 }}>{subtitle}</p>}
          <div style={{ color: '#425364', fontSize: 14.5, lineHeight: 1.75 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
