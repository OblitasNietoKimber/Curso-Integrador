# Curso Integrador — Leñas y Sabores

Base común del equipo. `Front/` contiene React + TypeScript + Vite; `Backend/` contiene la API REST en Spring Boot con persistencia en PostgreSQL.

---

## 1. Módulo Implementado: Inicio, Catálogo, Promociones y Carrito Básico

Rama: `feature/inicio-catalogo`

### Funcionalidades implementadas

- **Página de Inicio (`/`)**:
  - Hero interactivo con carrusel de diapositivas responsive y accesibilidad por teclado.
  - Sección de especialidades con navegación directa por categoría a la carta.
  - Presentación de promociones destacadas dinámicas obtenidas desde la API del backend.
  - Barra de beneficios (delivery, salón, recojo, métodos de pago, promociones).
  - Pie de página completo adaptado a los módulos vigentes.

- **Catálogo de Productos - Carta (`/carta`)**:
  - Listado dinámico de productos servido desde PostgreSQL.
  - Filtros interactivos por categoría (Pollo, Parrillas, Combos, Chaufas, Saltados, Acompañamientos, Bebidas, Salsas).
  - Filtro por tamaño de porción (Todos, Individual, Para compartir, Familiar).
  - Búsqueda en tiempo real por nombre y descripción.
  - Ordenamiento por popularidad, menor precio, mayor precio y novedades.
  - Modal de detalle del producto con selector de cantidad.
  - Botón de agregar directo al carrito con notificación flotante sincronizada.
  - Estados visuales de carga, catálogo vacío y manejo de errores HTTP.

- **Promociones (`/promociones`)**:
  - Catálogo de ofertas de temporada dinámicas consultadas a la base de datos.
  - Visualización de precios promocionales, precio tachado anterior y cálculo de ahorro ("Ahorras S/ ...").
  - Insignias visuales (`EDICIÓN HALLOWEEN`, `LA MÁS PEDIDA`, `SOLO POR TEMPORADA`).
  - Filtros por tipo de oferta y búsqueda.
  - Selector de cantidades y agregado directo al carrito.

- **Carrito de Compras Básico (`/carrito`)**:
  - Visualización detallada de artículos agregados (imagen, nombre, descripción, precio unitario).
  - Subtotal calculado por producto y total general.
  - Control de cantidad (+ y -) con validación entre 1 y 99.
  - Eliminación de productos individuales y botón para vaciar el carrito completo.
  - Indicador flotante con contador en la barra de navegación y navegación inferior móvil.
  - Sincronización bidireccional entre memoria, almacenamiento local (`localStorage`) y backend (`PostgreSQL`).
  - Identificador anónimo de carrito (`X-Carrito-Id`) para funcionar sin necesidad de inicio de sesión.
  - Validación de precios en el servidor para impedir manipulación desde el cliente.

- **Navegación adaptada**:
  - Barra superior (`BarraNavegacion.tsx`) con accesos funcionales a: Inicio, Carta, Promociones y Carrito.
  - Se retiraron las secciones fuera de alcance: *Nosotros*, *Locales*, *Contacto* y flujos de autenticación (asignados a otros integrantes).
  - Barra inferior móvil (`NavegacionInferior.tsx`) con contador numérico sincronizado.

---

## 2. Ejecutar el Frontend

Requiere **Node.js 22.12** o superior y **npm**.

```bash
cd Front

# Instalar dependencias
npm ci

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173/`.

### Variables de entorno del Frontend

Crear un archivo `.env` en `Front/` si se desea personalizar:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Comprobaciones de calidad

```bash
cd Front

# Verificación de tipos TypeScript estricto
npm run typecheck

# Análisis de código con Oxlint
npm run lint

# Compilación para producción
npm run build
```

---

## 3. Ejecutar el Backend

Requiere **Java 17** o superior (probado con Java 24) y **PostgreSQL 17** en ejecución.

```bash
cd Backend

# Compilar proyecto
./mvnw clean compile    # Linux / macOS
.\mvnw.cmd clean compile # Windows

# Ejecutar pruebas automatizadas
./mvnw test
.\mvnw.cmd test

# Iniciar la aplicación Spring Boot
./mvnw spring-boot:run
.\mvnw.cmd spring-boot:run
```

