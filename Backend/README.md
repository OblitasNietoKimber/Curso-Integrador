# Backend — Leñas y Sabores

Spring Boot 4.1.1, Java 17 y PostgreSQL. Conserva el catálogo y carrito de `dev` e incorpora autenticación y Mi cuenta.

## Iniciar

1. Instalar Java 17 y PostgreSQL. Crear una base vacía:

```sql
CREATE DATABASE lenas_sabores;
```

2. Dentro de `Backend/`, copiar `.env.example` como `.env` y configurar usuario y contraseña de PostgreSQL. Spring importa este archivo al iniciar desde esa carpeta. No subir `.env` a Git. Se pueden usar variables de entorno en su lugar.
3. Ejecutar desde `Backend/`:

```bash
./mvnw spring-boot:run
```

En PowerShell: `.\mvnw.cmd spring-boot:run`. En Linux, si falta permiso de ejecución, `bash mvnw spring-boot:run`.

4. En otra terminal, desde `Front/`: `npm ci` y `npm run dev`. Vite reenvía `/api` a `http://localhost:8080`. No abrir el frontend como un archivo HTML.

Flyway aplica `V1__usuarios_y_recuperacion.sql` para las tablas `usuarios` y `recuperaciones`. Si ya existe un esquema del catálogo, se establece su línea base en 0 sin borrar sus tablas. Se mantiene `ddl-auto=update` que ya usa el catálogo. No se crean cuentas de prueba ni administradores automáticamente: el registro público asigna siempre `CLIENTE`.

## API de autenticación

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/auth/csrf` | Obtener token CSRF y nombre de cabecera |
| POST | `/api/auth/register` | Crear cliente: `name`, `email`, `phone` internacional, `password`, `termsAccepted` |
| POST | `/api/auth/login` | Iniciar sesión: `email`, `password`, `remember` |
| GET | `/api/auth/me` | Usuario de la sesión actual |
| POST | `/api/auth/logout` | Invalidar la sesión actual |
| POST | `/api/auth/password` | Cambiar clave con `previous` y `next`; invalida las sesiones anteriores |
| POST | `/api/auth/forgot-password` | Solicitar recuperación con `email` |
| POST | `/api/auth/reset-password` | Restablecer con `token` y `password` |
| GET / PUT | `/api/account` | Leer / guardar los datos de la cuenta autenticada |

Las peticiones usan la cookie `LYSSESSION` HttpOnly y `credentials: include`. Antes de un POST/PUT/DELETE se obtiene `/api/auth/csrf` y se devuelve su token en la cabecera indicada. Se renueva el token después del login. Una petición sin CSRF válido se rechaza con 403. Las sesiones normales duran 30 minutos de inactividad; «Recordarme» establece cookie persistente y sesión de 7 días de inactividad. Se pierden al reiniciar el servidor, porque se almacenan en memoria.

Las contraseñas se guardan con BCrypt, nunca se devuelven por API y se validan de 8 caracteres a 72 bytes UTF-8. El login cambia el identificador de sesión. El cambio o recuperación de contraseña incrementa la versión de sesión para invalidar accesos anteriores. Los endpoints públicos de acceso y recuperación tienen un límite local de 60 solicitudes por IP y ruta cada 15 minutos; para varias instancias se debe sustituir por un limitador compartido.

`/api/account` identifica al propietario desde la sesión: no recibe un ID de usuario editable. Guarda perfil, foto, direcciones, referencias de tarjetas y preferencias. Solo admite marca y últimos cuatro dígitos de tarjeta, nunca PAN completo ni CVV. El cambio de correo no está habilitado porque requiere un flujo de verificación adicional. Las notificaciones, favoritos y pedidos se integran con sus módulos; aquí no se fabrican registros.

## Recuperación por correo

Configurar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`, `MAIL_FROM` y `FRONTEND_URL`. Después activar `PASSWORD_RESET_ENABLED=true`. El remitente debe estar autorizado por el proveedor SMTP.

El enlace apunta a `/restablecer-contrasena?token=...`, dura 30 minutos y solo sirve una vez. En la base se almacena únicamente su hash SHA-256. Solicitar otro enlace invalida el anterior. El API no devuelve ni registra el token. Los correos desconocidos reciben la misma respuesta genérica. Cuando el correo no está habilitado se responde 503; no se simula un envío.

Google OAuth y verificación del correo al registrarse quedan pendientes de configuración e implementación. Los botones de Google informan de que todavía no están disponibles.

## Despliegue

Usar HTTPS y `SESSION_COOKIE_SECURE=true`. Configurar `ALLOWED_ORIGINS` con los orígenes exactos del frontend y `FRONTEND_URL` con su URL real. Preferir frontend y API bajo el mismo sitio; la cookie SameSite=Lax no admite un despliegue en sitios externos distintos sin adaptar la configuración. Para la URL de API, el frontend admite `VITE_API_BASE_URL`.

## Pruebas

```bash
./mvnw test
```

Las pruebas usan H2 en modo PostgreSQL (`application-test.properties`), aplican la migración y no acceden a tu base local. Cubren registro, rol fijo, hash, duplicados, CSRF real, login, cierre de sesión, separación entre usuarios, persistencia de cuenta, cambio y recuperación de clave, tokens vencidos y tokens reutilizados. Incluyen las pruebas existentes del catálogo. La configuración Mockito usa mocks por subclase para evitar depender de la auto-adjunción de agentes JVM.
