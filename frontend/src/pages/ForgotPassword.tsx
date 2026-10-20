import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthCard from '../components/AuthCard';

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
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para cambiar tu contraseña."
      icon={<Mail className="h-7 w-7" aria-hidden="true" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-1 block text-base font-semibold text-gray-700"
          >
            Correo electrónico
          </label>
          <input
            id="forgot-email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 transition-colors placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoading ? (
            <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
          ) : (
            <Mail className="h-6 w-6" aria-hidden="true" />
          )}
          {isLoading ? 'Enviando...' : 'Enviar enlace'}
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

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl px-2 text-base font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}
