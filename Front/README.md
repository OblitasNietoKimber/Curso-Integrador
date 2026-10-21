# Frontend — Leñas y Sabores

React + TypeScript + Vite conectado al backend Spring Boot. El diseño de login y registro conserva la imagen de fondo, letras superpuestas, logo, colores y tipografías existentes.

```bash
npm ci
npm run dev
```

Iniciar también el backend según [su guía](../Backend/README.md). Vite reenvía `/api` al puerto 8080. Para otro servidor, configurar `VITE_API_BASE_URL` antes de compilar.

- `npm run typecheck`: comprobar TypeScript.
- `npm run lint`: analizar el código.
- `npm run build`: compilar.

## Acceso y cuenta

- `/iniciar-sesion`: acceso real, mostrar clave y recordarme.
- `/registrarse`: crea un cliente y luego inicia su sesión.
- `/recuperar-contrasena`: solicita un correo; requiere SMTP configurado en Spring Boot.
- `/restablecer-contrasena?token=...`: nueva clave mediante enlace válido.
- `/mi-cuenta`: requiere una sesión válida.
- `/mi-cuenta/datos`, `/direcciones`, `/metodos-pago`, `/notificaciones`: persistencia en PostgreSQL a través de `/api/account`.
- `/mi-cuenta/favoritos` y `/mi-cuenta/pedidos`: integración pendiente con sus módulos.

Las cookies de sesión las gestiona el navegador. No se guardan contraseñas ni tokens de sesión en localStorage. Si el servidor rechaza una operación, se muestra el error y no se confirma un guardado que haya fallado. Los botones de Google siguen pendientes de OAuth. Se conservan las páginas y servicios de catálogo, promociones y carrito incorporados de `dev`.
