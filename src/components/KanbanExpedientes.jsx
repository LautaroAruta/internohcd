import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, ArrowRight, CheckCircle, Clock, AlertCircle, FileCode, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function KanbanExpedientes({ expedientes, setExpedientes, esAdmin = false }) {
  const [nuevoExpediente, setNuevoExpediente] = useState({ 
    titulo: '', 
    tipo: 'Ordenanza', 
    comision: 'Obras Públicas', 
    estado: 'Borrador / Redacción', 
    responsable: 'Asesor Técnico' 
  });
  const [archivoFile, setArchivoFile] = useState(null);
  const [archivoEdicionFile, setArchivoEdicionFile] = useState(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Estado y funciones para Edición y Eliminación de Expedientes
  const [expedienteEditando, setExpedienteEditando] = useState(null);
  const [datosEdicionExp, setDatosEdicionExp] = useState({
    titulo: '',
    tipo: 'Ordenanza',
    comision: 'Obras Públicas',
    responsable: '',
    archivoNombre: '',
    archivoContenido: ''
  });

  const iniciarEdicionExp = (exp) => {
    setExpedienteEditando(exp.id);
    setArchivoEdicionFile(null); // Resetear archivo seleccionado en ediciones previas
    setDatosEdicionExp({
      titulo: exp.titulo || '',
      tipo: exp.tipo || 'Ordenanza',
      comision: exp.comision || 'Obras Públicas',
      responsable: exp.responsable || exp.iniciador || '',
      archivoNombre: exp.archivo || '',
      archivoContenido: exp.archivo_contenido || ''
    });
  };

  const guardarEdicionExp = async (e) => {
    e.preventDefault();
    setSubiendoArchivo(true);
    try {
      let archivoNombreFinal = datosEdicionExp.archivoNombre;
      let archivoContenidoFinal = datosEdicionExp.archivoContenido;

      // Si se seleccionó un nuevo archivo en el formulario de edición, subirlo
      if (archivoEdicionFile) {
        const fileExt = archivoEdicionFile.name.split('.').pop();
        const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('expedientes')
          .upload(uniqueFileName, archivoEdicionFile);

        if (storageError) {
          throw storageError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('expedientes')
          .getPublicUrl(uniqueFileName);
        
        archivoNombreFinal = archivoEdicionFile.name;
        archivoContenidoFinal = publicUrlData.publicUrl;
      }

      const actualizados = {
        titulo: datosEdicionExp.titulo,
        tipo: datosEdicionExp.tipo,
        comision: datosEdicionExp.comision,
        responsable: datosEdicionExp.responsable,
        iniciador: datosEdicionExp.responsable,
        archivo: archivoNombreFinal,
        archivo_contenido: archivoContenidoFinal
      };

      await supabase.from('expedientes').update(actualizados).eq('id', expedienteEditando);
      setExpedientes(prev => prev.map(exp => exp.id === expedienteEditando ? { ...exp, ...actualizados } : exp));
      setExpedienteEditando(null);
      setArchivoEdicionFile(null);
    } catch (err) {
      console.error('Error actualizando expediente en Supabase:', err);
      alert('Error al guardar cambios del expediente: ' + err.message);
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const eliminarExpediente = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este expediente del registro parlamentario?')) return;
    try {
      await supabase.from('expedientes').delete().eq('id', id);
      setExpedientes(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error('Error eliminando expediente en Supabase:', err);
    }
  };

  const columnas = [
    { id: 'Borrador / Redacción', titulo: '📝 Borrador / Redacción', color: '#e5e5e5' },
    { id: 'En Comisión', titulo: '🏛️ En Comisión', color: 'var(--accent-yellow)' },
    { id: 'Próxima Sesión', titulo: '🚀 Próxima Sesión', color: 'var(--accent-cyan)' },
    { id: 'Aprobados', titulo: '✅ Aprobados', color: 'var(--accent-lime)' }
  ];

  const moverExpediente = async (id, nuevoEstado) => {
    // Actualización local inmediata
    setExpedientes(prev => prev.map(exp => exp.id === id ? { ...exp, estado: nuevoEstado, ultimoMovimiento: 'Hoy (' + nuevoEstado + ')' } : exp));
    
    // Persistencia en Supabase
    try {
      await supabase.from('expedientes').update({ estado: nuevoEstado }).eq('id', id);
    } catch (err) {
      console.error('Error actualizando estado en Supabase:', err);
    }
  };

  const agregarExpediente = async (e) => {
    e.preventDefault();
    if (!nuevoExpediente.titulo) return;

    setSubiendoArchivo(true);
    try {
      let archivoNombreFinal = '';
      let archivoContenidoFinal = '';

      if (archivoFile) {
        // Subir archivo a Supabase Storage
        const fileExt = archivoFile.name.split('.').pop();
        const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('expedientes')
          .upload(uniqueFileName, archivoFile);

        if (storageError) {
          throw storageError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('expedientes')
          .getPublicUrl(uniqueFileName);
        
        archivoNombreFinal = archivoFile.name;
        archivoContenidoFinal = publicUrlData.publicUrl;
      } else {
        // Generar un borrador de texto autogenerado por defecto
        archivoNombreFinal = nuevoExpediente.titulo.toLowerCase().replace(/ /g, '_') + '.pdf';
        archivoContenidoFinal = ''; // Se generará visualmente en el visor
      }

      const nuevoExp = {
        numero: `EXP-2026-${Math.floor(Math.random() * 900 + 100)}`,
        titulo: nuevoExpediente.titulo,
        tipo: nuevoExpediente.tipo,
        comision: nuevoExpediente.comision,
        estado: nuevoExpediente.estado,
        iniciador: nuevoExpediente.responsable,
        responsable: nuevoExpediente.responsable,
        fecha: new Date().toLocaleDateString('es-ES'),
        prioridad: 'Alta',
        archivo: archivoNombreFinal,
        archivo_contenido: archivoContenidoFinal
      };

      const { data, error } = await supabase.from('expedientes').insert([nuevoExp]).select();
      if (data && data[0]) {
        setExpedientes(prev => [...prev, data[0]]);
      } else {
        setExpedientes(prev => [...prev, { ...nuevoExp, id: Date.now() }]);
      }

      // Resetear estados del formulario
      setNuevoExpediente({ titulo: '', tipo: 'Ordenanza', comision: 'Obras Públicas', estado: 'Borrador / Redacción', responsable: 'Asesor Técnico' });
      setArchivoFile(null);
      setMostrarForm(false);
    } catch (err) {
      console.error('Error insertando en Supabase:', err);
      alert('Error al agregar el expediente: ' + err.message);
    } finally {
      setSubiendoArchivo(false);
    }
  };

  return (
    <div className="hardware-unit" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px', height: '100%' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--accent-orange)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'white', boxShadow: '3px 3px 0px #171717' }}>
            <FileText size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>CONTROL DE EXPEDIENTES</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: '700' }}>TABLERO VISUAL DE PROYECTOS DEL BLOQUE (CONECTADO A SUPABASE)</p>
          </div>
        </div>

        {esAdmin && (
          <button className="btn-mechanical btn-orange" onClick={() => setMostrarForm(!mostrarForm)}>
            <Plus size={20} /> NUEVO EXPEDIENTE
          </button>
        )}
      </div>

      {/* Barra de Búsqueda Rápida */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', border: '2px solid var(--border-dark)', borderRadius: '12px', padding: '8px 16px', boxShadow: '3px 3px 0px var(--border-dark)' }}>
        <span style={{ fontSize: '1.2rem' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Buscar expediente por número, título, comisión o responsable..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-main)', background: 'transparent' }}
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: '800' }}>[ LIMPIAR ]</button>
        )}
      </div>

      {/* Formulario Nuevo Expediente */}
      {mostrarForm && (
        <form onSubmit={agregarExpediente} style={{ padding: '28px', background: 'var(--bg-card)', border: '2px solid var(--border-dark)', borderRadius: '16px', boxShadow: '4px 4px 0px var(--border-dark)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>&gt; INGRESO DE NUEVO EXPEDIENTE / BORRADOR</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Título del Proyecto (ej: Luminarias Bº Ceferino)" 
              className="input-hardware" 
              value={nuevoExpediente.titulo} 
              onChange={e => setNuevoExpediente({...nuevoExpediente, titulo: e.target.value})} 
              required 
            />
            <select 
              className="input-hardware" 
              value={nuevoExpediente.tipo} 
              onChange={e => setNuevoExpediente({...nuevoExpediente, tipo: e.target.value})}
            >
              <option value="Ordenanza">📜 Ordenanza</option>
              <option value="Resolución">📄 Resolución</option>
              <option value="Pedido de Informe">🔍 Pedido de Informe</option>
              <option value="Minuta de Comunicación">💬 Minuta de Comunicación</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <select 
              className="input-hardware" 
              value={nuevoExpediente.comision} 
              onChange={e => setNuevoExpediente({...nuevoExpediente, comision: e.target.value})}
            >
              <option value="Obras Públicas">🏗️ Obras Públicas</option>
              <option value="Hacienda y Presupuesto">💰 Hacienda y Presupuesto</option>
              <option value="Acción Social">👥 Acción Social</option>
              <option value="Legislación y Asuntos Constitucionales">⚖️ Legislación</option>
            </select>

            <select 
              className="input-hardware" 
              value={nuevoExpediente.estado} 
              onChange={e => setNuevoExpediente({...nuevoExpediente, estado: e.target.value})}
            >
              <option value="Borrador / Redacción">📝 Borrador / Redacción</option>
              <option value="En Comisión">🏛️ En Comisión</option>
              <option value="Próxima Sesión">🚀 Próxima Sesión</option>
              <option value="Aprobados">✅ Aprobados</option>
            </select>

            <input 
              type="text" 
              placeholder="Responsable (ej: Asesor Técnico)" 
              className="input-hardware" 
              value={nuevoExpediente.responsable} 
              onChange={e => setNuevoExpediente({...nuevoExpediente, responsable: e.target.value})} 
            />
          </div>

          {/* Campo para Cargar Archivo Word o PDF */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: '12px', border: '2px dashed var(--border-dark)' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📎 ADJUNTAR ARCHIVO WORD O PDF (Borrador / Proyecto Oficial):
            </label>
            <input 
              type="file" 
              accept=".doc,.docx,.pdf"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setArchivoFile(e.target.files[0]);
                }
              }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            />
            {archivoFile && (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                ✓ Archivo seleccionado: {archivoFile.name} ({(archivoFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
            <button type="button" className="btn-mechanical" onClick={() => setMostrarForm(false)} disabled={subiendoArchivo}>CANCELAR</button>
            <button type="submit" className="btn-mechanical btn-lime" disabled={subiendoArchivo}>
              {subiendoArchivo ? '⏳ SUBIENDO ARCHIVO...' : 'GUARDAR EN SUPABASE'}
            </button>
          </div>
        </form>
      )}

      {/* Tablero Kanban (Columnas) */}
      <div className="kanban-columns-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '20px', 
        height: 'calc(100vh - 280px)', 
        minHeight: '500px',
        paddingBottom: '12px' 
      }}>
        {columnas.map((col) => {
          const expsColumna = expedientes.filter(exp => {
            if (exp.estado !== col.id) return false;
            if (!busqueda) return true;
            const term = busqueda.toLowerCase();
            return (exp.numero?.toLowerCase().includes(term) ||
                    exp.titulo?.toLowerCase().includes(term) ||
                    exp.comision?.toLowerCase().includes(term) ||
                    exp.responsable?.toLowerCase().includes(term) ||
                    exp.iniciador?.toLowerCase().includes(term));
          });

          return (
            <div key={col.id} style={{ 
              background: 'var(--bg-surface)', 
              borderRadius: '16px', 
              border: '2px solid var(--border-dark)', 
              boxShadow: '4px 4px 0px var(--border-dark)', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden' 
            }}>
              
              {/* Encabezado Columna */}
              <div style={{ padding: '16px 18px', borderBottom: '2px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {col.titulo}
                </h3>
                <span style={{ background: col.color, border: '2px solid var(--border-dark)', padding: '2px 8px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: '#171717', boxShadow: '2px 2px 0px var(--border-dark)' }}>
                  {expsColumna.length}
                </span>
              </div>

              {/* Lista de Tarjetas (Con Scroll Independiente Estricto) */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flexGrow: 1, height: '0px' }}>
                {expsColumna.length === 0 ? (
                  <div style={{ padding: '36px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)', fontSize: '0.85rem', fontWeight: '700' }}>
                    [ VACÍO ]
                  </div>
                ) : (
                  expsColumna.map((exp) => (
                    expedienteEditando === exp.id ? (
                      <form 
                        key={`edit-${exp.id}`}
                        onSubmit={guardarEdicionExp}
                        style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '2px solid var(--accent-cyan)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '2px 2px 0px var(--accent-cyan)' }}
                      >
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                          [ EDITANDO EXP: {exp.numero || exp.id} ]
                        </div>
                        <input 
                          type="text" 
                          placeholder="Título" 
                          className="input-hardware" 
                          style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                          value={datosEdicionExp.titulo} 
                          onChange={e => setDatosEdicionExp({...datosEdicionExp, titulo: e.target.value})} 
                          required 
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <select 
                            className="input-hardware" 
                            style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                            value={datosEdicionExp.tipo} 
                            onChange={e => setDatosEdicionExp({...datosEdicionExp, tipo: e.target.value})}
                          >
                            <option value="Ordenanza">📜 Ordenanza</option>
                            <option value="Resolución">📄 Resolución</option>
                            <option value="Pedido de Informe">🔍 Pedido de Informe</option>
                            <option value="Minuta de Comunicación">💬 Minuta de Comunicación</option>
                          </select>
                          <select 
                            className="input-hardware" 
                            style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                            value={datosEdicionExp.comision} 
                            onChange={e => setDatosEdicionExp({...datosEdicionExp, comision: e.target.value})}
                          >
                            <option value="Obras Públicas">🏗️ Obras Públicas</option>
                            <option value="Hacienda y Presupuesto">💰 Hacienda y Presupuesto</option>
                            <option value="Acción Social">👥 Acción Social</option>
                            <option value="Legislación y Asuntos Constitucionales">⚖️ Legislación</option>
                          </select>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Responsable" 
                          className="input-hardware" 
                          style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                          value={datosEdicionExp.responsable} 
                          onChange={e => setDatosEdicionExp({...datosEdicionExp, responsable: e.target.value})} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-surface)', padding: '8px', borderRadius: '8px', border: '1px dashed var(--accent-cyan)' }}>
                          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {datosEdicionExp.archivoNombre ? `📄 Reemplazar: ${datosEdicionExp.archivoNombre}` : '📎 Adjuntar Archivo Word/PDF:'}
                          </label>
                          <input 
                            type="file" 
                            accept=".doc,.docx,.pdf"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                setArchivoEdicionFile(e.target.files[0]);
                              }
                            }}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                            disabled={subiendoArchivo}
                          />
                          {archivoEdicionFile && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-orange)', fontWeight: '800' }}>
                              ✓ Reemplazo: {archivoEdicionFile.name} ({(archivoEdicionFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button type="button" className="btn-mechanical" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setExpedienteEditando(null)} disabled={subiendoArchivo}>
                            <X size={14} />
                          </button>
                          <button type="submit" className="btn-mechanical btn-lime" style={{ padding: '4px 8px', fontSize: '0.75rem' }} disabled={subiendoArchivo}>
                            {subiendoArchivo ? '⏳ Subiendo...' : <><Check size={14} /> GUARDAR</>}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div 
                        key={exp.id} 
                        className="animate-fade-in" 
                        style={{ 
                          padding: '12px 14px', 
                          background: 'var(--bg-card)', 
                          border: '2px solid var(--border-dark)', 
                          borderRadius: '10px',
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '8px',
                          boxShadow: '2px 2px 0px var(--border-dark)',
                          transition: 'all 0.1s'
                        }}
                      >
                        {/* Encabezado: Tipo y Fecha */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '800', background: 'var(--bg-surface)', border: '1px solid var(--border-dark)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-main)', boxShadow: '1px 1px 0px var(--border-dark)' }}>
                              {exp.tipo || 'Ordenanza'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: '700', textAlign: 'right', flex: '1 1 auto', minWidth: '120px' }}>
                              {exp.ultimoMovimiento || exp.fecha || 'Hoy'}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                            {exp.titulo}
                          </h4>
                        </div>

                        {/* Comisión y Responsable */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(150,150,150,0.15)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-subtle)', fontWeight: '700' }}>COMISIÓN:</span> <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{exp.comision || 'Obras Públicas'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-subtle)', fontWeight: '700' }}>ENCARGADO:</span> <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{exp.responsable || exp.iniciador || 'Asesor Técnico'}</span>
                          </div>
                        </div>

                        {/* Sección Inferior: Archivo y Acciones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '2px solid rgba(150,150,150,0.15)', paddingTop: '10px', marginTop: '2px' }}>
                          {/* Archivo Adjunto */}
                          <button 
                            type="button"
                            onClick={() => setArchivoSeleccionado(exp)}
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: '800', cursor: 'pointer', width: '100%', justifyContent: 'flex-start', boxShadow: '1px 1px 0px var(--border-dark)' }}
                            title="Ver y Descargar Documento Adjunto"
                          >
                            <FileCode size={16} style={{ flexShrink: 0 }} /> 
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {exp.archivo || 'Proyecto_Oficial.pdf'}
                            </span>
                          </button>

                          {esAdmin && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              {/* Editar y Borrar */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button 
                                  type="button" 
                                  onClick={() => iniciarEdicionExp(exp)}
                                  className="btn-mini-mech edit"
                                  title="Editar expediente"
                                >
                                  <Edit size={12} /> EDITAR
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => eliminarExpediente(exp.id)}
                                  className="btn-mini-mech delete"
                                  title="Eliminar expediente"
                                  style={{ padding: '6px 10px' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {/* Controles para mover tarjeta */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {col.id !== 'Borrador / Redacción' && (
                                  <button 
                                    type="button"
                                    onClick={() => moverExpediente(exp.id, col.id === 'En Comisión' ? 'Borrador / Redacción' : col.id === 'Próxima Sesión' ? 'En Comisión' : 'Próxima Sesión')}
                                    style={{ background: 'var(--bg-card)', border: '2px solid var(--border-dark)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', boxShadow: '1px 1px 0px var(--border-dark)' }}
                                    title="Mover a etapa anterior"
                                  >
                                    ◀
                                  </button>
                                )}
                                {col.id !== 'Aprobados' && (
                                  <button 
                                    type="button"
                                    onClick={() => moverExpediente(exp.id, col.id === 'Borrador / Redacción' ? 'En Comisión' : col.id === 'En Comisión' ? 'Próxima Sesión' : 'Aprobados')}
                                    style={{ background: 'var(--accent-lime)', border: '2px solid var(--border-dark)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', boxShadow: '1px 1px 0px var(--border-dark)' }}
                                    title="Mover a siguiente etapa"
                                  >
                                    ▶
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL VISOR DE ARCHIVOS Y GESTOR DE DESCARGAS (RENDERIZADO EN PORTAL) */}
      {archivoSeleccionado && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '24px',
          overflowY: 'auto'
        }}>
          <div className="hardware-unit animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '3px solid var(--border-dark)',
            borderRadius: '20px',
            boxShadow: '12px 12px 0px var(--border-dark)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            margin: 'auto'
          }}>
            {/* Header del Visor */}
            <div className="no-print" style={{
              background: 'var(--border-dark)',
              color: 'var(--border-light)',
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '3px solid var(--border-dark)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileCode size={24} color="var(--accent-orange)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                    VISOR DE ARCHIVOS // HCD SAN MARTÍN
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                    SISTEMA DE REVISIÓN Y DESCARGA OFICIAL (SUPABASE)
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setArchivoSeleccionado(null)}
                style={{
                  background: 'var(--accent-red)',
                  border: '2px solid var(--border-light)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px var(--border-light)'
                }}
              >
                [ X ] CERRAR
              </button>
            </div>

            {/* Metadatos del Archivo */}
            <div className="no-print" style={{ padding: '24px 28px', background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-dark)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-subtle)', fontWeight: '700', display: 'block' }}>NOMBRE DEL ARCHIVO:</span>
                <strong style={{ color: 'var(--accent-orange)', fontSize: '0.95rem' }}>{archivoSeleccionado.archivo || 'Proyecto_Oficial.pdf'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)', fontWeight: '700', display: 'block' }}>EXPEDIENTE VINCULADO:</span>
                <strong style={{ color: 'var(--text-main)' }}>{archivoSeleccionado.titulo || 'Sin Título'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)', fontWeight: '700', display: 'block' }}>COMISIÓN / ESTADO:</span>
                <strong style={{ color: 'var(--text-main)' }}>{archivoSeleccionado.comision || 'Obras Públicas'} ({archivoSeleccionado.estado || 'Borrador / Redacción'})</strong>
              </div>
            </div>

            {/* Vista Previa del Documento */}
            <div style={{ padding: '28px', overflowY: 'auto', flexGrow: 1, background: 'var(--bg-base)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {archivoSeleccionado.archivo_contenido && 
               archivoSeleccionado.archivo_contenido.startsWith('http') && 
               archivoSeleccionado.archivo_contenido.toLowerCase().endsWith('.pdf') ? (
                <div style={{ width: '100%', height: '550px', background: '#ffffff', border: '1px solid #cccccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                  <iframe 
                    src={`${archivoSeleccionado.archivo_contenido}#toolbar=1`}
                    title="Visor PDF de Supabase Storage"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                </div>
              ) : archivoSeleccionado.archivo_contenido && 
                archivoSeleccionado.archivo_contenido.startsWith('http') && 
                (archivoSeleccionado.archivo_contenido.toLowerCase().endsWith('.docx') || archivoSeleccionado.archivo_contenido.toLowerCase().endsWith('.doc')) ? (
                <div style={{
                  background: '#ffffff',
                  padding: '40px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  width: '100%',
                  maxWidth: '550px',
                  textAlign: 'center',
                  border: '1px solid #cccccc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <FileText size={36} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>DOCUMENTO WORD ADJUNTO</h4>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{archivoSeleccionado.archivo}</p>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', lineHeight: 1.5, margin: 0 }}>
                    La previsualización interactiva directa en pantalla no está disponible para archivos Word. Puede descargarlo y abrirlo en su computadora para revisarlo y editarlo.
                  </p>
                  <a 
                    href={archivoSeleccionado.archivo_contenido} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-mechanical btn-lime"
                    style={{ padding: '12px 24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
                  >
                    📥 DESCARGAR DOCUMENTO WORD
                  </a>
                </div>
              ) : (
                <div id="documento-papel-oficial" style={{
                  background: 'var(--bg-card)',
                  padding: '40px 48px',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  width: '100%',
                  maxWidth: '620px',
                  minHeight: '400px',
                  fontFamily: 'serif',
                  color: 'var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  border: '1px solid var(--border-dark)'
                }}>
                  {/* Membrete HCD */}
                  <div style={{ borderBottom: '2px solid var(--border-dark)', paddingBottom: '16px', textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: '800', letterSpacing: '0.05em' }}>HONORABLE CONCEJO DELIBERANTE</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MUNICIPALIDAD DE Gral. SAN MARTÍN - MENDOZA</p>
                  </div>

                  {/* Contenido del Borrador */}
                  <div>
                    <h3 style={{ textAlign: 'center', fontSize: '1.3rem', textDecoration: 'underline', marginBottom: '24px' }}>
                      PROYECTO DE {(archivoSeleccionado.tipo || 'Ordenanza').toUpperCase()}
                    </h3>
                    
                    <p style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '16px' }}>
                      <strong>VISTO:</strong> Las necesidades de los vecinos del departamento de Gral. San Martín en relación a la solicitud de <em>"{archivoSeleccionado.titulo || 'Sin Título'}"</em> tramitada bajo la órbita de la <strong>{archivoSeleccionado.comision || 'Obras Públicas'}</strong>, y;
                    </p>

                    <p style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '16px' }}>
                      <strong>CONSIDERANDO:</strong> Que es deber de este Honorable Cuerpo legislar para garantizar el bienestar, la seguridad y el desarrollo de la comunidad, atendiendo los reclamos ingresados por los asesores técnicos y concejales en el presente periodo legislativo.
                    </p>

                    <p style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '24px' }}>
                      <strong>POR ELLO:</strong> El Honorable Concejo Deliberante de Gral. San Martín sanciona con fuerza de:
                    </p>

                    <h4 style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '16px' }}>{(archivoSeleccionado.tipo || 'Ordenanza').toUpperCase()}</h4>

                    <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
                      <strong>ARTÍCULO 1º.-</strong> Apruébase en todos sus términos la solicitud y ejecución de las obras/acciones correspondientes al expediente <em>"{archivoSeleccionado.titulo || 'Sin Título'}"</em>.
                    </p>

                    <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
                      <strong>ARTÍCULO 2º.-</strong> Gírese copia al Departamento Ejecutivo Municipal para su toma de razón, asignación presupuestaria y posterior ejecución a través de las áreas correspondientes.
                    </p>

                    <p style={{ lineHeight: 1.6 }}>
                      <strong>ARTÍCULO 3º.-</strong> Comuníquese, publíquese y archívese.
                    </p>
                  </div>

                  {/* Firma */}
                  <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ textAlign: 'center', borderTop: '1px dashed var(--border-dark)', paddingTop: '8px', width: '200px' }}>
                      {archivoSeleccionado.responsable || archivoSeleccionado.iniciador || 'Asesor Técnico'}<br />
                      HCD San Martín
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Panel de Botones de Descarga y Acciones Reales */}
            <div className="no-print" style={{
              padding: '20px 28px',
              background: 'var(--bg-card)',
              borderTop: '3px solid var(--border-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {archivoSeleccionado.archivo_contenido && archivoSeleccionado.archivo_contenido.startsWith('http') ? (
                  <a
                    href={archivoSeleccionado.archivo_contenido}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-mechanical btn-lime"
                    style={{ padding: '14px 24px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                  >
                    📥 DESCARGAR ARCHIVO DE STORAGE
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (archivoSeleccionado.archivo_contenido && archivoSeleccionado.archivo_contenido.startsWith('data:')) {
                        // Descargar el archivo original exacto cargado en base64
                        const a = document.createElement('a');
                        a.href = archivoSeleccionado.archivo_contenido;
                        a.download = archivoSeleccionado.archivo;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else {
                        // Descargar el archivo generado de previsualización
                        const textoContenido = `HONORABLE CONCEJO DELIBERANTE DE SAN MARTÍN\nEXPEDIENTE: ${archivoSeleccionado.titulo || ''}\nTIPO: ${archivoSeleccionado.tipo || 'Ordenanza'}\nCOMISIÓN: ${archivoSeleccionado.comision || ''}\nRESPONSABLE: ${archivoSeleccionado.responsable || archivoSeleccionado.iniciador || ''}\n\nPROYECTO DE ${(archivoSeleccionado.tipo || 'Ordenanza').toUpperCase()}\n\nVISTO: Las necesidades de los vecinos en relación a "${archivoSeleccionado.titulo || ''}"...\n\nARTÍCULO 1º.- Apruébase en todos sus términos la solicitud...\nARTÍCULO 2º.- Gírese copia al Ejecutivo Municipal...\nARTÍCULO 3º.- Comuníquese, publíquese y archívese.`;
                        const blob = new Blob([textoContenido], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = archivoSeleccionado.archivo || 'Proyecto_Oficial.pdf';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="btn-mechanical btn-lime"
                    style={{ padding: '14px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    📥 DESCARGAR ARCHIVO GENERADO (.TXT)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const textoContenido = `HONORABLE CONCEJO DELIBERANTE DE SAN MARTÍN\nEXPEDIENTE: ${archivoSeleccionado.titulo || ''}\nTIPO: ${archivoSeleccionado.tipo || 'Ordenanza'}\nCOMISIÓN: ${archivoSeleccionado.comision || ''}\nRESPONSABLE: ${archivoSeleccionado.responsable || archivoSeleccionado.iniciador || ''}\n\nPROYECTO DE ${(archivoSeleccionado.tipo || 'Ordenanza').toUpperCase()}\n\nVISTO: Las necesidades de los vecinos en relación a "${archivoSeleccionado.titulo || ''}"...\n\nARTÍCULO 1º.- Apruébase en todos sus términos la solicitud...\nARTÍCULO 2º.- Gírese copia al Ejecutivo Municipal...\nARTÍCULO 3º.- Comuníquese, publíquese y archívese.`;
                    navigator.clipboard.writeText(textoContenido);
                    alert('¡Texto completo del proyecto copiado al portapapeles!');
                  }}
                  className="btn-mechanical btn-cyan"
                  style={{ padding: '14px 20px', fontSize: '0.9rem' }}
                >
                  📋 COPIAR TEXTO
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn-mechanical btn-orange"
                style={{ padding: '14px 20px', fontSize: '0.9rem' }}
              >
                🖨️ IMPRIMIR / EXPORTAR PDF
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
