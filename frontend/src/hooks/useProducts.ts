import { useCallback, useEffect, useState } from 'react';
import type { ProductData } from '../components/ProductCard';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL;

// Convierte una fila llegada por Realtime en un ProductData seguro.
// Solo incluye los campos opcionales si vienen en la fila (para poder
// combinarlos con lo que ya exista en el estado sin perder datos).
function normalizeProductRow(row: unknown): ProductData | null {
  if (typeof row !== 'object' || row === null) return null;
  const data = row as Record<string, unknown>;
  if (data.id === undefined || data.id === null) return null;

  const product: ProductData = {
    id: String(data.id),
    name: String(data.name ?? ''),
    price: Number(data.price ?? 0),
    stock: Number(data.stock ?? 0),
  };

  if ('description' in data) {
    product.description = typeof data.description === 'string' ? data.description : undefined;
  }

  const imageKey = (['image', 'imageUrl', 'image_url', 'imagen'] as const).find(
    (key) => key in data,
  );
  if (imageKey) {
    const value = data[imageKey];
    product.image = typeof value === 'string' ? value : undefined;
  }

  return product;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // El setState solo ocurre en callbacks asíncronos (seguro dentro del effect)
  const fetchProducts = useCallback((category?: string) => {
    const url = category
      ? `${API_URL}/products?category=${encodeURIComponent(category)}`
      : `${API_URL}/products`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Tiempo real: INSERT/UPDATE/DELETE en la tabla products actualiza el
    // estado local al instante, sin recargar la página.
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: unknown } | undefined;
            const deletedId = oldRow?.id;
            if (deletedId === undefined || deletedId === null) return;
            const id = String(deletedId);
            setProducts((prev) => prev.filter((p) => String(p.id) !== id));
            return;
          }

          // INSERT y UPDATE: alta o reemplazo por id
          const incoming = normalizeProductRow(payload.new);
          if (!incoming) return;
          setProducts((prev) => {
            const index = prev.findIndex((p) => String(p.id) === incoming.id);
            if (index === -1) return [...prev, incoming];
            const next = [...prev];
            next[index] = { ...prev[index], ...incoming };
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Recarga manual (botón «Intentar de nuevo»): se llama desde un event handler
  const reload = useCallback((category?: string) => {
    setIsLoading(true);
    setHasError(false);
    fetchProducts(category);
  }, [fetchProducts]);

  return { products, isLoading, hasError, reload, fetchProducts };
}
