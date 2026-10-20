import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setMessage('');
    setIsError(false);
    setIsGoogleLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (oauthError) {
        setIsError(true);
        setMessage(oauthError.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setIsError(true);
      setMessage('Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('¡Usuario registrado con éxito! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        const error = await res.json().catch(() => null);
        setIsError(true);
        setMessage(error?.message ?? 'Error al registrar usuario');
      }
    } catch {
      setIsError(true);
      setMessage('Error de conexión con el backend');
    }
  };

  return (
    <section style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Registro de Usuarios</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <input
          type="text"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          minLength={6}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="cliente">Cliente</option>
          <option value="campesino">Campesino</option>
        </select>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
          Registrar
        </button>
      </form>

      {message && (
        <p style={{ fontWeight: 'bold', color: isError ? '#c62828' : '#2e7d32' }}>
          {message}
        </p>
      )}

      <div className="mt-6">
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
      </div>

      <p style={{ marginTop: '1rem' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </section>
  );
}
