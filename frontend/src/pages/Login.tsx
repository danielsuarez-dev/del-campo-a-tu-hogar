import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (oauthError) {
        setError(oauthError.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <section style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Iniciar Sesión</h2>
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
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '0.5rem', cursor: 'pointer' }}>
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        title="Iniciar sesión con Google"
        className="w-12 h-12 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-all mx-auto mt-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          className="h-6 w-6"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      </button>

      {error && <p style={{ color: '#c62828', fontWeight: 'bold' }}>{error}</p>}

      <p style={{ marginTop: '1rem' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </section>
  );
}
