import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  LogIn,
  Minus,
  PackageOpen,
  Plus,
  ShoppingBasket,
  Trash,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Cart() {
  const { items, total, count, updateQuantity, removeItem, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) return;
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutMessage('');
    setIsError(false);

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.status === 201) {
        clearCart();
        setCheckoutMessage('Pedido Exitoso');
        setIsError(false);
      } else {
        const error = await res.json().catch(() => null);
        setCheckoutMessage(error?.message ?? 'Error al procesar el pedido');
        setIsError(true);
      }
    } catch {
      setCheckoutMessage('Error de conexión con el backend');
      setIsError(true);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShoppingBasket className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tu carrito</h1>
          <p className="text-base text-gray-600">
            {count === 1 ? '1 artículo' : `${count} artículos`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <PackageOpen className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
          <p className="mt-4 text-xl font-bold text-gray-900">Tu carrito está vacío</p>
          <p className="mt-2 text-gray-600">Aún no has agregado productos.</p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <ShoppingBasket className="h-6 w-6" aria-hidden="true" />
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {items.map((item) => (
              <li
                key={item.product.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-[11rem] flex-1">
                  <p className="text-lg font-bold text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    Precio por unidad: ${Number(item.product.price).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label={`Quitar uno de ${item.product.name}`}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center text-lg font-extrabold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    aria-label={`Agregar uno más de ${item.product.name}`}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <p className="w-28 text-right text-xl font-extrabold text-gray-900">
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  aria-label={`Quitar ${item.product.name} del carrito`}
                  className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash className="h-5 w-5" aria-hidden="true" />
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between rounded-2xl bg-emerald-50 p-6">
            <span className="text-xl font-bold text-emerald-900">Total</span>
            <span className="text-3xl font-extrabold text-emerald-900">
              ${total.toFixed(2)}
            </span>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-xl font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-wait disabled:bg-emerald-400"
            >
              {isCheckingOut ? (
                <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : (
                <Truck className="h-7 w-7" aria-hidden="true" />
              )}
              {isCheckingOut ? 'Procesando pedido...' : 'Realizar pedido'}
            </button>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <LogIn className="h-7 w-7 shrink-0 text-emerald-700" aria-hidden="true" />
              <p className="min-w-[12rem] flex-1 text-base font-semibold text-emerald-900">
                Para hacer tu pedido necesitas iniciar sesión.
              </p>
              <Link
                to="/login"
                className="flex min-h-12 items-center rounded-xl bg-emerald-600 px-5 text-base font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
        </>
      )}

      {checkoutMessage && (
        <p
          role="status"
          className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 text-lg font-bold ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {isError ? (
            <CircleAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
          ) : (
            <CircleCheck className="h-6 w-6 shrink-0" aria-hidden="true" />
          )}
          {checkoutMessage}
        </p>
      )}
    </section>
  );
}
