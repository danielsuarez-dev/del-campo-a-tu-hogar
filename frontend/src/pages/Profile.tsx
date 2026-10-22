import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  CircleCheck,
  CircleDollarSign,
  Clock,
  ImagePlus,
  LoaderCircle,
  LogIn,
  PackageOpen,
  Pencil,
  Save,
  ShoppingBasket,
  Sprout,
  Trash,
  Truck,
  User,
} from 'lucide-react';
import { useAuth, type AuthUser } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/formatPrice';

type Role = 'campesino' | 'cliente';
type TabId = 'datos' | 'productos' | 'compras' | 'pedidos';

interface FarmProduct {
  id: string | number;
  name: string;
  price: number;
  stock: number;
}

interface OrderItemProduct {
  name?: string;
  farmer_id?: string;
}

interface OrderItem {
  quantity: number;
  unit_price: number;
  product_id?: string;
  // PostgREST devuelve la relación `products` como arreglo en el embed
  // many-to-one (`order_items -> products`), por eso el nombre debe
  // extraerse con cuidado: puede venir como lista o como objeto.
  products?: OrderItemProduct[] | OrderItemProduct | null;
}

interface OrderHistory {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
  user_id?: string;
}

// Extracción segura del producto de un item de orden (lista u objeto).
function getItemProductName(item: OrderItem): string | undefined {
  return Array.isArray(item.products) ? item.products[0]?.name : item.products?.name;
}

