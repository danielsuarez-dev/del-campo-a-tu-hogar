import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <section style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Carrito de Compras ({count} artículos)</h2>

      {items.length === 0 ? (
        <p style={{ color: '#666' }}>El carrito está vacío.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li
                key={item.product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <span style={{ flex: 1 }}>{item.product.name}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  style={{ width: '32px', cursor: 'pointer' }}
                >
                  −
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.product.stock}
                  style={{ width: '32px', cursor: 'pointer' }}
                >
                  +
                </button>

                <span style={{ width: '90px', textAlign: 'right' }}>
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.product.id)}
                  style={{ cursor: 'pointer' }}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <p style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'right' }}>
            Total: ${total.toFixed(2)}
          </p>

          {isAuthenticated ? (
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{
                padding: '0.75rem 1.5rem',
                cursor: isCheckingOut ? 'wait' : 'pointer',
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
              }}
            >
              {isCheckingOut ? 'Procesando...' : 'Realizar pedido'}
            </button>
          ) : (
            <p
              style={{
                padding: '1rem',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeeba',
                borderRadius: '6px',
              }}
            >
              Debes iniciar sesión para realizar tu pedido.{' '}
              <Link to="/login">Inicia sesión aquí</Link>.
            </p>
          )}
        </>
      )}

      {checkoutMessage && (
        <p
          style={{
            marginTop: '1rem',
            fontWeight: 'bold',
            color: isError ? '#c62828' : '#2e7d32',
          }}
        >
          {checkoutMessage}
        </p>
      )}
    </section>
  );
}
