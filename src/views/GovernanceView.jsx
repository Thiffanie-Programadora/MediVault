import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldIcon, CheckIcon, AlertTriangleIcon } from '../components/Icons';

export default function GovernanceView() {
  const [governanceData, setGovernanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGovernance();
  }, []);

  const loadGovernance = async () => {
    setLoading(true);
    try {
      const res = await api.getGovernanceInfo();
      setGovernanceData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Gobernanza de Datos y Marco Legal
        </h1>
        <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6 }}>
          Políticas de Privacidad, Términos y Condiciones con Descargo de Responsabilidad para Inteligencia Artificial,
          y cumplimiento estricto con la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley N.° 8968, Costa Rica).
        </p>
      </div>

      {/* Summary Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-cyan)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Marco Regulatorio
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginTop: '0.25rem' }}>
            Ley N.° 8968
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', marginTop: '0.2rem' }}>
            Regulado por PRODHAB
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-emerald)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Consentimiento
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-emerald)', marginTop: '0.25rem' }}>
            Expreso e Informado
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', marginTop: '0.2rem' }}>
            Auditado en Base de Datos
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-amber)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', textTransform: 'uppercase', fontWeight: 700 }}>
            Cláusula de IA
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-amber)', marginTop: '0.25rem' }}>
            Soporte No Diagnóstico
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', marginTop: '0.2rem' }}>
            Requiere Criterio Médico
          </div>
        </div>
      </div>

      {/* Section 1: Privacy Policy */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldIcon /> Política de Privacidad y Tratamiento de Datos Personales
        </h2>
        <div style={{ color: 'var(--color-navy-dark)', fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            <strong>1. Responsable del Fichero:</strong> MediVault Soluciones Clínicas S.A., con cédula jurídica 3-101-998877,
            domiciliada en San José, Costa Rica, es la entidad responsable de las bases de datos automatizadas creadas con la
            finalidad de almacenar expedientes médicos y notas confidenciales.
          </p>
          <p>
            <strong>2. Naturaleza de los Datos:</strong> Conforme al Artículo 9 de la Ley N.° 8968, los datos relativos a la salud
            son de <em>categoría especial / sensibles</em>. Su tratamiento requiere el consentimiento previo, expreso, informado
            e inequívoco del titular o de su representante legal debidamente acreditado.
          </p>
          <p>
            <strong>3. Medidas de Seguridad FIPS y OWASP:</strong> MediVault implementa cifrado simétrico autenticado
            <strong> AES-256-GCM</strong> para los datos en reposo, firmas HMAC para verificar integridad, y derivación de contraseñas
            mediante algoritmo <strong>Bcrypt (cost 12)</strong>.
          </p>
          <p>
            <strong>4. Derechos ARCO:</strong> Todo usuario tiene derecho a solicitar de forma gratuita y en cualquier momento el
            Acceso, Rectificación, Cancelación y Oposición de sus datos personales. Las solicitudes de supresión deben ser resueltas
            en un plazo legal no mayor a cinco (5) días hábiles.
          </p>
        </div>
      </div>

      {/* Section 2: Terms and AI Disclaimer */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangleIcon /> Términos de Servicio y Descargo de Responsabilidad de Inteligencia Artificial
        </h2>
        <div style={{ color: 'var(--color-navy-dark)', fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid var(--color-amber)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <strong>ADVERTENCIA LEGAL OBLIGATORIA:</strong> Los ocho (8) agentes de Inteligencia Artificial integrados en MediVault
            operan exclusivamente como herramientas informáticas de apoyo administrativo, síntesis documental y correlación de información.
            <strong> BAJO NINGUNA CIRCUNSTANCIA EMITEN UN DIAGNÓSTICO MÉDICO DEFINITIVO NI PRESCRIBEN TRATAMIENTOS.</strong> Toda decisión
            clínica debe ser tomada exclusivamente por un profesional médico debidamente incorporado al Colegio de Médicos y Cirujanos de Costa Rica.
          </div>
          <p>
            <strong>5. Registro y Trazabilidad de Agentes:</strong> Cada invocación a los agentes de IA queda registrada en la tabla
            <code>ai_agent_logs</code> del sistema, almacenando el hash SHA-256 del prompt, modelo empleado, tokens consumidos y timestamp
            para propósitos de auditoría médica forense y rendición de cuentas (Accountability).
          </p>
          <p>
            <strong>6. No Re-Entrenamiento:</strong> MediVault garantiza que la información clínica y datos confidenciales introducidos
            por los usuarios no son utilizados para el re-entrenamiento de modelos fundacionales de terceros ni comercializados bajo ninguna modalidad.
          </p>
        </div>
      </div>
    </div>
  );
}
