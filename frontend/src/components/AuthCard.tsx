import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, icon, children }: AuthCardProps) {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
            aria-hidden="true"
          >
            {icon}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
