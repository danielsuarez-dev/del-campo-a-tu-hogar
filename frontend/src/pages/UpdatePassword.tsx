import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, LoaderCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthCard from '../components/AuthCard';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        navigate('/login');
      }
    } catch {
      setError('Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Nueva contraseña"
      subtitle="Ingresa tu nueva contraseña."
      icon={<KeyRound className="h-7 w-7" aria-hidden="true" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1 block text-base font-semibold text-gray-700"
          >
            Nueva contraseña
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 transition-colors placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-base font-semibold text-gray-700"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 transition-colors placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoading ? (
            <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          )}
          {isLoading ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-base font-semibold text-red-700"
        >
          {error}
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
