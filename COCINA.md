# Cocina

Implementado en `feature/kitchen`, creada desde `dev`. Interfaz adaptada de
`PaginaWebLYS`, rama `dev`, commit `1fc1ddf56c3cbab3b6c0500d464b16a9f28a49ab`.

## Acceso y pantallas

- `/cocina`: tablero de nuevos, en preparación y listos.
- `/cocina/pedidos`: pedidos entrantes con búsqueda y filtros.
- `/cocina/tiempos`: tiempos, alertas y gráficos calculados con pedidos reales.
- `/cocina/historial`: pedidos entregados o cancelados, filtros y exportación.

Acceso con roles `COCINA` o `ADMINISTRADOR`. Las cuentas de Cocina acceden al
panel al iniciar sesión. También se puede usar `/iniciar-sesion?destino=cocina`.
No se crean cuentas ni pedidos de demostración.

## Integración

Se reutiliza Spring Boot, JPA y la conexión PostgreSQL del proyecto, sin cambiar
archivos de configuración o credenciales. Los pedidos se guardan en
`caja_pedidos` y sus productos en `caja_lineas`; Caja y Cocina consultan los mismos
registros. El esquema se amplía mediante el mecanismo existente de Hibernate
(`spring.jpa.hibernate.ddl-auto=update`). Se conservan los pedidos anteriores;
los que no tienen estado se presentan como recibidos.

El checkout registra pedidos reales mediante `POST /api/pedidos`, validando
productos, promociones, cantidades, disponibilidad y precios en el servidor.
El envío Delivery cuesta S/ 5, como en el checkout existente. La confirmación
usa el código, la fecha y los importes devueltos por el backend. Reintentar una
misma solicitud no duplica el pedido ni el pago.

En este checkout local, Yape, Plin y tarjeta registran automáticamente un pago
en `caja_pagos` y marcan el pedido como pagado. Efectivo queda pendiente para
Caja. El backend valida el método y exige una referencia de seis dígitos para
Yape/Plin; calcula el importe del catálogo y descuenta stock una sola vez. Los
pagos web no requieren turno abierto ni alteran su efectivo (`turno_id` nulo).
Esto es un registro local: no se integra una pasarela ni se verifican o ejecutan
cargos bancarios. Para producción se necesita confirmación del proveedor desde
el servidor antes de establecer `pagado`.

`GET /api/cocina` devuelve los pedidos. `POST /api/cocina/pedidos/{id}/estado`
recibe `{ "esperado": "Recibido", "estado": "En preparación" }`.
Se exige sesión, rol y CSRF. El servidor bloquea el pedido mientras cambia su
estado y rechaza transiciones obsoletas con 409. Cocina puede aceptar y marcar
listo; Administración puede pasar de Listo a Entregado. No hay acciones de
cancelación ni reparto nuevas.

Las fechas de aceptación, preparación y entrega quedan persistidas. El panel
consulta cambios cada 10 segundos e incluye actualización manual y errores
visibles. La meta visual es 25 minutos. Componentes en
`Front/src/components/cocina`, acceso al backend en `Front/src/services`, CSS en
`Front/src/styles` y backend en el paquete `cocina`.

## Flujo de Carta, Cocina y Caja

**Carta → carrito confirmado → Cocina → listo para Caja → cobro**.
Caja solo muestra para cobrar los pedidos listos (también admite los que ya
están en reparto o entregados). El servidor rechaza cobros de pedidos recibidos
o en preparación. Las ventas creadas desde Caja también se envían primero a
Cocina. Un pedido pagado sigue visible y puede aceptarse y prepararse; al estar
listo pasa al historial, sin requerir otro cobro en Caja. El seguimiento del
cliente muestra pago y preparación por separado. Cobrar no declara la entrega.

La confirmación del cliente muestra el seguimiento y consulta cada 10 segundos
`GET /api/pedidos/{id}`. Solo el usuario que creó ese pedido puede consultarlo.
Las tarjetas muestran imágenes del catálogo, cantidades totales de platos y
tiempos legibles en horas o días para pedidos antiguos; no se alteran sus fechas.

## Verificación

En `Front`: `npm ci`, `npm run build`, `npm run lint`.
En `Backend`: `./mvnw.cmd test`.

`CocinaIntegracionTest` cubre permisos, CSRF, transiciones, fechas, conflictos,
precios del servidor e idempotencia del checkout. Por defecto usa H2 en modo
PostgreSQL. Para ejecutarlo contra una base PostgreSQL de pruebas **vacía y
separada de los datos locales**, definir solo en el proceso:
`COCINA_TEST_URL`, `COCINA_TEST_DRIVER=org.postgresql.Driver`,
`COCINA_TEST_USER`, `COCINA_TEST_PASSWORD`, y ejecutar
`./mvnw.cmd -Dtest=CocinaIntegracionTest test`.
