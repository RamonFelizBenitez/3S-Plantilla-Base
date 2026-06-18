import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';
import { showToast } from '../utils/alerts';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.details || data.message || 'Credenciales inválidas');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.fullName);
      
      if (data.empresas && data.empresas.length > 0) {
        localStorage.setItem('empresas', JSON.stringify(data.empresas));
        localStorage.setItem('empresaId', data.empresas[0].EmpresaID);
      } else {
        localStorage.setItem('empresaId', '1');
      }

      navigate('/dashboard');
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#f0f4f8' }}>
      
      {/* Panel Izquierdo - Decorativo */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Patrón Decorativo de Fondo */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          
          {/* Logo Tipográfico 3S - Lado Oscuro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <span style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '0.8', color: '#ffffff', letterSpacing: '-2px' }}>
              3S
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '2px solid rgba(255,255,255,0.3)', paddingLeft: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '1px', color: '#ffffff', lineHeight: '1.2' }}>SYSTEM</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '1px', color: '#ffffff', lineHeight: '1.2' }}>SHOP</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '1px', color: '#ffffff', lineHeight: '1.2' }}>SOLUTIONS</span>
            </div>
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Sistema de Gestión Integral
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#93c5fd', lineHeight: 1.6 }}>
            Plataforma centralizada para la administración y control de recursos empresariales. Optimiza tus procesos con eficiencia y seguridad.
          </p>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div style={{ 
        width: '500px', 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.05)'
      }}>
        
        {/* Contenedor Principal Centrado */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 4rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            
            {/* Logo Tipográfico 3S - Lado Claro */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '12px 24px', backgroundColor: '#eff6ff', borderRadius: '16px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '0.8', color: '#1e3a8a', letterSpacing: '-1px' }}>
                3S
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '2px solid #93c5fd', paddingLeft: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.5px', color: '#1e3a8a', lineHeight: '1.2' }}>SYSTEM</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.5px', color: '#1e3a8a', lineHeight: '1.2' }}>SHOP</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.5px', color: '#1e3a8a', lineHeight: '1.2' }}>SOLUTIONS</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Bienvenido de nuevo</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Usuario</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="admin"
                  required
                  style={{ 
                    width: '100%', padding: '12px 14px 12px 42px', 
                    border: '1px solid #e2e8f0', borderRadius: '8px', 
                    fontSize: '0.95rem', color: '#0f172a', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ 
                    width: '100%', padding: '12px 14px 12px 42px', 
                    border: '1px solid #e2e8f0', borderRadius: '8px', 
                    fontSize: '0.95rem', color: '#0f172a', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              {loading ? 'Validando credenciales...' : (
                <>Iniciar Sesión <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer del Login */}
        <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontWeight: '500' }}>
            System Shop Solutions 3S © {new Date().getFullYear()}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
            Versión 1.0.0
          </p>
        </div>

      </div>

      {/* Media Queries (Inyectados dinámicamente) */}
      <style>{`
        @media (max-width: 900px) {
          .login-container > div:first-child { display: none !important; }
          .login-container > div:last-child { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
