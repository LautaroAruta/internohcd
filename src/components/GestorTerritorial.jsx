import React, { useState, useEffect } from 'react';
import { MapPin, Send, CheckCircle, Users, MessageSquare, Edit, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function GestorTerritorial({ esAdmin = false }) {
  const [reclamo, setReclamo] = useState({
    barrio: 'San Martín (Ciudad / Centro)',
    domicilio: '',
    vecino: '',
    telefono: '',
    detalle: ''
  });

  const [reclamosGuardados, setReclamosGuardados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [busquedaTerritorio, setBusquedaTerritorio] = useState('');

  // Estado y funciones para Edición y Eliminación
  const [reclamoEditando, setReclamoEditando] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({
    barrio: '',
    domicilio: '',
    vecino: '',
    telefono: '',
    detalle: ''
  });

  const iniciarEdicion = (rec) => {
    setReclamoEditando(rec.id);
    setDatosEdicion({
      barrio: rec.barrio || '',
      domicilio: rec.domicilio || '',
      vecino: rec.vecino || '',
      telefono: rec.tel || rec.telefono || '',
      detalle: rec.detalle || ''
    });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const actualizados = {
        barrio: datosEdicion.barrio,
        domicilio: datosEdicion.domicilio,
        vecino: datosEdicion.vecino,
        tel: datosEdicion.telefono,
        detalle: datosEdicion.detalle
      };
      await supabase.from('reclamos').update(actualizados).eq('id', reclamoEditando);
      setReclamosGuardados(prev => prev.map(r => r.id === reclamoEditando ? { ...r, ...actualizados } : r));
      setReclamoEditando(null);
    } catch (err) {
      console.error('Error actualizando reclamo en Supabase:', err);
    }
  };

  const eliminarReclamo = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este reclamo del registro vecinal?')) return;
    try {
      await supabase.from('reclamos').delete().eq('id', id);
      setReclamosGuardados(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error eliminando reclamo en Supabase:', err);
    }
  };

  useEffect(() => {
    const fetchReclamos = async () => {
      try {
        const { data, error } = await supabase.from('reclamos').select('*').order('id', { ascending: false });
        if (data) {
          setReclamosGuardados(data);
        }
      } catch (err) {
        console.error('Error cargando reclamos de Supabase:', err);
      } finally {
        setCargando(false);
      }
    };
    fetchReclamos();
  }, []);

  const distritosSanMartin = [
    'San Martín (Ciudad / Centro)',
    'Palmira',
    'Buen Orden',
    'Alto Verde',
    'Alto Salvador',
    'Chapanay',
    'Tres Porteñas',
    'El Central',
    'Nueva California',
    'Chivilcoy',
    'El Divisadero',
    'El Espino',
    'El Ramblón',
    'Las Chimbas',
    'Montecaseros',
    'Otro / Fuera de Distrito'
  ];

  const guardarReclamo = async (e) => {
    e.preventDefault();
    if (!reclamo.detalle) return;

    const nuevoRec = {
      barrio: reclamo.barrio,
      domicilio: reclamo.domicilio || 'Sin Domicilio Especificado',
      vecino: reclamo.vecino || 'Vecino Anónimo',
      tel: reclamo.telefono || 'Sin Teléfono',
      detalle: reclamo.detalle,
      fecha: 'Hoy ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs'
    };

    try {
      const { data, error } = await supabase.from('reclamos').insert([nuevoRec]).select();
      if (data && data[0]) {
        setReclamosGuardados(prev => [data[0], ...prev]);
      } else {
        setReclamosGuardados(prev => [{ ...nuevoRec, id: Date.now() }, ...prev]);
      }
    } catch (err) {
      console.error('Error insertando reclamo en Supabase:', err);
      setReclamosGuardados(prev => [{ ...nuevoRec, id: Date.now() }, ...prev]);
    }

    setReclamo({ barrio: reclamo.barrio, domicilio: '', vecino: '', telefono: '', detalle: '' });
    setEnviado(true);
    setTimeout(() => setEnviado(false), 2500);
  };

  return (
    <div className="hardware-unit" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px', height: '100%' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '3px 3px 0px var(--border-dark)' }}>
          <MapPin size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>GESTOR TERRITORIAL</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: '700' }}>CAPTURA RÁPIDA DE RECLAMOS BARRIALES DESDE EL CELULAR</p>
        </div>
      </div>

      {/* Contenedor Principal Dividido en 2 Columnas */}
      <div className="gestor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', flexGrow: 1 }}>
        
        {/* Columna Izquierda: Formulario de Captura Rápida */}
        {esAdmin && (
          <form onSubmit={guardarReclamo} style={{ background: 'var(--bg-card)', padding: '28px', border: '2px solid var(--border-dark)', borderRadius: '16px', boxShadow: '4px 4px 0px var(--border-dark)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              <MessageSquare size={20} color="var(--accent-lime)" /> Nuevo Reclamo en Territorio
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>DISTRITO</label>
                <select className="input-hardware" value={reclamo.barrio} onChange={e => setReclamo({...reclamo, barrio: e.target.value})}>
                  {distritosSanMartin.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>DOMICILIO / BARRIO</label>
                <input 
                  type="text" 
                  className="input-hardware" 
                  placeholder="Calle, N°, Barrio..." 
                  value={reclamo.domicilio}
                  onChange={e => setReclamo({...reclamo, domicilio: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>VECINO REFERENTE</label>
                <input 
                  type="text" 
                  className="input-hardware" 
                  placeholder="Nombre" 
                  value={reclamo.vecino}
                  onChange={e => setReclamo({...reclamo, vecino: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>TELÉFONO</label>
                <input 
                  type="text" 
                  className="input-hardware" 
                  placeholder="Móvil" 
                  value={reclamo.telefono}
                  onChange={e => setReclamo({...reclamo, telefono: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>PROBLEMÁTICA / SOLICITUD</label>
              <textarea 
                className="input-hardware" 
                rows={3} 
                placeholder="Describa el problema o idea (ej: falta luminaria, bacheo, cloacas...)" 
                value={reclamo.detalle}
                onChange={e => setReclamo({...reclamo, detalle: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-mechanical btn-lime" 
              disabled={enviado}
              style={{ marginTop: 'auto', padding: '16px', fontSize: '1rem' }}
            >
              {enviado ? (
                <>
                  <CheckCircle size={20} /> RECLAMO REGISTRADO
                </>
              ) : (
                <>
                  <Send size={20} /> REGISTRAR RECLAMO (BUZÓN INTERNO)
                </>
              )}
            </button>
          </form>
        )}

        {/* Columna Derecha: Reclamos Recientes */}
        <div className="gestor-right-col" style={{ background: 'var(--bg-surface)', padding: '28px', border: '2px solid var(--border-dark)', borderRadius: '16px', boxShadow: '4px 4px 0px var(--border-dark)', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              <Users size={20} color="var(--accent-lime)" /> RECLAMOS RECIENTES
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', color: 'var(--text-main)', padding: '4px 12px', borderRadius: '8px', fontWeight: '800', boxShadow: '2px 2px 0px var(--border-dark)' }}>
              {reclamosGuardados.length} REGISTRADOS
            </span>
          </div>

          {/* Barra de Búsqueda Territorial */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', border: '2px solid var(--border-dark)', borderRadius: '10px', padding: '6px 14px', boxShadow: '2px 2px 0px var(--border-dark)' }}>
            <span style={{ fontSize: '1.1rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por distrito, barrio, vecino, teléfono o detalle..."
              value={busquedaTerritorio}
              onChange={e => setBusquedaTerritorio(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-main)', background: 'transparent' }}
            />
            {busquedaTerritorio && (
              <button onClick={() => setBusquedaTerritorio('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: '800' }}>[ LIMPIAR ]</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
            {reclamosGuardados.filter(rec => {
              if (!busquedaTerritorio) return true;
              const term = busquedaTerritorio.toLowerCase();
              return (rec.barrio?.toLowerCase().includes(term) ||
                      rec.domicilio?.toLowerCase().includes(term) ||
                      rec.vecino?.toLowerCase().includes(term) ||
                      rec.tel?.toLowerCase().includes(term) ||
                      rec.telefono?.toLowerCase().includes(term) ||
                      rec.detalle?.toLowerCase().includes(term));
            }).map((rec) => (
              reclamoEditando === rec.id ? (
                <form 
                  key={`edit-${rec.id}`}
                  onSubmit={guardarEdicion}
                  className="animate-fade-in"
                  style={{ 
                    padding: '20px', 
                    background: 'var(--bg-card)', 
                    border: '2px solid var(--accent-lime)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    boxShadow: '4px 4px 0px var(--accent-lime)'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-lime)' }}>
                    [ EDITANDO RECLAMO ID: {rec.id} ]
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <select 
                      className="input-hardware" 
                      value={datosEdicion.barrio} 
                      onChange={e => setDatosEdicion({...datosEdicion, barrio: e.target.value})}
                    >
                      {distritosSanMartin.map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="input-hardware" 
                      value={datosEdicion.domicilio} 
                      onChange={e => setDatosEdicion({...datosEdicion, domicilio: e.target.value})} 
                      placeholder="Domicilio / Barrio" 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input 
                      type="text" 
                      className="input-hardware" 
                      value={datosEdicion.vecino} 
                      onChange={e => setDatosEdicion({...datosEdicion, vecino: e.target.value})} 
                      placeholder="Vecino" 
                    />
                    <input 
                      type="text" 
                      className="input-hardware" 
                      value={datosEdicion.telefono} 
                      onChange={e => setDatosEdicion({...datosEdicion, telefono: e.target.value})} 
                      placeholder="Teléfono" 
                    />
                  </div>
                  <textarea 
                    className="input-hardware" 
                    rows={3} 
                    value={datosEdicion.detalle} 
                    onChange={e => setDatosEdicion({...datosEdicion, detalle: e.target.value})} 
                    placeholder="Detalle del reclamo" 
                    required 
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="btn-mechanical" onClick={() => setReclamoEditando(null)}>
                      <X size={16} /> CANCELAR
                    </button>
                    <button type="submit" className="btn-mechanical btn-lime">
                      <Check size={16} /> GUARDAR CAMBIOS
                    </button>
                  </div>
                </form>
              ) : (
                <div 
                  key={rec.id} 
                  className="animate-fade-in" 
                  style={{ 
                    padding: '20px', 
                    background: 'var(--bg-card)', 
                    border: '2px solid var(--border-dark)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    borderLeft: '8px solid var(--accent-lime)',
                    boxShadow: '3px 3px 0px var(--border-dark)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '800', color: 'var(--text-main)', background: 'var(--accent-lime)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-dark)' }}>{rec.barrio}</span>
                      {rec.domicilio && rec.domicilio !== 'Sin Domicilio Especificado' && (
                        <span style={{ color: 'var(--text-subtle)', fontWeight: '700' }}>📍 {rec.domicilio}</span>
                      )}
                    </div>
                    <span style={{ fontWeight: '700' }}>{rec.fecha}</span>
                  </div>

                  <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: '700' }}>
                    {rec.detalle}
                  </p>

                  <div className="reclamo-item-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-subtle)', borderTop: '2px solid rgba(150,150,150,0.15)', paddingTop: '12px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span>REFERENTE: <strong style={{ color: 'var(--text-main)' }}>{rec.vecino}</strong></span>
                      <span>TEL: <strong style={{ color: 'var(--text-main)' }}>{rec.tel || rec.telefono}</strong></span>
                    </div>
                    {esAdmin && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => iniciarEdicion(rec)}
                          className="btn-mini-mech edit"
                          title="Editar reclamo"
                        >
                          <Edit size={14} /> EDITAR
                        </button>
                        <button 
                          type="button" 
                          onClick={() => eliminarReclamo(rec.id)}
                          className="btn-mini-mech delete"
                          title="Eliminar reclamo"
                        >
                          <Trash2 size={14} /> BORRAR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
