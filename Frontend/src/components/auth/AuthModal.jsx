import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ModalContent = styled.div`
  background-color: white;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  padding: 30px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    font-family: var(--font-family-secondary, sans-serif);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #555;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: black;
  margin-bottom: 15px;
  font-family: var(--font-family-secondary, sans-serif);
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: black;
  margin-bottom: 25px;
  line-height: 1.4;
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  margin-bottom: 25px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }

  img {
    width: 20px;
    height: 20px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
  color: #535353;
  font-weight: 300px;
  font-size: 0.85rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #535353;
  }

  &::before {
    margin-right: .5em;
  }

  &::after {
    margin-left: .5em;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  color: black;

  &:focus {
    outline: none;
    border-color: #333;
  }
`;

const ForgotPassword = styled.a`
  font-size: 0.85rem;
  color: #333;
  text-align: right;
  text-decoration: underline;
  cursor: pointer;
  margin-top: -5px;
  margin-bottom: 10px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #2b0b0a; /* Dark maroon color from the image */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 5px;

  &:hover {
    background-color: #4a1311;
  }
`;

const ToggleModeText = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #c0392b;
  font-size: 0.85rem;
  margin-top: -5px;
  margin-bottom: 10px;
  text-align: center;
`;

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, authRedirect, clearAuthRedirect } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only for register
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = () => {
    // Redirigir a la API de Strapi para iniciar el flujo OAuth
    // Strapi por defecto expone /api/connect/google
    window.location.href = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/connect/google`;
  };

  const finishAuth = () => {
    closeAuthModal();
    if (authRedirect) {
      navigate(authRedirect);
    }
    clearAuthRedirect();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

    try {
      if (isLoginMode) {
        const res = await fetch(`${apiUrl}/api/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);

        login(data.jwt, data.user);
        finishAuth();
      } else {
        const res = await fetch(`${apiUrl}/api/auth/local/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);

        login(data.jwt, data.user);
        finishAuth();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error. Verifica tus datos.');
    }
  };

  return (
    <ModalOverlay onClick={closeAuthModal}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={closeAuthModal}>✕</CloseButton>

        <Title>{isLoginMode ? 'Iniciar sesión para continuar' : 'Crear tu cuenta'}</Title>
        <Subtitle>
          Tu carrito está guardado. {isLoginMode ? 'Iniciá sesión o creá tu cuenta' : 'Creá tu cuenta o iniciá sesión'} para finalizar la compra.
        </Subtitle>

        <GoogleButton onClick={handleGoogleLogin} type="button">
          <GoogleIcon />
          Continuar con Google
        </GoogleButton>

        <Divider>o con email</Divider>

        <Form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <Input
              type="text"
              placeholder="Nombre completo"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {isLoginMode && <ForgotPassword>¿Olvidaste tu contraseña?</ForgotPassword>}

          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

          <SubmitButton type="submit">
            {isLoginMode ? 'Iniciar sesión' : 'Crear cuenta'}
          </SubmitButton>
        </Form>

        <ToggleModeText onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? 'Crear cuenta' : 'Ya tengo una cuenta. Iniciar sesión'}
        </ToggleModeText>

      </ModalContent>
    </ModalOverlay>
  );
}
