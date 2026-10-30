# Release 1.0.0

Primera entrega integrada de Leñas y Sabores, preparada desde `dev`.

## Funcionalidades incluidas

- Inicio, catálogo, promociones y carrito persistente.
- Registro, inicio de sesión, Google OAuth, recuperación y segundo factor.
- Pedidos web, seguimiento y registro de pagos digitales.
- Caja: turnos, cobros, comprobantes y reembolsos.
- Cocina: preparación de pedidos y estado de pago.
- Administración de productos, promociones, clientes, usuarios y configuración.
- Dashboard y reportes de ventas.
- Configuración de despliegue con Docker, Render y Vercel.

## Flujo de publicación

`dev` → `release/1.0.0` → `main` → etiqueta `v1.0.0`.

La rama `dev` recibe la integración de `main` al finalizar para conservar
la versión publicada en el historial de desarrollo.

## Ejecución y despliegue

Consultar `README.md`, `Backend/README.md` y `DESPLIEGUE.md` para requisitos,
variables de entorno, base de datos y persistencia de imágenes.
