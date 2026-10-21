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

Flyway aplica V1–V4: usuarios y recuperación, identidad Google, segundo factor y separación de roles/clientes. Si ya existe un esquema del catálogo, se establece su línea base en 0 sin borrar sus tablas. Se mantiene `ddl-auto=update` que ya usa el catálogo. No se crean cuentas de prueba ni administradores automáticamente: el registro público asigna siempre `CLIENTE`.

## Usuarios, roles y clientes

| Tabla | Responsabilidad |
| --- | --- |
| `roles` | Catálogo: CLIENTE, ADMINISTRADOR, CAJA, COCINA y DELIVERY. Se inicializa por migración. |
| `usuarios` | Todas las cuentas: nombre de identificación, correo único, hash de contraseña, identidad Google, segundo factor, estado y `id_rol` como clave foránea. |
| `clientes` | Perfil comercial: nombre, teléfono, foto, documento, nacimiento, género y notas. Direcciones, referencias de pago y preferencias se conservan en `cuenta`, sin duplicar el perfil ni las credenciales. |

`clientes.id_usuario` es opcional y único. Un cliente con cuenta tiene un usuario y un cliente relacionado; un cliente presencial puede existir sin cuenta. El personal puede tener únicamente usuario. Si se elimina un usuario, el cliente se conserva con `id_usuario = NULL`; no se eliminan sus datos comerciales automáticamente.

El registro público, tanto con contraseña como con Google, crea usuario con rol CLIENTE y su cliente en una misma transacción. El acceso repetido por Google reutiliza ambos registros. Los roles del personal no pueden elegirse desde el formulario de registro. La autenticación y Seguridad siguen disponibles para el personal; el perfil comercial de Mi cuenta es exclusivo de clientes. Las pantallas operativas de cada rol corresponden a sus módulos.

La migración Java `V4__roles_y_clientes` mueve automáticamente los perfiles existentes de usuarios CLIENTE, conservando sus IDs de acceso, correos, contraseñas, Google, segundo factor y versiones de sesión. Mantiene también los roles del personal y retira de usuarios las columnas antiguas `rol`, `telefono` y `cuenta` tras trasladar la información del cliente. El nombre de identificación se mantiene en usuarios conforme al modelo físico. No crear ni modificar estas tablas manualmente; reiniciar el backend aplica la migración. No requiere cambios adicionales en `.env`. En una base con datos, hacer una copia antes de actualizar.

Para revisar las relaciones en pgAdmin:

```sql
SELECT u.id, u.email, r.nombre AS rol,
       c.id AS id_cliente, c.nombre, c.telefono
FROM public.usuarios u
JOIN public.roles r ON r.id_rol = u.id_rol
LEFT JOIN public.clientes c ON c.id_usuario = u.id;
```

Las pruebas de separación incluyen actualización desde V3 con datos existentes, preservación de seguridad, registro normal/Google, personal sin perfil de cliente, cliente sin cuenta y restricciones de claves foráneas y unicidad. Se ejecutan sobre H2 en modo PostgreSQL, sin acceder a la base local del usuario.

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

`/api/account` es exclusivo de usuarios con rol `CLIENTE` e identifica al propietario desde la sesión: no recibe un ID de usuario editable. Guarda perfil, foto, direcciones, referencias de tarjetas y preferencias. Solo admite marca y últimos cuatro dígitos de tarjeta, nunca PAN completo ni CVV. El cambio de correo no está habilitado porque requiere un flujo de verificación adicional. Las notificaciones, favoritos y pedidos se integran con sus módulos; aquí no se fabrican registros.

## Recuperación por correo

