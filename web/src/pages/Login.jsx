import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const labelStyle = { display: 'block', color: '#566573', fontSize: 12, fontWeight: 600, marginBottom: 6 };
const inputStyle = {
  width: '100%', background: '#F4F6F7', border: '1.5px solid #EBF5FB',
  borderRadius: 10, padding: '12px 14px', color: '#2C3E50', fontSize: 14,
  boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif',
  minHeight: 48,
};

const AuthCard = ({ children }) => (
  <div style={{
    minHeight: '100vh', background: '#F4F6F7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif', padding: 16,
  }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'linear-gradient(135deg, #5DADE2 0%, #2E86C1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 16px rgba(93,173,226,0.4)',
          }}>⚽</div>
          <div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#2C3E50' }}>MONDIAL</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#5DADE2' }}>ITO</span>
          </div>
        </Link>
        <p style={{ color: '#85C1E9', fontSize: 13, marginTop: 8 }}>Platfòm jwèt/konkou an liy ⚡</p>
      </div>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 24,
        border: '1px solid #EBF5FB', boxShadow: '0 8px 40px rgba(93,173,226,0.12)',
      }}>
        {children}
      </div>
    </div>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ERROR_LABELS = {
    invalid_credentials: 'Email oswa modpas ensorèk',
    account_banned: 'Kont sa a bloke. Kontakte sipò.',
    email_not_verified: 'Verifye imèl ou anvan — tcheke bwat resepsyon ou pou kòd la.',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.login(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(ERROR_LABELS[err.data?.error] || 'Echèk koneksyon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#2C3E50' }}>Konneksyon</h2>
      <p style={{ margin: '0 0 22px', color: '#85C1E9', fontSize: 13 }}>Byenveni sou Mondialito</p>

      {error && (
        <div style={{ background: '#FEF3F2', border: '1px solid #FADBD8', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#EC7063', fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="login-email" style={labelStyle}>Adrès imèl</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
            <input
              id="login-email" type="email" required autoComplete="email" placeholder="ou@egzanp.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label htmlFor="login-password" style={labelStyle}>Modpas</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
            <input
              id="login-password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36, paddingRight: 38 }}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#85C1E9' }}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <Link to="/forgot-password" style={{ color: '#5DADE2', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
            Modpas bliye ?
          </Link>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', background: loading ? '#BDC3C7' : '#5DADE2', color: '#fff',
          border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(93,173,226,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          minHeight: 50,
        }}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Koneksyon...</> : "Konekte"}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, color: '#566573', fontSize: 14 }}>
        Pa enskri ankò ?{' '}
        <Link to="/register" style={{ color: '#5DADE2', fontWeight: 700, textDecoration: 'none' }}>
          Kreye yon kont
        </Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: '#BDC3C7' }}>
        <Link to="/terms" style={{ color: '#BDC3C7' }}>CGU</Link> · <Link to="/privacy" style={{ color: '#BDC3C7' }}>Konfidansyalite</Link> · <Link to="/responsible-gaming" style={{ color: '#BDC3C7' }}>Jwèt Responsab</Link>
      </p>
    </AuthCard>
  );
}
