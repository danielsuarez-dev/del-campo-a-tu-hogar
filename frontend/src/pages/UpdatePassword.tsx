import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
    <section style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Nueva Contraseña</h2>
      <p style={{ marginBottom: '1rem' }}>Ingresa tu nueva contraseña.</p>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={isLoading} style={{ padding: '0.5rem', cursor: 'pointer' }}>
          {isLoading ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>

      {error && <p style={{ color: '#c62828', fontWeight: 'bold' }}>{error}</p>}

      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </section>
  );
}
