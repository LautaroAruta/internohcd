import React, { useState, useEffect } from 'react';
import TableroZen from './components/TableroZen';
import KanbanExpedientes from './components/KanbanExpedientes';
import FabricaProyectos from './components/FabricaProyectos';
import BotoneraTactica from './components/BotoneraTactica';
import GestorTerritorial from './components/GestorTerritorial';
import Agenda from './components/Agenda';
import { Shield, Bell, CheckCircle2, Zap, LayoutGrid, Calendar, FolderKanban, Cpu, MapPin, Command, Clock, Disc, Lock, Unlock, Sun, Moon } from 'lucide-react';
import { supabase } from './supabaseClient';

const ordenarEventos = (lista) => {
  return [...lista].sort((a, b) => {
    const fechaA = a.fecha || '';
    const fechaB = b.fecha || '';
    
    const obtenerTimestamp = (fStr) => {
      if (!fStr) return 0;
      if (fStr.includes('-')) {
        const [y, m, d] = fStr.split('-').map(Number);
        return new Date(y, m - 1, d).getTime();
      }
      if (fStr.includes('/')) {
        const [d, m, y] = fStr.split('/').map(Number);
        return new Date(y, m - 1, d).getTime();
      }
      return new Date(fStr).getTime() || 0;
    };

    const tsA = obtenerTimestamp(fechaA);
    const tsB = obtenerTimestamp(fechaB);

    if (tsA !== tsB) {
      return tsA - tsB;
    }

    const parsearHora = (h) => {
      if (!h) return { horas: 99, minutos: 99 };
      const hLimpia = h.toLowerCase().replace('hs', '').trim();
      const match = hLimpia.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        return { horas: parseInt(match[1], 10), minutos: parseInt(match[2], 10) };
      }
      const matchSoloHoras = hLimpia.match(/(\d{1,2})/);
      if (matchSoloHoras) {
        return { horas: parseInt(matchSoloHoras[1], 10), minutos: 0 };
      }
      return { horas: 99, minutos: 99 };
    };

    const horaA = parsearHora(a.hora);
    const horaB = parsearHora(b.hora);

    if (horaA.horas !== horaB.horas) {
      return horaA.horas - horaB.horas;
    }
    return horaA.minutos - horaB.minutos;
  });
};

