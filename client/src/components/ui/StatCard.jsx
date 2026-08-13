import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export function StatCard({ icon, label, value, sub, tone = 'primary' }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="stat-icon" style={tone === 'danger' ? { background: 'rgba(255,77,109,0.1)', color: 'var(--danger)', borderColor: 'rgba(255,77,109,0.25)' } : tone === 'accent' ? { background: 'rgba(0,255,200,0.1)', color: 'var(--ok)', borderColor: 'rgba(0,255,200,0.25)' } : {}}>
        {icon}
      </div>
      <Counter value={value} />
      <div className="stat-label">{label}</div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}
    </motion.div>
  );
}

export function Counter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, Number(value) || 0, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div className="stat-value mono" ref={ref}>
      {display.toLocaleString()}
    </div>
  );
}
