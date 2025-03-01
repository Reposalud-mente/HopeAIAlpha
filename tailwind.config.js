/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border-color)",
        input: "var(--border-color)",
        ring: "var(--calm-primary)",
        background: "rgb(var(--background-start-rgb))",
        foreground: "rgb(var(--foreground-rgb))",
        primary: {
          DEFAULT: "var(--calm-primary)",
          foreground: "white",
        },
        secondary: {
          DEFAULT: "var(--calm-secondary)",
          foreground: "var(--calm-primary)",
        },
        destructive: {
          DEFAULT: "var(--alert-primary)",
          foreground: "white",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "var(--calm-secondary)",
          foreground: "var(--calm-primary)",
        },
        popover: {
          DEFAULT: "white",
          foreground: "var(--neutral-text)",
        },
        card: {
          DEFAULT: "white",
          foreground: "var(--neutral-text)",
        },
        'calm': {
          primary: "var(--calm-primary)",
          secondary: "var(--calm-secondary)",
        },
        'analysis': {
          primary: "var(--analysis-primary)",
          secondary: "var(--analysis-secondary)",
        },
        'alert': {
          primary: "var(--alert-primary)",
          secondary: "var(--alert-secondary)",
        },
        'success': {
          primary: "var(--success-primary)",
          secondary: "var(--success-secondary)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}