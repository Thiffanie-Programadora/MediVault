import React from 'react';
import {
  IconNotes,
  IconBot,
  IconExternal,
  IconAdmin,
  IconLegal,
  IconUser
} from './Icons';

export function Sidebar({ currentTab, onSelectTab, currentView, onNavigate, userRole }) {
  const active = currentView || currentTab;
  const navigate = onNavigate || onSelectTab;
  const isAdminOrAuditor = userRole === 'admin' || userRole === 'auditor';

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Módulos del Sistema
      </div>

      <button
        className={`nav-btn ${active === 'notes' ? 'active' : ''}`}
        onClick={() => navigate('notes')}
      >
        <IconNotes size={18} />
        <span>Expedientes y Notas</span>
      </button>

      <button
        className={`nav-btn ${active === 'ai-agents' ? 'active' : ''}`}
        onClick={() => navigate('ai-agents')}
      >
        <IconBot size={18} />
        <span>8 Agentes de IA</span>
      </button>

      <button
        className={`nav-btn ${active === 'external-apis' || active === 'apis' ? 'active' : ''}`}
        onClick={() => navigate('apis')}
      >
        <IconExternal size={18} />
        <span>APIs Externas</span>
      </button>

      {isAdminOrAuditor && (
        <button
          className={`nav-btn ${active === 'admin' ? 'active' : ''}`}
          onClick={() => navigate('admin')}
        >
          <IconAdmin size={18} />
          <span>Panel de Seguridad</span>
        </button>
      )}

      <button
        className={`nav-btn ${active === 'governance' ? 'active' : ''}`}
        onClick={() => navigate('governance')}
      >
        <IconLegal size={18} />
        <span>Gobernanza (Ley 8968)</span>
      </button>

      <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', paddingLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Cuenta
      </div>

      <button
        className={`nav-btn ${active === 'profile' ? 'active' : ''}`}
        onClick={() => navigate('profile')}
      >
        <IconUser size={18} />
        <span>Mi Perfil Cifrado</span>
      </button>
    </aside>
  );
}

export default Sidebar;
