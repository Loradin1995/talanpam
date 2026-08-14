import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, Lock } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
    } catch {
      // Menm konpòtman kèlkeswa rezilta a — pa revele si imèl la egziste
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Modpas yo pa menm"); return; }
    setLoading(true);
    try {
      await api.auth.resetPassword({ email, otpCode, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.data?.error === 'invalid_or_expired_code' ? 'Kòd envalid oswa ekspire' : (err.message || 'Echèk reyinisyalizasyon'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout icon={Lock} title="Modpas chanje ✓" subtitle="Ou ka konekte ak nouvo modpas ou a">
        <Link to="/login"><Button className="w-full h-12 font-medium">Ale nan Konnekte</Button></Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Mail}
      title="Reyinisyalize modpas"
      subtitle={sent ? "Antre kòd ki voye bay imèl ou a" : "N ap voye w yon kòd pou reyinisyalize modpas ou"}
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Retounen nan Konnekte
        </Link>
      }
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      {!sent ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adrès imèl</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" autoFocus placeholder="ou@egzanp.com"
                value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Voye...</> : "Voye kòd la"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Kòd resevwa pa imèl</Label>
            <Input id="otp" inputMode="numeric" maxLength={6} placeholder="123456"
              value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="h-12" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouvo modpas</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" placeholder="Minimòm 8 karaktè"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfime nouvo modpas</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12" required />
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Chanjman...</> : "Chanje modpas la"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
