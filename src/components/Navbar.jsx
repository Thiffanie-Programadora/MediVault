import React from 'react';
import { IconShield, IconLogout, IconLock } from './Icons';

export function Navbar({ user, onLogout }) {
  const roleClasses = {
    admin: 'badge-admin',
    colaborador: 'badge-colaborador',
    cliente: 'badge-cliente',
    auditor: 'badge-auditor'
  };

  const roleLabels = {
    admin: 'Administrador',
    colaborador: 'Médico Especialista',
    cliente: 'Paciente / Cliente',
    auditor: 'Oficial de Auditoría'
  };

  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <img src="/mediV.jpg" alt="MediVault Escudo con libreta y cruz" className="brand-logo-img" />
        <div>
          <div className="brand-name">
            MediVault
          </div>
          <span style={{ fontSize: '0.72rem', color: '#5A7B8C', display: 'block', marginTop: '-2px' }}>
            Bóveda de Expedientes Clínicos
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div className="badge-crypto" title="Bóveda de salud con máxima protección y confidencialidad">
          <IconLock size={14} />
          <span>Bóveda Protegida</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                {user.fullName || user.name}
              </div>
              <span className={`badge ${roleClasses[user.role] || 'badge-cliente'}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626' }}
              title="Cerrar sesión de forma segura"
            >
              <IconLogout size={16} />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
