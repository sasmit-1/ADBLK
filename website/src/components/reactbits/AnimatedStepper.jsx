import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedStepper = ({ steps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', marginTop: '3rem' }}>
      {/* Connecting line */}
      <div style={{ position: 'absolute', left: '24px', top: '0', bottom: '0', width: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
      
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.2, type: 'spring', bounce: 0.4 }}
          style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 + 0.3, type: 'spring' }}
            style={{
              width: '50px', height: '50px', borderRadius: '50%', background: '#0ea5e9', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold',flexShrink: 0,
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)'
            }}
          >
            {index + 1}
          </motion.div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#f8fafc' }}>{step.title}</h3>
            <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
