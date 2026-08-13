const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

if (config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

const isEmailConfigured = () => !!transporter;

async function sendOtpEmail(to, code, name, purpose = 'login') {
  const firstName = (name || '').split(' ')[0] || 'there';
  const isReset = purpose === 'password_reset';
  const subject = isReset
    ? `🔑 Réinitialisation de votre mot de passe · ${code}`
    : `🔐 Votre code de connexion · ${code}`;
  const description = isReset
    ? 'Votre code de réinitialisation de mot de passe. Il expirera dans'
    : 'Votre code de connexion sécurisée. Il expirera dans';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#0a0f1e;color:#e8f6ff;border-radius:16px;overflow:hidden;border:1px solid #1b2740">
      <div style="background:linear-gradient(135deg,#00e5ff,#7c4dff);padding:18px 24px;color:#04121a">
        <span style="font-weight:700;font-size:18px">Le Gourmet</span>
      </div>
      <div style="padding:28px 24px">
        <h2 style="margin:0 0 10px;font-size:20px;color:#fff">Bonjour ${firstName} 👋</h2>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#a9bfd6">
          ${description} <strong>${config.otp.expiresMinutes} minutes</strong>.
        </p>
        <div style="text-align:center;padding:18px;border-radius:12px;background:#101a30;border:1px dashed #00e5ff">
          <span style="font-size:34px;letter-spacing:10px;font-weight:700;color:#00e5ff;font-family:monospace">${code}</span>
        </div>
        <p style="margin:18px 0 0;font-size:12px;color:#7f93ad;line-height:1.6">
          Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre adresse IP et votre session sont enregistrées.
        </p>
      </div>
    </div>
  `;

  const mail = {
    from: `"Le Gourmet" <${config.smtp.user}>`,
    to,
    subject,
    html,
  };

  if (!transporter) {
    if (config.env === 'production') {
      throw new Error('SMTP is not configured. Set SMTP_USER and SMTP_PASS.');
    }
    console.log(`[email] DEV MODE (SMTP non configuré) — code OTP pour ${to} : ${code}`);
    return { dev: true };
  }

  await transporter.sendMail(mail);
  return { dev: false };
}

module.exports = { sendOtpEmail, isEmailConfigured };
