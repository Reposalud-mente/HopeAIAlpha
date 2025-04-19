# Gestión de Dependencias

Este proyecto utiliza [PNPM](https://pnpm.io/) como gestor de paquetes y está construido sobre Node.js y TypeScript.

## Requisitos de entorno
- Node.js >= 18.x
- PNPM >= 8.x

## Dependencias principales

- **next**: ^15.1.7 — Framework principal para aplicaciones React.
- **react**: ^19.0.0 — Biblioteca de UI.
- **typescript**: ^5.x — Tipado estático.
- **tailwindcss**: ^3.x — Utilidades de estilos CSS.
- **@prisma/client** y **prisma**: ^6.x — ORM y migraciones de base de datos.
- **zustand**: ^5.x — Manejo de estado global.
- **socket.io** y **socket.io-client**: ^4.x — Comunicación en tiempo real.
- **radix-ui**: ^1.x — Componentes de UI accesibles.
- **framer-motion**: ^12.x — Animaciones.
- **pdfkit** y **jspdf**: PDF y generación de reportes.

Para la lista completa y versiones exactas, revisa `package.json` y `pnpm-lock.yaml`.

## Herramientas de desarrollo
- **eslint**: Linter para JavaScript/TypeScript.
- **prettier**: Formateador de código.
- **jest** o **vitest**: (Opcional) Pruebas automatizadas.

## Instalación de dependencias

```bash
pnpm install
```

Esto instalará todas las dependencias requeridas según `package.json` y las versiones bloqueadas en `pnpm-lock.yaml`.
