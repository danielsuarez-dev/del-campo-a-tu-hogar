import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CupSoda,
  IceCream,
  Leaf,
  LoaderCircle,
  Milk,
  PackageOpen,
  TriangleAlert,
} from 'lucide-react';
import { Cheese } from '../components/icons/Cheese';
import type { LucideIcon } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

const CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: 'Leche Fresca', icon: Milk },
  { label: 'Quesos', icon: Cheese },
  { label: 'Yogures y Kumis', icon: CupSoda },
  { label: 'Cuajada y Arequipe', icon: IceCream },
];

const FEATURED_LIMIT = 4;

export default function Home() {
  const { products, isLoading, hasError, reload, fetchProducts } = useProducts();
  const featured = products.slice(0, FEATURED_LIMIT);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <>
      <Hero />

      {/* Sección: Nuestras Categorías */}
      <section
        className="mx-auto w-full max-w-7xl px-4 py-12"
        aria-labelledby="categorias-titulo"
      >
        <h2 id="categorias-titulo" className="text-3xl font-extrabold text-gray-900">
          Nuestras Categorías
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Explora lo que el campo de Ubaté tiene para ti.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              to={`/products?category=${encodeURIComponent(label)}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <span className="text-base font-bold text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sección: Productos Destacados */}
      <section
        className="bg-gray-50 py-12"
        aria-labelledby="destacados-titulo"
      >
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="destacados-titulo" className="text-3xl font-extrabold text-gray-900">
                Productos Destacados
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Los favoritos de nuestros clientes.
              </p>
            </div>
            <Link
              to="/products"
              className="flex min-h-12 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-base font-bold text-white transition-colors hover:bg-emerald-700"
            >
              Ver todos los productos
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-16 text-gray-500">
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
                No pudimos cargar los productos destacados.
              </p>
              <button
                type="button"
                onClick={() => reload()}
                className="mt-5 min-h-12 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : featured.length === 0 ? (
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
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-4 py-12"
        aria-labelledby="apoya-titulo"
      >
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12">
          <img src="/LOGO.jpg" alt="Logo" className="h-16 w-16 mx-auto mb-4 object-contain rounded-full" />
          <h2 id="apoya-titulo" className="text-3xl font-extrabold text-emerald-900">
            Apoya al Campo de Ubaté
          </h2>
          <p className="max-w-2xl text-lg text-emerald-800">
            Cada compra que haces aquí llega directo a las manos de las familias
            campesinas de Ubaté, sin intermediarios. Tú obtienes productos frescos
            y ellos un precio justo por su trabajo.
          </p>
          <Link
            to="/products"
            className="flex min-h-14 items-center gap-3 rounded-xl bg-emerald-600 px-8 text-lg font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            <Leaf className="h-6 w-6" aria-hidden="true" />
            Comprar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
