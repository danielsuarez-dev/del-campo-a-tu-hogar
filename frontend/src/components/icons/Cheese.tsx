import { forwardRef } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';

/**
 * Icono «Cheese» (cuña de queso con agujeros).
 *
 * lucide-react no incluye un icono de queso en su catálogo (verificado hasta
 * la versión 1.60.0), por lo que se define aquí con el mismo estilo de trazo,
 * tamaño y API que los iconos de lucide para usarlo de forma intercambiable.
 */
export const Cheese: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, strokeWidth = 2, absoluteStrokeWidth, ...props }, ref) => {
    const computedStrokeWidth =
      absoluteStrokeWidth && Number(size) > 0
        ? (Number(strokeWidth) * 24) / Number(size)
        : strokeWidth;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={computedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M3 19h16a2 2 0 0 0 2-2V8L3 13Z" />
        <circle cx="8" cy="16" r="1" />
        <circle cx="14" cy="15" r="1.4" />
        <circle cx="17.5" cy="11.5" r="1" />
      </svg>
    );
  },
);

Cheese.displayName = 'Cheese';
