import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/layout/Logo';
import { ParticleField } from '../components/3d/ParticleField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { ADMIN_PATH } from '../config';

export default function Login() {
  const { requestOtp, completeLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [blockedIp, setBlockedIp] = useState(null);
  const codeRef = useRef(null);

  useEffect(() => {
    document.title = 'Login · Le Gourmet';
  }, []);

  useEffect(() => {
    if (step === 'otp' && codeRef.current) {
      codeRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const validateCredentials = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequestOtp = async (ev) => {
    ev.preventDefault();
    if (!validateCredentials() || loading) return;
    setLoading(true);
    setServerError(null);
    setBlockedIp(null);
    setInfo(null);
    try {
      const data = await requestOtp(email.trim(), password);
      setPendingToken(data.pendingToken);
      setStep('otp');
      setInfo(`Un code à 6 chiffres a été envoyé à ${data.email}.`);
      setResendIn(30);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'IP_BLOCKED') {
        const ip = err.details?.ip || 'unknown';
        setBlockedIp(ip);
        setTimeout(() => navigate('/blocked', { state: { from: ip }, replace: true }), 900);
      } else {
        setServerError(err.message || 'Request failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ev) => {
    ev.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: 'Enter the 6-digit code.' });
      return;
    }
    if (loading) return;
    setLoading(true);
    setServerError(null);
    setErrors({});
    try {
      const data = await completeLogin(pendingToken, code.trim());
      navigate(data.user.role === 'admin' ? ADMIN_PATH : '/', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Verification failed.');
      setCode('');
      if (codeRef.current) codeRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading || resendIn > 0) return;
    setLoading(true);
    setServerError(null);
    try {
      const data = await apiResend();
      setInfo('Un nouveau code a été envoyé.');
      setCode('');
      setResendIn(30);
    } catch (err) {
      setServerError(err.message || 'Resend failed.');
    } finally {
      setLoading(false);
    }
  };

  const apiResend = async () => {
    const { api } = await import('../api/client');
    return api.resendOtp(pendingToken);
  };

  return (
    <div className="page restaurant-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ParticleField count={160} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: 20 }}>
        <Logo brand="restaurant" />
      </div>

      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '0 20px 60px', position: 'relative', zIndex: 2 }}>
        <motion.div
          className="card corner-frame"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 430,
            padding: '38px 34px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span className="scan-line" />

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 58,
                height: 58,
                margin: '0 auto 16px',
                borderRadius: 16,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--gradient-main)',
                color: '#04121a',
                fontSize: 24,
                boxShadow: '0 0 40px rgba(0,229,255,0.35)',
              }}
            >
              {step === 'otp' ? '✉' : '🍽'}
            </div>
            <h2 style={{ fontSize: 26 }}>{step === 'otp' ? 'Vérification' : 'Bienvenue'}</h2>
            <p className="mono" style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>
              {step === 'otp' ? 'CODE RECU PAR EMAIL' : 'ESPACE MEMBRE · LE GOURMET'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.div key="creds" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginBottom: 18,
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,77,109,0.1)',
                        border: '1px solid rgba(255,77,109,0.3)',
                        color: 'var(--danger)',
                        fontSize: 13.5,
                      }}
                    >
                      ⚠ {serverError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="votre@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    autoComplete="email"
                  />
                  <Input
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    autoComplete="current-password"
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      CONNEXION SECURISEE + OTP EMAIL
                    </span>
                  </div>

                  <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
                    {loading ? 'Envoi du code…' : 'Continuer'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <AnimatePresence>
                  {info && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginBottom: 18,
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: 'rgba(0,229,255,0.08)',
                        border: '1px solid rgba(0,229,255,0.3)',
                        color: 'var(--primary)',
                        fontSize: 13.5,
                      }}
                    >
                      ✓ {info}
                    </motion.div>
                  )}

                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginBottom: 18,
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,77,109,0.1)',
                        border: '1px solid rgba(255,77,109,0.3)',
                        color: 'var(--danger)',
                        fontSize: 13.5,
                      }}
                    >
                      ⚠ {serverError}
                    </motion.div>
                  )}

                  <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
                    <Input
                      label="Code à 6 chiffres"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      error={errors.code}
                      autoComplete="one-time-code"
                      ref={codeRef}
                      style={{ fontSize: 22, letterSpacing: 8, textAlign: 'center' }}
                    />

                    <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
                      {loading ? 'Vérification…' : 'Se connecter'}
                    </Button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => { setStep('credentials'); setServerError(null); setInfo(null); setCode(''); }}
                        className="mono"
                        style={{ fontSize: 12, color: 'var(--text-3)' }}
                      >
                        ← Changer d'email
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendIn > 0 || loading}
                        className="mono"
                        style={{ fontSize: 12, color: resendIn > 0 ? 'var(--text-3)' : 'var(--primary)' }}
                      >
                        {resendIn > 0 ? `Renvoyer (${resendIn}s)` : 'Renvoyer le code'}
                      </button>
                    </div>
                  </form>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Votre IP est détectée automatiquement à la connexion
            </span>
          </div>
        </motion.div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingBottom: 26 }}>
        <Link to="/" style={{ color: 'var(--text-3)', fontSize: 13 }}>
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
