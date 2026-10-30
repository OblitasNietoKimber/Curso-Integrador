# Caja — frontend de LYS-Front y backend PostgreSQL

Referencia: `HuamaniAlexander/LYS-Front`, rama `main`, commit `c282e7169bd99170a9d790f6a3d5acf76bbb4b58`. El repositorio solo publica esa rama.

El módulo reemplaza la interfaz anterior por las pantallas de Caja de la referencia: dashboard, cobros, comprobantes, Caja (apertura y cierre) e historial. Se conservan sus componentes, iconos, tablas, formularios, diseño responsive y estilos compartidos. No se incluyen pantallas de administración, cocina, salón ni delivery.

## Conexión PostgreSQL

Completa `Backend/.env` con tu conexión. Hay un ejemplo en `Backend/.env.caja.example`. No reemplaces las demás variables que ya tengas.

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/lenas_sabores
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=tu_contrasena
```

La base debe existir y el usuario debe poder crear las nuevas tablas `caja_*`, como permite la configuración JPA del proyecto. No se eliminan las tablas existentes.

La aplicación y el perfil `caja-local` usan PostgreSQL. Ya no hay un datasource H2 para ejecutar Caja. La dependencia H2 conserva su alcance de **pruebas**, tal como estaba en `dev`, para las pruebas anteriores del equipo; las pruebas de integración nuevas de Caja usan PostgreSQL.

## Ejecutar localmente

Terminal del backend:

```powershell
cd C:\Users\Nando\Curso-Integrador\Backend
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-24'
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=caja-local'
```

Este perfil usa tu conexión PostgreSQL y únicamente crea, si no existe, una cuenta local:

- Correo: `caja.local@lys.test`
- Contraseña: `CajaLocal2026!`

Si ya tienes un usuario con rol CAJA o ADMINISTRADOR puedes iniciar sin ese perfil:

```powershell
.\mvnw.cmd spring-boot:run
```

Terminal del frontend:

```powershell
cd C:\Users\Nando\Curso-Integrador\Front
npm ci
npm run dev
```

Abre http://localhost:5173/caja e inicia sesión con la cuenta del proyecto. Se usan la sesión y protección CSRF existentes, sin un login paralelo ni credenciales HTTP Basic.

## Probar

1. En **Caja → Apertura de caja**, cuenta las denominaciones, verifica el efectivo y confirma la apertura.
2. Para generar una cuenta con productos reales del catálogo, entra a **Nueva Venta**, justo debajo de **Cobros** en el menú lateral. Indica mesa/canal y guarda la cuenta; se abrirá Cobros.
3. En **Cobros**, selecciona la cuenta, registra el pago y verifica el vuelto. El backend calcula importes y descuenta stock al primer cobro.
4. En **Comprobantes**, emite una boleta, factura local o nota de venta. Se conserva la generación PDF de la referencia, con QR y código de barras, vista previa e impresión.
5. En **Historial**, filtra los pagos y exporta a Excel. También se puede exportar el resumen del cierre.
6. En **Caja → Cierre de caja**, cuenta el efectivo y confirma el arqueo. El backend registra esperado, contado y diferencia.

Las cuentas, pagos, turnos, reembolsos y comprobantes persisten en PostgreSQL. La vista vuelve a consultar el servidor después de cada operación y periódicamente. No se guarda una copia operativa en localStorage.

El reembolso solicita un motivo, solo permite pagos del turno abierto y anula su comprobante local. No repone productos ya consumidos; corregir y recobrar la misma cuenta no descuenta stock otra vez.

Los comprobantes son locales y no tienen valor tributario. Los métodos digitales registran una operación confirmada externamente; no ejecutan cargos, devoluciones bancarias ni envío a SUNAT.

## Código

- Frontend: `Front/src/components/caja/`.
- Estilos CSS: `Front/src/styles/`.
- Servicios y utilidades TypeScript: `Front/src/services/`.
- Adaptador de API: `Front/src/services/operationsStore.ts`, reemplaza la persistencia local del frontend de referencia.
- Backend: `Backend/src/main/java/com/LenasLYS/Backend/caja/`.
- Los datos comerciales impresos se configuran con `app.caja.nombre`, `app.caja.direccion`, `app.caja.telefono`, `app.caja.email`, `app.caja.horario` y `app.caja.ruc`.
- Las operaciones usan transacciones y un bloqueo de base de datos para evitar cobros y aperturas duplicados. Una sola caja física.

## Validaciones

```powershell
cd Front
npm run build
npm run lint
```

Las pruebas de Caja requieren una base **de pruebas** PostgreSQL separada, vacía o destinada a pruebas. No deben apuntar a la base de uso normal:

```powershell
$env:CAJA_TEST_URL='jdbc:postgresql://localhost:5432/lenas_caja_test'
$env:CAJA_TEST_USER='postgres'
$env:CAJA_TEST_PASSWORD='contrasena_de_pruebas'
cd Backend
.\mvnw.cmd test
```

Sin `CAJA_TEST_URL` solo se omiten las pruebas PostgreSQL de Caja; las pruebas anteriores del equipo conservan su configuración. La validación realizada en Codex usa una instancia temporal de PostgreSQL 17 separada de tu base, sin cambiar tu conexión ni solicitar tu contraseña.

No se crearon commits ni se realizó push.

### Resultado de esta entrega

- 45 pruebas del backend aprobadas, 0 fallos, 0 errores; 9 de Caja contra PostgreSQL 17 real.
- Frontend: compilación y análisis de código correctos.
- Dependencias de producción: 0 vulnerabilidades reportadas.
- La base PostgreSQL usada para validar fue temporal y separada de tu conexión; no se modificó tu contraseña.