Configurar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`, `MAIL_FROM` y `FRONTEND_URL`. Después activar `PASSWORD_RESET_ENABLED=true`. El remitente debe estar autorizado por el proveedor SMTP.

El enlace apunta a `/restablecer-contrasena?token=...`, dura 30 minutos y solo sirve una vez. En la base se almacena únicamente su hash SHA-256. Solicitar otro enlace invalida el anterior. El API no devuelve ni registra el token. Los correos desconocidos reciben la misma respuesta genérica. Cuando el correo no está habilitado se responde 503; no se simula un envío.

La verificación por correo de los registros con contraseña sigue pendiente. El acceso con Google se configura como se indica abajo.

## Despliegue

Usar HTTPS y `SESSION_COOKIE_SECURE=true`. Configurar `ALLOWED_ORIGINS` con los orígenes exactos del frontend y `FRONTEND_URL` con su URL real. Preferir frontend y API bajo el mismo sitio; la cookie SameSite=Lax no admite un despliegue en sitios externos distintos sin adaptar la configuración. Para la URL de API, el frontend admite `VITE_API_BASE_URL`.

## Pruebas

```bash
./mvnw test
```

Las pruebas usan H2 en modo PostgreSQL (`application-test.properties`), aplican la migración y no acceden a tu base local. Cubren registro, rol fijo, hash, duplicados, CSRF real, login, cierre de sesión, separación entre usuarios, persistencia de cuenta, cambio y recuperación de clave, tokens vencidos y tokens reutilizados. Incluyen las pruebas existentes del catálogo. La configuración Mockito usa mocks por subclase para evitar depender de la auto-adjunción de agentes JVM.


## Iniciar sesión con Google

1. En [Google Cloud Console](https://console.cloud.google.com/), crear o seleccionar un proyecto y configurar Google Auth Platform (nombre de la aplicación, correo de soporte y audiencia). Si está en modo de prueba, agregar las cuentas de los integrantes como usuarios de prueba.
2. Crear un cliente OAuth de tipo **Aplicación web**. En **URIs de redirección autorizados** registrar exactamente:

```text
http://localhost:5173/login/oauth2/code/google
```

3. Completar `Backend/.env` con el ID y secreto de ese cliente:

```properties
GOOGLE_LOGIN_ENABLED=true
GOOGLE_CLIENT_ID=tu-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-secreto
GOOGLE_REDIRECT_URI=http://localhost:5173/login/oauth2/code/google
FRONTEND_URL=http://localhost:5173
```

4. Reiniciar Spring Boot y Vite. Abrir la web usando **localhost:5173** y pulsar «Continuar con Google». Vite reenvía `/oauth2` y `/login/oauth2` al backend. Usar el mismo host durante todo el flujo: no alternar entre `localhost` y `127.0.0.1`.

El flujo usa OpenID Connect y código de autorización. Spring verifica firma, emisor, audiencia, estado, nonce y vigencia; el secreto y el intercambio de código permanecen en el servidor. Solo se solicitan `openid`, `email` y `profile`. El identificador de la cuenta es el `sub` de Google, persistido con la migración V2. Se exige correo verificado y las cuentas nuevas reciben `CLIENTE`. No se inventa una contraseña local ni se solicita teléfono a Google. El usuario completa el celular desde Mis datos cuando lo necesite.

Si ya existe una cuenta local con el mismo correo, se debe entrar con su contraseña. La vinculación manual de Google fue retirada; no se fusionan cuentas automáticamente.

Cuando Google está desactivado, el backend inicia normalmente y el botón muestra un aviso de configuración. Si se activa sin credenciales, el arranque indica qué variables faltan. No se necesita añadir secretos al frontend. En producción, registrar el callback HTTPS exacto del dominio público de la aplicación y configurar la ruta de proxy correspondiente.

Las pruebas de Google usan un proveedor local que firma tokens de prueba. Comprueban creación de cliente, acceso repetido por `sub`, segundo factor obligatorio, ausencia de vinculación manual, cuenta deshabilitada, correo sin verificar, firma/audiencia/vigencia inválidas, estado ausente y cancelación. No usan credenciales reales ni llaman a Google.

## Seguridad y Google Authenticator

**Mi cuenta → Seguridad** contiene el cambio de contraseña y la verificación en dos pasos. Mis datos conserva únicamente la información del perfil. El navbar de autenticación contiene Inicio, Carta y Promociones.

Antes de activar Authenticator, generar una clave aleatoria de 32 bytes en PowerShell:

```powershell
$totpBytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($totpBytes)
[Convert]::ToBase64String($totpBytes)
```

Copiar el resultado a `Backend/.env` y reiniciar Spring Boot:

```dotenv
TOTP_ENCRYPTION_KEY=resultado-del-comando
```

Conservar esta clave de forma segura: cifra los secretos TOTP con AES-256-GCM. Cambiarla impide verificar las cuentas ya configuradas. Sin ella la web informa que la configuración está pendiente y no permite activar 2FA; no hay una clave predeterminada en el repositorio.

1. Iniciar sesión recientemente (menos de cinco minutos), entrar en Seguridad y pulsar Activar Google Authenticator.
2. Escanear el QR desde la app o introducir la clave manualmente, eligiendo códigos basados en tiempo.
3. Confirmar un código de seis dígitos. Hasta confirmarlo, la protección sigue desactivada. El alta pendiente vence en diez minutos.
4. Guardar los ocho códigos de recuperación mostrados una sola vez. Se pueden descargar; cada uno sirve una sola vez y el servidor conserva únicamente sus hashes SHA-256.
5. Los siguientes accesos, tanto con contraseña como con Google, quedan pendientes hasta verificar un código. El desafío vence en cinco minutos y admite cinco intentos. CSRF y el límite de solicitudes también se aplican.

Se utiliza TOTP según RFC 6238 (SHA-1, seis dígitos, 30 segundos, tolerancia de un periodo). Los códigos usados se rechazan con un contador protegido mediante bloqueo de fila. Activar o desactivar la protección revoca las demás sesiones; desactivar exige un código de la app o de recuperación. Recuperar/cambiar contraseña no elimina el segundo factor. No se necesita un cliente adicional en Google Cloud ni se envían claves a servicios externos para generar el QR.

Endpoints: `GET /api/account/security`, `POST /api/account/security/setup`, `/enable`, `/disable`; `POST /api/auth/2fa/verify` completa el acceso pendiente. La sesión de desafío no tiene permisos para acceder a Mi cuenta. Las pruebas usan H2 en modo PostgreSQL, vectores RFC, activación, cifrado, códigos reutilizados, recuperación de un solo uso, vencimiento, límites de intentos, CSRF y acceso Google con segundo factor.
