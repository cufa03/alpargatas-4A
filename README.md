# Catálogo Mayorista (Alpargatas) — Starter

Sitio público de catálogo (sin precios ni carrito) + panel admin para cargar/editar productos, subir imagen y reordenar con drag & drop.

## Stack

- Next.js App Router (TypeScript)
- Tailwind CSS + shadcn/ui
- Firebase: Firestore, Auth (email/password), Storage
- Zod + React Hook Form
- Drag & Drop: `@dnd-kit`

## Estructura (resumen)

- `src/app` rutas públicas y admin
- `src/lib/firebase` helpers de Firebase (Firestore/Storage)
- `src/lib/products` tipos y schemas Zod
- `src/middleware.ts` protección de rutas admin

## Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá los valores.

Requeridas:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `ADMIN_EMAIL`
- `WHATSAPP_NUMBER` (sin `+`)

Opcional:

- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

## Firebase — Setup

1. **Crear proyecto** en Firebase Console.

2. **Auth**

- Ir a Authentication → Sign-in method → habilitar **Email/Password**.
- Crear 1 usuario (el admin) con email igual a `ADMIN_EMAIL`.

3. **Firestore**

- Ir a Firestore Database → Create database.
- Modo: producción (recomendado).
- Colección: `products`.

4. **Storage**

- Ir a Storage → Get started.

## Reglas de seguridad (ejemplos)

En `firebase/firestore.rules` y `firebase/storage.rules` hay ejemplos listos para copiar.

### Firestore

- Lectura pública **solo** de productos activos.
- Escritura (create/update/delete) solo si el usuario está autenticado y su email es el admin.

Nota importante: Firestore Rules no puede leer `ADMIN_EMAIL` desde el sitio. Por eso:

- En el **código** se valida allowlist con `ADMIN_EMAIL` (ver `src/app/api/auth/session/route.ts` + `src/middleware.ts`).
- En **rules**, hardcodeá tu email de admin (o usá custom claims si querés una solución más escalable).

### Storage

- Lectura pública (para mostrar imágenes en el catálogo).
- Escritura solo admin.

## Índices de Firestore (posible requerimiento)

Dependiendo de tus filtros, Firestore puede pedir índices compuestos (te muestra un link directo para crearlos).

Consultas usadas:

- `isActive == true` + `orderBy(sortOrder)` + `orderBy(createdAt)`
- `isActive == true` + `gender == ...` + `orderBy(sortOrder)` + `orderBy(createdAt)`
- `isActive == true` + `type == ...` + `orderBy(sortOrder)` + `orderBy(createdAt)`
- `isActive == true` + `gender == ...` + `type == ...` + `orderBy(sortOrder)` + `orderBy(createdAt)`

## Cómo correr

```bash
npm install
npm run dev
```

Abrir:

- Público: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Comandos (Tailwind + shadcn)

Este repo ya viene inicializado. Si necesitás repetirlo desde cero:

```bash
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*"
npx shadcn@latest init -d --src-dir --template next
npx shadcn@latest add button card input textarea select dialog sonner table badge label separator dropdown-menu switch
```

## Notas de implementación

- Protección admin:
  - `/api/auth/session` valida el `idToken` y compara el email con `ADMIN_EMAIL`.
  - `src/middleware.ts` protege `/admin/*` (excepto `/admin/login`).
- Imágenes:
  - Se sube 1 imagen por producto a `products/{productId}/images/main.ext`.
  - Estructura lista para extender a múltiples imágenes.
- Reordenamiento:
  - En `/admin/products` → “Modo reordenar” (DnD) persiste `sortOrder`.
    This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
