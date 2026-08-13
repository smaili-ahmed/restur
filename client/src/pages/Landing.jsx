import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { GlobeScene } from '../components/3d/GlobeScene';
import { ParticleField } from '../components/3d/ParticleField';
import { Logo } from '../components/layout/Logo';

const FLOAT_CARDS = [
  { ip: '192.168.1.42', table: 'Table 4', note: 'Dégustation · 20h30', x: '5%', y: '18%', delay: 0 },
  { ip: '203.0.113.7', table: 'Table 7', note: 'Menu du chef · 19h45', x: '82%', y: '13%', delay: 0.6 },
  { ip: '10.0.2.15', table: 'Table 2', note: 'Soirée privée · 21h', x: '3%', y: '60%', delay: 1.1 },
  { ip: '172.16.4.9', table: 'Table 9', note: 'Brunch · 11h30', x: '86%', y: '56%', delay: 0.3 },
  { ip: '66.249.75.3', table: 'Table 1', note: 'Vin & fromages · 22h', x: '70%', y: '82%', delay: 1.6 },
  { ip: '198.51.100.14', table: 'Table 5', note: 'Carte printemps · 20h', x: '12%', y: '84%', delay: 0.9 },
];

const STARTERS = [
  { name: 'Velouté de potimarron', desc: 'Châtaigne rôtie, crème de noisette et huile de noisette torréfiée.', price: '14€' },
  { name: 'Foie gras mi-cuit', desc: 'Chutney de figues, pain brioché toasté et fleur de sel.', price: '22€' },
  { name: 'Huîtres fines de claire', desc: 'Servies avec un vinaigre d’échalote et citron caviar.', price: '18€' },
];

const MAINS = [
  { name: 'Homard bleu', desc: 'Cuit à basse température, beurre d’agrumes, algue marine.', price: '38€' },
  { name: 'Filet de bœuf vieilli', desc: '45 jours d’affinage, jus corsé au poivre noir, purée truffée.', price: '34€' },
  { name: 'Canard laqué', desc: 'Façon asiatique, chutney de mangue et épices douces.', price: '29€' },
];

const DESSERTS = [
  { name: 'Soufflé pistache', desc: 'Cœur coulant, glace vanille de Madagascar.', price: '14€' },
  { name: 'Mille-feuille vanille', desc: 'Pâte feuilletée caramélisée, crème légère à la vanille bourbon.', price: '13€' },
  { name: 'Café gourmand', desc: 'Trois douceurs du moment accompagnées d’un café.', price: '11€' },
];

const STEPS = [
  { icon: '✉', title: '1 · Votre email', desc: 'Entrez n’importe quel Gmail réel avec un mot de passe. Le compte est créé automatiquement.' },
  { icon: '🔑', title: '2 · Code reçu', desc: 'Un code à 6 chiffres arrive dans votre boîte mail. Vous le validez en quelques secondes.' },
  { icon: '🍽', title: '3 · Bonne table', desc: 'Vous entrez dans l’espace membre : réservations, menus et profil.' },
  { icon: '⌗', title: '4 · IP tracée', desc: 'Chaque connexion est enregistrée côté restaurant pour protéger l’accès.' },
];

const TESTIMONIALS = [
  { quote: 'Une expérience d’exception du début à la fin. La connexion est d’ailleurs aussi raffinée que la carte.', name: 'Claire D.', role: 'Habituée · Table 4' },
  { quote: 'Recevoir un code par email avant l’accès au menu, on se sent vraiment privilégié.', name: 'Marc L.', role: 'Client fidèle' },
  { quote: 'Le restaurant qui pense à tout, jusqu’à la sécurité de ses clients. Bravo.', name: 'Sophie R.', role: 'Table 7' },
];

