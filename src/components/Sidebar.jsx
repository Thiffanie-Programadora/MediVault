import React from 'react';
import {
  IconNotes,
  IconAdmin,
  IconUser,
  IconLock
} from './Icons';

export function Sidebar({ currentTab, onSelectTab, currentView, onNavigate, userRole }) {
  const active = currentView || currentTab;
  const navigate = onNavigate || onSelectTab;
  const isAdmin = userRole === 'admin';

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Expedientes
      </div>

      <button
        className={`nav-btn ${active === 'notes' ? 'active' : ''}`}
        onClick={() => navigate('notes')}
      >
        <IconNotes size={18} />
        <span>Notas Médicas</span>
      </button>

      <button
        className={`nav-btn ${active === 'profile' ? 'active' : ''}`}
        onClick={() => navigate('profile')}
      >
        <IconUser size={18} />
        <span>Mi Perfil</span>
      </button>

      {isAdmin && (
        <>
          <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', paddingLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Administración
          </div>

          <button
            className={`nav-btn ${active === 'admin' ? 'active' : ''}`}
            onClick={() => navigate('admin')}
          >
            <IconAdmin size={18} />
            <span>Panel de Control</span>
          </button>
        </>
      )}

      <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', paddingLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Seguridad
      </div>

      <button
        className={`nav-btn ${active === 'crypto' ? 'active' : ''}`}
        onClick={() => navigate('crypto')}
      >
        <IconLock size={18} />
        <span>Seguridad y Estado</span>
      </button>
    </aside>
  );
}

export default Sidebar;
