import React, { useState, useRef } from 'react';

export default function FramerMotionCard({ children, stagger = 0, style = {}, className = '' }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Posición del mouse relativa al centro de la tarjeta
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Inclinación máxima de ±6 grados para mantener un look premium y sutil
    const rotateX = ((mouseY - centerY) / centerY) * -6;
    const rotateY = ((mouseX - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    
    // Posición del resplandor (spotlight) en porcentaje
    const xPct = (mouseX / width) * 100;
    const yPct = (mouseY / height) * 100;
    setSpotlight({ x: xPct, y: yPct, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`framer-card-base animate-framer-spring ${className}`}
      style={{
        ...style,
        transform,
        animationDelay: `${stagger * 90}ms`,
        willChange: 'transform',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out'
      }}
    >
      {/* Capa de Resplandor Dinámica (Spotlight Glare) */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(255, 255, 255, 0.12), transparent 60%)`,
          opacity: spotlight.opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      {/* Contenido de la Tarjeta */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
