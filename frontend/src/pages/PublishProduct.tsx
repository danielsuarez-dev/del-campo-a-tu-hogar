import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  ImagePlus,
  Leaf,
  LoaderCircle,
  Sprout,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const inputClass =
  'min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-900 transition-colors placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
const labelClass = 'mb-1 block text-base font-semibold text-gray-700';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CATEGORIES = ['Leche Fresca', 'Quesos', 'Yogures y Kumis', 'Cuajada y Arequipe'];

// Fila de producto que devuelve el backend (GET /products).
interface ProductRow {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  image_url?: string;
}

export default function PublishProduct() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [formData, setFormData] = useState({
    name: '',
    // Categoría por defecto válida: así el payload nunca viaja con `category`
    // vacío aunque el usuario no toque el selector.
    category: CATEGORIES[0],
    description: '',
    price: '',
    stock: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Si el producto guardado tiene una categoría que ya no está en la lista
  // (datos antiguos), se conserva como opción para no perderla al publicar.
  const categoryOptions =
    formData.category && !CATEGORIES.includes(formData.category)
      ? [formData.category, ...CATEGORIES]
      : CATEGORIES;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!editId) return;
      try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const product = (data as ProductRow[]).find((p) => String(p.id) === String(editId));
          if (product) {
            setFormData({
              name: product.name || '',
              category: product.category || CATEGORIES[0],
              description: product.description || '',
              price: product.price !== undefined ? String(product.price) : '',
              stock: product.stock !== undefined ? String(product.stock) : '',
            });
            if (product.image_url) {
              setExistingImageUrl(product.image_url);
              setImagePreview(product.image_url);
            }
          }
        }
      } catch (err) {
        console.error('Error cargando producto para editar:', err);
      }
    };
    fetchProduct();
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyImageFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen (JPG, PNG, WEBP o GIF).');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(
        `La imagen pesa ${formatMegabytes(file.size)} y el máximo permitido es 5 MB.`,
      );
      return;
    }

    setImageError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview, imageFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = '';
    applyImageFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) applyImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!imageFile && !existingImageUrl) {
      setIsError(true);
      setMessage('Debes subir una imagen del producto');
      setIsSaving(false);
      return;
    }

    if (!formData.category) {
      setIsError(true);
      setMessage('Debes seleccionar una categoría');
      setIsSaving(false);
      return;
    }

    if (Number(formData.stock) <= 0) {
      setIsError(true);
      setMessage('El stock debe ser mayor a 0');
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl: string | undefined = existingImageUrl || undefined;

      if (imageFile) {
        const cleanName = imageFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
        const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(path, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          setIsError(true);
          setMessage(`No se pudo subir la imagen: ${uploadError.message}`);
          setIsSaving(false);
          return;
        }

        const { data: publicUrl } = supabase.storage.from('products').getPublicUrl(path);
        imageUrl = publicUrl.publicUrl;
      }

      // Payload único para alta y edición: `category` e `image_url` viajan
      // siempre explícitamente para que el backend los pueda mapear.
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: imageUrl,
        farmerId: user?.id,
        farmer_id: user?.id,
      };

      if (isEditMode && editId) {
        const res = await fetch(`${API_URL}/products/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setMessage('¡Producto actualizado con éxito! Redirigiendo a tu perfil...');
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          const error = await res.json().catch(() => null);
          setIsError(true);
          setMessage(error?.message ?? 'No se pudo actualizar el producto');
        }
      } else {
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setFormData({ name: '', category: CATEGORIES[0], description: '', price: '', stock: '' });
          setImagePreview(null);
          setImageFile(null);
          setExistingImageUrl(null);
          setMessage('¡Producto publicado con éxito! Redirigiendo a tu perfil...');
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          const error = await res.json().catch(() => null);
          setIsError(true);
          setMessage(error?.message ?? 'No se pudo publicar el producto');
        }
      }
    } catch {
      setIsError(true);
      setMessage('Error de conexión con el backend');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        to="/profile"
        className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Volver a mi perfil
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Sprout className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isEditMode ? 'Editar producto' : 'Publicar nuevo producto'}
          </h1>
          <p className="text-base text-gray-600">
            {isEditMode ? 'Actualiza la información de tu producto.' : 'Cuéntanos qué ofreces desde tu finca.'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <label htmlFor="publish-name" className={labelClass}>
            Nombre del producto
          </label>
          <input
            id="publish-name"
            name="name"
            type="text"
            placeholder="Ej. Tomates orgánicos"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="publish-category" className={labelClass}>
            Categoría
          </label>
          <select
            id="publish-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="publish-description" className={labelClass}>
            Descripción
          </label>
          <textarea
            id="publish-description"
            name="description"
            placeholder="Describe brevemente tu producto"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} min-h-28 resize-y py-3`}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="publish-price" className={labelClass}>
              Precio por unidad ($)
            </label>
            <input
              id="publish-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 2.50"
              value={formData.price}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="publish-stock" className={labelClass}>
              Stock disponible
            </label>
            <input
              id="publish-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="Ej. 50"
              value={formData.stock}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Imagen del producto</span>
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors ${
              isDragging
                ? 'border-emerald-600 bg-emerald-100'
                : 'border-emerald-300 bg-emerald-50 hover:border-emerald-500 hover:bg-emerald-100'
            }`}
          >
            <label
              htmlFor="publish-image"
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-2"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Vista previa del producto"
                    className="h-24 w-24 rounded-xl object-cover ring-2 ring-white shadow"
                  />
                  <span className="flex items-center gap-2 text-base font-bold text-emerald-800">
                    <CircleCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                    {imageFile ? imageFile.name : 'Imagen actual'}
                  </span>
                  <span className="text-sm text-emerald-700">
                    {isDragging ? 'Suelta aquí para reemplazar la imagen' : 'Arrastra otra imagen o toca para cambiarla'}
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus
                    className={`h-9 w-9 ${isDragging ? 'text-emerald-700' : 'text-emerald-600'}`}
                    aria-hidden="true"
                  />
                  <span className="text-lg font-bold text-emerald-800">
                    {isDragging ? 'Suelta aquí tu imagen' : 'Subir Imagen'}
                  </span>
                  <span className="text-sm text-emerald-700">
                    Arrastra y suelta, o toca para elegir — JPG o PNG, máx. 5 MB
                  </span>
                </>
              )}
            </label>
            <input
              id="publish-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </div>
          {imageError && (
            <p
              role="alert"
              className="mt-2 flex items-center gap-2 text-sm font-bold text-red-600"
            >
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              {imageError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-2 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 text-xl font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {isSaving ? (
            <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
          ) : (
            <Leaf className="h-6 w-6" aria-hidden="true" />
          )}
          {isSaving ? (isEditMode ? 'Actualizando...' : 'Publicando...') : (isEditMode ? 'Actualizar producto' : 'Publicar producto')}
        </button>

        {message && (
          <p
            role="status"
            className={`flex items-center gap-3 rounded-xl border p-4 text-base font-semibold ${
              isError
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {isError ? (
              <CircleAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
            ) : (
              <CircleCheck className="h-6 w-6 shrink-0" aria-hidden="true" />
            )}
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
