import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, PackageOpen, TriangleAlert } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import type { ProductData } from '../components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL;

export default function Products() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <>
      <Hero />

      <section
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-12"
        aria-labelledby="productos-titulo"
      >
        <h2 id="productos-titulo" className="text-3xl font-extrabold text-gray-900">
          Nuestros productos
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Elige lo que quieras y presiona «Agregar al carrito».
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-20 text-gray-500">
            <LoaderCircle
              className="h-12 w-12 animate-spin text-emerald-600"
              aria-hidden="true"
            />
            <p className="text-lg font-semibold">Cargando productos...</p>
          </div>
        ) : hasError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <TriangleAlert
              className="mx-auto h-10 w-10 text-red-600"
              aria-hidden="true"
            />
            <p className="mt-3 text-lg font-bold text-red-800">
              No pudimos cargar los productos.
            </p>
            <p className="mt-1 text-red-700">Revisa tu conexión e inténtalo otra vez.</p>
            <button
              type="button"
              onClick={loadProducts}
              className="mt-5 min-h-12 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <PackageOpen
              className="mx-auto h-12 w-12 text-emerald-600"
              aria-hidden="true"
            />
            <p className="mt-3 text-lg font-bold text-gray-900">
              No hay productos disponibles ahora mismo.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
