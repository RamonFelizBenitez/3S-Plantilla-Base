import React, { useContext } from 'react';
import { Users, FileText, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { LanguageContext } from '../i18n/LanguageContext';

const Dashboard = () => {
  const { t } = useContext(LanguageContext);
  return (
    <section className="page-section active" style={{ animation: 'none' }}>
      <div className="page-header">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <div className="page-date">
          {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><Users size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">1,245</div>
            <div className="kpi-label">{t('dashboard.kpi.active_employees')}</div>
          </div>
          <div className="kpi-trend up">+12 este mes</div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="kpi-icon"><FileText size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">42</div>
            <div className="kpi-label">{t('dashboard.kpi.pending_requests')}</div>
          </div>
          <div className="kpi-trend alert">Requieren revisión</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">18</div>
            <div className="kpi-label">{t('dashboard.kpi.approved_actions')}</div>
          </div>
          <div className="kpi-trend up">+5 hoy</div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon"><Calendar size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">34</div>
            <div className="kpi-label">{t('dashboard.kpi.on_vacation')}</div>
          </div>
          <div className="kpi-trend neutral">Personal ausente</div>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dash-panel">
          <div className="panel-header">
            <h2>{t('dashboard.tables.latest_requests')}</h2>
            <span className="panel-badge">Últimas 24h</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref.</th>
                  <th>Empleado</th>
                  <th>Departamento</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono">#SOL-1045</td>
                  <td>Carlos R. Méndez</td>
                  <td>Sistemas</td>
                  <td><span className="badge badge-deposit" style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>Vacaciones</span></td>
                  <td><span className="dot yellow" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#eab308', marginRight: '6px' }}></span>Pendiente</td>
                  <td className="mono">Hoy</td>
                </tr>
                <tr>
                  <td className="mono">#SOL-1044</td>
                  <td>Ana L. Pérez</td>
                  <td>Contabilidad</td>
                  <td><span className="badge" style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>Permiso</span></td>
                  <td><span className="dot green" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginRight: '6px' }}></span>Aprobado</td>
                  <td className="mono">Ayer</td>
                </tr>
                <tr>
                  <td className="mono">#SOL-1043</td>
                  <td>José M. Santos</td>
                  <td>Operaciones</td>
                  <td><span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>Amonestación</span></td>
                  <td><span className="dot green" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginRight: '6px' }}></span>Registrado</td>
                  <td className="mono">Ayer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-side">
          <div className="panel-small panel-alerts">
            <div className="panel-header" style={{ borderBottomColor: '#fee2e2' }}>
              <h2>{t('dashboard.tables.alerts')}</h2>
              <span className="alert-count" style={{ background: '#c8102e', color: '#fff', fontSize: '11px', fontWeight: '700', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            </div>
            <div className="alert-list" style={{ padding: '8px 0' }}>
              <div className="alert-item alert-med" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 20px', borderBottom: '1px solid var(--clr-border)', borderLeft: '3px solid #d97706' }}>
                <span className="ai-icon"><AlertCircle size={16} color="#d97706" /></span>
                <div className="ai-body" style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '13px' }}>Contratos por vencer</strong>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-2)' }}>5 empleados (próximos 15 días)</span>
                </div>
              </div>
              <div className="alert-item alert-high" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 20px', borderLeft: '3px solid #c8102e' }}>
                <span className="ai-icon"><AlertCircle size={16} color="#c8102e" /></span>
                <div className="ai-body" style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '13px' }}>Evaluaciones Pendientes</strong>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-2)' }}>Dpto. Comercial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
