-- Esquema para el carrito de compras / órdenes.
-- Ejecutar manualmente en Supabase (el proyecto usa synchronize: false).

CREATE TABLE IF NOT EXISTS orders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid,
  total      numeric(10, 2) NOT NULL DEFAULT 0,
  status     varchar NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products (id),
  quantity   integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);
