import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthView from './views/AuthView';
import NotesView from './views/NotesView';
import AiAgentsView from './views/AiAgentsView';
import ExternalApisView from './views/ExternalApisView';
import AdminView from './views/AdminView';
import ProfileView from './views/ProfileView';
import GovernanceView from './views/GovernanceView';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('notes');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      // Verify token with backend
      api.getProfile()
        .then((res) => {
          if (res?.data) {
            setUser({ ...savedUser, ...res.data });
          }
        })
        .catch(() => {
          // Token expired or invalid
          api.logout();
          setUser(null);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    } else {
      setInitialLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('notes');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentView('notes');
  };

  if (initialLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-navy-dark)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>Cargando MediVault Secure Health...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth View
  if (!user) {
    return <AuthView onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="main-wrapper">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          userRole={user.role}
        />
        <main className="content-area">
          {currentView === 'notes' && <NotesView user={user} />}
          {currentView === 'ai-agents' && <AiAgentsView user={user} />}
          {currentView === 'apis' && <ExternalApisView user={user} />}
          {currentView === 'admin' && <AdminView user={user} />}
          {currentView === 'profile' && <ProfileView user={user} onUpdateUser={setUser} />}
          {currentView === 'governance' && <GovernanceView user={user} />}
        </main>
      </div>
    </div>
  );
}
