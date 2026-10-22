-- Esquema de productos y acceso del frontend (Supabase).
-- Ejecutar manualmente en Supabase (el proyecto usa synchronize: false).
--
-- CONTEXTO
-- La tabla `products` tenía RLS habilitado (ALTER TABLE ... ENABLE ROW LEVEL
-- SECURITY) pero SIN políticas. En PostgreSQL, RLS sin políticas = denegar
-- todo a los roles que no tienen BYPASSRLS.
--
-- El frontend (frontend/src/lib/supabase.ts) usa la anon key, por lo que sus
-- consultas PostgREST corren como los roles `anon` / `authenticated`, que NO
-- tienen BYPASSRLS. Consecuencias observadas:
--
--   1) GET /rest/v1/products                -> []            (0 filas)
--   2) embed `order_items -> products`      -> `null`        => "Producto eliminado"
--   3) UPDATE de stock desde el carrito     -> 200 con []    => el stock nunca baja
--   4) Realtime de `products`               -> sin eventos
--
-- El backend no sufría el problema porque conecta con el rol `postgres`
-- (BYPASSRLS) a través de DATABASE_URL.
--
-- `orders` y `order_items` ya funcionan sin RLS (el frontend los inserta y
-- los consulta). Se aplica el mismo criterio a `products` para que las tres
-- tablas se comporten igual y el embed anidado funcione.

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Para revertir (si en el futuro se endurecen las políticas):
--   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY ... (ver documentación de Supabase sobre RLS)
