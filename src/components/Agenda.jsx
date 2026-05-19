import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Filter, ChevronDown, ChevronRight, CalendarDays, AlertCircle, ChevronLeft, Edit, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Agenda({ eventos: propsEventos, setEventos: propsSetEventos }) {
  const [localEventos, setLocalEventos] = useState([]);
  const eventos = propsEventos || localEventos;
  const setEventos = propsSetEventos || setLocalEventos;

  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, comision, sesion, territorio
  const [toggleLista, setToggleLista] = useState(true);

  // Estado del calendario mensual visual
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Formulario (Sin el campo alcance)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    hora: '10:00 hs',
    titulo: '',
    lugar: 'Sala de Comisiones',
    tipo: 'comision',
    participantes: 'Concejal y Asesor'
  });

  // Estado y funciones para Edición y Eliminación
  const [eventoEditando, setEventoEditando] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({
    fecha: '',
    hora: '',
    titulo: '',
    lugar: '',
    tipo: 'comision',
    participantes: ''
  });

  const iniciarEdicion = (evento) => {
    setEventoEditando(evento.id);
    setDatosEdicion({
      fecha: evento.fecha || '',
      hora: evento.hora || '',
      titulo: evento.titulo || '',
      lugar: evento.lugar || '',
      tipo: evento.tipo || 'comision',
      participantes: evento.participantes || ''
    });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      const [year, month, day] = datosEdicion.fecha.split('-').map(Number);
      const fechaObj = new Date(year, month - 1, day);
      const diaNombre = diasSemana[fechaObj.getDay()];

      const actualizados = {
        dia: diaNombre,
        fecha: datosEdicion.fecha,
        hora: datosEdicion.hora,
        titulo: datosEdicion.titulo,
        lugar: datosEdicion.lugar,
        tipo: datosEdicion.tipo,
        participantes: datosEdicion.participantes
      };

      await supabase.from('agenda').update(actualizados).eq('id', eventoEditando);
      setEventos(prev => prev.map(ev => ev.id === eventoEditando ? { ...ev, ...actualizados } : ev).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setEventoEditando(null);
    } catch (err) {
      console.error('Error actualizando evento en Supabase:', err);
    }
  };

  const eliminarEvento = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este compromiso de la agenda oficial?')) return;
    try {
      await supabase.from('agenda').delete().eq('id', id);
      setEventos(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      console.error('Error eliminando evento en Supabase:', err);
    }
  };

  // Cargar eventos desde Supabase
  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const { data, error } = await supabase.from('agenda').select('*').order('fecha', { ascending: true });
        if (data) {
          setEventos(data);
        }
      } catch (err) {
        console.error('Error cargando agenda de Supabase:', err);
      } finally {
        setCargando(false);
      }
    };
    fetchAgenda();
  }, [setEventos]);

  // Función para agregar evento en Supabase
  const agregarEvento = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) return;

    // Calcular el día de la semana en español a partir de la fecha seleccionada
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const [year, month, day] = nuevoEvento.fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);
    const diaNombre = diasSemana[fechaObj.getDay()];

    const nuevoEv = {
      dia: diaNombre,
      fecha: nuevoEvento.fecha,
      hora: nuevoEvento.hora,
      titulo: nuevoEvento.titulo,
      lugar: nuevoEvento.lugar,
      tipo: nuevoEvento.tipo,
      participantes: nuevoEvento.participantes,
      alcance: 'semana' // valor por defecto interno para la base de datos
    };

    try {
      const { data, error } = await supabase.from('agenda').insert([nuevoEv]).select();
      if (data && data[0]) {
        setEventos(prev => [...prev, data[0]].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      } else {
        setEventos(prev => [...prev, { ...nuevoEv, id: Date.now() }].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      }
    } catch (err) {
      console.error('Error insertando en Supabase:', err);
      setEventos(prev => [...prev, { ...nuevoEv, id: Date.now() }].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    }

    setNuevoEvento({
      fecha: new Date().toISOString().split('T')[0],
      hora: '10:00 hs',
      titulo: '',
      lugar: 'Sala de Comisiones',
      tipo: 'comision',
      participantes: 'Concejal y Asesor'
    });
    setMostrarForm(false);
  };

  // Helper para obtener días del mes para la grilla visual
  const getDiasDelMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    const dias = [];
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push(null);
    }
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      dias.push({ dia: i, fechaStr });
    }
    return dias;
  };

  const diasMes = getDiasDelMes(mesActual);
  const nombresMeses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  const cambiarMes = (dif) => {
    const nuevaFecha = new Date(mesActual.getFullYear(), mesActual.getMonth() + dif, 1);
    setMesActual(nuevaFecha);
  };

  const formatearFechaVista = (fechaStr) => {
    if (!fechaStr) return '';
    if (fechaStr.includes('/')) return fechaStr;
    const partes = fechaStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}`;
    return fechaStr;
  };

  // Filtrado de eventos para la lista unificada inferior
  const eventosFiltrados = eventos.filter(ev => {
    if (filtro !== 'todos' && ev.tipo !== filtro) return false;
    if (diaSeleccionado && ev.fecha !== diaSeleccionado) return false;
    return true;
  });

  return (
    <div className="hardware-unit animate-fade-in" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px', height: '100%', overflowY: 'auto' }}>
      
      {/* Encabezado y Botonera Superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--accent-cyan)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '3px 3px 0px #171717' }}>
            <CalendarIcon size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>AGENDA COMPLETA HCD</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: '700' }}>
              {cargando ? 'CARGANDO AGENDA DESDE SUPABASE...' : 'SINCRONIZADA CON SUPABASE • EQUIPO DE 4'}
            </p>
          </div>
        </div>

        <button className="btn-mechanical btn-cyan" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus size={20} /> AGENDAR COMPROMISO
        </button>
      </div>

      {/* Formulario de Nuevo Evento (SIN EL CAMPO ALCANCE) */}
      {mostrarForm && (
        <form onSubmit={agregarEvento} className="animate-fade-in" style={{ padding: '28px', background: '#ffffff', border: '2px solid var(--border-dark)', borderRadius: '16px', boxShadow: '4px 4px 0px #171717', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>&gt; NUEVO EVENTO EN CALENDARIO</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>TÍTULO DEL COMPROMISO</label>
              <input 
                type="text" 
                placeholder="ej: Comisión Hacienda o Reunión Vecinos" 
                className="input-hardware" 
                value={nuevoEvento.titulo} 
                onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>FECHA (CALENDARIO)</label>
              <input 
                type="date" 
                className="input-hardware" 
                value={nuevoEvento.fecha} 
                onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>HORA</label>
              <input 
                type="text" 
                placeholder="ej: 10:00 hs" 
                className="input-hardware" 
                value={nuevoEvento.hora} 
                onChange={e => setNuevoEvento({...nuevoEvento, hora: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>LUGAR</label>
              <input 
                type="text" 
                placeholder="ej: Sala 1 o Barrio San Ceferino" 
                className="input-hardware" 
                value={nuevoEvento.lugar} 
                onChange={e => setNuevoEvento({...nuevoEvento, lugar: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>TIPO DE EVENTO</label>
              <select 
                className="input-hardware" 
                value={nuevoEvento.tipo} 
                onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
              >
                <option value="comision">🏛️ Comisión</option>
                <option value="sesion">📜 Sesión</option>
                <option value="territorio">📍 Territorio / Audiencia</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>PARTICIPANTES</label>
              <input 
                type="text" 
                placeholder="ej: Concejal y Asesores" 
                className="input-hardware" 
                value={nuevoEvento.participantes} 
                onChange={e => setNuevoEvento({...nuevoEvento, participantes: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
            <button type="button" className="btn-mechanical" onClick={() => setMostrarForm(false)}>CANCELAR</button>
            <button type="submit" className="btn-mechanical btn-lime">GUARDAR EN SUPABASE</button>
          </div>
        </form>
      )}

      {/* ESPECTACULAR CALENDARIO MENSUAL VISUAL CON LOS DÍAS */}
      <div style={{ background: '#ffffff', border: '2px solid var(--border-dark)', borderRadius: '16px', padding: '24px', boxShadow: '4px 4px 0px #171717', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Cabecera de Navegación del Calendario */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '2px solid var(--border-dark)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarDays size={24} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
              CALENDARIO VISUAL // {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {diaSeleccionado && (
              <button 
                onClick={() => setDiaSeleccionado(null)} 
                style={{ background: 'var(--accent-yellow)', border: '2px solid var(--border-dark)', padding: '6px 12px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', boxShadow: '2px 2px 0px #171717' }}
              >
                MOSTRAR TODOS LOS DÍAS
              </button>
            )}
            <button className="btn-mechanical" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => cambiarMes(-1)}>
              ◀ ANTERIOR
            </button>
            <button className="btn-mechanical" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => cambiarMes(1)}>
              SIGUIENTE ▶
            </button>
          </div>
        </div>

        {/* Nombres de los Días de la Semana */}
        <div className="calendar-grid-container" style={{ overflowX: 'auto', paddingBottom: '12px' }}>
          <div className="calendar-7col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '680px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)' }}>
            <div>DOM</div>
            <div>LUN</div>
            <div>MAR</div>
            <div>MIE</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SAB</div>
          </div>

          {/* Grilla de Días del Mes */}
          <div className="calendar-7col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '680px', marginTop: '8px' }}>
            {diasMes.map((obj, index) => {
              if (!obj) {
                return <div key={`empty-${index}`} style={{ background: '#f9f9f9', border: '1px dashed #ccc', borderRadius: '10px', minHeight: '80px' }} />;
              }

              const isSeleccionado = diaSeleccionado === obj.fechaStr;
              const eventosDelDia = eventos.filter(ev => ev.fecha === obj.fechaStr);

              return (
                <div 
                  key={obj.fechaStr} 
                  onClick={() => setDiaSeleccionado(isSeleccionado ? null : obj.fechaStr)}
                  style={{ 
                    background: isSeleccionado ? '#171717' : '#ffffff', 
                    border: isSeleccionado ? '2px solid #171717' : '2px solid var(--border-dark)', 
                    borderRadius: '10px', 
                    padding: '8px', 
                    minHeight: '90px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: isSeleccionado ? 'none' : '2px 2px 0px #171717',
                    transition: 'all 0.1s',
                    transform: isSeleccionado ? 'translate(2px, 2px)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '900', color: isSeleccionado ? '#ffffff' : 'var(--text-main)' }}>
                      {obj.dia}
                    </span>
                    {eventosDelDia.length > 0 && (
                      <span style={{ background: 'var(--accent-cyan)', color: '#171717', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', fontFamily: 'var(--font-mono)', border: '1px solid #171717' }}>
                        {eventosDelDia.length}
                      </span>
                    )}
                  </div>

                  {/* Lista de Píldoras de Eventos en el Día */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflow: 'hidden' }}>
                    {eventosDelDia.map(ev => {
                      let bgPill = '#e5e5e5';
                      if (ev.tipo === 'sesion') bgPill = 'var(--accent-cyan)';
                      if (ev.tipo === 'comision') bgPill = 'var(--accent-orange)';
                      if (ev.tipo === 'territorio') bgPill = 'var(--accent-lime)';

                      return (
                        <div 
                          key={ev.id} 
                          style={{ 
                            background: bgPill, 
                            border: '1px solid var(--border-dark)', 
                            padding: '2px 4px', 
                            borderRadius: '4px', 
                            fontSize: '0.65rem', 
                            fontWeight: '800', 
                            fontFamily: 'var(--font-mono)',
                            color: '#171717', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}
                          title={ev.titulo}
                        >
                          {ev.hora.replace(' hs', '')} {ev.titulo}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {diaSeleccionado && (
          <div style={{ background: '#171717', color: 'white', padding: '10px 16px', borderRadius: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📅 FILTRANDO EVENTOS PARA EL DÍA: {formatearFechaVista(diaSeleccionado)}</span>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-yellow)', fontWeight: '800', cursor: 'pointer' }} onClick={() => setDiaSeleccionado(null)}>
              [ QUITAR FILTRO ]
            </button>
          </div>
        )}
      </div>

      {/* Pestañas de Filtro Mecánicas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid var(--border-dark)', paddingBottom: '16px', overflowX: 'auto' }}>
        <button 
          onClick={() => setFiltro('todos')} 
          style={{ 
            background: filtro === 'todos' ? 'var(--accent-cyan)' : '#ffffff', 
            color: 'var(--text-main)', 
            border: '2px solid var(--border-dark)', 
            padding: '8px 18px', 
            borderRadius: '10px', 
            fontWeight: '800', 
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: filtro === 'todos' ? '1px 1px 0px #171717' : '3px 3px 0px #171717',
            transform: filtro === 'todos' ? 'translate(2px, 2px)' : 'none',
            transition: 'all 0.1s'
          }}
        >
          TODOS
        </button>
        <button 
          onClick={() => setFiltro('sesion')} 
          style={{ 
            background: filtro === 'sesion' ? 'var(--accent-cyan)' : '#ffffff', 
            color: 'var(--text-main)', 
            border: '2px solid var(--border-dark)', 
            padding: '8px 18px', 
            borderRadius: '10px', 
            fontWeight: '800', 
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: filtro === 'sesion' ? '1px 1px 0px #171717' : '3px 3px 0px #171717',
            transform: filtro === 'sesion' ? 'translate(2px, 2px)' : 'none',
            transition: 'all 0.1s'
          }}
        >
          📜 SESIONES
        </button>
        <button 
          onClick={() => setFiltro('comision')} 
          style={{ 
            background: filtro === 'comision' ? 'var(--accent-cyan)' : '#ffffff', 
            color: 'var(--text-main)', 
            border: '2px solid var(--border-dark)', 
            padding: '8px 18px', 
            borderRadius: '10px', 
            fontWeight: '800', 
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: filtro === 'comision' ? '1px 1px 0px #171717' : '3px 3px 0px #171717',
            transform: filtro === 'comision' ? 'translate(2px, 2px)' : 'none',
            transition: 'all 0.1s'
          }}
        >
          🏛️ COMISIONES
        </button>
        <button 
          onClick={() => setFiltro('territorio')} 
          style={{ 
            background: filtro === 'territorio' ? 'var(--accent-cyan)' : '#ffffff', 
            color: 'var(--text-main)', 
            border: '2px solid var(--border-dark)', 
            padding: '8px 18px', 
            borderRadius: '10px', 
            fontWeight: '800', 
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: filtro === 'territorio' ? '1px 1px 0px #171717' : '3px 3px 0px #171717',
            transform: filtro === 'territorio' ? 'translate(2px, 2px)' : 'none',
            transition: 'all 0.1s'
          }}
        >
          📍 TERRITORIO & AUDIENCIAS
        </button>
      </div>

      {/* BLOQUE UNIFICADO DE COMPROMISOS AGENDADOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button 
          onClick={() => setToggleLista(!toggleLista)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            background: '#ffffff', 
            border: '2px solid var(--border-dark)', 
            padding: '16px 20px', 
            borderRadius: '12px',
            color: 'var(--text-main)', 
            fontWeight: '800', 
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #171717'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {toggleLista ? <ChevronDown size={22} color="var(--border-dark)" /> : <ChevronRight size={22} color="var(--border-dark)" />}
            📌 LISTA DE COMPROMISOS AGENDADOS <span style={{ fontSize: '0.75rem', background: 'var(--accent-cyan)', border: '1px solid var(--border-dark)', color: 'var(--text-main)', padding: '2px 10px', borderRadius: '6px', fontWeight: '800' }}>{eventosFiltrados.length} EVENTOS</span>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{toggleLista ? 'COLAPSAR' : 'DESPLEGAR'}</span>
        </button>

        {toggleLista && (
          <div className="agenda-futura-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '8px' }}>
            {eventosFiltrados.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)', fontSize: '0.85rem', fontWeight: '700' }}>
                [ SIN EVENTOS AGENDADOS PARA ESTA SELECCIÓN ]
              </div>
            ) : (
              eventosFiltrados.map((evento) => {
                let colorBorde = 'var(--border-dark)';
                if (evento.tipo === 'sesion') colorBorde = 'var(--accent-cyan)';
                if (evento.tipo === 'comision') colorBorde = 'var(--accent-orange)';
                if (evento.tipo === 'territorio') colorBorde = 'var(--accent-lime)';

                return eventoEditando === evento.id ? (
                  <form 
                    key={`edit-${evento.id}`} 
                    onSubmit={guardarEdicion}
                    className="animate-fade-in"
                    style={{ 
                      padding: '20px', 
                      background: '#fff', 
                      border: '2px solid var(--accent-orange)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '16px',
                      boxShadow: '4px 4px 0px var(--accent-orange)'
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-orange)' }}>
                      [ EDITANDO COMPROMISO ID: {evento.id} ]
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <input 
                        type="text" 
                        className="input-hardware" 
                        value={datosEdicion.titulo} 
                        onChange={e => setDatosEdicion({...datosEdicion, titulo: e.target.value})} 
                        placeholder="Título" 
                        required 
                      />
                      <input 
                        type="date" 
                        className="input-hardware" 
                        value={datosEdicion.fecha} 
                        onChange={e => setDatosEdicion({...datosEdicion, fecha: e.target.value})} 
                        required 
                      />
                      <input 
                        type="text" 
                        className="input-hardware" 
                        value={datosEdicion.hora} 
                        onChange={e => setDatosEdicion({...datosEdicion, hora: e.target.value})} 
                        placeholder="Hora (ej: 10:00 hs)" 
                        required 
                      />
                      <input 
                        type="text" 
                        className="input-hardware" 
                        value={datosEdicion.lugar} 
                        onChange={e => setDatosEdicion({...datosEdicion, lugar: e.target.value})} 
                        placeholder="Lugar" 
                      />
                      <select 
                        className="input-hardware" 
                        value={datosEdicion.tipo} 
                        onChange={e => setDatosEdicion({...datosEdicion, tipo: e.target.value})}
                      >
                        <option value="comision">🏛️ Comisión</option>
                        <option value="sesion">📜 Sesión</option>
                        <option value="territorio">📍 Territorio</option>
                      </select>
                      <input 
                        type="text" 
                        className="input-hardware" 
                        value={datosEdicion.participantes} 
                        onChange={e => setDatosEdicion({...datosEdicion, participantes: e.target.value})} 
                        placeholder="Participantes" 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button type="button" className="btn-mechanical" onClick={() => setEventoEditando(null)}>
                        <X size={16} /> CANCELAR
                      </button>
                      <button type="submit" className="btn-mechanical btn-lime">
                        <Check size={16} /> GUARDAR CAMBIOS
                      </button>
                    </div>
                  </form>
                ) : (
                  <div 
                    key={evento.id} 
                    className="agenda-item"
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: '2px solid var(--border-dark)',
                      borderLeft: `8px solid ${colorBorde}`,
                      borderRadius: '12px',
                      background: '#ffffff',
                      boxShadow: '3px 3px 0px #171717'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'center', minWidth: '90px', paddingRight: '20px', borderRight: '2px solid var(--border-dark)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-orange)' }}>{evento.dia} {formatearFechaVista(evento.fecha)}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{evento.hora}</div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0' }}>{evento.titulo}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={16} color="var(--border-dark)" /> {evento.lugar}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} color="var(--border-dark)" /> {evento.participantes}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '800', background: '#f5f5f5', border: '2px solid var(--border-dark)', padding: '6px 14px', borderRadius: '8px', color: 'var(--text-main)', boxShadow: '2px 2px 0px #171717' }}>
                        {evento.tipo === 'sesion' ? '📜 SESIÓN' : evento.tipo === 'comision' ? '🏛️ COMISIÓN' : '📍 TERRITORIO'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => iniciarEdicion(evento)}
                        className="btn-mini-mech edit"
                        title="Editar compromiso"
                      >
                        <Edit size={14} /> EDITAR
                      </button>
                      <button 
                        type="button" 
                        onClick={() => eliminarEvento(evento.id)}
                        className="btn-mini-mech delete"
                        title="Eliminar compromiso"
                      >
                        <Trash2 size={14} /> BORRAR
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Tip de Sincronización */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '2px solid var(--border-dark)', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 'auto', boxShadow: '2px 2px 0px #171717' }}>
        💡 <strong style={{ color: 'var(--text-main)', fontWeight: '800' }}>SINCRONIZACIÓN AUTOMÁTICA EN SUPABASE:</strong> Todos los compromisos se almacenan y persisten de forma oficial en la base de datos.
      </div>

    </div>
  );
}