function FloatingCard({ ip, table, note, x, y, delay }) {
  return (
    <motion.div
      className="glass pill"
      style={{ position: 'absolute', left: x, top: y, zIndex: 2, pointerEvents: 'none', gap: 8, padding: '10px 14px' }}
      animate={{ y: [0, -14, 0], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <span className="dot" style={{ color: 'var(--ok)' }} />
      <span className="restaurant-serif" style={{ fontSize: 14, color: 'var(--primary)' }}>{table}</span>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{note}</span>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{ip}</span>
    </motion.div>
  );
}

function MenuList({ title, items }) {
  return (
    <div>
      <h3 className="restaurant-serif" style={{ fontSize: 30, color: 'var(--primary)', marginBottom: 6, textAlign: 'center' }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: 0 }}>
        {items.map((m) => (
          <div key={m.name} className="restaurant-menu-item">
            <div className="restaurant-dish">{m.name}</div>
            <div className="restaurant-menu-dots" />
            <div className="restaurant-price">{m.price}</div>
            <div className="restaurant-desc">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <div className="page restaurant-theme" style={{ overflow: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section
        ref={heroRef}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 'var(--nav-h)',
          background:
            'radial-gradient(circle at 70% 40%, rgba(227,176,75,0.10), transparent 45%), radial-gradient(circle at 20% 80%, rgba(138,109,59,0.12), transparent 50%)',
        }}
      >
        <motion.div style={{ y: bgY, position: 'absolute', inset: 0 }} className="particle-layer">
          <ParticleField
            count={200}
            color="#e3b04b"
            color1="rgba(227,176,75,0.22)"
            color2="rgba(138,109,59,0.2)"
          />
        </motion.div>

        {FLOAT_CARDS.map((f) => (
          <FloatingCard key={f.ip} {...f} />
        ))}

        <div className="container hero-grid" style={{ position: 'relative', zIndex: 5, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center' }}>
          <div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="restaurant-rule" style={{ marginBottom: 22 }}>
                RESTAURANT GASTRONOMIQUE · PARIS
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'clamp(46px, 7vw, 86px)',
                lineHeight: 1.02,
                marginBottom: 20,
              }}
            >
              Le Gourmet
              <br />
              <em style={{ color: 'var(--primary)', fontWeight: 500 }}>la table d'exception</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ fontSize: 'clamp(16px, 1.6vw, 19px)', color: 'var(--text-2)', maxWidth: 560, lineHeight: 1.75, marginBottom: 34 }}
            >
              Une cuisine de saison au cœur de la ville. Accédez à votre espace membre, découvrez notre
              carte et réservez votre table — chaque connexion est confirmée par un code envoyé sur votre
              email.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
            >
              <a href="#reservation" className="btn btn-primary btn-lg">
                Réserver une table
              </a>
              <a href="#carte" className="btn btn-ghost btn-lg">
                Voir la carte ↓
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mono"
              style={{ marginTop: 28, fontSize: 11.5, color: 'var(--text-3)', letterSpacing: '0.14em' }}
            >
              ACCES MEMBRE SECURISE · VOTRE IP EST TRACEE A CHAQUE CONNEXION
            </motion.p>
          </div>

          <motion.div
            className="hero-scene"
            style={{ position: 'relative', height: 'min(78vh, 640px)', x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
          >
            <GlobeScene showHud tone="gold" />
          </motion.div>
        </div>

        <motion.div
          style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <span className="mono" style={{ color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.25em' }}>
            DEFILER ▼
          </span>
        </motion.div>
      </section>

      {/* Notre histoire */}
      <section style={{ padding: '110px 0', position: 'relative' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="restaurant-rule" style={{ marginBottom: 18 }}>NOTRE HISTOIRE</div>
            <h2 className="section-title restaurant-serif" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 600 }}>
              La maison, depuis <em style={{ color: 'var(--primary)' }}>1974</em>
            </h2>
            <p className="section-sub" style={{ maxWidth: 640, margin: '18px auto 0', color: 'var(--text-2)', fontSize: 16, lineHeight: 1.8 }}>
              Trois générations de passion autour d'une même exigence : des produits remarquables,
              une cuisine sincère et un service à la hauteur de nos hôtes.
            </p>
          </motion.div>

          <div className="grid grid-4">
            {[
              { v: '50', l: 'années de maison' },
              { v: '12', l: 'chefs étoilés formés' },
              { v: '40', l: 'couverts par service' },
              { v: '100%', l: 'connexions tracées' },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                className="card glass-hover"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ textAlign: 'center', padding: '34px 20px' }}
              >
                <div className="restaurant-serif" style={{ fontSize: 48, color: 'var(--primary)', fontWeight: 600 }}>{s.v}</div>
                <p style={{ color: 'var(--text-3)', fontSize: 13.5, marginTop: 6, letterSpacing: '0.06em' }}>{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* La Carte */}
      <section id="carte" style={{ padding: '90px 0', position: 'relative' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="restaurant-rule" style={{ marginBottom: 18 }}>LA CARTE</div>
            <h2 className="section-title restaurant-serif" style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 600 }}>
              Nos <em style={{ color: 'var(--primary)' }}>signatures</em>
            </h2>
            <p className="section-sub" style={{ maxWidth: 560, margin: '14px auto 0' }}>
              Une carte qui évolue au rythme du marché et des saisons.
            </p>
          </motion.div>

          <div className="grid grid-3" style={{ gap: 44, alignItems: 'start' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}>
              <MenuList title="Entrées" items={STARTERS} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: 0.1 }}>
              <MenuList title="Plats" items={MAINS} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: 0.2 }}>
              <MenuList title="Desserts" items={DESSERTS} />
            </motion.div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Réserver via l'espace membre →
            </Link>
          </div>
        </div>
      </section>

      {/* Espace membre sécurisé */}
      <section id="espace" style={{ padding: '90px 0', position: 'relative' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="restaurant-rule" style={{ marginBottom: 18 }}>ESPACE MEMBRE SECURISE</div>
            <h2 className="section-title restaurant-serif" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', fontWeight: 600 }}>
              Simple, <em style={{ color: 'var(--primary)' }}>protégé</em>, élégant
            </h2>
            <p className="section-sub" style={{ maxWidth: 560, margin: '14px auto 0' }}>
              Votre accès au restaurant, validé par un code reçu sur votre email.
            </p>
          </motion.div>

          <div className="grid grid-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                className="card glass-hover"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="stat-icon" style={{ marginBottom: 16, background: 'rgba(227,176,75,0.12)', color: 'var(--primary)', border: '1px solid rgba(227,176,75,0.25)' }}>{s.icon}</div>
                <h3 className="restaurant-serif" style={{ fontSize: 20, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Se connecter à l'espace membre
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="grid grid-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="card corner-frame"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ padding: '30px 26px' }}
              >
                <div style={{ color: 'var(--primary)', fontSize: 30, marginBottom: 12 }}>“</div>
                <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.75, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ marginTop: 18 }}>
                  <div className="restaurant-serif" style={{ fontSize: 18, color: 'var(--text-1)' }}>{t.name}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Réservation + horaires */}
      <section id="reservation" style={{ padding: '90px 0 120px' }}>
        <div className="container">
          <div className="card corner-frame" style={{ padding: '56px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'rgba(227,176,75,0.05)' }}>
            <span className="scan-line" />
            <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="restaurant-serif" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 600, marginBottom: 10 }}>
              Réservez votre <em style={{ color: 'var(--primary)' }}>table</em>
            </motion.h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>Connectez-vous avec votre Gmail — un code vous sera envoyé pour confirmer votre identité.</p>
            <div className="grid grid-2" style={{ maxWidth: 720, margin: '0 auto 36px', textAlign: 'left' }}>
              <div>
                <div className="mono" style={{ color: 'var(--primary)', fontSize: 12, letterSpacing: '0.18em', marginBottom: 10 }}>HORAIRES</div>
                {['Lun — Ven · 12h à 14h30', 'Lun — Sam · 19h à 23h', 'Dimanche · fermé'].map((h) => (
                  <p key={h} style={{ color: 'var(--text-2)', fontSize: 14.5, padding: '6px 0', borderBottom: '1px dashed rgba(228,186,112,0.14)' }}>{h}</p>
                ))}
              </div>
              <div>
                <div className="mono" style={{ color: 'var(--primary)', fontSize: 12, letterSpacing: '0.18em', marginBottom: 10 }}>INFOS</div>
                <p style={{ color: 'var(--text-2)', fontSize: 14.5, padding: '6px 0' }}>12 rue des Gourmets, 75001 Paris</p>
                <p style={{ color: 'var(--text-2)', fontSize: 14.5, padding: '6px 0' }}>+33 1 23 45 67 89</p>
                <p style={{ color: 'var(--text-2)', fontSize: 14.5, padding: '6px 0' }}>contact@legourmet.fr</p>
              </div>
            </div>
            <Link to="/login" className="btn btn-primary btn-lg">
              Accéder à l'espace membre →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <Logo brand="restaurant" size={26} />
          <p className="mono" style={{ color: 'var(--text-3)', fontSize: 12 }}>
            © {new Date().getFullYear()} Le Gourmet · Accès sécurisé et tracé par IP
          </p>
        </div>
      </footer>
    </div>
  );
}
