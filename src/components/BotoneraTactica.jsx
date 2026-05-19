import React from 'react';
import { Tv, Search, FileText, CheckSquare, Phone, ExternalLink } from 'lucide-react';

export default function BotoneraTactica() {
  const botones = [
    {
      id: 1,
      titulo: 'SESIÓN EN VIVO',
      subtitulo: 'Canal de YouTube HCD',
      icono: <Tv size={28} />,
      colorBg: '#ef4444', // Rojo Youtube
      enlace: 'https://www.youtube.com/results?search_query=hcd+san+martin+mendoza+en+vivo'
    },
    {
      id: 2,
      titulo: 'DIGESTO MUNICIPAL',
      subtitulo: 'Buscador de Ordenanzas',
      icono: <Search size={28} />,
      colorBg: 'var(--accent-cyan)', // Cian
      enlace: 'https://sanmartinmza.gob.ar/'
    },
    {
      id: 3,
      titulo: 'NUEVO PROYECTO',
      subtitulo: 'Plantilla Word Oficial',
      icono: <FileText size={28} />,
      colorBg: 'var(--accent-purple)', // Púrpura
      enlace: 'https://docs.google.com/document/d/1ejemplo_plantilla_hcd_san_martin/copy'
    },
    {
      id: 4,
      titulo: 'TAREAS INTERNAS',
      subtitulo: 'Planilla de Seguimiento',
      icono: <CheckSquare size={28} />,
      colorBg: 'var(--accent-lime)', // Verde Lima
      enlace: 'https://docs.google.com/spreadsheets/d/1ejemplo_tareas_equipo_hcd/edit'
    }
  ];

  const contactos = [
    { nombre: 'Mesa de Entradas HCD', interno: 'Int. 102', tel: '2634-428200' },
    { nombre: 'Secretaría Legislativa', interno: 'Int. 105', tel: '2634-428205' },
    { nombre: 'Dirección de Prensa', interno: 'Int. 112', tel: '2634-428212' },
    { nombre: 'Presidencia HCD', interno: 'Int. 101', tel: '2634-428201' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Botonera de 4 Columnas con Sombras Duras */}
      <div className="botonera-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {botones.map((btn) => (
          <a 
            key={btn.id}
            href={btn.enlace}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              padding: '24px', 
              background: btn.colorBg, 
              color: btn.colorBg === 'var(--accent-lime)' || btn.colorBg === 'var(--accent-cyan)' ? 'var(--text-main)' : 'white', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              border: '2px solid var(--border-dark)', 
              borderRadius: '16px',
              boxShadow: '6px 6px 0px #171717',
              transition: 'all 0.1s'
            }}
            className="hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#171717]"
          >
            <div style={{ background: '#ffffff', border: '2px solid var(--border-dark)', padding: '14px', borderRadius: '12px', color: btn.colorBg === 'var(--accent-lime)' || btn.colorBg === 'var(--accent-cyan)' ? 'var(--text-main)' : btn.colorBg, boxShadow: '3px 3px 0px #171717' }}>
              {btn.icono}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
                {btn.titulo} <ExternalLink size={16} opacity={0.8} />
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.9, margin: '4px 0 0 0', fontWeight: '700' }}>{btn.subtitulo}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Guía Telefónica de Emergencia / Contactos Frecuentes */}
      <div className="hardware-unit animate-fade-in" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '2px solid var(--border-dark)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '3px 3px 0px #171717' }}>
            <Phone size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>DIRECTORIO TELEFÓNICO HCD</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: '700' }}>CONTACTOS FRECUENTES PARA LLAMADAS RÁPIDAS DESDE EL CELULAR</p>
          </div>
        </div>

        <div className="directorio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {contactos.map((c, i) => (
            <a 
              key={i} 
              href={`tel:${c.tel}`}
              style={{ 
                background: '#ffffff', 
                border: '2px solid var(--border-dark)', 
                padding: '20px 24px', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'var(--text-main)',
                boxShadow: '4px 4px 0px #171717',
                transition: 'all 0.1s'
              }}
              className="hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#171717]"
            >
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>{c.nombre}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '700' }}>{c.interno} // TEL: {c.tel}</div>
              </div>
              <div style={{ background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', boxShadow: '2px 2px 0px #171717' }}>
                📞 Llamar
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
