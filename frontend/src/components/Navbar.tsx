import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 2rem',
        backgroundColor: '#2e7d32',
        color: 'white',
      }}
    >
      <Link to="/" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}>
        🧀 Del Campo a tu Hogar
      </Link>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Productos
        </Link>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>
          Carrito ({count})
        </Link>

        {isAuthenticated ? (
          <>
             <span style={{ fontSize: '14px' }}>Hola, {user?.name ?? ''}</span>
            <button
              onClick={handleLogout}
              style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
