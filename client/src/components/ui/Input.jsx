import { forwardRef, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const Input = forwardRef(function Input(
  { label, icon, error, type = 'text', className = '', ...props },
  ref
) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-wrap">
        <input
          ref={ref}
          id={id}
          type={isPassword && visible ? 'text' : type}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 12,
              color: 'var(--text-3)',
              padding: 4,
            }}
          >
            {visible ? 'HIDE' : 'SHOW'}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            className="field-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});
