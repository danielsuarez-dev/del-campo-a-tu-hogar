import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, ShoppingBasket, Sprout, Store } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Menú principal"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3"
      >
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-gray-50"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sprout className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold leading-tight text-gray-900">
            Del Campo <span className="text-emerald-700">a tu Hogar</span>
          </span>
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            <Store className="h-6 w-6" aria-hidden="true" />
            Productos
          </Link>

          <Link
            to="/cart"
            className="flex min-h-12 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-base font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <ShoppingBasket className="h-6 w-6" aria-hidden="true" />
            Mi carrito
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1 text-sm font-bold text-white">
              {count}
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <span className="hidden max-w-40 truncate text-base font-semibold text-gray-600 md:block">
                Hola, {user?.name ?? ''}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-12 items-center gap-2 rounded-xl border border-gray-300 px-4 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                <LogIn className="h-5 w-5" aria-hidden="true" />
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="flex min-h-12 items-center rounded-xl bg-emerald-600 px-5 text-base font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
