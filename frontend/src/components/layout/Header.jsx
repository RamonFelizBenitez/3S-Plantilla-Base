import React, { useState, useEffect, useContext } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../i18n/LanguageContext';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Administrador';
  
  const { lang, setLang, t } = useContext(LanguageContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // Basic breadcrumb logic
  const getBreadcrumb = () => {
    const path = location.pathname.substring(1);
    if (!path || path === 'dashboard') return t('menu.dashboard');
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '); // TODO: translate path names dynamically if needed
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle menu">
          <span></span><span></span><span></span>
        </button>
        <div className="breadcrumb">
          <span>RHDBW</span>
          <span className="breadcrumb-sep">&#8250;</span>
          <span id="breadcrumbCurrent">{getBreadcrumb()}</span>
        </div>
      </div>
      
      <div className="topbar-right">
        
        {/* Language Switcher */}
        <div className="lang-switcher">
          <button 
            className={`lang-btn ${lang === 'es' ? 'active' : ''}`} 
            onClick={() => setLang('es')}
          >
            ES
          </button>
          <span className="lang-divider">|</span>
          <button 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>

        {/* User Info */}
        <div className="topbar-user">
          <div className="user-avatar"><User size={16} /></div>
          <div className="user-info">
            <span className="user-name">{username}</span>
            <span className="user-role">{t('header.role')}</span>
          </div>
        </div>

        {/* Clock */}
        <div className="topbar-clock">
          {formatTime(currentTime)}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-red)', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
          <LogOut size={16} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>{t('header.logout')}</span>
        </button>

      </div>
    </header>
  );
};

export default Header;
