import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/update-password',
      });

      if (error) {
        setIsError(true);
        setMessage(error.message);
      } else {
        setMessage('¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
      }
    } catch {
      setIsError(true);
      setMessage('Error al enviar el correo de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Recuperar Contraseña</h2>
      <p style={{ marginBottom: '1rem' }}>
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading} style={{ padding: '0.5rem', cursor: 'pointer' }}>
          {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      {message && (
        <p style={{ fontWeight: 'bold', color: isError ? '#c62828' : '#2e7d32' }}>{message}</p>
      )}

      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </section>
  );
}
