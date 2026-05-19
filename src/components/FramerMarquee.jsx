import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function FramerMarquee({ texto }) {
  // Duplicamos el contenido para el scroll infinito perfecto
  const items = Array(4).fill(texto);

  return (
    <div 
      style={{ 
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))', 
        border: '1px solid rgba(245, 158, 11, 0.3)', 
        borderRadius: '20px', 
        padding: '18px 0', 
        overflow: 'hidden', 
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
        backdropFilter: 'blur(12px)'
      }}
      className="animate-framer-spring"
    >
      <div className="animate-marquee-content" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fcd34d', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>
              <AlertTriangle size={14} className="animate-pulse" /> URGENTE // HOY
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', letterSpacing: '-0.01em' }}>
              {item}
            </span>
            <Sparkles size={18} color="#f59e0b" style={{ marginLeft: '20px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
