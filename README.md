# Curso Integrador — Leñas y Sabores

Base común del equipo. `Front/` contiene React + TypeScript + Vite; `Backend/` conserva el proyecto Spring Boot existente.

## Ejecutar el frontend

Requiere Node.js 22.12 o superior y npm.

```bash
cd Front
npm ci
npm run dev
```

Comprobaciones: `npm run typecheck`, `npm run lint` y `npm run build`. Para revisar la compilación: `npm run preview`.

## Base de dev

Solo incluye configuración, tipografías locales, logo, favicon, estilos globales mínimos y una pantalla inicial. Cada integrante construye las interfaces de su módulo en su rama, tomando el repositorio anterior como referencia. No incluye autenticación, datos simulados, conexión al backend ni pantallas de funcionalidades.

## Distribución del trabajo

| Rama prevista | Alcance |
| --- | --- |
| `feature/login` | Login, registro y mi cuenta |
| `feature/inicio-catalogo` | Inicio, carta, promociones y páginas públicas |
| `feature/caja` | Venta directa, cobros, comprobantes, apertura y cierre |
| `feature/administracion` | Dashboard, productos, promociones, clientes, usuarios, inventario, proveedores, reportes y configuración |
| `feature/pedidos-cocina-delivery` | Carrito, checkout, confirmación, seguimiento, cocina y reparto |

Crear las cinco ramas desde el mismo commit de la base, cuando esté publicado en `dev`. Cada persona realiza sus propios commits de avance y abre un pull request hacia `dev`. No se contempla el rol mesera.

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feature/login
```