El backend se iniciará en `http://localhost:8080/`.

---

## 4. Configuración de PostgreSQL y Carga Inicial

### Crear la base de datos

En el gestor o terminal de PostgreSQL:

```sql
CREATE DATABASE lenas_sabores;
```

### Variables de entorno del Backend

Por defecto, el backend busca conectarse a `localhost:5432/lenas_sabores` con usuario `postgres`. Se pueden sobreescribir mediante variables de entorno del sistema:

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Cadena JDBC de conexión | `jdbc:postgresql://localhost:5432/lenas_sabores` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de base de datos | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña del usuario | `admin` |
| `PORT` | Puerto de escucha HTTP | `8080` |

### Carga automática e idempotente de datos iniciales

La aplicación incorpora la clase `CargadorDatosIniciales` (`CommandLineRunner`), la cual lee `datos/catalog.json` e inserta automáticamente:
- **8 categorías**
- **96 productos oficiales**
- **9 promociones de temporada**

Si las tablas ya contienen registros, la carga se omite para evitar duplicados.

---

## 5. Endpoints REST del Backend

Todos los endpoints responden en formato JSON:

### Categorías (`/api/categorias`)
- `GET /api/categorias`: Lista todas las categorías activas ordenadas.
- `GET /api/categorias/{id}`: Obtiene el detalle de una categoría por su identificador.

### Productos (`/api/productos`)
- `GET /api/productos`: Lista productos activos con parámetros opcionales de filtro:
  - `categoria` (ej. `pollo`, `parrillas`, `combos`, etc.)
  - `tamano` (ej. `individual`, `compartir`, `familiar`)
  - `buscar` (búsqueda insensible a mayúsculas en nombre y descripción)
  - `orden` (`popular`, `precio_asc`, `precio_desc`, `nuevo`)
- `GET /api/productos/destacados`: Lista los 6 productos de mayor popularidad.
- `GET /api/productos/{id}`: Consulta un producto por su identificador.

### Promociones (`/api/promociones`)
- `GET /api/promociones`: Lista promociones vigentes con filtros opcionales (`categoria`, `buscar`).
- `GET /api/promociones/destacadas`: Obtiene las promociones principales para la página de inicio.
- `GET /api/promociones/{id}`: Consulta una promoción por identificador.

### Carrito Básico (`/api/carrito`)
Cabecera admitida en todas las operaciones: `X-Carrito-Id: <uuid_del_carrito>` (o parámetro `?carritoId=...`).

- `GET /api/carrito`: Obtiene el contenido actual del carrito o genera uno nuevo si no existe.
- `POST /api/carrito/items`: Agrega o incrementa un producto en el carrito (`{ "productoId": "pollo-01", "cantidad": 2 }`).
- `PUT /api/carrito/items/{productoId}`: Actualiza la cantidad exacta de un producto (`{ "cantidad": 3 }`).
- `DELETE /api/carrito/items/{productoId}`: Elimina un producto específico del carrito.
- `DELETE /api/carrito`: Vacía completamente el carrito.

---

## 6. Alcance y Funcionalidades Excluidas

Siguiendo la distribución de responsabilidades del equipo:

- **Incluido en esta entrega**:
  - Inicio visual y dinámico.
  - Catálogo (Carta) con búsqueda, filtros y ordenamiento.
  - Promociones vigentes con cálculo de ahorros.
  - Carrito de compras básico con agregación, modificación de cantidades, cálculo de totales y persistencia sin login.
  - Servicios REST y persistencia en PostgreSQL para productos, categorías, promociones y carritos.

- **Expresamente fuera de alcance (asignado a otras ramas)**:
  - Checkout, confirmación de pedidos y pagos (`feature/pedidos-cocina-delivery`).
  - Pasarelas de pago y facturación (`feature/caja`).
  - Autenticación, login, registro y perfiles de usuario (`feature/login`).
  - Paneles administrativos de inventario y gestión (`feature/administracion`).
