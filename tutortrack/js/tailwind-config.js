/**
 * tailwind-config.js — configuración del Tailwind CDN (Play CDN).
 *
 * Debe cargarse DESPUÉS de <script src="https://cdn.tailwindcss.com">
 * y ANTES del contenido de la página, en todas las páginas del mockup.
 * Tailwind no define colores, tipografía, radios ni sombras propios,
 * todo apunta a las variables CSS de css/tokens.css. Cambiar un valor de
 * diseño se hace ahí, nunca aquí.
 */
tailwind.config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: "var(--font-display)",
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
          soft: "var(--color-primary-soft)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dark: "var(--color-accent-dark)",
          light: "var(--color-accent-light)",
          soft: "var(--color-accent-soft)",
        },
        onPrimary: "var(--color-on-primary)",
        onAccent: "var(--color-on-accent)",
        onBrand: "var(--color-on-brand)",
        brandInk: {
          DEFAULT: "var(--color-brand-ink)",
          mid: "var(--color-brand-ink-mid)",
        },
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        primarySoft: "var(--color-primary-soft)",
        success: { DEFAULT: "var(--color-success)", bg: "var(--color-success-bg)" },
        danger: { DEFAULT: "var(--color-danger)", bg: "var(--color-danger-bg)" },
        warning: { DEFAULT: "var(--color-warning)", bg: "var(--color-warning-bg)" },
        info: { DEFAULT: "var(--color-info)", bg: "var(--color-info-bg)" },
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
          700: "var(--gray-700)",
          800: "var(--gray-800)",
          900: "var(--gray-900)",
        },
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
};
