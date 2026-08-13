import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/layout/Logo';
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
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef(null);

  useEffect(() => {
    document.title = 'Connexion · Le Gourmet';
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
    if (!email.trim()) e.email = "L'adresse email est requise.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Entrez une adresse email valide.';
    if (!password) e.password = 'Le mot de passe est requis.';
    else if (password.length < 6) e.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequestOtp = async (ev) => {
    ev.preventDefault();
    if (!validateCredentials() || loading) return;
    setLoading(true);
    setServerError(null);
    setForgot(false);
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
        setTimeout(() => navigate('/blocked', { state: { from: ip }, replace: true }), 900);
      } else {
        setServerError(err.message || 'La demande a échoué.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ev) => {
    ev.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: 'Entrez le code à 6 chiffres.' });
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
      setServerError(err.message || 'La vérification a échoué.');
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
      const { api } = await import('../api/client');
      await api.resendOtp(pendingToken);
      setInfo('Un nouveau code a été envoyé.');
      setCode('');
      setResendIn(30);
    } catch (err) {
      setServerError(err.message || 'Le renvoi a échoué.');
    } finally {
      setLoading(false);
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setServerError(null);
    setInfo(null);
    setForgot(false);
    setCode('');
  };

  return (
    <div className="page login-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, position: 'relative' }}>
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="login-brand">
          <Logo brand="restaurant" />
        </div>

        <h1 className="login-title">{step === 'otp' ? 'Vérification' : 'Connexion'}</h1>
        <p className="login-sub">
          {step === 'otp' ? 'Entrez le code reçu par email' : 'Accédez à votre espace membre Le Gourmet'}
        </p>

        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            <motion.form
              key="creds"
              onSubmit={handleRequestOtp}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              noValidate
            >
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    className="login-alert login-alert-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    ⚠ {serverError}
                  </motion.div>
                )}
                {forgot && (
                  <motion.div
                    className="login-alert login-alert-info"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    ℹ Pour réinitialiser votre mot de passe, contactez l'administrateur à{' '}
                    <a href="mailto:contact@legourmet.fr" style={{ color: 'inherit', fontWeight: 600 }}>
                      contact@legourmet.fr
                    </a>
                    .
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="login-fields">
                <Input
                  label="Adresse email"
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
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
                />
              </div>

              <div className="login-row">
                <label className="login-check">
                  <input type="checkbox" /> Se souvenir de moi
                </label>
                <button type="button" className="login-link" onClick={() => setForgot((f) => !f)}>
                  Mot de passe oublié&nbsp;?
                </button>
              </div>

              <Button type="submit" size="lg" loading={loading} className="login-btn" style={{ width: '100%' }}>
                {loading ? 'Envoi du code…' : 'Se connecter'}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              onSubmit={handleVerify}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              noValidate
            >
              <AnimatePresence>
                {info && (
                  <motion.div
                    className="login-alert login-alert-success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    ✓ {info}
                  </motion.div>
                )}
                {serverError && (
                  <motion.div
                    className="login-alert login-alert-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    ⚠ {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="login-fields">
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
                  style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center' }}
                />
              </div>

              <Button type="submit" size="lg" loading={loading} className="login-btn" style={{ width: '100%' }}>
                {loading ? 'Vérification…' : 'Valider'}
              </Button>

              <div className="login-row login-row-otp">
                <button type="button" className="login-link" onClick={backToCredentials}>
                  ← Changer d'email
                </button>
                <button
                  type="button"
                  className="login-link"
                  onClick={handleResend}
                  disabled={resendIn > 0 || loading}
                  style={{ color: resendIn > 0 ? '#9ca3af' : undefined, cursor: resendIn > 0 ? 'not-allowed' : 'pointer' }}
                >
                  {resendIn > 0 ? `Renvoyer (${resendIn}s)` : 'Renvoyer le code'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="login-foot">
          Connexion sécurisée · Un code est envoyé par email · Votre IP est enregistrée
        </p>
      </motion.div>

      <Link to="/" className="login-back">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}
