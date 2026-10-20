import { useCallback, useEffect, useState } from 'react';
import { useCart, type CartProduct } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;

interface Product extends CartProduct {
  description?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  const loadProducts = useCallback(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error cargando productos:', err));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <section style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Productos Disponibles</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1rem' }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#1b5e20' }}>{p.name}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {p.description || 'Producto artesanal'}
            </p>
            <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '8px 0' }}>
              Precio: ${p.price}
            </p>
            <p style={{ color: '#2e7d32', fontSize: '14px', margin: 0 }}>
              Stock: {p.stock} unidades
            </p>
            <button
              onClick={() => addItem(p)}
              disabled={p.stock <= 0}
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                width: '100%',
              }}
            >
              {p.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
