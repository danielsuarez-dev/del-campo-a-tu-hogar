import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export default function App() {
  // Estado para productos
  const [products, setProducts] = useState<Product[]>([]);

  // Estado para el formulario de registro
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente',
    phone: '',
  });
  const [message, setMessage] = useState('');

  // Cargar productos
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error cargando productos:', err));
  }, []);

  // Enviar formulario de registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage('¡Usuario registrado con éxito!');
      } else {
        setMessage('Error al registrar usuario');
      }
    } catch (error) {
      setMessage('Error de conexión con el backend');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2e7d32' }}>Del Campo a tu Hogar 🧀🥛</h1>

      {/* Sección Registro */}
      <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Registro de Usuarios</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength={6}
            required
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="cliente">Cliente</option>
            <option value="campesino">Campesino</option>
          </select>
          <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
            Registrar
          </button>
        </form>
        {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
      </section>

      <hr />

      {/* Sección Catálogo */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Productos Disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {products.map((p) => (
            <div key={p.id} style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1b5e20' }}>{p.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{p.description || 'Producto artesanal'}</p>
              <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '8px 0' }}>Precio: ${p.price}</p>
              <p style={{ color: '#2e7d32', fontSize: '14px', margin: 0 }}>Stock: {p.stock} unidades</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}