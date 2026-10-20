import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthCard from '../components/AuthCard';

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

  const inputClass =
    'min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 transition-colors placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
  const labelClass = 'mb-1 block text-base font-semibold text-gray-700';

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Regístrate en pocos pasos y empieza a comprar."
      icon={<UserPlus className="h-7 w-7" aria-hidden="true" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="register-name" className={labelClass}>
            Nombre completo
          </label>
          <input
            id="register-name"
            type="text"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="register-email" className={labelClass}>
            Correo electrónico
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="register-password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="register-password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="new-password"
            minLength={6}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="register-phone" className={labelClass}>
            Teléfono
          </label>
          <input
            id="register-phone"
            type="text"
            placeholder="Tu número de teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="register-role" className={labelClass}>
            ¿Quién eres?
          </label>
          <select
            id="register-role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={inputClass}
          >
            <option value="cliente">Cliente (quiero comprar)</option>
            <option value="campesino">Campesino (quiero vender)</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-2 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <UserPlus className="h-6 w-6" aria-hidden="true" />
          Registrarme
        </button>
      </form>

      {message && (
        <p
          role="status"
          className={`mt-4 rounded-xl border p-3 text-base font-semibold ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {message}
        </p>
      )}

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-sm font-bold text-gray-400">o</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        title="Registrarse con Google"
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-6 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-6 w-6" width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
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
        {isGoogleLoading ? 'Abriendo Google...' : 'Continuar con Google'}
      </button>

      <p className="mt-6 text-center text-base text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-bold text-emerald-700 underline hover:text-emerald-900"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  );
}
