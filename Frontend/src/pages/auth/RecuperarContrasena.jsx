import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf9f7;
  padding: 40px 20px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 40px 36px;
  max-width: 440px;
  width: 100%;
  text-align: center;
`;

const Logo = styled.img`
  display: block;
  height: 36px;
  margin: 0 auto 28px;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  color: #3E0102;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #888;
  margin: 0 0 28px;
`;

const Input = styled.input`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 14px;
  box-sizing: border-box;
  outline: none;
  background-color: #fff;
  color: #000;
  transition: border-color 0.2s;
  &:focus { border-color: #3E0102; }

  /* Neutralizar el fondo amarillo del autofill del navegador */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: #000;
    -webkit-box-shadow: 0 0 0px 1000px #fff inset;
    box-shadow: 0 0 0px 1000px #fff inset;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #3E0102;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #5a0103; }
  &:disabled { background: #ccc; cursor: not-allowed; }
`;

const Message = styled.p`
  font-size: 0.9rem;
  margin-top: 12px;
  color: ${p => p.error ? '#c0392b' : '#27ae60'};
`;

export default function RecuperarContrasena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!code) {
      setMsg('El enlace de recuperación no es válido o ya expiró.');
      setIsError(true);
    }
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (password.length < 6) {
      setMsg('La contraseña debe tener al menos 6 caracteres.');
      setIsError(true);
      return;
    }
    if (password !== confirm) {
      setMsg('Las contraseñas no coinciden.');
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, passwordConfirmation: confirm })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      setMsg('¡Contraseña restablecida con éxito! Redirigiendo...');
      setIsError(false);
      setTimeout(() => navigate('/inicio'), 2500);
    } catch (err) {
      setIsError(true);
      setMsg('No se pudo restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Logo src="/logo-marybe.png" alt="Marybe" />
        <Title>Nueva contraseña</Title>
        <Subtitle>Ingresá tu nueva contraseña para recuperar el acceso a tu cuenta.</Subtitle>

        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={!code}
          />
          <Input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            disabled={!code}
          />
          <Button type="submit" disabled={loading || !code}>
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </Button>
        </form>

        {msg && <Message error={isError}>{msg}</Message>}
      </Card>
    </Page>
  );
}
