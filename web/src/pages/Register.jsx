import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api, setSession } from "@/api/client";
import { Mail, Lock, Loader2, Eye, EyeOff, Calendar } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const labelStyle = { display: 'block', color: '#566573', fontSize: 12, fontWeight: 600, marginBottom: 6 };
const inputStyle = {
  width: '100%', background: '#F4F6F7', border: '1.5px solid #EBF5FB',
  borderRadius: 10, padding: '11px 14px', color: '#2C3E50', fontSize: 14,
  boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif',
};

const AuthCard = ({ children }) => (
  <div style={{
    minHeight: '100vh', background: '#F4F6F7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif', padding: 16,
  }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #5DADE2 0%, #2E86C1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 4px 16px rgba(93,173,226,0.4)',
          }}>⚽</div>
          <div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#2C3E50' }}>MONDIAL</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#5DADE2' }}>ITO</span>
          </div>
        </Link>
        <p style={{ color: '#85C1E9', fontSize: 13, marginTop: 8 }}>Platfòm jwèt/konkou an liy ⚡</p>
      </div>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        border: '1px solid #EBF5FB', boxShadow: '0 8px 40px rgba(93,173,226,0.12)',
      }}>
        {children}
      </div>
    </div>
  </div>
);

const ERROR_LABELS = {
  age_below_minimum: 'Ou dwe gen 18 an oswa plis pou enskri sou Mondialito.',
  email_already_registered: 'Yon kont deja egziste ak imèl sa a.',
  invalid_or_expired_code: 'Kòd envalid oswa ekspire.',
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [ageConfirmed18, setAgeConfirmed18] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Modpas yo pa menm"); return; }
    if (!birthDate) { setError("Antre dat nesans ou"); return; }
    if (!ageConfirmed18) { setError("Ou dwe konfime ou gen 18 an oswa plis."); return; }
    if (!tosAccepted) { setError("Ou dwe aksepte Kondisyon Itilizasyon yo."); return; }
    setLoading(true);
    try {
      await api.auth.register({ email, password, birthDate, ageConfirmed18: true, tosAccepted: true });
      setShowOtp(true);
    } catch (err) {
      setError(ERROR_LABELS[err.data?.error] || err.message || "Echèk enskripsyon");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.auth.verifyOtp({ email, otpCode });
      if (result?.accessToken) setSession(result);
      window.location.href = "/";
    } catch (err) {
      setError(ERROR_LABELS[err.data?.error] || err.message || "Kòd envalid");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try { await api.auth.resendOtp(email); } catch (err) { setError(err.message || "Echèk"); }
  };

  if (showOtp) {
    return (
      <AuthCard>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={24} color="#5DADE2" />
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#2C3E50' }}>Verifye imèl ou</h2>
          <p style={{ margin: 0, color: '#85C1E9', fontSize: 13 }}>Kòd voye bay <strong>{email}</strong></p>
        </div>

        {error && (
          <div style={{ background: '#FEF3F2', border: '1px solid #FADBD8', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#EC7063', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button onClick={handleVerify} disabled={loading || otpCode.length < 6} style={{
          width: '100%', background: loading || otpCode.length < 6 ? '#BDC3C7' : '#5DADE2', color: '#fff',
          border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700,
          cursor: loading || otpCode.length < 6 ? 'not-allowed' : 'pointer',
          boxShadow: loading || otpCode.length < 6 ? 'none' : '0 4px 14px rgba(93,173,226,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifikasyon...</> : 'Konfime'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#566573', fontSize: 13 }}>
          Pa resevwa l ?{' '}
          <button onClick={handleResend} style={{ color: '#5DADE2', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Voye kòd la ankò
          </button>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#2C3E50' }}>Kreye yon kont</h2>
      <p style={{ margin: '0 0 24px', color: '#85C1E9', fontSize: 13 }}>Rantre nan Mondialito gratis</p>

      {error && (
        <div style={{ background: '#FEF3F2', border: '1px solid #FADBD8', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#EC7063', fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="reg-email" style={labelStyle}>Adrès imèl</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
            <input id="reg-email" type="email" required autoComplete="email" placeholder="ou@egzanp.com"
              value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="reg-birthdate" style={labelStyle}>Dat nesans</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
            <input id="reg-birthdate" type="date" required
              value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="reg-password" style={labelStyle}>Modpas</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
            <input id="reg-password" type={showPwd ? 'text' : 'password'} required autoComplete="new-password" placeholder="Minimòm 8 karaktè"
              value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, paddingLeft: 36, paddingRight: 38 }} />
            <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#85C1E9' }}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="reg-confirm" style={labelStyle}>Konfime modpas</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#85C1E9' }} />
            <input id="reg-confirm" type={showPwd ? 'text' : 'password'} required autoComplete="new-password" placeholder="••••••••"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 12.5, color: '#566573', cursor: 'pointer' }}>
          <input type="checkbox" checked={ageConfirmed18} onChange={e => setAgeConfirmed18(e.target.checked)} style={{ marginTop: 2 }} />
          <span>Mwen konfime mwen gen <strong>18 an oswa plis</strong>.</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20, fontSize: 12.5, color: '#566573', cursor: 'pointer' }}>
          <input type="checkbox" checked={tosAccepted} onChange={e => setTosAccepted(e.target.checked)} style={{ marginTop: 2 }} />
          <span>Mwen aksepte <Link to="/terms" target="_blank" style={{ color: '#5DADE2' }}>Kondisyon Itilizasyon</Link>, <Link to="/privacy" target="_blank" style={{ color: '#5DADE2' }}>Politik Konfidansyalite</Link>, ak <Link to="/responsible-gaming" target="_blank" style={{ color: '#5DADE2' }}>Jwèt Responsab</Link>.</span>
        </label>

        <button type="submit" disabled={loading} style={{
          width: '100%', background: loading ? '#BDC3C7' : '#5DADE2', color: '#fff',
          border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(93,173,226,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Kreyasyon...</> : "Kreye kont mwen"}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, color: '#566573', fontSize: 14 }}>
        Ou gen yon kont deja ?{' '}
        <Link to="/login" style={{ color: '#5DADE2', fontWeight: 700, textDecoration: 'none' }}>
          Konekte
        </Link>
      </p>
    </AuthCard>
  );
}
