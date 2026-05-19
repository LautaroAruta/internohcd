import React, { useState } from 'react';
import { Zap, LayoutGrid, Calendar, FolderKanban, Cpu, MapPin, Command } from 'lucide-react';

export default function FramerDock({ tabActiva, setTabActiva }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const items = [
    { id: 'zen', label: 'Modo Zen', icon: Zap, color: '#3b82f6' },
    { id: 'general', label: 'Dashboard', icon: LayoutGrid, color: '#6366f1' },
    { id: 'agenda', label: 'Agenda Dual', icon: Calendar, color: '#a855f7' },
    { id: 'expedientes', label: 'Kanban', icon: FolderKanban, color: '#ec4899' },
    { id: 'ia', label: 'Fábrica IA', icon: Cpu, color: '#10b981' },
    { id: 'territorio', label: 'Territorio', icon: MapPin, color: '#f59e0b' },
    { id: 'botonera', label: 'Botonera', icon: Command, color: '#f43f5e' }
  ];

  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const diff = Math.abs(hoveredIndex - index);
    if (diff === 0) return 1.35; // Elemento actual muy grande
    if (diff === 1) return 1.15; // Vecinos inmediatos medianos
    if (diff === 2) return 1.05; // Segundos vecinos levemente grandes
    return 1;
  };

  const getTranslateY = (index) => {
    if (hoveredIndex === null) return 0;
    const diff = Math.abs(hoveredIndex - index);
    if (diff === 0) return -12;
    if (diff === 1) return -6;
    if (diff === 2) return -2;
    return 0;
  };

  return (
    <div style={{ position: 'fixed', bottom: '32px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
      <div 
        style={{ 
          background: 'var(--bg-dock)', 
          backdropFilter: 'blur(32px)', 
          webkitBackdropFilter: 'blur(32px)',
          border: '1px solid var(--border-glass-hover)', 
          padding: '12px 20px', 
          borderRadius: '9999px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          boxShadow: 'var(--shadow-dock)',
          pointerEvents: 'auto',
          transition: 'border-color 0.3s ease'
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = tabActiva === item.id;
          const scale = getScale(index);
          const translateY = getTranslateY(index);
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={item.id}
              onClick={() => setTabActiva(item.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              style={{
                background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                border: isActive ? `1px solid ${item.color}` : '1px solid var(--border-glass)',
                color: isActive ? item.color : 'var(--text-muted)',
                padding: '14px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transform: `scale(${scale}) translateY(${translateY}px)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, border-color 0.2s, color 0.2s',
                boxShadow: isActive ? `0 0 20px ${item.color}40, inset 0 1px 1px rgba(255,255,255,0.2)` : 'inset 0 1px 1px rgba(255,255,255,0.1)'
              }}
            >
              <Icon size={20} />

              {/* Tooltip Framer Premium */}
              {isHovered && (
                <div 
                  className="animate-framer-spring"
                  style={{ 
                    position: 'absolute', 
                    top: '-45px', 
                    background: 'rgba(12, 16, 28, 0.95)', 
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-glass-hover)', 
                    color: 'white', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    whiteSpace: 'nowrap',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                    animationDuration: '0.3s'
                  }}
                >
                  {item.label}
                </div>
              )}

              {/* Dot Indicador Activo */}
              {isActive && (
                <span 
                  style={{ 
                    position: 'absolute', 
                    bottom: '-6px', 
                    width: '4px', 
                    height: '4px', 
                    borderRadius: '50%', 
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}` 
                  }} 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
