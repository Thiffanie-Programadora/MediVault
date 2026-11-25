import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthView from './views/AuthView';
import NotesView from './views/NotesView';
import AdminView from './views/AdminView';
import ProfileView from './views/ProfileView';
import CryptoHealthView from './views/CryptoHealthView';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('notes');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = api.getCurrentUser();
      const token = api.getToken();
      if (savedUser && token) {
        setUser(savedUser);
        api.getProfile()
          .then((res) => {
            if (res?.profile || res?.data) {
              setUser((prev) => ({ ...prev, ...(res.profile || res.data) }));
            }
          })
          .catch(() => {
            api.logout();
            setUser(null);
          })
          .finally(() => {
            setInitialLoading(false);
          });
      } else {
        setInitialLoading(false);
      }
    } catch {
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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', color: '#253852', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #CBD5E1', borderTopColor: '#253852', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.25rem' }} />
          <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>Cargando MediVault Secure Health...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth View
  if (!user) {
    return <AuthView onLoginSuccess={handleLogin} onAuthSuccess={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="main-layout">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          userRole={user.role}
        />
        <main className="content-area">
          {currentView === 'notes' && <NotesView user={user} />}
          {currentView === 'profile' && <ProfileView user={user} onUpdateUser={setUser} />}
          {currentView === 'admin' && <AdminView user={user} />}
          {currentView === 'crypto' && <CryptoHealthView user={user} />}
        </main>
      </div>
    </div>
  );
}
