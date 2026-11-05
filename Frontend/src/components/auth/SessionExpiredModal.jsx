import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
`;

const Dialog = styled.div`
  width: min(100%, 430px);
  padding: 28px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.24);
  font-family: var(--font-family-secondary, sans-serif);

  h2 { margin: 0 0 12px; color: #3e0102; font-size: 1.3rem; }
  p { margin: 0 0 24px; color: #333; line-height: 1.5; }
  div { display: flex; gap: 10px; flex-wrap: wrap; }
  button { flex: 1 1 170px; padding: 12px 16px; border-radius: 7px; font-weight: 700; cursor: pointer; }
`;

const LoginButton = styled.button`
  border: 1px solid #3e0102;
  color: #fff;
  background: #3e0102;
`;

const LogoutButton = styled.button`
  border: 1px solid #aaa;
  color: #333;
  background: #fff;
`;

export default function SessionExpiredModal() {
  const { expiredSessionScope, beginReauthentication, dismissExpiredSession } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!expiredSessionScope) return null;

  const loginAgain = () => {
    if (expiredSessionScope === 'admin') {
      window.location.reload();
      return;
    }
    beginReauthentication();
  };

  const closeSession = () => {
    dismissExpiredSession();
    navigate('/inicio', { replace: true });
  };

  return (
    <Overlay role="presentation">
      <Dialog role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title">
        <h2 id="session-expired-title">Tu sesión ha expirado</h2>
        <p>Iniciá sesión nuevamente para continuar.</p>
        <div>
          <LoginButton type="button" onClick={loginAgain}>Iniciar sesión nuevamente</LoginButton>
          <LogoutButton type="button" onClick={closeSession}>Cerrar sesión</LogoutButton>
        </div>
      </Dialog>
    </Overlay>
  );
}
