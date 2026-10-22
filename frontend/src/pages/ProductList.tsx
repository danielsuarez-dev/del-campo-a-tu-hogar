import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoaderCircle, PackageOpen, Store, TriangleAlert } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const { products, isLoading, hasError, reload, fetchProducts } = useProducts();

  useEffect(() => {
    setTimeout(() => {
      fetchProducts(category || undefined);
    }, 0);
  }, [category, fetchProducts]);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-12"
      aria-labelledby="catalogo-titulo"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Store className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h1 id="catalogo-titulo" className="text-3xl font-extrabold text-gray-900">
            Nuestros productos
          </h1>
          <p className="text-base text-gray-600">
            Elige lo que quieras y presiona «Agregar al carrito».
          </p>
        </div>
      </div>

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
            onClick={() => reload(category || undefined)}
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
        <>
          <p className="mt-6 text-base font-semibold text-gray-500">
            {category ? `Categoría: ${category} — ` : ''}
            {products.length === 1
              ? '1 producto disponible'
              : `${products.length} productos disponibles`}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
