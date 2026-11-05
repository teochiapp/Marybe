import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiClock } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 10, 10, 0.48);
  backdrop-filter: blur(3px);
`;

const Dialog = styled.div`
  width: min(100%, 410px);
  padding: 32px;
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(30, 8, 8, 0.25);
  font-family: var(--font-family-secondary, sans-serif);

  @media (max-width: 480px) {
    padding: 26px 22px 22px;
    border-radius: 16px;
  }
`;

const IconWrap = styled.div`
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  border-radius: 50%;
  color: #5c0a0a;
  background: #f7eeee;
`;

const Title = styled.h2`
  margin: 0 0 9px;
  color: #3e0102;
  font-size: 1.35rem;
  line-height: 1.25;
  letter-spacing: -0.02em;
`;

const Message = styled.p`
  margin: 0 0 26px;
  color: #625858;
  font-size: 0.96rem;
  line-height: 1.55;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  button {
    min-height: 46px;
    padding: 11px 12px;
    border-radius: 9px;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.2;
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;
  }

  button:hover { transform: translateY(-1px); }

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const LoginButton = styled.button`
  border: 1px solid #3e0102;
  color: #fff;
  background: #3e0102;
  &:hover { background: #5c0a0a; }
`;

const LogoutButton = styled.button`
  border: 1px solid #ded5d5;
  color: #514747;
  background: #fff;
  &:hover { border-color: #b7a6a6; background: #faf8f8; }
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
        <IconWrap aria-hidden="true"><FiClock size={23} strokeWidth={1.8} /></IconWrap>
        <Title id="session-expired-title">Tu sesión ha expirado</Title>
        <Message>Iniciá sesión nuevamente para continuar.</Message>
        <Actions>
          <LoginButton type="button" onClick={loginAgain}>Iniciar sesión</LoginButton>
          <LogoutButton type="button" onClick={closeSession}>Cerrar sesión</LogoutButton>
        </Actions>
      </Dialog>
    </Overlay>
  );
}
