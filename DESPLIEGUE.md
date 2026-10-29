# Desplegar feature/kitchen en Render y Vercel

Backend: Spring Boot en Docker + PostgreSQL de Render. Frontend: Vite en Vercel.
Estos archivos preparan el despliegue; no crean recursos ni publican el proyecto.

## 1. Preparar la rama

Los archivos deben estar en GitHub, en `feature/kitchen`, antes de desplegar.
También deben incluirse las correcciones de pagos que aún estén sin commit.
No subir `Backend/.env` ni los cambios personales de
`Backend/src/main/resources/application.properties`.

El Dockerfile excluye esa configuración local y usa
`Backend/deployment/application.properties`, que solo recibe secretos por
variables de entorno. No usa el perfil `caja-local` ni crea cuentas de prueba.

## 2. Render

1. Conectar `OblitasNietoKimber/Curso-Integrador` y crear un **Blueprint**.
2. Seleccionar la rama **feature/kitchen** y el archivo **render.yaml** de la raíz.
3. Revisar los recursos y planes antes de confirmar. El archivo propone planes
   gratuitos; revisar sus límites y vigencia en Render.
4. Completar **FRONTEND_URL** con la URL HTTPS de Vercel, sin barra final:
   `https://TU-PROYECTO.vercel.app`. Se puede reservar primero el proyecto en Vercel
   y desplegarlo después de obtener la URL del backend.
5. Render conecta automáticamente DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD
   a la nueva base `lys-kitchen-db`. No usar `localhost` ni una URL `postgres://`
   en lugar de estos campos. El contenedor construye la conexión JDBC con SSL.
6. Render genera **TOTP_ENCRYPTION_KEY**. Conservarla si se activa segundo factor;
   si se importa una base existente con 2FA, usar su clave original.
7. Esperar a que `/api/categorias` responda correctamente y copiar la URL pública
   HTTPS del servicio. El nombre sugerido es `lys-kitchen-api`, pero Render puede
   asignar una URL diferente.

El contexto Docker es `Backend`, el archivo es `Backend/Dockerfile`, y la imagen
usa Java 17. El backend escucha el puerto que Render indica con `PORT`.
Los despliegues automáticos están desactivados: usar **Manual Deploy** al actualizar.

La base de la nube es independiente de tu PostgreSQL local. Se crearán las tablas
y el catálogo por los mecanismos actuales del proyecto. Usuarios, pedidos e
historial locales no se transfieren automáticamente. Usar exportación/importación
si se necesitan esos datos. Las cuentas nuevas tienen rol CLIENTE; los roles de
personal deben asignarse por el procedimiento del proyecto en la base de Render.

## 3. Vercel

1. En `Front/vercel.json`, reemplazar las tres apariciones de
   `https://lys-kitchen-api.onrender.com` por la URL REAL del servicio de Render.
   No es una URL verificada ni un servicio creado por estos archivos.
2. Importar el mismo repositorio en Vercel.
3. Elegir **Root Directory: Front**, framework **Vite** y Node.js **22.x** o **24.x**.
4. En la configuración Git del proyecto, establecer **Production Branch:
   feature/kitchen**. Seleccionar la rama al importar no sustituye este ajuste.
5. Configurar **VITE_API_BASE_URL=/api** para Production. No poner la URL de Render
   en esta variable: el proxy de `vercel.json` mantiene las cookies bajo el dominio
   del frontend. No poner contraseñas ni secretos en variables `VITE_*`.
6. Desplegar. El archivo configura `npm ci`, `npm run build` y salida `dist`.
7. Si la URL definitiva de Vercel cambia, actualizar **FRONTEND_URL** en Render y
   reiniciar el servicio. Para otros dominios autorizados, configurar
   **ALLOWED_ORIGINS** con URLs exactas separadas por comas, sin barra final.

Las peticiones `/api`, `/oauth2` y `/login/oauth2` van a Render. Las rutas como
`/cocina/historial`, `/caja` y `/mi-cuenta` cargan `index.html` al recargar.
Las respuestas de la API no deben almacenarse en caché. La sesión sigue usando
cookies HttpOnly, Secure y SameSite=Lax, junto con CSRF.

## Funciones opcionales

- Google: en Render definir GOOGLE_LOGIN_ENABLED=true, GOOGLE_CLIENT_ID y
  GOOGLE_CLIENT_SECRET. En Google registrar exactamente
  `https://TU-PROYECTO.vercel.app/login/oauth2/code/google`. La configuración del
  contenedor toma ese callback desde FRONTEND_URL; puede sobrescribirse con
  GOOGLE_REDIRECT_URI. Nunca colocar el secreto en Vercel/VITE_*.
- Recuperación de contraseña: configurar SMTP_HOST, SMTP_PORT, SMTP_USERNAME,
  SMTP_PASSWORD, MAIL_FROM y PASSWORD_RESET_ENABLED=true en Render.
- Los pagos digitales actuales son registros de demostración. Publicar el sitio
  no integra cobros bancarios: no usar ese flujo para aceptar pagos reales sin
  confirmación del proveedor desde el servidor.

## Comprobación

1. Abrir `https://TU-PROYECTO.vercel.app/api/categorias` y comprobar que devuelve
   JSON del backend, no HTML.
2. Iniciar sesión y recargar una ruta privada. Comprobar persistencia de la sesión
   y que los cambios de estado no devuelvan errores CSRF.
3. Confirmar un pedido, aceptarlo en Cocina, marcarlo listo y revisar Caja.
4. Abrir y recargar directamente `/cocina/historial` para comprobar las rutas SPA.

Las sesiones están en memoria: se pierden al reiniciar o suspender el backend.
Mantener una sola instancia hasta incorporar un almacén de sesiones compartido.

## Construir la imagen localmente (opcional)

Desde la raíz del repositorio:

```powershell
docker build -t lys-kitchen-api ./Backend
```

La construcción no necesita conexión a la base de datos. Para ejecutar el
contenedor se necesitan DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD y
FRONTEND_URL de un servidor PostgreSQL accesible con SSL; no la base temporal
usada para las pruebas.

Referencias oficiales: [Render Blueprint](https://render.com/docs/blueprint-spec),
[Vercel rewrites](https://vercel.com/docs/routing/rewrites),
[Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).
