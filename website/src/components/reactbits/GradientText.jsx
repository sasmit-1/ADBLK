import React from 'react';
import { motion } from 'framer-motion';

export const GradientText = ({ text, className = '' }) => {
  return (
    <motion.span
      className={className}
      style={{
        background: 'linear-gradient(to right, #ff00cc, #333399, #00c9ff, #92fe9d)',
        backgroundSize: '300% 300%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block'
      }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    >
      {text}
    </motion.span>
  );
};
