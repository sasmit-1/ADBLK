import React from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = ({ children }) => {
  return (
    <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#020617', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.5 }}>
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'conic-gradient(from 90deg at 50% 50%, #1e1b4b, #312e81, #1e1b4b, #8b5cf6, #1e1b4b)',
            filter: 'blur(100px)'
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #020617 80%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};
