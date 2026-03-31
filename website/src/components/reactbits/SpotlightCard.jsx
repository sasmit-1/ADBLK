import React, { useRef, useState } from 'react';

export const SpotlightCard = ({ children, className = '', style = {} }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '1rem',
        padding: '2px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        ...style
      }}
      className={className}
    >
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
          zIndex: 0
        }}
      />
      <div style={{ position: 'relative', height: '100%', background: '#09090b', borderRadius: 'calc(1rem - 2px)', padding: '1.5rem', zIndex: 1, color: '#f8fafc' }}>
        {children}
      </div>
    </div>
  );
};
