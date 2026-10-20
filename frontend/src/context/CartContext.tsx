import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQuantity = Math.min(
          existing.quantity + quantity,
          product.stock,
        );
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.product.stock)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      ),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, total, count, addItem, removeItem, updateQuantity, clearCart }),
    [items, total, count, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
