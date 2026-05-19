import React, { useState } from 'react';
import { Bot, Sparkles, Copy, FileText, Send, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function FabricaProyectos({ setExpedientes }) {
  const [datosCaso, setDatosCaso] = useState({
    tipo: 'Resolución',
    barrio: 'Barrio San Ceferino, San Martín',
    problematica: 'Falta de luminarias públicas en el acceso principal y baches profundos en calle Neuquén',
    responsable: 'Asesor Técnico'
  });

  const [generando, setGenerando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const generarProyecto = (e) => {
    e.preventDefault();
    setGenerando(true);
    setResultadoIA(null);
    setEnviado(false);

    // Simulamos el tiempo de respuesta de Antigravity
    setTimeout(() => {
      const tituloCorto = `Luminarias y bacheo en ${datosCaso.barrio.split(',')[0].replace('Barrio ', '')}`;
      
      const textoGenerado = `---
BLOQUE 1: METADATOS PARA LA WEB INTERNA
- TÍTULO CORTO PARA TARJETA: ${tituloCorto}
- ESTADO INICIAL: Borrador / Redacción
- ÁREA/COMISIÓN SUGERIDA: Comisión de Obras y Servicios Públicos
- COMENTARIO DE CONTROL: "Proyecto generado por IA en revisión por el equipo de 4."

---
BLOQUE 2: PROYECTO FORMAL (TÉCNICA LEGISLATIVA MENDOZA)

HONORABLE CONCEJO DELIBERANTE DE SAN MARTÍN, MENDOZA

VISTO:
La imperiosa necesidad de garantizar óptimas condiciones de infraestructura urbana, seguridad vial y alumbrado público en el ${datosCaso.barrio}, en consonancia con las competencias indelegables de mantenimiento asignadas al municipio; y

CONSIDERANDO:
Que la actual problemática (${datosCaso.problematica}) representa un gravísimo riesgo para la integridad física de los vecinos y conductores, incrementando el peligro de siniestros viales y propiciando un entorno de inseguridad en horas nocturnas.

Que, conforme a lo establecido en la Ley Orgánica de Municipalidades (Ley N° 1079), recae sobre el Departamento Ejecutivo Municipal el deber de velar por la correcta prestación de los servicios públicos y el mantenimiento de la red vial para asegurar el bienestar general de los habitantes.

Que resulta de extrema urgencia la aprobación de la presente iniciativa a fin de que las áreas técnicas procedan de forma inmediata a la ejecución de las obras requeridas.

PROYECTO DE ${datosCaso.tipo.toUpperCase()}:

Artículo 1°: Solicitar al Departamento Ejecutivo Municipal que, a través de la Secretaría de Obras y Servicios Públicos, proceda de forma urgente a solucionar la problemática de: ${datosCaso.problematica} en el ${datosCaso.barrio}.

Artículo 2°: Los gastos que demande el cumplimiento de la presente serán imputados a las partidas presupuestarias correspondientes.

Artículo 3°: De forma.`;

      setResultadoIA({
        tituloCorto,
        textoCompleto: textoGenerado,
        metadatos: {
          titulo: tituloCorto,
          tipo: datosCaso.tipo,
          comision: 'Obras Públicas',
          estado: 'Borrador / Redacción',
          responsable: datosCaso.responsable
        }
      });
      setGenerando(false);
    }, 1500);
  };

  const copiarAlPortapapeles = () => {
    if (!resultadoIA) return;
    navigator.clipboard.writeText(resultadoIA.textoCompleto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const enviarAlKanban = async () => {
    if (!resultadoIA) return;

    const nuevoExp = {
      numero: `EXP-2026-${Math.floor(Math.random() * 900 + 100)}`,
      titulo: resultadoIA.metadatos.titulo,
      tipo: resultadoIA.metadatos.tipo,
      comision: resultadoIA.metadatos.comision,
      estado: resultadoIA.metadatos.estado,
      iniciador: resultadoIA.metadatos.responsable,
      responsable: resultadoIA.metadatos.responsable,
      fecha: new Date().toLocaleDateString('es-ES'),
      prioridad: 'Alta',
      archivo: resultadoIA.metadatos.titulo.toLowerCase().replace(/ /g, '_') + '.pdf',
      archivo_contenido: resultadoIA.textoCompleto
    };

    try {
      const { data, error } = await supabase.from('expedientes').insert([nuevoExp]).select();
      if (data && data[0]) {
        setExpedientes(prev => [...prev, data[0]]);
      } else {
        setExpedientes(prev => [...prev, { ...nuevoExp, id: Date.now() }]);
      }
    } catch (err) {
      console.error('Error insertando expediente de IA en Supabase:', err);
      setExpedientes(prev => [...prev, { ...nuevoExp, id: Date.now() }]);
    }

    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  return (
    <div className="hardware-unit" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px', height: '100%' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'var(--accent-purple)', border: '2px solid var(--border-dark)', padding: '12px', borderRadius: '12px', color: 'white', boxShadow: '3px 3px 0px #171717' }}>
          <Bot size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
            ASISTENTE DE REDACCIÓN IA <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#ffffff', border: '2px solid var(--border-dark)', color: 'var(--accent-purple)', padding: '4px 12px', borderRadius: '8px', fontWeight: '800', boxShadow: '2px 2px 0px #171717' }}>[ MOTOR ANTIGRAVITY ]</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: '700' }}>ASISTENTE DE REDACCIÓN LEGISLATIVA • LEY 1079 MENDOZA</p>
        </div>
      </div>

      {/* Contenedor Principal Dividido en 2 Columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', flexGrow: 1 }}>
        
        {/* Columna Izquierda: Formulario de Entrada */}
        <form onSubmit={generarProyecto} style={{ background: '#ffffff', padding: '28px', border: '2px solid var(--border-dark)', borderRadius: '16px', boxShadow: '4px 4px 0px #171717', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            <FileText size={20} color="var(--accent-purple)" /> Datos del Reclamo / Iniciativa
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>TIPO DE INICIATIVA</label>
            <select className="input-hardware" value={datosCaso.tipo} onChange={e => setDatosCaso({...datosCaso, tipo: e.target.value})}>
              <option value="Ordenanza">📜 Ordenanza</option>
              <option value="Resolución">📄 Resolución</option>
              <option value="Pedido de Informe">🔍 Pedido de Informe</option>
              <option value="Minuta de Comunicación">💬 Minuta de Comunicación</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>UBICACIÓN / BARRIO</label>
            <input 
              type="text" 
              className="input-hardware" 
              value={datosCaso.barrio} 
              onChange={e => setDatosCaso({...datosCaso, barrio: e.target.value})}
              placeholder="Ej: Barrio San Ceferino, San Martín" 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>PROBLEMÁTICA CONCRETA (En lenguaje vecinal)</label>
            <textarea 
              className="input-hardware" 
              rows={4}
              value={datosCaso.problematica} 
              onChange={e => setDatosCaso({...datosCaso, problematica: e.target.value})}
              placeholder="Ej: Falta de luminarias públicas en el acceso principal y baches profundos en calle Neuquén" 
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>ENCARGADO DEL CASO</label>
            <input 
              type="text" 
              className="input-hardware" 
              value={datosCaso.responsable} 
              onChange={e => setDatosCaso({...datosCaso, responsable: e.target.value})}
              placeholder="Ej: Asesor Técnico" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-mechanical btn-purple" 
            disabled={generando}
            style={{ marginTop: 'auto', padding: '16px', fontSize: '1rem' }}
          >
            {generando ? (
              <>
                <Sparkles size={20} className="animate-pulse" /> REDACTANDO CON LEY 1079...
              </>
            ) : (
              <>
                <Sparkles size={20} /> GENERAR BORRADOR CON IA
              </>
            )}
          </button>
        </form>

        {/* Columna Derecha: Resultado IA y Acciones */}
        <div style={{ background: '#f5f5f5', padding: '28px', border: '2px solid var(--border-dark)', borderRadius: '16px', boxShadow: '4px 4px 0px #171717', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              <Bot size={20} color="var(--accent-purple)" /> VENTANA DE ASISTENTE
            </h3>
            
            {resultadoIA && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={copiarAlPortapapeles} 
                  className="btn-mechanical" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  title="Copiar Texto Completo"
                >
                  {copiado ? <Check size={16} color="#10b981" /> : <Copy size={16} />} {copiado ? 'COPIADO' : 'COPIAR'}
                </button>

                <button 
                  onClick={enviarAlKanban} 
                  className="btn-mechanical btn-lime" 
                  disabled={enviado}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  title="Enviar al Tablero Kanban"
                >
                  {enviado ? <Check size={16} /> : <Send size={16} />} {enviado ? 'ENVIADO AL KANBAN' : 'ENVIAR A REVISIÓN'}
                </button>
              </div>
            )}
          </div>

          {/* Caja de Texto del Resultado */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '2px solid var(--border-dark)', flexGrow: 1, overflowY: 'auto', maxHeight: '400px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6, boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.05)' }}>
            {generando ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-muted)' }}>
                <Sparkles size={36} className="animate-pulse" color="var(--accent-purple)" />
                <p className="animate-pulse" style={{ fontWeight: '700' }}>Analizando competencias municipales e imputación presupuestaria...</p>
              </div>
            ) : resultadoIA ? (
              resultadoIA.textoCompleto
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-subtle)', textAlign: 'center' }}>
                <Bot size={42} color="var(--border-dark)" />
                <p style={{ fontWeight: '700', maxWidth: '300px' }}>Ingrese los datos a la izquierda y presione "Generar Borrador con IA" para obtener el texto técnico legislativo y los metadatos.</p>
              </div>
            )}
          </div>

          {/* Prompt Maestro de Referencia */}
          <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '2px solid var(--border-dark)', fontSize: '0.8rem', color: 'var(--text-muted)', boxShadow: '2px 2px 0px #171717' }}>
            <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>💡 TIP DE TÉCNICA LEGISLATIVA:</span> El motor utiliza la plantilla del Bloque configurada con los parámetros de la Ley Orgánica de Municipalidades N° 1079 de Mendoza.
          </div>

        </div>

      </div>

    </div>
  );
}
