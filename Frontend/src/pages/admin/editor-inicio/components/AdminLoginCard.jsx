import React, { useState } from 'react';
import axios from 'axios';
import '../../ImportacionAdmin.css';

const API = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';

export default function AdminLoginCard({ subtitle, onAuthenticated }) {
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await axios.post(`${API}/api/importacion-admin/login`, credentials);
      onAuthenticated(response.data.jwt);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || requestError.message || 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ia-wrapper">
      <div className="ia-bg-particles">{[...Array(12)].map((_, index) => <div key={index} className={`ia-particle ia-particle--${index + 1}`} />)}</div>
      <section className="ia-login-card" aria-labelledby="editor-inicio-login-title">
        <div className="ia-login-brand">
          <div className="ia-brand-icon">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" /><path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" fill="currentColor" opacity=".2" /><path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor" /></svg>
          </div>
          <h1 id="editor-inicio-login-title" className="ia-brand-title">Marybe</h1>
          <p className="ia-brand-sub">{subtitle}</p>
        </div>
        <form className="ia-login-form" onSubmit={login} noValidate>
          <div className="ia-field">
            <label htmlFor="editor-inicio-email" className="ia-label">Email administrador</label>
            <div className="ia-input-wrap">
              <span className="ia-input-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></span>
              <input id="editor-inicio-email" type="email" className="ia-input" placeholder="admin@marybe.com" autoComplete="email" required value={credentials.identifier} onChange={event => setCredentials({ ...credentials, identifier: event.target.value })} />
            </div>
          </div>
          <div className="ia-field">
            <label htmlFor="editor-inicio-password" className="ia-label">Contraseña</label>
            <div className="ia-input-wrap">
              <span className="ia-input-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a7 7 0 0114 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></span>
              <input id="editor-inicio-password" type={showPassword ? 'text' : 'password'} className="ia-input" placeholder="••••••••••••" autoComplete="current-password" required value={credentials.password} onChange={event => setCredentials({ ...credentials, password: event.target.value })} />
              <button type="button" className="ia-show-pass" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? '◉' : '◌'}</button>
            </div>
          </div>
          {error && <div className="ia-alert ia-alert--error" role="alert">{error}</div>}
          <button type="submit" className="ia-btn ia-btn--primary" disabled={busy || !credentials.identifier || !credentials.password}>
            {busy ? <><span className="ia-spinner" aria-hidden="true" /> Iniciando sesión...</> : 'Iniciar sesión'}
          </button>
        </form>
        <p className="ia-login-hint">Acceso restringido · Solo administradores</p>
      </section>
    </main>
  );
}
