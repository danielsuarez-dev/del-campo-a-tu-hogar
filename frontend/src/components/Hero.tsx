import type { LucideIcon } from 'lucide-react';
import { Leaf, ShieldCheck, Sprout, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BENEFITS: { icon: LucideIcon; text: string }[] = [
  { icon: Leaf, text: '100% natural' },
  { icon: Truck, text: 'Entrega a domicilio' },
  { icon: ShieldCheck, text: 'Compra segura' },
];

export default function Hero() {
  const { user, isAuthenticated } = useAuth();

  const greeting =
    isAuthenticated && user?.name ? `¡Hola, ${user.name}!` : '¡Bienvenido!';

  return (
    <section className="bg-gradient-to-br from-emerald-700 via-emerald-700 to-green-900">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:py-20">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <Sprout className="h-9 w-9 text-white" aria-hidden="true" />
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {greeting}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-xl text-emerald-50">
          Productos frescos y artesanales, cultivados con amor y directo del
          campo a tu mesa.
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-base font-semibold text-white ring-1 ring-white/20"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
