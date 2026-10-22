import { useEffect, useRef, useState } from 'react';
import { Check, Leaf, ShoppingBasket } from 'lucide-react';
import { useCart, type CartProduct } from '../context/CartContext';
import { formatPrice } from '../lib/formatPrice';

export interface ProductData extends CartProduct {
  description?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  imagen?: string;
}

function getProductImage(product: ProductData): string | undefined {
  return product.image_url || product.imageUrl || product.image || product.imagen;
}

export default function ProductCard({ product }: { product: ProductData }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState<string | undefined>(undefined);
  const timerRef = useRef<number | undefined>(undefined);

  const outOfStock = product.stock <= 0;
  const image = getProductImage(product);
  // Si la URL cambia, el fallo anterior ya no aplica (sin necesidad de un effect)
  const showImage = Boolean(image) && imgError !== image;

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const handleAddToCart = () => {
    addItem(product);
    setJustAdded(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {showImage ? (
        <div className="m-3 overflow-hidden rounded-xl bg-gray-50">
          <img
            src={product.image_url || product.imageUrl || image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(image)}
            className="h-44 w-full object-cover"
          />
        </div>
      ) : (
        <div
          className="m-3 flex h-44 items-center justify-center rounded-xl bg-gray-100 text-gray-400"
          aria-hidden="true"
        >
          <Leaf className="h-12 w-12" />
        </div>
      )}

      <div className="flex flex-1 flex-col px-5 pb-5">
        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>

        <p className="mt-1 text-sm text-gray-500">
          {product.description || 'Producto artesanal del campo'}
        </p>

        <p className="mt-4 text-3xl font-extrabold text-gray-900">
          {formatPrice(product.price)}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {outOfStock
            ? 'Agotado por ahora'
            : `Disponibles: ${product.stock} unidades`}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          aria-label={`Agregar ${product.name} al carrito`}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-4 text-lg font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
        >
          {justAdded ? (
            <>
              <Check className="h-6 w-6" aria-hidden="true" />
              ¡Agregado!
            </>
          ) : (
            <>
              <ShoppingBasket className="h-6 w-6" aria-hidden="true" />
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