function getItemFarmerId(item: OrderItem): string | undefined {
  return Array.isArray(item.products) ? item.products[0]?.farmer_id : item.products?.farmer_id;
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 transition-colors placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
const labelClass = 'mb-1 block text-base font-semibold text-gray-700';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="flex flex-col items-center gap-4 py-24 text-gray-500">
        <LoaderCircle
          className="h-12 w-12 animate-spin text-emerald-600"
          aria-hidden="true"
        />
        <p className="text-lg font-semibold">Cargando tu perfil...</p>
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="mx-auto w-full max-w-xl px-4 py-16">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <LogIn
            className="mx-auto h-12 w-12 text-emerald-700"
            aria-hidden="true"
          />
          <p className="mt-4 text-xl font-bold text-emerald-900">
            Inicia sesión para ver tu perfil
          </p>
          <p className="mt-2 text-base text-emerald-800">
            Aquí podrás actualizar tus datos, publicar productos y ver tus compras.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-base font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

  return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: AuthUser }) {
  const role: Role = user.role === 'campesino' ? 'campesino' : 'cliente';
  const [activeTab, setActiveTab] = useState<TabId>('datos');

  const [formData, setFormData] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const [products, setProducts] = useState<FarmProduct[]>([]);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [receivedOrders, setReceivedOrders] = useState<OrderHistory[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingReceived, setIsLoadingReceived] = useState(false);

  const tabs = [
    { id: 'datos', label: 'Datos Personales', icon: User },
    { id: 'productos', label: 'Mi Finca / Mis Productos', icon: Sprout, roles: ['campesino'] },
    { id: 'pedidos', label: 'Pedidos Recibidos', icon: Truck, roles: ['campesino'] },
    { id: 'compras', label: 'Mis Compras', icon: ShoppingBasket, roles: ['cliente'] },
  ].filter((tab) => !('roles' in tab) || (tab.roles as Role[]).includes(role));

  useEffect(() => {
    const fetchFarmerProducts = async () => {
      if (role !== 'campesino' || !user.id) return;
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/products?farmer_id=${user.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(
            (data as FarmProduct[]).map((p) => ({
              id: p.id,
              name: p.name || '',
              price: Number(p.price || 0),
              stock: Number(p.stock || 0),
            })),
          );
        }
      } catch (err) {
        console.error('Error cargando productos del campesino:', err);
      }
    };

    fetchFarmerProducts();
  }, [role, user.id]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (role !== 'cliente' || !user.id) return;
      setIsLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, products(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error cargando órdenes:', error);
        } else {
          setOrders((data || []) as OrderHistory[]);
        }
      } catch (err) {
        console.error('Error cargando órdenes:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [role, user.id]);

  useEffect(() => {
    const fetchReceivedOrders = async () => {
      if (role !== 'campesino' || !user.id) return;
      setIsLoadingReceived(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, products!inner(name, farmer_id))')
          .eq('order_items.products.farmer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error cargando pedidos recibidos:', error);
        } else {
          setReceivedOrders((data || []) as OrderHistory[]);
        }
      } catch (err) {
        console.error('Error cargando pedidos recibidos:', err);
      } finally {
        setIsLoadingReceived(false);
      }
    };

    fetchReceivedOrders();
  }, [role, user.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleDelete = (id: string | number) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) {
        console.error('Error actualizando estado:', error);
        return;
      }
      setReceivedOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  const statusStyles: Record<string, { bg: string; text: string; icon: typeof Truck }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock },
    enviado: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Truck },
    entregado: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CircleCheck },
    'En camino': { bg: 'bg-amber-100', text: 'text-amber-800', icon: Truck },
    Entregado: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CircleCheck },
    Pendiente: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
  };

  // Pedidos que contienen al menos un producto de este campesino: el filtro
  // del servidor puede devolver órdenes donde este campesino no participa.
  const farmerOrders = receivedOrders.filter((order) =>
    order.order_items.some((item) => getItemFarmerId(item) === user.id),
  );

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <User className="h-9 w-9" aria-hidden="true" />
        </span>
        <div className="min-w-[12rem] flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {user.name || 'Mi perfil'}
          </h1>
          <p className="text-base text-gray-600">{user.email}</p>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-800">
          {role}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Secciones del perfil"
        className="mt-8 flex flex-wrap gap-2 border-b border-gray-200"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`-mb-px flex min-h-12 items-center gap-2 rounded-t-xl border-b-4 px-5 text-base font-bold transition-colors ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {activeTab === 'datos' && (
          <form onSubmit={handleSave} className="flex flex-col gap-4" role="tabpanel">
            <h2 className="text-xl font-extrabold text-gray-900">Datos personales</h2>

            <div>
              <label htmlFor="profile-name" className={labelClass}>
                Nombre completo
              </label>
              <input
                id="profile-name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="profile-email" className={labelClass}>
                Correo electrónico
              </label>
              <input
                id="profile-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className={labelClass}>
                Teléfono
              </label>
              <input
                id="profile-phone"
                type="tel"
                placeholder="Tu número de teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                autoComplete="tel"
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:w-auto sm:self-start"
            >
              <Save className="h-6 w-6" aria-hidden="true" />
              Guardar cambios
            </button>

            {savedMessage && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-base font-semibold text-emerald-800"
              >
                <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                ¡Datos guardados con éxito!
              </p>
            )}
          </form>
        )}

        {activeTab === 'productos' && role === 'campesino' && (
          <div role="tabpanel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Mi finca</h2>
                <p className="text-base text-gray-600">
                  Administra los productos que vendes.
                </p>
              </div>
              <Link
                to="/publish"
                className="flex min-h-14 items-center gap-3 rounded-xl bg-emerald-600 px-7 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
              >
                <ImagePlus className="h-7 w-7" aria-hidden="true" />
                Publicar Nuevo Producto
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
                <PackageOpen
                  className="mx-auto h-12 w-12 text-emerald-600"
                  aria-hidden="true"
                />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  Aún no tienes productos publicados.
                </p>
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full min-w-[34rem] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-bold text-gray-500">Producto</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-500">Precio</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-500">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="bg-white">
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-2 text-base font-bold text-gray-900">
                            <Boxes className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                            {product.name}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1 text-base font-semibold text-gray-700">
                            <CircleDollarSign className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            {formatPrice(product.price)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {product.stock > 0 ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                              {product.stock} unidades
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                              Agotado
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/publish?edit=${product.id}`}
                              aria-label={`Editar ${product.name}`}
                              title="Editar"
                              className="flex h-11 w-11 items-center justify-center rounded-xl text-emerald-700 transition-colors hover:bg-emerald-50"
                            >
                              <Pencil className="h-5 w-5" aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              aria-label={`Eliminar ${product.name}`}
                              title="Eliminar"
                              className="flex h-11 w-11 items-center justify-center rounded-xl text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pedidos' && role === 'campesino' && (
          <div role="tabpanel">
            <h2 className="text-xl font-extrabold text-gray-900">Pedidos Recibidos</h2>
            <p className="text-base text-gray-600">Gestiona los pedidos de tus productos.</p>

            {isLoadingReceived ? (
              <div className="mt-6 flex items-center gap-3 text-gray-500">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span>Cargando pedidos...</span>
              </div>
            ) : farmerOrders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-3 font-semibold text-gray-700">No hay pedidos recibidos aún</p>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {farmerOrders.map((order) => {
                  const orderDate = new Date(order.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  const farmerItems = order.order_items.filter(
                    (item) => getItemFarmerId(item) === user.id,
                  );
                  // Resumen "Producto x Cantidad" para saber qué debe enviar.
                  const itemsSummary = farmerItems
                    .map((item) => `${getItemProductName(item) || 'Producto'} x ${item.quantity}`)
                    .join(', ');

                  return (
                    <li
                      key={order.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                          {itemsSummary && (
                            <p className="mt-1 text-base font-bold text-emerald-700">
                              {itemsSummary}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">{orderDate}</p>
                        </div>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="pending">pending</option>
                          <option value="enviado">enviado</option>
                          <option value="entregado">entregado</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        {farmerItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {getItemProductName(item) || 'Producto eliminado'}
                              </p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900">
                              {formatPrice(item.unit_price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'compras' && role === 'cliente' && (
          <div role="tabpanel">
            <h2 className="text-xl font-extrabold text-gray-900">Mis compras</h2>
            <p className="text-base text-gray-600">Historial de tus pedidos anteriores.</p>

            {isLoadingOrders ? (
              <div className="mt-6 flex items-center gap-3 text-gray-500">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <span>Cargando historial...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-3 font-semibold text-gray-700">No tienes compras aún</p>
              </div>
            ) : (
              <ul className="mt-6 space-y-6">
                {orders.map((order) => {
                  const statusKey = order.status || 'pending';
                  const statusStyle = statusStyles[statusKey] || statusStyles.pending;
                  const StatusIcon = statusStyle.icon;
                  const orderDate = new Date(order.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  const productNames = order.order_items
                    .map((item) => getItemProductName(item))
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <li
                      key={order.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {productNames || 'Pedido'}
                          </p>
                          <p className="text-sm text-gray-500">{orderDate}</p>
                        </div>

                        <span
                          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <StatusIcon className="h-4 w-4" aria-hidden="true" />
                          {statusKey}
                        </span>

                        <p className="text-xl font-extrabold text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {order.order_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                          >
                            <div className="min-w-[12rem] flex-1">
                              <p className="font-semibold text-gray-900">
                                {getItemProductName(item) || 'Producto eliminado'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Cantidad: {item.quantity} × {formatPrice(item.unit_price)}
                              </p>
                            </div>
                            <p className="font-bold text-gray-900">
                              {formatPrice(item.unit_price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
