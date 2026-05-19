import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, MessageSquare, Clock, CheckCircle, ExternalLink, MessageCircle, Plus, Send, Sparkles, Layers, Zap, AlertTriangle, ShieldCheck, FileCheck, FileCode, Play, FileSearch, Terminal, Edit, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function TableroZen({ expedientes, eventos }) {
  const [togglePapeles, setTogglePapeles] = useState(false);
  const [toggleMinutas, setToggleMinutas] = useState(true);
  
  const [alertaDia, setAlertaDia] = useState('Obras Públicas se pasó para las 11:30 hs en Sala 2.');
  const [editandoAlerta, setEditandoAlerta] = useState(false);
  const [tempAlerta, setTempAlerta] = useState('');

  const [minutas, setMinutas] = useState([]);
  const [papelesSemana, setPapelesSemana] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Estado y funciones para Edición y Eliminación de Minutas
  const [minutaEditando, setMinutaEditando] = useState(null);
  const [datosEdicionMinuta, setDatosEdicionMinuta] = useState({
    comision: '',
    autor: '',
    texto: ''
  });

  const iniciarEdicionMinuta = (m) => {
    setMinutaEditando(m.id);
    setDatosEdicionMinuta({
      comision: m.comision || '',
      autor: m.autor || '',
      texto: m.texto || ''
    });
  };

  const guardarEdicionMinuta = async (e) => {
    e.preventDefault();
    try {
      const actualizados = {
        comision: datosEdicionMinuta.comision,
        autor: datosEdicionMinuta.autor,
        texto: datosEdicionMinuta.texto
      };
      await supabase.from('minutas').update(actualizados).eq('id', minutaEditando);
      setMinutas(prev => prev.map(m => m.id === minutaEditando ? { ...m, ...actualizados } : m));
      setMinutaEditando(null);
    } catch (err) {
      console.error('Error actualizando minuta en Supabase:', err);
    }
  };

  const eliminarMinuta = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta minuta rápida?')) return;
    try {
      await supabase.from('minutas').delete().eq('id', id);
      setMinutas(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error eliminando minuta en Supabase:', err);
    }
  };

  // Estado y funciones para Edición, Eliminación e Ingreso de Papeles de la Semana con Archivos Reales
  const [papelEditando, setPapelEditando] = useState(null);
  const [datosEdicionPapel, setDatosEdicionPapel] = useState({ titulo: '', tipo: '', icono: '', archivo_contenido: '' });
  const [nuevoPapel, setNuevoPapel] = useState({ titulo: '', tipo: 'PDF Oficial', icono: '📄', archivo_contenido: '' });

  const iniciarEdicionPapel = (p) => {
    setPapelEditando(p.id);
    setDatosEdicionPapel({
      titulo: p.titulo || '',
      tipo: p.tipo || '',
      icono: p.icono || '📄',
      archivo_contenido: p.archivo_contenido || ''
    });
  };

  const guardarEdicionPapel = async (e) => {
    e.preventDefault();
    try {
      const actualizados = {
        titulo: datosEdicionPapel.titulo,
        tipo: datosEdicionPapel.tipo,
        icono: datosEdicionPapel.icono,
        archivo_contenido: datosEdicionPapel.archivo_contenido
      };
      await supabase.from('papeles_semana').update(actualizados).eq('id', papelEditando);
      setPapelesSemana(prev => prev.map(p => p.id === papelEditando ? { ...p, ...actualizados } : p));
      setPapelEditando(null);
    } catch (err) {
      console.error('Error actualizando papel en Supabase:', err);
    }
  };

  const eliminarPapel = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este documento?')) return;
    try {
      await supabase.from('papeles_semana').delete().eq('id', id);
      setPapelesSemana(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error eliminando papel en Supabase:', err);
    }
  };

  const agregarPapel = async (e) => {
    e.preventDefault();
    if (!nuevoPapel.titulo) return;

    try {
      const { data, error } = await supabase.from('papeles_semana').insert([nuevoPapel]).select();
      if (data && data[0]) {
        setPapelesSemana(prev => [...prev, data[0]]);
      } else {
        setPapelesSemana(prev => [...prev, { ...nuevoPapel, id: Date.now() }]);
      }
    } catch (err) {
      console.error('Error insertando papel en Supabase:', err);
      setPapelesSemana(prev => [...prev, { ...nuevoPapel, id: Date.now() }]);
    }

    setNuevoPapel({ titulo: '', tipo: 'PDF Oficial', icono: '📄', archivo_contenido: '' });
  };

  // Cargar Alertas, Minutas y Papeles desde Supabase
  useEffect(() => {
    const fetchTableroData = async () => {
      try {
        // Cargar alerta
        const { data: alertaData } = await supabase.from('alertas').select('*').eq('id', 1).single();
        if (alertaData && alertaData.mensaje) {
          setAlertaDia(alertaData.mensaje);
        }

        // Cargar minutas
        const { data: minutasData } = await supabase.from('minutas').select('*').order('id', { ascending: false });
        if (minutasData) {
          setMinutas(minutasData);
        }

        // Cargar papeles semana
        const { data: papelesData } = await supabase.from('papeles_semana').select('*').order('id', { ascending: true });
        if (papelesData) {
          setPapelesSemana(papelesData);
        }
      } catch (err) {
        console.error('Error cargando datos del TableroZen desde Supabase:', err);
      } finally {
        setCargandoDatos(false);
      }
    };
    fetchTableroData();
  }, []);

  const guardarAlertaEditada = async (e) => {
    e.preventDefault();
    if (!tempAlerta) return;
    setAlertaDia(tempAlerta);
    setEditandoAlerta(false);

    try {
      await supabase.from('alertas').upsert({ id: 1, mensaje: tempAlerta, actualizado_en: new Date() });
    } catch (err) {
      console.error('Error actualizando alerta en Supabase:', err);
    }
  };

  const [nuevaMinuta, setNuevaMinuta] = useState({ comision: '', texto: '', autor: 'Lautaro' });

  const agregarMinuta = async (e) => {
    e.preventDefault();
    if (!nuevaMinuta.texto) return;

    const nuevaMin = {
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      comision: nuevaMinuta.comision || 'General',
      texto: nuevaMinuta.texto,
      autor: nuevaMinuta.autor
    };

    try {
      const { data, error } = await supabase.from('minutas').insert([nuevaMin]).select();
      if (data && data[0]) {
        setMinutas(prev => [data[0], ...prev]);
      } else {
        setMinutas(prev => [{ ...nuevaMin, id: Date.now() }, ...prev]);
      }
    } catch (err) {
      console.error('Error insertando minuta en Supabase:', err);
      setMinutas(prev => [{ ...nuevaMin, id: Date.now() }, ...prev]);
    }

    setNuevaMinuta({ comision: '', texto: '', autor: 'Lautaro' });
  };

  // Filtrar eventos para que se vayan saliendo automáticamente cuando pase su horario
  const now = new Date();
  const eventosInmediatos = (eventos || []).filter(ev => {
    if (!ev.fecha) return true;
    let year, month, day;
    if (ev.fecha.includes('/')) {
      [day, month, year] = ev.fecha.split('/').map(Number);
    } else {
      [year, month, day] = ev.fecha.split('-').map(Number);
    }
    let horaStr = ev.hora ? ev.hora.replace('hs', '').trim() : '00:00';
    if (!horaStr.includes(':')) horaStr += ':00';
    const [hours, minutes] = horaStr.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return eventDate >= now;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '44px' }}>
      
      {/* PANTALLA LED DE ADVERTENCIA (Alerta en Español con Edición Interactiva) */}
      <div className="led-display animate-fade-in" style={{ padding: '24px 32px', border: '3px solid var(--border-dark)', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.3), inset 0 0 20px rgba(239,68,68,0.2)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-led-amber)', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            <AlertTriangle size={18} className="animate-blink" /> [ ! ] ALERTA DEL DÍA // AVISO IMPORTANTE <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'none', letterSpacing: 'normal' }}>(Sustituye Mensaje Fijado WA)</span>
          </div>
          {!editandoAlerta && (
            <button 
              onClick={() => { setTempAlerta(alertaDia); setEditandoAlerta(true); }}
              style={{ background: '#22', border: '2px solid var(--text-led-amber)', color: 'var(--text-led-amber)', padding: '6px 14px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '2px 2px 0px var(--text-led-amber)' }}
              className="hover:bg-[#333] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--text-led-amber)]"
            >
              <Edit size={14} /> EDITAR ALERTA
            </button>
          )}
        </div>

        {editandoAlerta ? (
          <form 
            onSubmit={guardarAlertaEditada}
            style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}
          >
            <input 
              type="text" 
              value={tempAlerta}
              onChange={(e) => setTempAlerta(e.target.value)}
              style={{ flex: 1, minWidth: '280px', background: '#111', border: '2px solid var(--text-led-red)', borderRadius: '8px', padding: '12px 16px', color: 'var(--text-led-red)', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '700', outline: 'none', boxShadow: 'inset 0 0 10px rgba(239,68,68,0.2)' }}
              autoFocus
            />
            <button 
              type="submit" 
              style={{ background: 'var(--text-led-green)', border: '2px solid #000', color: '#000', padding: '12px 20px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '2px 2px 0px #000' }}
            >
              <Check size={16} /> GUARDAR
            </button>
            <button 
              type="button" 
              onClick={() => setEditandoAlerta(false)}
              style={{ background: '#333', border: '2px solid #555', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={16} />
            </button>
          </form>
        ) : (
          <p style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-led-red)', margin: 0, lineHeight: 1.4, textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
            &gt; {alertaDia}
          </p>
        )}
      </div>

      {/* CAJAS MODULARES GEMELAS: AGENDA Y ESTADO PARLAMENTARIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '32px' }}>
        
        {/* UNIDAD 1: AGENDA INMEDIATA */}
        <div className="hardware-unit" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="mech-label">
              <Clock size={16} color="var(--border-dark)" /> 01: AGENDA INMEDIATA <span style={{ textTransform: 'none', color: 'var(--text-subtle)' }}>(¿Qué hay Hoy o Próximamente?)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {eventosInmediatos && eventosInmediatos.length > 0 ? (
                <>
                  {eventosInmediatos.slice(0, 4).map((ev) => {
                    let bgBadge = 'var(--accent-orange)';
                    if (ev.tipo === 'sesion') bgBadge = 'var(--accent-cyan)';
                    if (ev.tipo === 'territorio') bgBadge = 'var(--accent-lime)';

                    return (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '18px' }}>
                        <span className="badge-mech" style={{ background: bgBadge, color: ev.tipo === 'comision' ? 'white' : 'var(--text-main)', fontSize: '0.85rem', padding: '6px 12px' }}>
                          [ {ev.hora ? ev.hora.replace(' hs', '') : '10:00'} ]
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {ev.titulo}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                            📅 {ev.dia} {ev.fecha && (ev.fecha.includes('/') ? ev.fecha : ev.fecha.split('-').reverse().join('/'))} // 📍 {ev.lugar}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {eventosInmediatos.length > 4 && (
                    <div style={{ 
                      background: '#f5f5f5', 
                      border: '2px solid var(--border-dark)', 
                      padding: '10px 16px', 
                      borderRadius: '8px', 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.85rem', 
                      color: 'var(--text-main)', 
                      textAlign: 'center', 
                      fontWeight: '800',
                      boxShadow: '2px 2px 0px #171717',
                      marginTop: '4px'
                    }}>
                      [ + {eventosInmediatos.length - 4} COMPROMISOS EN AGENDA COMPLETA ]
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center', fontWeight: '700' }}>
                  [ NO HAY EVENTOS PRÓXIMOS EN AGENDA ]
                </div>
              )}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', marginTop: '36px', paddingTop: '16px', borderTop: '2px solid rgba(0,0,0,0.1)', fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'right', fontWeight: '700' }}>
            ⚡ SINCRONIZADO CON SUPABASE (AGENDA OFICIAL)
          </div>
        </div>

        {/* UNIDAD 2: ESTADO PARLAMENTARIO */}
        <div className="hardware-unit" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="mech-label">
              <ShieldCheck size={16} color="var(--border-dark)" /> 02: ESTADO PARLAMENTARIO <span style={{ textTransform: 'none', color: 'var(--text-subtle)' }}>(¿En qué andamos?)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {expedientes && expedientes.length > 0 ? (
                expedientes.slice(0, 4).map((exp) => {
                  let badgeClass = 'badge-borrador';
                  let badgeText = 'BORRADOR';
                  if (exp.estado && exp.estado.includes('Comisión')) { badgeClass = 'badge-comision'; badgeText = 'COMISIÓN'; }
                  else if (exp.estado && exp.estado.includes('Sesión')) { badgeClass = 'badge-sesion'; badgeText = 'SESIÓN'; }
                  else if (exp.estado && exp.estado.includes('Aprobado')) { badgeClass = 'badge-aprobado'; badgeText = 'APROBADO'; }

                  return (
                    <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '18px', background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '2px solid var(--border-dark)', boxShadow: '3px 3px 0px #171717' }}>
                      <span className={`badge-mech ${badgeClass}`}>[ {badgeText} ]</span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.titulo}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center', fontWeight: '700' }}>
                  [ NO HAY EXPEDIENTES REGISTRADOS ]
                </div>
              )}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', marginTop: '36px', paddingTop: '16px', borderTop: '2px solid rgba(0,0,0,0.1)', fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'right', fontWeight: '700' }}>
            📌 SINCRONIZADO CON EXPEDIENTES EN SUPABASE
          </div>
        </div>

        {/* 03: PAPELES DE LA SEMANA */}
        <div className="hardware-unit" style={{ gridColumn: '1 / -1', padding: '36px' }}>
          <button 
            onClick={() => setTogglePapeles(!togglePapeles)}
            className="collapse-btn"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-main)', 
              fontWeight: '900', 
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span className="collapse-btn-left" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ background: 'var(--accent-cyan)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '2px 2px 0px #171717' }}>
                <FileText size={22} />
              </div>
              <span className="collapse-btn-title" style={{ display: 'flex', alignItems: 'center', gap: '14px', letterSpacing: '-0.02em' }}>
                03: PAPELES DE LA SEMANA <span className="collapse-btn-badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#ffffff', border: '2px solid var(--border-dark)', padding: '4px 12px', borderRadius: '6px', color: 'var(--text-main)', fontWeight: '800', boxShadow: '2px 2px 0px #171717' }}>[ {papelesSemana.length} ARCHIVOS DISPONIBLES ]</span>
              </span>
            </span>
            <div className="collapse-btn-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
              {togglePapeles ? 'CERRAR' : 'ABRIR'} {togglePapeles ? <ChevronDown size={22} color="var(--border-dark)" /> : <ChevronRight size={22} />}
            </div>
          </button>

          {togglePapeles && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px', paddingTop: '32px', borderTop: '3px solid var(--border-dark)' }}>
              
              {/* Formulario Mecánico de Ingreso de Papel / Orden del Día */}
              <form onSubmit={agregarPapel} style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: '#ffffff', padding: '28px', borderRadius: '16px', border: '2px solid var(--border-dark)', boxShadow: '4px 4px 0px #171717' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileCheck size={18} /> ✍️ AGREGAR ORDEN DEL DÍA / DOCUMENTO OFICIAL:
                </div>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 220px 120px', gap: '18px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="TÍTULO / DESCRIPCIÓN (EJ: Orden del Día Sesión 20.pdf)" 
                    className="input-hardware" 
                    style={{ padding: '14px 18px', fontSize: '0.95rem' }}
                    value={nuevoPapel.titulo}
                    onChange={e => setNuevoPapel({...nuevoPapel, titulo: e.target.value})}
                    required
                  />
                  <select 
                    className="input-hardware" 
                    style={{ padding: '14px 18px', fontSize: '0.95rem' }}
                    value={nuevoPapel.tipo}
                    onChange={e => {
                      const t = e.target.value;
                      let ic = nuevoPapel.icono;
                      if (t === 'PDF Oficial') ic = '📄';
                      if (t === 'Borrador Word') ic = '📝';
                      if (t === 'Normativa') ic = '🏛️';
                      if (t === 'Decreto') ic = '📜';
                      setNuevoPapel({...nuevoPapel, tipo: t, icono: ic});
                    }}
                  >
                    <option value="PDF Oficial">📄 PDF Oficial</option>
                    <option value="Borrador Word">📝 Borrador Word</option>
                    <option value="Normativa">🏛️ Normativa</option>
                    <option value="Decreto">📜 Decreto</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="ICONO (📄)" 
                    className="input-hardware" 
                    style={{ padding: '14px 18px', fontSize: '0.95rem', textAlign: 'center' }}
                    value={nuevoPapel.icono}
                    onChange={e => setNuevoPapel({...nuevoPapel, icono: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-mechanical btn-cyan" style={{ padding: '14px 32px', borderRadius: '10px' }}>
                    <Plus size={20} /> AGREGAR DOCUMENTO
                  </button>
                </div>
              </form>

              {/* Feed de Papeles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: '700' }}>&gt; PRESIONE EL BOTÓN PARA DESCARGAR O ABRIR LA VERSIÓN OFICIAL LIMPIA EN EL VISOR:</p>
                {papelesSemana.map((p) => (
                  papelEditando === p.id ? (
                    <form 
                      key={`edit-papel-${p.id}`}
                      onSubmit={guardarEdicionPapel}
                      style={{ background: '#ffffff', border: '2px solid var(--accent-cyan)', borderRadius: '14px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '4px 4px 0px var(--accent-cyan)' }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                        [ EDITANDO DOCUMENTO ID: {p.id} ]
                      </div>
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 220px 120px', gap: '14px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="Título del documento" 
                          className="input-hardware" 
                          value={datosEdicionPapel.titulo} 
                          onChange={e => setDatosEdicionPapel({...datosEdicionPapel, titulo: e.target.value})} 
                          required
                        />
                        <select 
                          className="input-hardware" 
                          value={datosEdicionPapel.tipo} 
                          onChange={e => {
                            const t = e.target.value;
                            let ic = datosEdicionPapel.icono;
                            if (t === 'PDF Oficial') ic = '📄';
                            if (t === 'Borrador Word') ic = '📝';
                            if (t === 'Normativa') ic = '🏛️';
                            if (t === 'Decreto') ic = '📜';
                            setDatosEdicionPapel({...datosEdicionPapel, tipo: t, icono: ic});
                          }}
                        >
                          <option value="PDF Oficial">📄 PDF Oficial</option>
                          <option value="Borrador Word">📝 Borrador Word</option>
                          <option value="Normativa">🏛️ Normativa</option>
                          <option value="Decreto">📜 Decreto</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Icono" 
                          className="input-hardware" 
                          style={{ textAlign: 'center' }}
                          value={datosEdicionPapel.icono} 
                          onChange={e => setDatosEdicionPapel({...datosEdicionPapel, icono: e.target.value})} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-mechanical" onClick={() => setPapelEditando(null)}>
                          <X size={16} /> CANCELAR
                        </button>
                        <button type="submit" className="btn-mechanical btn-cyan">
                          <Check size={16} /> GUARDAR CAMBIOS
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '22px 28px', borderRadius: '14px', border: '2px solid var(--border-dark)', boxShadow: '4px 4px 0px #171717', transition: 'all 0.1s', flexWrap: 'wrap', gap: '16px' }} className="papel-item hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#171717]">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flex: 1, minWidth: '280px' }}>
                        <span style={{ fontSize: '2rem' }}>{p.icono}</span>
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{p.titulo}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '700' }}>TIPO: {p.tipo}</div>
                        </div>
                      </div>
                      <div className="papel-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const isWord = p.tipo === 'Borrador Word' || p.titulo.toLowerCase().includes('.doc');
                            const ext = isWord ? '.docx' : '.pdf';
                            const fileName = p.titulo.toLowerCase().endsWith(ext) ? p.titulo : (p.titulo.replace(/\.[^/.]+$/, "") + ext);
                            
                            const fechaStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                            const textoContenido = `HONORABLE CONCEJO DELIBERANTE DE Gral. SAN MARTÍN\nPROVINCIA DE MENDOZA\n===================================================\n\nDOCUMENTO OFICIAL: ${p.titulo.toUpperCase()}\nTIPO DE ARCHIVO: ${p.tipo.toUpperCase()}\nFECHA DE EMISIÓN: ${fechaStr}\n\n===================================================\n[ ORDEN DEL DÍA / CONTENIDO PARLAMENTARIO ]\n===================================================\n\n1. APERTURA DE LA SESIÓN Y QUÓRUM LEGAL.\n   - Izamiento de la Bandera Nacional y Provincial.\n   - Constatación de concejales presentes por Secretaría.\n\n2. APROBACIÓN DE ACTAS ANTERIORES.\n   - Lectura y consideración de la versión taquigráfica de la sesión precedente.\n\n3. ASUNTOS ENTRADOS POR EL DEPARTAMENTO EJECUTIVO.\n   - Mensajes y proyectos remitidos por la Intendencia Municipal.\n   - Informes de ejecución presupuestaria y obras públicas.\n\n4. DESPACHOS DE COMISIONES PERMANENTES.\n   - Comisión de Obras y Servicios Públicos.\n   - Comisión de Hacienda, Presupuesto y Cuentas.\n   - Comisión de Legislación y Asuntos Constitucionales.\n   - Comisión de Acción Social, Salud y Medio Ambiente.\n\n5. PROYECTOS PRESENTADOS POR LOS BLOQUES POLÍTICOS.\n   - Proyectos de Ordenanza.\n   - Proyectos de Resolución y Pedidos de Informe.\n   - Minutas de Comunicación y Declaraciones de Interés.\n\n6. HOMENAJES Y MANIFESTACIONES GENERALES.\n   - Espacio libre para alocuciones de los señores Concejales.\n\n===================================================\nSECRETARÍA LEGISLATIVA - HCD SAN MARTÍN, MENDOZA`;
                            
                            const blob = new Blob([textoContenido], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="btn-mechanical btn-cyan"
                          style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.9rem' }}
                        >
                          Abrir // Descargar
                        </button>
                        <button 
                          type="button" 
                          onClick={() => iniciarEdicionPapel(p)}
                          className="btn-mini-mech edit"
                          title="Editar documento"
                        >
                          <Edit size={14} /> EDITAR
                        </button>
                        <button 
                          type="button" 
                          onClick={() => eliminarPapel(p.id)}
                          className="btn-mini-mech delete"
                          title="Eliminar documento"
                        >
                          <Trash2 size={14} /> BORRAR
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 04: MINUTAS RÁPIDAS */}
        <div className="hardware-unit" style={{ gridColumn: '1 / -1', padding: '36px' }}>
          <button 
            onClick={() => setToggleMinutas(!toggleMinutas)}
            className="collapse-btn"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-main)', 
              fontWeight: '900', 
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span className="collapse-btn-left" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '2px 2px 0px #171717' }}>
                <MessageSquare size={22} />
              </div>
              <span className="collapse-btn-title" style={{ display: 'flex', alignItems: 'center', gap: '14px', letterSpacing: '-0.02em' }}>
                04: MINUTAS RÁPIDAS <span className="collapse-btn-badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#ffffff', border: '2px solid var(--border-dark)', color: 'var(--text-main)', padding: '4px 12px', borderRadius: '6px', fontWeight: '800', boxShadow: '2px 2px 0px #171717' }}>[ {minutas.length} NOTAS GUARDADAS ]</span>
              </span>
            </span>
            <div className="collapse-btn-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
              {toggleMinutas ? 'CERRAR' : 'ABRIR'} {toggleMinutas ? <ChevronDown size={22} color="var(--border-dark)" /> : <ChevronRight size={22} />}
            </div>
          </button>

          {toggleMinutas && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px', paddingTop: '32px', borderTop: '3px solid var(--border-dark)' }}>
              
              {/* Formulario Mecánico de Ingreso */}
              <form onSubmit={agregarMinuta} style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: '#ffffff', padding: '28px', borderRadius: '16px', border: '2px solid var(--border-dark)', boxShadow: '4px 4px 0px #171717' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Terminal size={18} /> ✍️ INGRESO DE MINUTA RÁPIDA AL SALIR DE COMISIÓN:
                </div>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '18px' }}>
                  <input 
                    type="text" 
                    placeholder="COMISIÓN (EJ: HACIENDA)" 
                    className="input-hardware" 
                    style={{ padding: '14px 18px', fontSize: '0.95rem' }}
                    value={nuevaMinuta.comision}
                    onChange={e => setNuevaMinuta({...nuevaMinuta, comision: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="AUTOR" 
                    className="input-hardware" 
                    style={{ padding: '14px 18px', fontSize: '0.95rem' }}
                    value={nuevaMinuta.autor}
                    onChange={e => setNuevaMinuta({...nuevaMinuta, autor: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                  <input 
                    type="text" 
                    placeholder="RESUMEN (EJ: LA OPOSICIÓN NO DIO QUÓRUM POR EL ART 4...)" 
                    className="input-hardware" 
                    style={{ padding: '14px 18px', fontSize: '0.95rem' }}
                    value={nuevaMinuta.texto}
                    onChange={e => setNuevaMinuta({...nuevaMinuta, texto: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-mechanical btn-lime" style={{ padding: '14px 32px', borderRadius: '10px' }}>
                    <Send size={20} /> GUARDAR MINUTA
                  </button>
                </div>
              </form>

              {/* Feed de Minutas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {minutas.map((m) => (
                  minutaEditando === m.id ? (
                    <form 
                      key={`edit-${m.id}`}
                      onSubmit={guardarEdicionMinuta}
                      style={{ background: '#ffffff', border: '2px solid var(--accent-lime)', borderRadius: '14px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '4px 4px 0px var(--accent-lime)' }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-lime)' }}>
                        [ EDITANDO MINUTA ID: {m.id} ]
                      </div>
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '14px' }}>
                        <input 
                          type="text" 
                          placeholder="Comisión" 
                          className="input-hardware" 
                          value={datosEdicionMinuta.comision} 
                          onChange={e => setDatosEdicionMinuta({...datosEdicionMinuta, comision: e.target.value})} 
                        />
                        <input 
                          type="text" 
                          placeholder="Autor" 
                          className="input-hardware" 
                          value={datosEdicionMinuta.autor} 
                          onChange={e => setDatosEdicionMinuta({...datosEdicionMinuta, autor: e.target.value})} 
                        />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Resumen" 
                        className="input-hardware" 
                        value={datosEdicionMinuta.texto} 
                        onChange={e => setDatosEdicionMinuta({...datosEdicionMinuta, texto: e.target.value})} 
                        required 
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-mechanical" onClick={() => setMinutaEditando(null)}>
                          <X size={16} /> CANCELAR
                        </button>
                        <button type="submit" className="btn-mechanical btn-lime">
                          <Check size={16} /> GUARDAR CAMBIOS
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div key={m.id} className="minuta-item" style={{ background: '#ffffff', border: '2px solid var(--border-dark)', borderRadius: '14px', padding: '24px 28px', borderLeft: '8px solid var(--accent-lime)', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '4px 4px 0px #171717' }}>
                      <div className="minuta-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>[ {m.fecha} ]</strong> // <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{m.comision}</span>
                        </span>
                        <div className="minuta-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', background: '#f5f5f5', border: '2px solid var(--border-dark)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '800', boxShadow: '2px 2px 0px #171717' }}>AUTOR: {m.autor}</span>
                          <button 
                            type="button" 
                            onClick={() => iniciarEdicionMinuta(m)}
                            className="btn-mini-mech edit"
                            title="Editar minuta"
                          >
                            <Edit size={14} /> EDITAR
                          </button>
                          <button 
                            type="button" 
                            onClick={() => eliminarMinuta(m.id)}
                            className="btn-mini-mech delete"
                            title="Eliminar minuta"
                          >
                            <Trash2 size={14} /> BORRAR
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5, fontWeight: '700' }}>
                        "{m.texto}"
                      </p>
                    </div>
                  )
                ))}
              </div>

            </div>
          )}
        </div>

        {/* BOTONERA TÁCTICA DE SINTETIZADOR (Grid 2x2 en Español) */}
        <div className="tactical-grid" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <a 
            href="https://www.youtube.com/results?search_query=hcd+san+martin+mendoza+en+vivo" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ background: 'var(--accent-orange)', border: '2px solid var(--border-dark)', padding: '28px 24px', borderRadius: '16px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.1s', cursor: 'pointer', boxShadow: '6px 6px 0px #171717' }}
            className="hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#171717]"
          >
            <div style={{ background: '#ffffff', border: '2px solid var(--border-dark)', padding: '14px', borderRadius: '12px', color: 'var(--accent-orange)', boxShadow: '3px 3px 0px #171717' }}>
              <Play size={26} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Recinto en Vivo</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fffede', marginTop: '4px', fontWeight: '700' }}>TRANSMISIÓN YOUTUBE</span>
            </div>
          </a>

          <a 
            href="https://sanmartinmza.gob.ar/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ background: 'var(--accent-cyan)', border: '2px solid var(--border-dark)', padding: '28px 24px', borderRadius: '16px', color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.1s', cursor: 'pointer', boxShadow: '6px 6px 0px #171717' }}
            className="hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#171717]"
          >
            <div style={{ background: '#ffffff', border: '2px solid var(--border-dark)', padding: '14px', borderRadius: '12px', color: 'var(--accent-cyan)', boxShadow: '3px 3px 0px #171717' }}>
              <FileSearch size={26} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Digesto Online</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '800' }}>LEYES Y ORDENANZAS</span>
            </div>
          </a>

          <button 
            onClick={() => alert('Abriendo formulario de reclamo territorial...')}
            style={{ background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', padding: '28px 24px', borderRadius: '16px', color: 'var(--text-main)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.1s', cursor: 'pointer', boxShadow: '6px 6px 0px #171717' }}
            className="hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#171717]"
          >
            <div style={{ background: '#ffffff', border: '2px solid var(--border-dark)', padding: '14px', borderRadius: '12px', color: 'var(--accent-lime)', boxShadow: '3px 3px 0px #171717' }}>
              <FileCheck size={26} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Nuevo Reclamo</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '800' }}>FORMULARIO VECINOS</span>
            </div>
          </button>

          <button 
            onClick={() => alert('Copiando Prompt Maestro Ley 1079 a ChatGPT/Antigravity...')}
            style={{ background: 'var(--accent-purple)', border: '2px solid var(--border-dark)', padding: '28px 24px', borderRadius: '16px', color: 'white', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.1s', cursor: 'pointer', boxShadow: '6px 6px 0px #171717' }}
            className="hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#171717]"
          >
            <div style={{ background: '#ffffff', border: '2px solid var(--border-dark)', padding: '14px', borderRadius: '12px', color: 'var(--accent-purple)', boxShadow: '3px 3px 0px #171717' }}>
              <FileCode size={26} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Prompt IA</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#fffede', marginTop: '4px', fontWeight: '700' }}>ASISTENTE LEY 1079</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
