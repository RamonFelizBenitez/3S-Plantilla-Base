import React, { useState, useEffect, useContext } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../i18n/LanguageContext';
import { showToast } from '../../utils/alerts';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Administrador';
  
  // Extraer empresas y empresa seleccionada
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');

  const { lang, setLang, t } = useContext(LanguageContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadEmpresas = () => {
      const savedEmpresas = JSON.parse(localStorage.getItem('empresas') || '[]');
      const savedEmpresaId = localStorage.getItem('empresaId');
      
      if (savedEmpresas.length > 0) {
        setEmpresas(savedEmpresas);
        
        // Verificar si la empresa seleccionada actual todavía existe en la lista
        const empresaExiste = savedEmpresas.find(e => e.EmpresaID.toString() === savedEmpresaId?.toString());
        
        if (!savedEmpresaId || !empresaExiste) {
          const firstEmpresaId = savedEmpresas[0].EmpresaID.toString();
          setSelectedEmpresaId(firstEmpresaId);
          localStorage.setItem('empresaId', firstEmpresaId);
        } else {
          setSelectedEmpresaId(savedEmpresaId);
        }
      } else {
        setEmpresas([]);
        setSelectedEmpresaId('');
      }
    };

    // Cargar inicial
    loadEmpresas();

    // Notificar si acabamos de cambiar de empresa (viene de un reload)
    const toastMsg = sessionStorage.getItem('toastEmpresaCambiada');
    if (toastMsg) {
      // Pequeño delay para asegurar que el DOM cargó y el toast se vea bien
      setTimeout(() => showToast(toastMsg), 300);
      sessionStorage.removeItem('toastEmpresaCambiada');
    }

    // Escuchar actualizaciones dinámicas
    window.addEventListener('empresasUpdated', loadEmpresas);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('empresasUpdated', loadEmpresas);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('empresas');
    localStorage.removeItem('empresaId');
    navigate('/login');
  };

  const handleEmpresaChange = (e) => {
    const newId = e.target.value;
    const empresaTarget = empresas.find(emp => emp.EmpresaID.toString() === newId.toString());
    const nombreEmpresa = empresaTarget ? empresaTarget.NombreEmpresa : 'otra empresa';
    
    localStorage.setItem('empresaId', newId);
    sessionStorage.setItem('toastEmpresaCambiada', `Área de trabajo cambiada a: ${nombreEmpresa}`);
    
    setSelectedEmpresaId(newId);
    // Forzar recarga de página para limpiar estados residuales y traer datos de la nueva empresa
    window.location.reload();
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

        {/* Company Switcher */}
        {empresas.length > 0 && (
          <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
            <select 
              value={selectedEmpresaId} 
              onChange={handleEmpresaChange}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {empresas.map(emp => (
                <option key={emp.EmpresaID} value={emp.EmpresaID}>{emp.NombreEmpresa}</option>
              ))}
            </select>
          </div>
        )}

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