export default function App() {
  const [tabActiva, setTabActiva] = useState('zen');
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [esAdmin, setEsAdmin] = useState(() => {
    return localStorage.getItem('hcd_admin_logged') === 'true';
  });
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [loginUsuario, setLoginUsuario] = useState('');
  const [loginClave, setLoginClave] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginCargando, setLoginCargando] = useState(false);

  const [tema, setTema] = useState(() => {
    return localStorage.getItem('hcd_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('hcd_theme', tema);
  }, [tema]);

  const toggleTema = () => {
    setTema(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginCargando(true);
    try {
      const { data, error } = await supabase.rpc('verificar_admin', { 
        p_usuario: loginUsuario, 
        p_clave: loginClave 
      });
      
      if (error) throw error;
      
      if (data === true) {
        setEsAdmin(true);
        localStorage.setItem('hcd_admin_logged', 'true');
        setMostrarLogin(false);
        setLoginUsuario('');
        setLoginClave('');
      } else {
        setLoginError('Usuario o clave incorrectos.');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setLoginError('Error de conexión o credenciales.');
    } finally {
      setLoginCargando(false);
    }
  };
  
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
          setEventos(ordenarEventos(data));
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
      <header className="app-header-container" style={{ background: 'var(--bg-card)', borderBottom: '3px solid var(--border-dark)', padding: '24px 32px', boxShadow: '0 4px 0px var(--border-dark)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fila Institucional / Display LED Superior */}
          <div className="app-header-title-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Placa de Identificación de Hardware */}
            <div className="app-header-top-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--accent-orange)', color: 'white', border: '2px solid var(--border-dark)', padding: '6px 12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '0.85rem', boxShadow: '2px 2px 0px var(--border-dark)' }}>
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



            {/* Contenedor Relativo para Botón de Alarma, Login y Popup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
              
              {/* Selector de Modo Oscuro / Claro Táctico (Switch Modular) */}
              <button
                onClick={toggleTema}
                style={{
                  background: tema === 'dark' ? 'var(--border-dark)' : 'var(--bg-card)',
                  color: tema === 'dark' ? 'var(--bg-card)' : 'var(--text-main)',
                  border: '2px solid var(--border-dark)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  boxShadow: '3px 3px 0px var(--border-dark)',
                  transition: 'all 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--border-dark)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_var(--border-dark)]"
                title={tema === 'dark' ? "Cambiar a Modo Claro (Matte Grey)" : "Cambiar a Modo Oscuro (High Contrast)"}
              >
                {tema === 'dark' ? <Moon size={16} color="var(--accent-yellow)" /> : <Sun size={16} color="var(--accent-orange)" />}
                <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                  {tema === 'dark' ? 'MODO_OSCURO' : 'MODO_CLARO'}
                </span>
              </button>

              <button
                onClick={esAdmin ? () => { setEsAdmin(false); localStorage.removeItem('hcd_admin_logged'); } : () => setMostrarLogin(true)}
                style={{ 
                  background: esAdmin ? 'var(--accent-orange)' : 'var(--bg-card)', 
                  color: esAdmin ? '#ffffff' : 'var(--text-main)', 
                  border: '2px solid var(--border-dark)', 
                  padding: '8px 16px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  boxShadow: esAdmin ? '1px 1px 0px var(--border-dark)' : '3px 3px 0px var(--border-dark)', 
                  transition: 'all 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--border-dark)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_var(--border-dark)]"
                title={esAdmin ? "Cerrar sesión de administrador" : "Iniciar sesión de administrador para editar"}
              >
                {esAdmin ? <Unlock size={16} /> : <Lock size={16} />}
                {esAdmin ? 'ADMIN' : 'LECTOR'}
              </button>

              <button 
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                style={{ background: mostrarNotificaciones ? 'var(--border-dark)' : 'var(--bg-card)', color: mostrarNotificaciones ? 'var(--bg-card)' : 'var(--border-dark)', border: '2px solid var(--border-dark)', padding: '10px', borderRadius: '10px', cursor: 'pointer', boxShadow: mostrarNotificaciones ? '1px 1px 0px var(--border-dark)' : '3px 3px 0px var(--border-dark)', transition: 'all 0.1s' }} 
                className="hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--border-dark)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_var(--border-dark)]"
                title="Centro de Notificaciones y Registro del Sistema"
              >
                <Bell size={20} />
              </button>

              {mostrarNotificaciones && (
                <div className="hardware-unit animate-fade-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: '340px', background: 'var(--bg-card)', border: '3px solid var(--border-dark)', borderRadius: '16px', boxShadow: '8px 8px 0px var(--border-dark)', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border-dark)', paddingBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-main)' }}>🔔 REGISTRO DE EVENTOS</span>
                    <button onClick={() => setMostrarNotificaciones(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: '800' }}>[ X ]</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notificaciones.map(n => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', background: 'var(--bg-surface)', border: '1px solid rgba(150,150,150,0.15)', borderLeft: n.tipo === 'warning' ? '6px solid var(--accent-orange)' : n.tipo === 'success' ? '6px solid var(--accent-lime)' : '6px solid var(--accent-cyan)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{n.texto}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: '700' }}>{n.tiempo}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid rgba(150,150,150,0.15)', paddingTop: '10px', fontWeight: '700' }}>
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
        {tabActiva === 'zen' && <TableroZen expedientes={expedientes} eventos={eventos} setTabActiva={setTabActiva} esAdmin={esAdmin} />}
        {tabActiva === 'agenda' && <Agenda eventos={eventos} setEventos={setEventos} esAdmin={esAdmin} />}
        {tabActiva === 'expedientes' && <KanbanExpedientes expedientes={expedientes} setExpedientes={setExpedientes} esAdmin={esAdmin} />}
        {tabActiva === 'ia' && <FabricaProyectos expedientes={expedientes} setExpedientes={setExpedientes} esAdmin={esAdmin} />}
        {tabActiva === 'territorio' && <GestorTerritorial expedientes={expedientes} setExpedientes={setExpedientes} esAdmin={esAdmin} />}
        {tabActiva === 'botonera' && <BotoneraTactica />}
      </main>

      {/* MODAL DE INICIO DE SESIÓN DE ADMINISTRACIÓN */}
      {mostrarLogin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="hardware-unit animate-fade-in" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', border: '3px solid var(--border-dark)', borderRadius: '16px', boxShadow: '8px 8px 0px var(--border-dark)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border-dark)', paddingBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-main)' }}>🔒 ACCESO DE EDICIÓN</span>
              <button onClick={() => { setMostrarLogin(false); setLoginError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: '800' }}>[ X ]</button>
            </div>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>USUARIO</label>
                <input 
                  type="text" 
                  className="input-hardware" 
                  value={loginUsuario} 
                  onChange={e => setLoginUsuario(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>CONTRASEÑA</label>
                <input 
                  type="password" 
                  className="input-hardware" 
                  value={loginClave} 
                  onChange={e => setLoginClave(e.target.value)} 
                  required 
                />
              </div>

              {loginError && (
                <div style={{ background: '#fef2f2', border: '2px solid var(--accent-red)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-mechanical" onClick={() => { setMostrarLogin(false); setLoginError(''); }}>CANCELAR</button>
                <button type="submit" className="btn-mechanical btn-orange" disabled={loginCargando}>
                  {loginCargando ? 'VERIFICANDO...' : 'INGRESAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
