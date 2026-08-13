import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = false, style, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`card ${hover ? 'glass-hover' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}
