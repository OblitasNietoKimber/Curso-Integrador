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

Cambiar el nombre de la rama según el módulo asignado. Si la rama ya existe, usar `git switch nombre-de-rama`.

## Organización del frontend

- `src/App.tsx`: punto de composición de las futuras pantallas.
- `src/main.tsx`: arranque e importación de estilos compartidos.
- `src/styles/tokens.css`: fuentes y variables visuales.
- `src/styles/global.css`: reglas globales y botón común.
- `public/fonts/`: tipografías con sus licencias.
- `public/images/logo.webp`: logo original.

Al desarrollar un módulo, colocar sus componentes y estilos en `src/features/<modulo>/`. Reservar `src/components/` para componentes reutilizables y `src/services/` para futuras llamadas al backend. Las carpetas se crean cuando tengan contenido. Coordinar los cambios de `App.tsx`, dependencias y estilos globales para reducir conflictos.

## Identidad visual

Se conserva la identidad del repositorio [PaginaWebLYS](https://github.com/OblitasNietoKimber/PaginaWebLYS), referencia `feature/prototipo-visual` en el commit `ada4a837750b83e6ec6c3ebaada6e9690c00555b`.

| Uso | Fuente o recurso |
| --- | --- |
| Texto e interfaces generales | DM Sans, respaldo Arial |
| Frases manuscritas | Caveat |
| Títulos destacados del inicio | Knewave |
| Logo | `/images/logo.webp`, sin redibujar ni recolorear |
| Favicon | Llama original `/favicon.svg` |

El panel operativo anterior usaba Arial; puede conservarse dentro de ese módulo. Knewave y Caveat se aplican solo donde corresponde, no a todos los encabezados. Las tres fuentes se sirven localmente, sin Google Fonts.

| Variable CSS | Valor original |
| --- | --- |
| `--red` | `#ed0000` |
| `--button-red` | `#ce0014` |
| `--muted` | `#5d7097` |
| `--placeholder` | `#667795` |
| `--input-border` | `#dce1ec` |
| `--line` | `#adbbd4` |
| `--focus` | `#24487d` |
| `--home-cream` | `#fcf6ee` |
| Texto / fondo | `#08080b` / `#fff` |
| Radios de tarjetas / campos | `16px` / `8px` |

Usar `var(--font-body)`, `var(--font-script)` y `var(--font-display)` para las tipografías. El botón `.primary-button` y el enlace `.text-link` mantienen las reglas comunes anteriores. Los estilos específicos de login, catálogo, caja, etc. se desarrollan en sus ramas. Las imágenes de productos y banners se incorporan con el módulo que las necesite.
