import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogIn, LogOut, ShoppingBasket, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['Leche Fresca', 'Quesos', 'Yogures y Kumis', 'Cuajada y Arequipe'];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <img
            src="LOGO.jpg"
            alt="Logo de Del Campo a tu Hogar"
            className="h-10 w-auto shrink-0"
          />
          <span className="text-lg font-extrabold leading-tight text-gray-900">
            Del Campo <span className="text-emerald-700">a tu Hogar</span>
          </span>
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Store className="h-6 w-6" aria-hidden="true" />
              Productos
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {isOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-[100]">
                <ul className="py-2">
                  <li>
                    <Link
                      to="/products"
                      className="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Todos los productos
                    </Link>
                  </li>
                  {CATEGORIES.map((category) => (
                    <li key={category}>
                      <Link
                        to={`/products?category=${encodeURIComponent(category)}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsOpen(false)}
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="flex min-h-12 items-center gap-2 rounded-xl bg-emerald-50 px-2 sm:px-4 text-base font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <ShoppingBasket className="h-6 w-6" aria-hidden="true" />
            <span className="hidden sm:inline">Mi carrito</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1 text-sm font-bold text-white">
              {count}
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                title="Mi perfil"
                className="flex min-h-12 items-center gap-2 rounded-xl px-2 sm:px-3 text-base font-semibold text-gray-600 transition-colors hover:bg-gray-100"
              >
                <User className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                <span className="hidden md:inline truncate max-w-48">Hola, {user?.name ?? ''}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-12 items-center gap-2 rounded-xl border border-gray-300 px-2 sm:px-4 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
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
