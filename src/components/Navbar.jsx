import React, { useState } from 'react';
import { Shield, Bell, AlertTriangle, CheckCircle2, User, X } from 'lucide-react';

export default function Navbar({ alertaGlobal, setAlertaGlobal }) {
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  return (
    <header className="glass-card" style={{ margin: '16px 16px 0', borderRadius: '16px', borderBottom: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        
        {/* Izquierda: Logo y Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-indigo))', 
            padding: '10px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              HCD San Martín <span style={{ fontSize: '0.8rem', fontWeight: '500', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>Búnker Digital</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Intranet Táctica • Equipo de 4</p>
          </div>
        </div>

        {/* Derecha: Indicador de Estado y Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Indicador de Estado del Sistema */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '9999px' }}>
            <CheckCircle2 size={16} color="#10b981" className="animate-pulse" />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981' }}>Sistema Activo</span>
          </div>

          {/* Botón de Alerta / Campana */}
          <button 
            onClick={() => setAlertaGlobal(prev => prev ? null : '⚠️ AVISO DE HOY: La Comisión de Obras Públicas se pasó para las 11:30 hs en la Sala de Sesiones.')}
            style={{ 
              background: alertaGlobal ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)', 
              border: `1px solid ${alertaGlobal ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-glass)'}`, 
              padding: '10px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              color: alertaGlobal ? '#ef4444' : 'var(--text-main)',
              transition: 'all 0.2s'
            }}
            title="Alternar Alerta Global"
          >
            <Bell size={20} />
          </button>

          {/* Avatar del Usuario */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setMostrarPerfil(!mostrarPerfil)}
              style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-glass)', 
                padding: '10px', 
                borderRadius: '12px', 
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} />
            </button>

            {mostrarPerfil && (
              <div className="glass-card animate-fade-in" style={{ position: 'absolute', right: 0, top: '48px', width: '240px', padding: '16px', zIndex: 50 }}>
                <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Equipo de Asesores</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>bloquexhcd@gmail.com</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Concejal:</span> <span style={{ color: 'var(--text-main)' }}>Activo</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Asesor Técnico:</span> <span style={{ color: 'var(--text-main)' }}>Activo</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Secretaría:</span> <span style={{ color: 'var(--text-main)' }}>Activa</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Territorio:</span> <span style={{ color: 'var(--text-main)' }}>Activo</span></div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Banner de Alerta Global (si existe) */}
      {alertaGlobal && (
        <div className="animate-fade-in" style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))', 
          borderTop: '1px solid rgba(245, 158, 11, 0.3)', 
          padding: '12px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fcd34d', margin: 0 }}>
              {alertaGlobal}
            </p>
          </div>
          <button 
            onClick={() => setAlertaGlobal(null)} 
            style={{ background: 'transparent', border: 'none', color: '#fcd34d', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

    </header>
  );
}
