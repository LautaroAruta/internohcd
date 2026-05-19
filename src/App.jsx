import React, { useState, useEffect } from 'react';
import TableroZen from './components/TableroZen';
import KanbanExpedientes from './components/KanbanExpedientes';
import FabricaProyectos from './components/FabricaProyectos';
import BotoneraTactica from './components/BotoneraTactica';
import GestorTerritorial from './components/GestorTerritorial';
import Agenda from './components/Agenda';
import { Shield, Bell, CheckCircle2, Zap, LayoutGrid, Calendar, FolderKanban, Cpu, MapPin, Command, Clock, Disc } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [tabActiva, setTabActiva] = useState('zen');
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  
  const [expedientes, setExpedientes] = useState([
    { id: 1, numero: 'EXP-2026-089', titulo: 'Bacheo y repavimentación Calle Neuquén', iniciador: 'Bloque Oficialista', estado: 'Borrador / Redacción', comision: 'Obras Públicas', fecha: '14/05/2026', prioridad: 'Alta', archivo: 'Borrador_Bacheo_Neuquen.docx', tipo: 'Ordenanza', responsable: 'Bloque Oficialista' },
    { id: 2, numero: 'EXP-2026-088', titulo: 'Creación del Digesto Digital Accesible', iniciador: 'Presidencia', estado: 'En Comisión', comision: 'Legislativa', fecha: '10/05/2026', prioridad: 'Media', archivo: 'Proyecto_Digesto.pdf', tipo: 'Resolución', responsable: 'Presidencia' },
    { id: 3, numero: 'EXP-2026-085', titulo: 'Declaración de Interés: Aniversario Club San Martín', iniciador: 'Bloque Conjunto', estado: 'Próxima Sesión', comision: 'Labor Legislativa', fecha: '08/05/2026', prioridad: 'Baja', archivo: 'Declaracion_Club.pdf', tipo: 'Resolución', responsable: 'Bloque Conjunto' },
    { id: 4, numero: 'EXP-2026-080', titulo: 'Pedido de Informe: Estado de luminarias LED', iniciador: 'Vecinos / Bloque', estado: 'Aprobados', comision: 'Hacienda', fecha: '02/05/2026', prioridad: 'Alta', archivo: 'Informe_Luminarias.pdf', tipo: 'Pedido de Informe', responsable: 'Vecinos / Bloque' }
  ]);

  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const { data, error } = await supabase.from('expedientes').select('*').order('id', { ascending: true });
        if (data && data.length > 0) {
          setExpedientes(data.map(exp => ({
            ...exp,
            tipo: exp.tipo || 'Ordenanza',
            responsable: exp.responsable || exp.iniciador || 'Asesor Técnico',
            comision: exp.comision || 'Obras Públicas',
            estado: exp.estado || 'Borrador / Redacción',
            archivo: exp.archivo || 'Proyecto_Oficial.pdf'
          })));
        }
      } catch (err) {
        console.error('Error fetching expedientes from Supabase:', err);
      }
    };
    fetchExpedientes();

    const fetchAgenda = async () => {
      try {
        const { data, error } = await supabase.from('agenda').select('*').order('fecha', { ascending: true });
        if (data) {
          setEventos(data);
        }
      } catch (err) {
        console.error('Error fetching agenda from Supabase in App:', err);
      }
    };
    fetchAgenda();
  }, []);

  const notificaciones = [
    { id: 1, texto: 'Sincronización Supabase activa y en línea.', tiempo: 'Hace 2 min', tipo: 'info' },
    { id: 2, texto: `Último expediente registrado: ${expedientes[expedientes.length - 1]?.numero || 'EXP-2026-089'}`, tiempo: 'Hace 15 min', tipo: 'success' },
    { id: 3, alert: true, texto: 'Reunión de Labor Legislativa programada para el viernes.', tiempo: 'Hace 1 hora', tipo: 'warning' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* CONSOLA DE CONTROL SUPERIOR (Panel de Hardware en Español) */}
      <header className="app-header-container" style={{ background: '#f5f5f5', borderBottom: '3px solid var(--border-dark)', padding: '24px 32px', boxShadow: '0 4px 0px #171717', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fila Institucional / Display LED Superior */}
          <div className="app-header-title-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Placa de Identificación de Hardware */}
            <div className="app-header-top-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--accent-orange)', color: 'white', border: '2px solid var(--border-dark)', padding: '6px 12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '0.85rem', boxShadow: '2px 2px 0px #171717' }}>
                SISTEMA // HCD SAN MARTÍN
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={24} color="var(--border-dark)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="app-header-title-text" style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-main)' }}>BÚNKER DIGITAL HCD</span>
                  <span className="app-header-version-text" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>SISTEMA LEGISLATIVO // VERSIÓN 8.2</span>
                </div>
              </div>
            </div>



            {/* Contenedor Relativo para Botón de Alarma y Popup */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                style={{ background: mostrarNotificaciones ? '#171717' : '#ffffff', color: mostrarNotificaciones ? '#ffffff' : 'var(--border-dark)', border: '2px solid var(--border-dark)', padding: '10px', borderRadius: '10px', cursor: 'pointer', boxShadow: mostrarNotificaciones ? '1px 1px 0px #171717' : '3px 3px 0px #171717', transition: 'all 0.1s' }} 
                className="hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#171717]"
                title="Centro de Notificaciones y Registro del Sistema"
              >
                <Bell size={20} />
              </button>

              {mostrarNotificaciones && (
                <div className="hardware-unit animate-fade-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: '340px', background: '#ffffff', border: '3px solid var(--border-dark)', borderRadius: '16px', boxShadow: '8px 8px 0px #171717', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border-dark)', paddingBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-main)' }}>🔔 REGISTRO DE EVENTOS</span>
                    <button onClick={() => setMostrarNotificaciones(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: '800' }}>[ X ]</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notificaciones.map(n => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.1)', borderLeft: n.tipo === 'warning' ? '6px solid var(--accent-orange)' : n.tipo === 'success' ? '6px solid var(--accent-lime)' : '6px solid var(--accent-cyan)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{n.texto}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: '700' }}>{n.tiempo}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px', fontWeight: '700' }}>
                    SISTEMA DE MONITOREO HCD SAN MARTÍN
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Botonera de Navegación Modular en Español */}
          <nav style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              onClick={() => setTabActiva('zen')} 
              className={`nav-mech-btn ${tabActiva === 'zen' ? 'active' : ''}`}
            >
              <Zap size={16} /> [ 01_INICIO ]
            </button>
            <button 
              onClick={() => setTabActiva('agenda')} 
              className={`nav-mech-btn ${tabActiva === 'agenda' ? 'active' : ''}`}
            >
              <Calendar size={16} /> [ 02_AGENDA ]
            </button>
            <button 
              onClick={() => setTabActiva('expedientes')} 
              className={`nav-mech-btn ${tabActiva === 'expedientes' ? 'active' : ''}`}
            >
              <FolderKanban size={16} /> [ 03_EXPEDIENTES ]
            </button>
            <button 
              onClick={() => setTabActiva('ia')} 
              className={`nav-mech-btn ${tabActiva === 'ia' ? 'active' : ''}`}
            >
              <Cpu size={16} /> [ 04_ASISTENTE IA ]
            </button>
            <button 
              onClick={() => setTabActiva('territorio')} 
              className={`nav-mech-btn ${tabActiva === 'territorio' ? 'active' : ''}`}
            >
              <MapPin size={16} /> [ 05_TERRITORIO ]
            </button>
            <button 
              onClick={() => setTabActiva('botonera')} 
              className={`nav-mech-btn ${tabActiva === 'botonera' ? 'active' : ''}`}
            >
              <Command size={16} /> [ 06_ACCESOS ]
            </button>
          </nav>

        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL DE MÓDULOS */}
      <main className="app-main-container" style={{ flex: 1, padding: '40px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {tabActiva === 'zen' && <TableroZen expedientes={expedientes} eventos={eventos} setTabActiva={setTabActiva} />}
        {tabActiva === 'agenda' && <Agenda eventos={eventos} setEventos={setEventos} />}
        {tabActiva === 'expedientes' && <KanbanExpedientes expedientes={expedientes} setExpedientes={setExpedientes} />}
        {tabActiva === 'ia' && <FabricaProyectos expedientes={expedientes} setExpedientes={setExpedientes} />}
        {tabActiva === 'territorio' && <GestorTerritorial expedientes={expedientes} setExpedientes={setExpedientes} />}
        {tabActiva === 'botonera' && <BotoneraTactica />}
      </main>

    </div>
  );
}
